const rateLimit = require('express-rate-limit');

// Rate limiter for AI chat endpoints
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Limit each user to 10 requests per minute
  message: {
    error: 'Too many AI requests. Please wait a moment before trying again.',
    retryAfter: 60
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user's email as the key for rate limiting
  keyGenerator: (req, res) => {
    // Always use email if available (authenticated requests)
    if (req.user?.email) {
      return req.user.email;
    }
    // For unauthenticated requests, don't use IP-based limiting
    return 'anonymous';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many AI requests from this account. Please wait a minute before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime.getTime() / 1000),
      limit: req.rateLimit.limit,
      current: req.rateLimit.current
    });
  }
});

// More lenient rate limiter for recommendations
const recommendationsRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 5, // Limit each user to 5 requests per 5 minutes
  message: {
    error: 'Too many recommendation requests. Please wait before requesting more.',
    retryAfter: 300
  },
  keyGenerator: (req, res) => {
    // Always use email if available (authenticated requests)
    if (req.user?.email) {
      return req.user.email;
    }
    // For unauthenticated requests, don't use IP-based limiting
    return 'anonymous';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many recommendation requests. Please wait a few minutes before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime.getTime() / 1000)
    });
  }
});

module.exports = {
  chatRateLimiter,
  recommendationsRateLimiter
};
