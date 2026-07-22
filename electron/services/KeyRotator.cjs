// electron/services/KeyRotator.cjs
class KeyRotator {
  constructor(keys = []) {
    this.keys = keys.filter(k => k && k.trim());
    this.currentIndex = 0;
    this.failedKeys = new Map();
    this.cooldownMs = 60 * 1000;
  }

  updateKeys(keys) {
    this.keys = keys.filter(k => k && k.trim());
    this.currentIndex = 0;
    this.failedKeys.clear();
  }

  getNextKey() {
    if (this.keys.length === 0) return null;

    const now = Date.now();
    for (const [key, ts] of this.failedKeys.entries()) {
      if (now - ts > this.cooldownMs) {
        this.failedKeys.delete(key);
      }
    }

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      if (!this.failedKeys.has(key)) {
        return key;
      }
    }

    return this.keys[0];
  }

  markKeyFailed(key) {
    this.failedKeys.set(key, Date.now());
  }

  getStats() {
    return {
      total: this.keys.length,
      available: this.keys.length - this.failedKeys.size,
      cooldown: this.failedKeys.size
    };
  }
}

module.exports = KeyRotator;