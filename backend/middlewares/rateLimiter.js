import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { error: "Chill! You're roasting too fast. Try again in 15 mins." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { error: "Security Alert: Too many failed login attempts. You are blocked for whole day." },
  standardHeaders: true,
  legacyHeaders: false,
});