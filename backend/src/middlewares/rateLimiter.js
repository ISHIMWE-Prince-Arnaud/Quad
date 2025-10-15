import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

export const confessionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: parseInt(process.env.CONFESSION_RATE_LIMIT) || 5,
  message: 'You have reached your daily confession limit. Try again tomorrow.',
  skipSuccessfulRequests: true,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});
