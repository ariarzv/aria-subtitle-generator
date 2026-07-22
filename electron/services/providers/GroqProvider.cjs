const { net, session } = require('electron');

class GroqProvider {
  constructor(keyRotator) {
    this.keyRotator = keyRotator;
    this.baseUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';
    this.model = 'whisper-large-v3-turbo';
  }

  async transcribe(wavBuffer, chunkStart = 0) {
    const apiKey = this.keyRotator.getNextKey();
    if (!apiKey) {
      throw new Error('هیچ کلید Groq API تنظیم نشده است.');
    }

    const boundary = '----GroqBoundary' + Date.now();
    const CRLF = '\r\n';
    const parts = [];

    parts.push(Buffer.from(`--${boundary}${CRLF}`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="audio.wav"${CRLF}`));
    parts.push(Buffer.from(`Content-Type: audio/wav${CRLF}${CRLF}`));
    parts.push(wavBuffer);
    parts.push(Buffer.from(CRLF));

    parts.push(Buffer.from(`--${boundary}${CRLF}`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="model"${CRLF}${CRLF}`));
    parts.push(Buffer.from(`${this.model}${CRLF}`));

    parts.push(Buffer.from(`--${boundary}${CRLF}`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="response_format"${CRLF}${CRLF}`));
    parts.push(Buffer.from(`verbose_json${CRLF}`));

    parts.push(Buffer.from(`--${boundary}${CRLF}`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="timestamp_granularities[]"${CRLF}${CRLF}`));
    parts.push(Buffer.from(`segment${CRLF}`));

    parts.push(Buffer.from(`--${boundary}${CRLF}`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="language"${CRLF}${CRLF}`));
    parts.push(Buffer.from(`en${CRLF}`));

    parts.push(Buffer.from(`--${boundary}--${CRLF}`));
    const body = Buffer.concat(parts);

    console.log(`[Groq] Sending ${(body.length / 1024).toFixed(1)}KB audio, offset: ${chunkStart}s`);

    const responseData = await new Promise((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: this.baseUrl,
        session: session.defaultSession,
        useSessionCookies: true
      });

      request.setHeader('Authorization', `Bearer ${apiKey}`);
      request.setHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);

      let chunks = [];
      let statusCode = 0;

      request.on('response', (response) => {
        statusCode = response.statusCode;
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolve({ statusCode, body: Buffer.concat(chunks).toString('utf-8') });
        });
        response.on('error', reject);
      });

      request.on('error', reject);
      request.write(body);
      request.end();
    });

    console.log(`[Groq] Response status: ${responseData.statusCode}`);

    if (responseData.statusCode === 429) {
      this.keyRotator.markKeyFailed(apiKey);
      throw new Error('GROQ_RATE_LIMIT');
    }

    if (responseData.statusCode === 401) {
      this.keyRotator.markKeyFailed(apiKey);
      throw new Error('کلید Groq API نامعتبر است.');
    }

    if (responseData.statusCode < 200 || responseData.statusCode >= 300) {
      throw new Error(`Groq API Error ${responseData.statusCode}: ${responseData.body.slice(0, 200)}`);
    }

    const result = JSON.parse(responseData.body);
    const segments = (result.segments || []).map(seg => ({
      start: seg.start + chunkStart,
      end: seg.end + chunkStart,
      text: seg.text.trim()
    }));

    return segments;
  }
}

module.exports = GroqProvider;
