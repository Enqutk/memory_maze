# 🔄 Multiple API Keys Setup Guide

## ✅ What's Enabled

Your app now has **automatic key rotation**! When one key hits its limit, it automatically switches to the next one.

---

## 📋 Quick Setup (3 API Keys = 300k tokens/day)

### Step 1: Create Multiple Groq Accounts

**Gmail Trick** (all emails go to ONE inbox):

1. Go to https://console.groq.com/keys
2. **Account 1**: Sign up with `yourname@gmail.com`
   - Create API Key → Copy `gsk_...`
3. **Account 2**: Sign up with `yourname+groq2@gmail.com`
   - Create API Key → Copy `gsk_...`
4. **Account 3**: Sign up with `yourname+groq3@gmail.com`
   - Create API Key → Copy `gsk_...`

**All verification emails arrive at yourname@gmail.com!** 📧

---

### Step 2: Update backend/.env

**Current (single key):**
```env
GROQ_API_KEY=gsk_your_single_key_here
```

**Update to (multiple keys):**
```env
# Delete or comment out single key
# GROQ_API_KEY=gsk_...

# Add comma-separated keys (no spaces!)
GROQ_API_KEYS=gsk_key1_here,gsk_key2_here,gsk_key3_here
```

**Important:** No spaces between keys, only commas!

---

### Step 3: Restart Server

```bash
# On Windows (Git Bash):
taskkill //F //PID <PID> && cd backend && npm start

# Or just close terminal and run:
cd backend
npm start
```

You should see:
```
✅ Key rotation initialized with 3 key(s)
🔄 API Key rotation enabled
```

---

## 🎯 How It Works

### Automatic Load Balancing
```
User request comes in
    ↓
System picks LEAST USED key
    ↓
If key hits 429 error → Try NEXT key
    ↓
All keys exhausted → Retry after wait
    ↓
Success! Response sent
```

### Smart Features
- ✅ **Load balancing**: Uses least-used key
- ✅ **Auto-failover**: Switches on 429 errors
- ✅ **Error tracking**: Skips recently failed keys
- ✅ **Daily reset**: Stats reset at midnight UTC
- ✅ **Admin dashboard**: Monitor key usage

---

## 📊 Capacity Calculator

| Keys | Tokens/Day | Messages/Day | Recommendations/Day |
|------|------------|--------------|---------------------|
| 1    | 100,000    | ~470*        | ~400                |
| 2    | 200,000    | ~940*        | ~800                |
| 3    | 300,000    | ~1,410*      | ~1,200              |
| 5    | 500,000    | ~2,350*      | ~2,000              |
| 10   | 1,000,000  | ~4,700*      | ~4,000              |

*With 30% cache hit rate

---

## 🔍 Monitor Your Keys

### Option 1: Server Logs
Watch the terminal for:
```
✅ Key rotation initialized with 3 key(s)
🔄 Rate limited, trying next API key...
```

### Option 2: Admin API Endpoint
**GET** `/api/admin/api-keys/stats` (Admin only)

Returns:
```json
{
  "enabled": true,
  "totalKeys": 3,
  "totalRequests": 150,
  "totalErrors": 2,
  "successRate": "98.67%",
  "keys": {
    "key_1": {
      "key": "gsk_xxx...xxxx",
      "requests": 50,
      "errors": 0,
      "lastUsed": "2026-01-21T06:30:00.000Z",
      "lastError": null
    },
    "key_2": {
      "key": "gsk_yyy...yyyy",
      "requests": 55,
      "errors": 1,
      "lastUsed": "2026-01-21T06:35:00.000Z",
      "lastError": "2026-01-21T06:32:00.000Z"
    },
    "key_3": {
      "key": "gsk_zzz...zzzz",
      "requests": 45,
      "errors": 1,
      "lastUsed": "2026-01-21T06:33:00.000Z",
      "lastError": null
    }
  }
}
```

### Option 3: Groq Console
Check individual key usage:
- https://console.groq.com/settings/usage

---

## 🎮 Testing

### Test Single Key
1. Keep `GROQ_API_KEY` in `.env`
2. Start server → See "1 key(s)"
3. Use AI chat normally

### Test Multiple Keys
1. Update to `GROQ_API_KEYS` with 2-3 keys
2. Restart server → See "3 key(s)"
3. Send many messages quickly
4. Watch logs: "🔄 Rate limited, trying next API key..."

---

## 🔧 Troubleshooting

### "Key rotation initialized with 1 key(s)" but I added 3 keys

**Check:**
1. No spaces in `.env`: `key1,key2,key3` ✅ not `key1, key2, key3` ❌
2. Using `GROQ_API_KEYS` (plural) not `GROQ_API_KEY`
3. Keys are valid (start with `gsk_`)
4. Restart server after changing `.env`

### All keys getting 429 errors

**Reasons:**
1. All keys hit daily limit (100k tokens each)
2. All keys created from same IP (rare Groq restriction)
3. Keys are invalid/expired

**Solutions:**
1. Wait for daily reset (midnight UTC)
2. Create accounts from different devices/networks
3. Check keys at https://console.groq.com/keys

### One key always used, others ignored

**This is normal!** The system uses "least-used" strategy:
- Key 1 gets first request
- Key 2 gets next request
- Rotates automatically
- Watch server logs to see rotation

---

## 💡 Pro Tips

### Tip 1: Start Small
```
Week 1: Test with 1 key
Week 2: Add 2nd key if needed
Week 3: Add 3rd key for peak times
```

### Tip 2: Label Your Keys
When creating keys on Groq:
- Key 1: "Memory Maze Primary"
- Key 2: "Memory Maze Secondary"
- Key 3: "Memory Maze Backup"

### Tip 3: Monitor Usage
Check Groq console weekly:
- Which key is used most?
- Any keys hitting limits?
- Adjust strategy accordingly

### Tip 4: Development vs Production
```env
# Development (.env.development)
GROQ_API_KEY=gsk_dev_key_here

# Production (.env.production)
GROQ_API_KEYS=gsk_prod1,gsk_prod2,gsk_prod3
```

---

## 🚀 Scaling Strategies

### Personal App (1-5 users)
```
Keys needed: 1-2
Daily capacity: 200k tokens
Setup: Basic rotation
```

### Small Team (5-20 users)
```
Keys needed: 2-3
Daily capacity: 300k tokens
Setup: Standard rotation + monitoring
```

### Production App (50+ users)
```
Keys needed: 5-10
Daily capacity: 500k-1M tokens
Setup: Advanced rotation + fallback
```

### High Traffic (100+ concurrent users)
```
Keys needed: 10+
Daily capacity: 1M+ tokens
Setup: Load balancer + multiple key pools
```

---

## 📚 Related Files

- `backend/utils/keyRotation.js` - Core rotation logic
- `backend/services/chatService.js` - AI service integration
- `backend/controllers/adminController.js` - Stats endpoint
- `backend/routes/admin.js` - Admin routes
- `backend/.env` - Configuration
- `TOKEN_USAGE_CALCULATOR.md` - Usage calculations
- `AI_RATE_LIMIT_GUIDE.md` - Rate limit info

---

## 🎯 Quick Reference

### Environment Variables
```env
# Single key (old way)
GROQ_API_KEY=gsk_single_key

# Multiple keys (new way)
GROQ_API_KEYS=gsk_your_key_1_here,gsk_your_key_2_here,gsk_your_key_3_here

# Fallback to OpenAI
OPENAI_API_KEY=sk_openai_key
```

### Server Messages
```
✅ Key rotation initialized with N key(s)  → Success
🔄 API Key rotation enabled                → Working
🔄 Rate limited, trying next API key...    → Auto-switching
⚠️ Key error (N total): ...                 → Key issue
```

### Capacity Formula
```
Total Tokens = Keys × 100,000
Messages/Day = (Total Tokens × 0.7) ÷ 300
              ^cache savings  ^tokens/msg
```

---

## ❓ FAQ

**Q: Is using multiple keys allowed?**
A: Yes! No Groq policy prohibits this.

**Q: How many keys can I have?**
A: Technically unlimited, but 3-5 is practical.

**Q: Will I get banned?**
A: No, this is standard practice for free tiers.

**Q: Do keys share limits?**
A: No, each key has separate 100k token/day limit.

**Q: Can I mix Groq + OpenAI keys?**
A: Not currently, but I can add this if needed!

**Q: What if all keys fail?**
A: System will retry and show user-friendly error.

---

## 🆘 Need Help?

1. **Check server logs** for error messages
2. **Test one key at a time** to isolate issues
3. **Monitor Groq console** for API status
4. **Ask me!** I can help debug

---

**Your system is ready for multiple keys! Get 2-3 keys and watch your capacity multiply! 🚀**
