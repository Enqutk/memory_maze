// API Key Rotation for Higher Token Limits
// This allows you to use multiple free Groq API keys for more capacity

class KeyRotation {
  constructor() {
    // Load API keys from environment
    const keysString = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY;
    
    if (!keysString) {
      throw new Error('No API keys configured');
    }
    
    // Support both single key and comma-separated multiple keys
    this.apiKeys = keysString.includes(',') 
      ? keysString.split(',').map(k => k.trim()).filter(k => k)
      : [keysString.trim()];
    
    this.currentIndex = 0;
    this.keyStats = new Map();
    
    // Initialize stats for each key
    this.apiKeys.forEach(key => {
      this.keyStats.set(key, {
        requestCount: 0,
        errorCount: 0,
        lastError: null,
        lastUsed: null
      });
    });
    
    console.log(`✅ Key rotation initialized with ${this.apiKeys.length} key(s)`);
  }
  
  // Get next available key (round-robin)
  getNextKey() {
    if (this.apiKeys.length === 1) {
      return this.apiKeys[0];
    }
    
    const key = this.apiKeys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
    
    // Update stats
    const stats = this.keyStats.get(key);
    stats.requestCount++;
    stats.lastUsed = new Date();
    
    return key;
  }
  
  // Get least used key (load balancing)
  getLeastUsedKey() {
    if (this.apiKeys.length === 1) {
      return this.apiKeys[0];
    }
    
    let leastUsedKey = this.apiKeys[0];
    let minRequests = Infinity;
    
    for (const key of this.apiKeys) {
      const stats = this.keyStats.get(key);
      // Skip keys with recent errors (within last 5 minutes)
      if (stats.lastError && (Date.now() - stats.lastError.getTime() < 5 * 60 * 1000)) {
        continue;
      }
      
      if (stats.requestCount < minRequests) {
        minRequests = stats.requestCount;
        leastUsedKey = key;
      }
    }
    
    return leastUsedKey;
  }
  
  // Mark key as having an error
  markKeyError(key, error) {
    const stats = this.keyStats.get(key);
    if (stats) {
      stats.errorCount++;
      stats.lastError = new Date();
      console.warn(`⚠️ Key error (${stats.errorCount} total):`, error.message);
    }
  }
  
  // Get key with automatic error handling
  async getKeyWithRetry() {
    const maxAttempts = this.apiKeys.length;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const key = this.getLeastUsedKey();
      const stats = this.keyStats.get(key);
      
      // Skip if key had recent error
      if (stats.lastError && (Date.now() - stats.lastError.getTime() < 60 * 1000)) {
        continue;
      }
      
      return key;
    }
    
    // All keys have recent errors, return least recently errored
    let oldestErrorKey = this.apiKeys[0];
    let oldestErrorTime = Date.now();
    
    for (const key of this.apiKeys) {
      const stats = this.keyStats.get(key);
      if (stats.lastError && stats.lastError.getTime() < oldestErrorTime) {
        oldestErrorTime = stats.lastError.getTime();
        oldestErrorKey = key;
      }
    }
    
    return oldestErrorKey;
  }
  
  // Get statistics
  getStats() {
    const stats = {};
    let totalRequests = 0;
    let totalErrors = 0;
    
    this.apiKeys.forEach((key, index) => {
      const keyStats = this.keyStats.get(key);
      const maskedKey = `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
      
      stats[`key_${index + 1}`] = {
        key: maskedKey,
        requests: keyStats.requestCount,
        errors: keyStats.errorCount,
        lastUsed: keyStats.lastUsed,
        lastError: keyStats.lastError
      };
      
      totalRequests += keyStats.requestCount;
      totalErrors += keyStats.errorCount;
    });
    
    return {
      totalKeys: this.apiKeys.length,
      totalRequests,
      totalErrors,
      successRate: totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests * 100).toFixed(2) + '%' : 'N/A',
      keys: stats
    };
  }
  
  // Reset statistics (e.g., at midnight UTC)
  resetStats() {
    this.keyStats.forEach(stats => {
      stats.requestCount = 0;
      stats.errorCount = 0;
    });
    console.log('📊 Key rotation stats reset');
  }
}

// Singleton instance
let keyRotationInstance = null;

function getKeyRotation() {
  if (!keyRotationInstance) {
    try {
      keyRotationInstance = new KeyRotation();
    } catch (error) {
      console.error('Failed to initialize key rotation:', error.message);
      return null;
    }
  }
  return keyRotationInstance;
}

// Reset stats daily at midnight UTC
function scheduleDailyReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0); // Next midnight UTC
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    const rotation = getKeyRotation();
    if (rotation) {
      rotation.resetStats();
    }
    // Schedule next reset
    scheduleDailyReset();
  }, timeUntilMidnight);
  
  console.log(`⏰ Daily stats reset scheduled for ${tomorrow.toUTCString()}`);
}

// Start daily reset scheduler
scheduleDailyReset();

module.exports = {
  getKeyRotation,
  KeyRotation
};
