// backend/utils/logger.js
const logger = {
    info: (message, data = null) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    
    error: (message, data = null) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ERROR: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    
    warn: (message, data = null) => {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    
    debug: (message, data = null) => {
      if (process.env.NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
      }
    }
  };
  
  module.exports = logger;
  
 