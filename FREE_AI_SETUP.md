# Free AI API Setup Guide (No Payment Card Required)

Since you're in Ethiopia without a payment card, here are **FREE alternatives** to OpenAI:

## Option 1: Groq (Recommended - Fast & Free)

**Best option - No credit card needed!**

1. Go to: https://console.groq.com/
2. Sign up with Google/GitHub (free account)
3. Go to API Keys: https://console.groq.com/keys
4. Click "Create API Key"
5. Copy your key (starts with `gsk_`)
6. Add to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_your-key-here
   ```

**Features:**
- ✅ No credit card required
- ✅ Very fast responses
- ✅ Free tier: 30 requests/minute
- ✅ Uses Llama models (similar to ChatGPT)

---

## Option 2: Hugging Face (Completely Free)

1. Go to: https://huggingface.co/join
2. Create a free account
3. Go to Settings → Access Tokens: https://huggingface.co/settings/tokens
4. Create a new token (read permission)
5. Copy the token
6. Add to `backend/.env`:
   ```
   HUGGINGFACE_API_KEY=hf_your-token-here
   ```

**Features:**
- ✅ Completely free
- ✅ No credit card needed
- ✅ Multiple AI models available

---

## Option 3: Cohere (Free Tier)

1. Go to: https://dashboard.cohere.com/signup
2. Sign up (may need email verification)
3. Get API key from dashboard
4. Add to `backend/.env`:
   ```
   COHERE_API_KEY=your-key-here
   ```

**Features:**
- ✅ Free tier available
- ✅ Good for text generation

---

## Quick Setup Steps:

1. Choose one of the options above (Groq is recommended)
2. Sign up and get your API key
3. Add the key to `backend/.env` file
4. The code will automatically use it!

**Note:** I can modify the code to use Groq instead of OpenAI if you prefer. Just let me know which service you choose!
