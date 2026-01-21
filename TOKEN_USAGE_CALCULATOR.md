# Token Usage Calculator & Management Guide

## 📊 Groq Free Tier Limits

### Daily Limits
- **Token Limit**: 100,000 tokens/day
- **Request Limit**: 14,400 requests/day
- **Per-Minute**: 30 requests/min

### Current Model Usage
- **Model**: `llama-3.1-8b-instant`
- **Average per message**: ~300 tokens
- **Average per recommendation**: ~250 tokens

---

## 🧮 Usage Calculations

### Single User Scenarios

| Activity | Tokens Used | Daily Capacity |
|----------|-------------|----------------|
| Simple question | ~200 tokens | 500 questions |
| Detailed conversation | ~300 tokens | 333 messages |
| Book recommendation | ~250 tokens | 400 requests |
| Long conversation (10 msgs) | ~3,000 tokens | 33 conversations |

### Multi-User Scenarios

With **rate limiting** (10 msgs/min per user):

| Users | Messages/Day Each | Total Tokens | Status |
|-------|-------------------|--------------|--------|
| 1 user | 333 msgs | 100,000 | ✅ Within limit |
| 5 users | 66 msgs each | 100,000 | ✅ Fair usage |
| 10 users | 33 msgs each | 100,000 | ✅ Distributed |
| 50 users | 6 msgs each | 100,000 | ⚠️ Limited per user |
| 100 users | 3 msgs each | 100,000 | 🔴 Very limited |

---

## 🎯 Token Saving Strategies (Already Implemented)

### 1. Response Caching
```
First ask: "What's The Alchemist about?" → 300 tokens
Same ask within 5 min: Cached → 0 tokens ✅
Savings: 300 tokens per duplicate
```

### 2. Rate Limiting
```
Without: User sends 100 msgs/min → 30,000 tokens/min (limit hit in 3 mins!)
With: User sends max 10 msgs/min → 3,000 tokens/min (lasts 33 mins)
```

### 3. Smaller Model
```
Old (llama-3.3-70b): ~500 tokens/msg
New (llama-3.1-8b): ~300 tokens/msg
Savings: 40% reduction
```

### 4. Reduced Max Tokens
```
Chat: 300 max tokens (concise answers)
Recommendations: 250 max tokens
```

---

## 🚀 Scaling Solutions

### For Personal Use (1-5 users)
✅ **Current setup is perfect**
- 1 Groq account = 100k tokens/day
- With caching: Easily supports 300+ messages/day
- **No changes needed!**

### For Small Team (5-20 users)
🟡 **Get 2-3 API Keys**
- Create 2-3 Groq accounts
- Rotate keys when one hits limit
- Total capacity: 200k-300k tokens/day

**Setup**: I can implement automatic key rotation for you!

### For Production App (50+ users)
🔴 **Multiple Strategies**

#### Option 1: Multiple Free Accounts
```javascript
// Rotate through 5 keys
const keys = [
  'gsk_key1...',
  'gsk_key2...',
  'gsk_key3...',
  'gsk_key4...',
  'gsk_key5...'
];
// Total: 500k tokens/day (FREE)
```

#### Option 2: Groq Paid Tier
- Higher rate limits
- More tokens
- Better reliability
- Visit: https://console.groq.com/settings/billing

#### Option 3: Mix of Free + Paid
- Use free tier for most users
- Paid tier as fallback
- Smart routing based on priority

---

## 📈 Monitoring Token Usage

### Check Your Usage
1. Visit: https://console.groq.com/settings/usage
2. View real-time token consumption
3. Set up alerts (if available)

### In Your App (Future Enhancement)
```javascript
// Track token usage per user
const userTokens = {
  'user@email.com': {
    daily: 2500,
    total: 45000
  }
};

// Warn users approaching limits
if (userTokens[email].daily > 90000) {
  return "You're approaching your daily limit!";
}
```

---

## 💡 Best Practices

### For Users
1. **Be specific** - Clear questions use fewer tokens
2. **Use cache** - Ask similar questions to get instant cached responses
3. **Avoid spam** - Rate limiter prevents this anyway

### For Developers
1. ✅ **Rate limiting** - Already implemented
2. ✅ **Caching** - Already implemented
3. ✅ **Efficient model** - Already implemented
4. ⚪ **Token tracking** - Optional enhancement
5. ⚪ **Key rotation** - For scaling

---

## 🔧 Advanced: Key Rotation Setup

### When You Need It
- 20+ active users
- Consistently hitting daily limits
- Want 99.9% uptime

### How It Works
```javascript
// Round-robin key selection
let currentKeyIndex = 0;
const apiKeys = process.env.GROQ_API_KEYS.split(',');

function getNextKey() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

// Or smart selection based on usage
function getAvailableKey() {
  for (const key of apiKeys) {
    if (keyHasTokensAvailable(key)) {
      return key;
    }
  }
  throw new Error('All keys exhausted');
}
```

Want me to implement this? Just say "add key rotation"!

---

## 📊 Real-World Examples

### Scenario 1: Solo Developer Testing
```
Usage: 50 messages/day
Tokens: ~15,000/day
Status: ✅ Excellent (85k tokens left)
```

### Scenario 2: Small Reading Club (10 users)
```
Usage: 200 messages/day total
Tokens: ~60,000/day
Status: ✅ Great (40k tokens left)
Cache hit rate: ~30% (saves 18k tokens!)
```

### Scenario 3: Popular App (100 users)
```
Usage: 400+ messages/day
Tokens: 100,000/day (hits limit)
Solution: 3 API keys = 300k/day capacity
Status: ✅ Scales well
```

---

## 🎯 Your Current Setup

With the improvements implemented:

| Feature | Status | Benefit |
|---------|--------|---------|
| Rate Limiting | ✅ Active | Prevents abuse |
| Response Caching | ✅ Active | 30-50% token savings |
| Efficient Model | ✅ Active | 40% smaller responses |
| Auto-retry | ✅ Active | Handles temporary limits |
| Key Rotation | ⚪ Optional | For scaling |

**Estimated Daily Capacity:**
- **Without cache**: ~330 messages
- **With 30% cache hits**: ~470 messages
- **With multiple keys**: Multiply by number of keys

---

## 🆘 Troubleshooting

### "Still hitting limits too fast"
1. Check if cache is working (see console logs)
2. Monitor actual token usage at console.groq.com
3. Consider getting 2nd API key
4. Reduce max_tokens further (currently 300)

### "Want unlimited usage"
1. Get 3-5 free Groq accounts (legal & free!)
2. Implement key rotation
3. Or upgrade to paid tier (when available)

### "Need exact token count"
```javascript
// Add token tracking (future enhancement)
const { encoding_for_model } = require('tiktoken');
const encoder = encoding_for_model('llama-3.1-8b');
const tokens = encoder.encode(message).length;
```

---

## 📞 Need Help?

- **Get 2nd API key**: I can help set it up
- **Key rotation**: Say "implement key rotation"
- **Usage monitoring**: Say "add token tracking"
- **Increase limits**: Visit groq.com/pricing

**Your current setup handles 300+ messages/day easily with just ONE free key!** 🎉
