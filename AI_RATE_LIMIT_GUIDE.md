# AI Rate Limit Management Guide

## 🎯 Problem Solved

You were experiencing **Error 429: Rate Limit Exceeded** when using the AI chat feature. This happens when too many requests are sent to the Groq API in a short time period.

## ✅ Solutions Implemented

### 1. **Backend Rate Limiting** ⏱️
- **Chat Messages**: Limited to **10 requests per minute** per user
- **Recommendations**: Limited to **5 requests per 5 minutes** per user
- Users will get a clear error message if they exceed these limits

### 2. **Response Caching** 💾
- Similar questions are cached for **5 minutes**
- Repeated queries return instant cached responses (no API call!)
- Significantly reduces API usage for common questions

### 3. **Automatic Retry with Exponential Backoff** 🔄
- If rate limited by Groq API, the system automatically retries up to 2 times
- Waits: 1 second → 2 seconds before retrying
- Reduces failed requests due to temporary rate limits

### 4. **Better Error Messages** 💬
- Frontend now shows exactly how long to wait before retrying
- Clear, user-friendly error messages
- Helps users understand rate limits

## 📊 Groq API Free Tier Limits

The free Groq API has these limits:
- **30 requests per minute**
- **14,400 requests per day**
- **No credit card required!**

### Getting a Groq API Key (Free!)

1. Visit: [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account (no credit card needed)
3. Go to API Keys section
4. Create a new API key
5. Add it to your `backend/.env` file:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

## 🔧 Configuration Files

### Rate Limit Settings

Edit `backend/middleware/rateLimitMiddleware.js` to adjust limits:

```javascript
// Chat rate limiter
windowMs: 60 * 1000,  // 1 minute
max: 10,              // 10 requests per window

// Recommendations rate limiter
windowMs: 5 * 60 * 1000,  // 5 minutes
max: 5,                    // 5 requests per window
```

### Cache Settings

Edit `backend/services/chatService.js` to adjust cache duration:

```javascript
// Cache with 5 minute TTL
const responseCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
```

## 📈 How It Works

### Request Flow

```
User sends message
    ↓
Backend rate limiter checks (per user)
    ↓ (if under limit)
Cache check (for duplicate queries)
    ↓ (if not cached)
Call Groq API
    ↓ (if rate limited by Groq)
Retry with exponential backoff (up to 2 retries)
    ↓
Cache response
    ↓
Return to user
```

### Benefits

1. **Prevents API abuse** - Users can't spam requests
2. **Reduces costs** - Caching saves API calls
3. **Better UX** - Clear error messages and automatic retries
4. **Fair usage** - Everyone gets their share of the free tier

## 🛠️ Testing

To test the rate limiting:

1. **Start your backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Try sending multiple messages quickly** in the AI chat
   - After 10 messages in a minute, you'll see the rate limit message
   - After waiting 1 minute, you can send messages again

3. **Ask the same question twice**:
   - First request hits the API
   - Second request returns instantly from cache

## 💡 Tips

1. **For development**: Increase rate limits in `rateLimitMiddleware.js`
2. **For production**: Consider these limits appropriate for free tier
3. **Multiple API keys**: If you need higher limits, you can:
   - Create multiple Groq accounts (free)
   - Implement key rotation logic
   - Upgrade to Groq's paid tier (when available)

## 🔍 Monitoring

Check your API usage:
1. Visit [Groq Console](https://console.groq.com)
2. View your API usage dashboard
3. Monitor requests per minute/day

## 🆘 Troubleshooting

### Still getting 429 errors?

1. **Check your API key**: Make sure it's valid in `backend/.env`
2. **Check Groq's status**: Visit [status.groq.com](https://status.groq.com) (if it exists)
3. **Wait longer**: The free tier has daily limits too
4. **Try a different time**: Peak hours might have stricter limits

### Cache not working?

1. Restart the backend server
2. Check `node-cache` is installed: `npm list node-cache`
3. Check console logs for cache hit/miss messages

### Rate limiter not working?

1. Check `express-rate-limit` is installed: `npm list express-rate-limit`
2. Verify middleware is applied in `backend/routes/chat.js`
3. Clear browser cookies/localStorage (rate limit is per user email)

## 📚 Related Files

- `backend/middleware/rateLimitMiddleware.js` - Rate limiting configuration
- `backend/services/chatService.js` - Caching and retry logic
- `backend/controllers/chatController.js` - Error handling
- `backend/routes/chat.js` - Route protection
- `frontend/components/AIChat.js` - User-facing error messages

---

**Need help?** Check the error messages in the browser console and backend terminal for more details.
