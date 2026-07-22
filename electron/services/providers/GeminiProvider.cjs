// electron/services/providers/GeminiProvider.cjs
const { net, session } = require('electron');

class GeminiProvider {
  constructor(keyRotator) {
    this.keyRotator = keyRotator;
    
    // ✅ فقط مدل‌های تأیید شده و در دسترس
    this.models = [
      { name: 'gemini-2.0-flash', cooldownUntil: 0 },
      { name: 'gemini-2.0-flash-lite', cooldownUntil: 0 },
      { name: 'gemini-2.5-flash', cooldownUntil: 0 },
      { name: 'gemini-flash-latest', cooldownUntil: 0 },
    ];
    
    // ✅ صف مرکزی: همه درخواست‌ها یکی یکی
    this.queue = Promise.resolve();
    this.lastRequestTime = 0;
    this.minDelayMs = 1500; // حداقل ۱.۵ ثانیه بین هر درخواست
  }

  getCurrentModel() {
    const available = this.models.filter(m => Date.now() >= m.cooldownUntil);
    return available.length > 0 ? available[0].name : this.models[0].name;
  }

  pickAvailableModel() {
    const now = Date.now();
    const available = this.models.filter(m => now >= m.cooldownUntil);
    
    if (available.length === 0) {
      // همه cooldown دارن → صبر کن تا نزدیک‌ترین آزاد بشه
      return null;
    }
    
    return available[0];
  }

  markCooldown(modelName, seconds = 20) {
    const m = this.models.find(x => x.name === modelName);
    if (m) {
      m.cooldownUntil = Date.now() + (seconds * 1000);
      console.warn(`[Gemini] Model ${modelName} cooldown for ${seconds}s`);
    }
  }

  /**
   * ✅ ورودی همه درخواست‌ها از اینجاست — صف مرکزی
   */
  async translate(segments) {
    // اضافه کردن به صف
    const previous = this.queue;
    let resolveCurrent;
    this.queue = new Promise(r => resolveCurrent = r);

    try {
      // منتظر بمون تا نوبتت برسه
      await previous;

      // حداقل delay بین درخواست‌ها
      const now = Date.now();
      const timeSinceLast = now - this.lastRequestTime;
      if (timeSinceLast < this.minDelayMs) {
        await this.sleep(this.minDelayMs - timeSinceLast);
      }

      const result = await this._doTranslate(segments);
      this.lastRequestTime = Date.now();
      return result;
    } finally {
      resolveCurrent();
    }
  }

  async _doTranslate(segments) {
    if (!segments || segments.length === 0) return [];

    const apiKey = this.keyRotator.getNextKey();
    if (!apiKey) {
      throw new Error('هیچ کلید Gemini API تنظیم نشده است.');
    }

    // انتخاب مدل قابل استفاده
    let model = this.pickAvailableModel();
    
    if (!model) {
      // همه cooldown دارن → صبر کن ۵ ثانیه و دوباره
      console.log(`[Gemini] All models on cooldown, waiting 5s...`);
      await this.sleep(5000);
      model = this.pickAvailableModel() || this.models[0];
    }

    const modelName = model.name;

    const numberedSegments = segments.map((s, i) => ({
      id: i + 1,
      start: parseFloat(s.start.toFixed(2)),
      end: parseFloat(s.end.toFixed(2)),
      text: s.text
    }));

    const inputJson = JSON.stringify(numberedSegments, null, 2);

    const translationSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "INTEGER" },
          start: { type: "NUMBER" },
          end: { type: "NUMBER" },
          text: { type: "STRING" }
        },
        required: ["id", "start", "end", "text"]
      }
    };

    const userQuery = `You are a professional subtitle translator. Translate the following English subtitles to natural, fluent Persian (Farsi).

STRICT RULES:
1. You MUST translate ALL ${segments.length} items. Do NOT skip, merge, or omit ANY item.
2. Output MUST have EXACTLY ${segments.length} items with same "id" numbers (1 to ${segments.length}).
3. Keep the exact same "start", "end", and "id" values. Only translate the "text" field.
4. Translation should be natural, colloquial Persian suitable for video subtitles.
5. Keep proper names, brands, technical terms in English or transliterate.

Input (${segments.length} items):
${inputJson}

Output: JSON array with EXACTLY ${segments.length} translated items.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
        temperature: 0.2,
        maxOutputTokens: 8192
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    console.log(`[Gemini] Translating ${segments.length} segments with ${modelName}`);

    const responseData = await this._httpRequest(apiUrl, payload);

    console.log(`[Gemini/${modelName}] Response status: ${responseData.statusCode}`);

    if (responseData.statusCode === 429) {
      this.markCooldown(modelName, 30);
      throw new Error('GEMINI_RATE_LIMIT');
    }

    if (responseData.statusCode === 404) {
      this.markCooldown(modelName, 999999); // دیگه هیچوقت استفاده نکن
      throw new Error(`Model ${modelName} not available`);
    }

    if (responseData.statusCode < 200 || responseData.statusCode >= 300) {
      throw new Error(`Gemini API Error ${responseData.statusCode}: ${responseData.body.slice(0, 300)}`);
    }

    const result = JSON.parse(responseData.body);
    const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      throw new Error('پاسخ Gemini خالی است.');
    }

    let translated;
    try {
      translated = JSON.parse(jsonText);
    } catch (e) {
      throw new Error('Gemini JSON نامعتبر برگرداند');
    }

    console.log(`[Gemini] ✅ Received ${translated.length} translations for ${segments.length} inputs`);

    if (translated.length < segments.length) {
      const translatedIds = new Set(translated.map(t => t.id));
      const missing = numberedSegments.filter(s => !translatedIds.has(s.id));
      
      console.warn(`[Gemini] ⚠️ Missing ${missing.length} items, using English fallback`);
      
      missing.forEach(m => {
        translated.push({
          id: m.id,
          start: m.start,
          end: m.end,
          text: m.text
        });
      });
    }

    return translated
      .sort((a, b) => a.start - b.start)
      .map(t => ({
        start: t.start,
        end: t.end,
        text: t.text
      }));
  }

  /**
   * ✅ HTTP request با timeout مناسب
   */
  _httpRequest(url, payload) {
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: url,
        session: session.defaultSession,
        useSessionCookies: true
      });

      request.setHeader('Content-Type', 'application/json');

      let chunks = [];
      let statusCode = 0;
      let done = false;

      // ✅ Timeout بعد از ۴۵ ثانیه
      const timeout = setTimeout(() => {
        if (!done) {
          done = true;
          try { request.abort(); } catch (e) {}
          reject(new Error('Request timeout after 45s'));
        }
      }, 45000);

      request.on('response', (response) => {
        statusCode = response.statusCode;
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          if (!done) {
            done = true;
            clearTimeout(timeout);
            resolve({ statusCode, body: Buffer.concat(chunks).toString('utf-8') });
          }
        });
        response.on('error', (err) => {
          if (!done) {
            done = true;
            clearTimeout(timeout);
            reject(err);
          }
        });
      });

      request.on('error', (err) => {
        if (!done) {
          done = true;
          clearTimeout(timeout);
          reject(err);
        }
      });

      request.write(JSON.stringify(payload));
      request.end();
    });
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

module.exports = GeminiProvider;