// services/aiAPI.js - Dedicated AI API service for frontend
import axios from 'axios';

// Get API base URL
const getAPIBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://nasa-react-express-app.onrender.com';
  }
  return 'http://localhost:5001';
};

const API_BASE_URL = getAPIBaseURL();

// Create dedicated AI API instance
const aiAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/ai`,
  timeout: 120000, // 2 minutes for AI operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor for AI API
aiAPI.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🤖 AI API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    
    // Add request timestamp
    config.metadata = { startTime: Date.now() };
    
    // Log request details for debugging
    if (config.data) {
      console.log('🤖 AI Request data:', {
        hasImageUrl: !!config.data.imageUrl,
        hasText: !!config.data.text,
        textLength: config.data.text?.length || 0,
        hasTopic: !!config.data.topic,
        hasItems: !!config.data.items,
        itemCount: config.data.items?.length || 0
      });
    }
    
    return config;
  },
  (error) => {
    console.error('🤖 AI API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for AI API
aiAPI.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`🤖 AI API Response: ${response.status} (${duration}ms)`, {
      url: response.config.url,
      success: response.data.success,
      hasData: !!response.data.data,
      hasError: !!response.data.error
    });
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    console.error(`🤖 AI API Error: ${error.response?.status || 'Network'} (${duration}ms)`, {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific AI API errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('AI request timeout. The analysis is taking too long. Please try again.');
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 'a few minutes';
      throw new Error(`AI rate limit exceeded. Please try again in ${retryAfter}.`);
    }

    if (error.response?.status === 503) {
      throw new Error('AI services are temporarily unavailable. Please try again later.');
    }

    if (error.response?.status === 408) {
      throw new Error('AI analysis timeout. Please try with a smaller request or try again later.');
    }

    // Return the specific error message from the API
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'AI service error occurred';
    throw new Error(errorMessage);
  }
);

// AI API methods
export const aiService = {
  // =====================================
  // Status & Health Checks
  // =====================================
  
  /**
   * Get AI service status
   */
  getStatus: async () => {
    console.log('🔍 Checking AI service status');
    return aiAPI.get('/status');
  },

  /**
   * Comprehensive AI health check
   */
  healthCheck: async () => {
    console.log('🏥 AI health check');
    return aiAPI.get('/health');
  },

  // =====================================
  // Comprehensive Analysis
  // =====================================
  
  /**
   * Perform comprehensive AI analysis
   * @param {Object} data - Analysis data
   * @param {string} [data.imageUrl] - URL of image to analyze
   * @param {string} [data.text] - Text to analyze
   * @param {string} [data.topic] - Topic for tips generation
   */
  analyzeData: async (data) => {
    console.log('🤖 Comprehensive AI analysis');
    
    if (!data.imageUrl && !data.text && !data.topic) {
      throw new Error('At least one of imageUrl, text, or topic is required');
    }
    
    return aiAPI.post('/analyze', data);
  },

  /**
   * Batch analysis of multiple items
   * @param {Array} items - Array of analysis items (max 10)
   */
  batchAnalyze: async (items) => {
    console.log('🤖 Batch AI analysis', { itemCount: items.length });
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required and must not be empty');
    }
    
    if (items.length > 10) {
      throw new Error('Maximum 10 items allowed per batch');
    }
    
    return aiAPI.post('/batch', { items });
  },

  // =====================================
  // Image Analysis
  // =====================================
  
  /**
   * Analyze image content
   * @param {string} imageUrl - URL of the image
   */
  analyzeImage: async (imageUrl) => {
    console.log('🖼️ AI image analysis');
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    return aiAPI.post('/image/analyze', { imageUrl });
  },

  // =====================================
  // Text Analysis
  // =====================================
  
  /**
   * Comprehensive text analysis
   * @param {string} text - Text to analyze
   * @param {boolean} [summarize=true] - Whether to include summary
   * @param {number} [maxSummaryLength=150] - Maximum summary length
   */
  analyzeText: async (text, summarize = true, maxSummaryLength = 150) => {
    console.log('📝 AI text analysis');
    
    if (!text) {
      throw new Error('Text is required');
    }
    
    return aiAPI.post('/text/analyze', { 
      text, 
      summarize, 
      maxSummaryLength 
    });
  },

  /**
   * Summarize text
   * @param {string} text - Text to summarize
   * @param {number} [maxLength=150] - Maximum summary length
   * @param {number} [minLength=20] - Minimum summary length
   */
  summarizeText: async (text, maxLength = 150, minLength = 20) => {
    console.log('📄 AI text summarization');
    
    if (!text) {
      throw new Error('Text is required');
    }
    
    return aiAPI.post('/text/summarize', { 
      text, 
      maxLength, 
      minLength 
    });
  },

  /**
   * Analyze text sentiment
   * @param {string} text - Text to analyze
   */
  analyzeSentiment: async (text) => {
    console.log('😊 AI sentiment analysis');
    
    if (!text) {
      throw new Error('Text is required');
    }
    
    return aiAPI.post('/text/sentiment', { text });
  },

  /**
   * Analyze text complexity (local analysis, always available)
   * @param {string} text - Text to analyze
   */
  analyzeTextComplexity: async (text) => {
    console.log('📊 AI text complexity analysis');
    
    if (!text) {
      throw new Error('Text is required');
    }
    
    return aiAPI.post('/text/complexity', { text });
  },

  // =====================================
  // Astronomy Tips
  // =====================================
  
  /**
   * Get astronomy tips for a topic
   * @param {string} topic - Topic for tips
   * @param {number} [count=3] - Number of tips to return
   */
  getTips: async (topic, count = 3) => {
    console.log('💡 Getting astronomy tips');
    
    if (!topic) {
      throw new Error('Topic is required');
    }
    
    return aiAPI.get(`/tips/${encodeURIComponent(topic)}`, {
      params: { count }
    });
  },

  /**
   * Get general astronomy tips
   * @param {number} [count=3] - Number of tips to return
   * @param {string} [topic='default'] - Optional topic
   */
  getGeneralTips: async (count = 3, topic = 'default') => {
    console.log('💡 Getting general astronomy tips');
    
    return aiAPI.get('/tips', {
      params: { count, topic }
    });
  }
};

// Utility functions for AI operations
export const aiUtils = {
  /**
   * Check if AI services are available
   */
  isAvailable: async () => {
    try {
      const response = await aiService.getStatus();
      return response.data.data.available;
    } catch (error) {
      console.error('Failed to check AI availability:', error.message);
      return false;
    }
  },

  /**
   * Format AI analysis data for components
   * @param {Object} analysis - Raw AI analysis data
   */
  formatAnalysis: (analysis) => {
    if (!analysis) return null;
    
    return {
      imageDescription: analysis.imageAnalysis || null,
      sentiment: analysis.sentiment || { label: 'NEUTRAL', score: 0.5 },
      textAnalysis: analysis.textAnalysis || {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        complexity: 'Unknown'
      },
      tips: analysis.tips || [],
      summary: analysis.summary || null,
      timestamp: analysis.timestamp || new Date().toISOString()
    };
  },

  /**
   * Validate data before sending to AI
   * @param {Object} data - Data to validate
   */
  validateData: (data) => {
    const errors = [];
    
    if (!data.imageUrl && !data.text && !data.topic) {
      errors.push('At least one of imageUrl, text, or topic is required');
    }
    
    if (data.text && typeof data.text !== 'string') {
      errors.push('Text must be a string');
    }
    
    if (data.text && data.text.length > 50000) {
      errors.push('Text is too long (maximum 50,000 characters)');
    }
    
    if (data.imageUrl && typeof data.imageUrl !== 'string') {
      errors.push('Image URL must be a string');
    }
    
    if (data.imageUrl) {
      try {
        new URL(data.imageUrl);
      } catch {
        errors.push('Invalid image URL format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Create a retry wrapper for AI operations
   * @param {Function} operation - AI operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   */
  withRetry: (operation, maxRetries = 3, delay = 1000) => {
    return async (...args) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation(...args);
        } catch (error) {
          lastError = error;
          
          // Don't retry on certain errors
          if (error.message.includes('validation') || 
              error.message.includes('400') ||
              error.message.includes('authentication')) {
            throw error;
          }
          
          if (attempt < maxRetries) {
            console.log(`🔄 AI operation retry ${attempt}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
          }
        }
      }
      
      throw lastError;
    };
  }
};

export default aiService;