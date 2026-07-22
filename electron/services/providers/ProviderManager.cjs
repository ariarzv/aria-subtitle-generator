const KeyRotator = require('../KeyRotator.cjs');
const GroqProvider = require('./GroqProvider.cjs');
const GeminiProvider = require('./GeminiProvider.cjs');

const OUTPUT_MODES = {
  ENGLISH_ONLY: 'english_only',
  PERSIAN_ONLY: 'persian_only',
  BOTH: 'both'
};

const MAX_SEGMENTS_PER_TRANSLATION = 10;

class ProviderManager {
  constructor() {
    this.groqRotator = new KeyRotator([]);
    this.geminiRotator = new KeyRotator([]);
    this.groq = new GroqProvider(this.groqRotator);
    this.gemini = new GeminiProvider(this.geminiRotator);
    
    this.geminiQueue = Promise.resolve();
    this.lastGeminiTime = 0;
    this.minGeminiDelay = 1200;
  }

  setKeys({ groqKeys = [], geminiKeys = [] }) {
    this.groqRotator.updateKeys(groqKeys);
    this.geminiRotator.updateKeys(geminiKeys);
  }

  async processChunk(wavBuffer, chunkStart, outputMode = OUTPUT_MODES.PERSIAN_ONLY) {
    let englishSegments = null;
    let persianSegments = [];
    let lastError = null;
    const maxRetries = 5;
  
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        englishSegments = await this.groq.transcribe(wavBuffer, chunkStart);
        break;
      } catch (err) {
        lastError = err;
        console.error(`[ProviderManager] Groq attempt ${attempt + 1} failed:`, err.message);
        
        if (err.message === 'GROQ_RATE_LIMIT') {
          await this.sleep(3000 * (attempt + 1));
        } else if (err.message.includes('403') || err.message.includes('Access denied')) {
        
          await this.sleep(2000);
        } else if (attempt === maxRetries - 1) {
          throw new Error(`Groq failed: ${err.message}`);
        } else {
          await this.sleep(1500);
        }
      }
    }

    if (!englishSegments || englishSegments.length === 0) {
      throw lastError || new Error('هیچ متنی از Groq دریافت نشد');
    }

    console.log(`[ProviderManager] ✅ Groq returned ${englishSegments.length} segments`);

    if (outputMode === OUTPUT_MODES.ENGLISH_ONLY) {
      return { englishSegments, persianSegments: [] };
    }

  
    persianSegments = await this.translateInBatches(englishSegments);

    console.log(`[ProviderManager] ✅ Final: ${persianSegments.length} Persian / ${englishSegments.length} English`);

    if (outputMode === OUTPUT_MODES.PERSIAN_ONLY) {
      return { englishSegments: [], persianSegments };
    }

    return { englishSegments, persianSegments };
  }

  async translateInBatches(englishSegments) {
    const allTranslated = [];
    const batches = [];

    for (let i = 0; i < englishSegments.length; i += MAX_SEGMENTS_PER_TRANSLATION) {
      batches.push(englishSegments.slice(i, i + MAX_SEGMENTS_PER_TRANSLATION));
    }

    console.log(`[ProviderManager] Translating in ${batches.length} batch(es)`);

    for (let bIdx = 0; bIdx < batches.length; bIdx++) {
      const batch = batches[bIdx];
      const batchResult = await this.queuedTranslate(batch, bIdx + 1, batches.length);
      
      if (batchResult && batchResult.length > 0) {
        allTranslated.push(...batchResult);
      }
    }

    return allTranslated.sort((a, b) => a.start - b.start);
  }


  async queuedTranslate(batch, batchNum, totalBatches) {
    const previous = this.geminiQueue;
    let resolveCurrent;
    this.geminiQueue = new Promise(r => resolveCurrent = r);

    try {
      await previous;

     
      const now = Date.now();
      const elapsed = now - this.lastGeminiTime;
      if (elapsed < this.minGeminiDelay) {
        await this.sleep(this.minGeminiDelay - elapsed);
      }

      const result = await this.retryTranslate(batch, batchNum, totalBatches);
      this.lastGeminiTime = Date.now();
      return result;
    } finally {
      resolveCurrent();
    }
  }

  async retryTranslate(batch, batchNum, totalBatches) {
    const maxRetries = 8;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.gemini.translate(batch);
      } catch (err) {
        console.error(`[ProviderManager] Batch ${batchNum}/${totalBatches} attempt ${attempt + 1}: ${err.message}`);
        
        if (err.message === 'GEMINI_RATE_LIMIT') {
          const wait = Math.min(3000 * Math.pow(1.5, attempt), 30000);
          console.log(`[ProviderManager] Waiting ${wait}ms...`);
          await this.sleep(wait);
        } else if (err.message.includes('timeout') || err.message.includes('TIMED_OUT')) {
          await this.sleep(3000);
        } else if (attempt === maxRetries - 1) {
          console.warn(`[ProviderManager] Batch ${batchNum} failed. Using English fallback.`);
          return batch.map(s => ({
            start: s.start,
            end: s.end,
            text: s.text
          }));
        } else {
          await this.sleep(2000);
        }
      }
    }

    return batch.map(s => ({ start: s.start, end: s.end, text: s.text }));
  }

  getStats() {
    return {
      groq: this.groqRotator.getStats(),
      gemini: this.geminiRotator.getStats(),
      currentGeminiModel: this.gemini.getCurrentModel()
    };
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

module.exports = ProviderManager;
