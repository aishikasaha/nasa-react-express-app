 // backend/middleware/rateLimiter.js
 const rateLimit = require('express-rate-limit');
  
 // Create different rate limiters for different endpoints
 const createRateLimiter = (windowMs, max, message) => {
   return rateLimit({
     windowMs,
     max,
     message: {
       success: false,
       error: message
     },
     standardHeaders: true,
     legacyHeaders: false,
   });
 };
 
 // General API rate limiter
 const generalLimiter = createRateLimiter(
   15 * 60 * 1000, // 15 minutes
   100, // limit each IP to 100 requests per windowMs
   'Too many requests from this IP, please try again later.'
 );
 
 // NASA API specific limiter (more restrictive)
 const nasaApiLimiter = createRateLimiter(
   60 * 1000, // 1 minute
   30, // limit each IP to 30 requests per minute
   'NASA API rate limit exceeded. Please slow down your requests.'
 );
 
 module.exports = {
   generalLimiter,
   nasaApiLimiter
 };
 
 