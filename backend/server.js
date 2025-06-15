const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Trust proxy (important for Render)
app.set('trust proxy', 1);

// Security middleware - Updated for CORS compatibility
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for separate frontend/backend deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('⚪ Request with no origin - allowing');
      return callback(null, true);
    }
    
    // Allowed origins - Updated with your specific URLs
    const allowedOrigins = [
      'http://localhost:3000',                                    // Local development
      'http://localhost:3001',                                    // Alternative local port
      'https://nasa-react-express-app-1.onrender.com',          // Your frontend URL
      'https://nasa-react-express-app.onrender.com',            // Your backend URL (for testing)
      /^https:\/\/.*\.onrender\.com$/,                           // Any onrender subdomain
      /^https:\/\/.*\.vercel\.app$/,                             // Vercel domains
      /^https:\/\/.*\.netlify\.app$/,                            // Netlify domains
      /^http:\/\/localhost:\d+$/                                 // Any localhost port
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      } else {
        return pattern.test(origin);
      }
    });
    
    if (isAllowed) {
      console.log('✅ CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocking origin:', origin);
      console.log('🔍 Allowed origins:', allowedOrigins.filter(o => typeof o === 'string'));
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: false, // Set to false for separate domain deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
  exposedHeaders: ['Content-Length', 'X-Response-Time'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware - MUST come before routes that need to read request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced logging middleware for debugging CORS
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('🌍 Request Origin:', req.get('Origin'));
    console.log('🔧 Request Headers:', {
      'User-Agent': req.get('User-Agent'),
      'Content-Type': req.get('Content-Type'),
      'Accept': req.get('Accept')
    });
  }
  next();
});

// Import services after middleware setup
const nasaService = require('./services/nasaService');
const aiService = require('./services/aiService');

// Try to import AI routes, with fallback if files don't exist
let aiRoutes;
try {
  aiRoutes = require('./routes/aiRoutes');
  console.log('✅ AI routes loaded successfully');
} catch (error) {
  console.log('⚠️ AI routes not found, using inline routes:', error.message);
  aiRoutes = null;
}

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 NASA API Backend with AI',
    version: '2.0.0',
    description: 'Express backend for NASA React app with AI capabilities',
    endpoints: {
      health: '/api/health',
      apod: '/api/apod',
      randomApod: '/api/apod/random',
      marsPhotos: '/api/mars/photos',
      nearEarthObjects: '/api/neo',
      search: '/api/search',
      ai: '/api/ai/*'
    },
    aiEndpoints: {
      status: '/api/ai/status',
      health: '/api/ai/health',
      analyze: '/api/ai/analyze',
      batch: '/api/ai/batch',
      imageAnalyze: '/api/ai/image/analyze',
      textAnalyze: '/api/ai/text/analyze',
      summarize: '/api/ai/text/summarize',
      sentiment: '/api/ai/text/sentiment',
      complexity: '/api/ai/text/complexity',
      tips: '/api/ai/tips/:topic'
    },
    documentation: 'https://api.nasa.gov/',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NASA API Backend with AI',
    nasa_key_status: NASA_API_KEY !== 'DEMO_KEY' ? 'Real Key' : 'Demo Key',
    ai_status: process.env.HF_API_TOKEN ? 'Available' : 'Unavailable - missing HF_API_TOKEN',
    environment: process.env.NODE_ENV,
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cors: {
      enabled: true,
      origin: req.get('Origin'),
      method: req.method
    }
  });
});

// CORS test endpoint for debugging
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working! 🎉',
    timestamp: new Date().toISOString(),
    requestInfo: {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      method: req.method,
      headers: req.headers
    }
  });
});

// =================
// AI Routes
// =================

// Use dedicated AI routes if available, otherwise use inline routes
if (aiRoutes) {
  app.use('/api/ai', aiRoutes);
} else {
  // Inline AI routes as fallback
  console.log('🤖 Using inline AI routes');
  
  // AI Status endpoint
  app.get('/api/ai/status', (req, res) => {
    try {
      const isAvailable = aiService.isAvailable();
      
      res.json({
        success: true,
        data: {
          available: isAvailable,
          message: isAvailable 
            ? 'AI services are available' 
            : 'AI services require HF_API_TOKEN environment variable',
          services: {
            imageAnalysis: isAvailable,
            textSummarization: isAvailable,
            sentimentAnalysis: isAvailable,
            textComplexity: true, // Always available (local)
            astronomyTips: true   // Always available (local)
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking AI status:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to check AI service status',
        timestamp: new Date().toISOString()
      });
    }
  });

  // AI Health check
  app.get('/api/ai/health', (req, res) => {
    try {
      const isAvailable = aiService.isAvailable();
      
      res.json({
        success: true,
        data: {
          status: isAvailable ? 'healthy' : 'degraded',
          available: isAvailable,
          services: {
            textComplexity: true,
            astronomyTips: true,
            sentimentAnalysis: isAvailable,
            textSummarization: isAvailable,
            imageAnalysis: isAvailable
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'AI health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // AI Analysis endpoint
  app.post('/api/ai/analyze', async (req, res, next) => {
    try {
      const { imageUrl, text, topic } = req.body;
      
      if (!imageUrl && !text && !topic) {
        return res.status(400).json({
          success: false,
          error: 'At least one of imageUrl, text, or topic is required'
        });
      }
      
      const analysis = await aiService.performComprehensiveAnalysis({
        imageUrl,
        text,
        topic
      });
      
      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // AI Image Analysis endpoint
  app.post('/api/ai/image/analyze', async (req, res, next) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
      }
      
      const analysis = await aiService.analyzeImage(imageUrl);
      
      res.json({
        success: true,
        data: { analysis },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // AI Text Analysis endpoint
  app.post('/api/ai/text/analyze', async (req, res, next) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required'
        });
      }
      
      const complexity = aiService.analyzeTextComplexity(text);
      const sentiment = await aiService.analyzeSentiment(text);
      const summary = text.length > 200 ? await aiService.summarizeText(text) : null;
      
      res.json({
        success: true,
        data: {
          complexity,
          sentiment,
          summary
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/ai/text/complexity', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Analyzing text complexity for text length:', text.length);
    
    // Simple text complexity analysis (local, no API needed)
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;
    
    let complexity = 'Simple';
    if (avgWordsPerSentence > 15) complexity = 'Moderate';
    if (avgWordsPerSentence > 25) complexity = 'Complex';
    
    const analysis = {
      wordCount: words,
      sentenceCount: sentences,
      avgWordsPerSentence,
      complexity
    };
    
    res.json({
      success: true,
      data: {
        complexity: analysis,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Text complexity analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Text complexity analysis failed',
      timestamp: new Date().toISOString()
    });
  }
});

// AI Text Analysis endpoint
app.post('/api/ai/text/analyze', async (req, res) => {
  try {
    const { text, summarize = true, maxSummaryLength = 150 } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Performing comprehensive text analysis...');
    
    // Text complexity (always available)
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;
    
    let complexity = 'Simple';
    if (avgWordsPerSentence > 15) complexity = 'Moderate';
    if (avgWordsPerSentence > 25) complexity = 'Complex';
    
    const complexityAnalysis = {
      wordCount: words,
      sentenceCount: sentences,
      avgWordsPerSentence,
      complexity
    };

    // Try AI services if available
    let sentiment = { label: 'NEUTRAL', score: 0.5 };
    let summary = null;
    
    if (aiService && aiService.isAvailable()) {
      try {
        sentiment = await aiService.analyzeSentiment(text);
        if (summarize && text.length > 200) {
          summary = await aiService.summarizeText(text, maxSummaryLength);
        }
      } catch (aiError) {
        console.warn('AI services failed, using fallback:', aiError.message);
      }
    } else {
      console.log('AI services not available, using local analysis only');
    }
    
    res.json({
      success: true,
      data: {
        complexity: complexityAnalysis,
        sentiment,
        summary,
        originalLength: text.length,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Text analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Text analysis failed',
      timestamp: new Date().toISOString()
    });
  }
});


  // AI Tips endpoint
  app.get('/api/ai/tips/:topic', (req, res) => {
    try {
      const { topic } = req.params;
      const tips = aiService.generateAstronomyTips(topic);
      
      res.json({
        success: true,
        data: { tips, topic },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get astronomy tips',
        timestamp: new Date().toISOString()
      });
    }
  });
}

// =================
// NASA API Routes
// =================

// Updated APOD endpoint (now includes AI analysis)
app.get('/api/apod', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching APOD from NASA API with AI analysis...');
    }
    const { date } = req.query;
    
    const apodData = await nasaService.getAPOD(date);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('APOD API Response received:', apodData.title);
    }
    
    res.json({
      success: true,
      data: apodData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Updated Random APOD endpoint
app.get('/api/apod/random', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching random APOD with AI analysis...');
    }
    
    // Generate random date in the past year
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
    const dateString = randomDate.toISOString().split('T')[0];
    
    const apodData = await nasaService.getAPOD(dateString);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('Random APOD received:', apodData.title);
    }
    
    res.json({
      success: true,
      data: apodData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Updated Mars Rover Photos endpoint
app.get('/api/mars/photos', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching Mars rover photos with AI analysis...');
    }
    const { rover = 'curiosity', sol = 1000, page = 1 } = req.query;
    
    const marsData = await nasaService.getMarsRoverPhotos(rover, sol, page);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Mars photos received: ${marsData.photos?.length || 0} photos`);
    }
    
    res.json({
      success: true,
      data: marsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Updated Near Earth Objects endpoint
app.get('/api/neo', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching Near Earth Objects with AI analysis...');
    }
    const { start_date, end_date } = req.query;
    
    // Default to today and next 7 days if no dates provided
    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const neoData = await nasaService.getNearEarthObjects(startDate, endDate);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('NEO data received with AI analysis');
    }
    
    res.json({
      success: true,
      data: neoData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Updated NASA Library Search endpoint
app.get('/api/search', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Searching NASA library with AI analysis...');
    }
    const { q, media_type = 'image' } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const searchData = await nasaService.searchNasaLibrary(q, media_type);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Library search results: ${searchData.collection?.items?.length || 0} items`);
    }
    
    res.json({
      success: true,
      data: searchData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// =================
// Error Handling
// =================

// Error handling middleware - Enhanced for CORS debugging
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Server Error:', err);
    console.error('Request details:', {
      method: req.method,
      url: req.url,
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent')
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error: Frontend domain not allowed',
      origin: req.get('Origin'),
      message: 'Please check CORS configuration'
    });
  }

  // Default error
  let error = { ...err };
  error.message = err.message;

  // NASA API rate limit error
  if (err.response && err.response.status === 429) {
    const message = 'NASA API rate limit exceeded. Please try again later.';
    return res.status(429).json({
      success: false,
      error: message
    });
  }

  // NASA API errors
  if (err.response && err.response.status >= 400) {
    const message = `NASA API Error: ${err.response.data?.error?.message || err.message}`;
    return res.status(err.response.status).json({
      success: false,
      error: message
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API-only deployment - Updated
app.use('*', (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`404: ${req.method} ${req.originalUrl} from origin: ${req.get('Origin')}`);
  }
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: 'This endpoint does not exist. Check /api for available endpoints.',
    availableEndpoints: [
      '/api/health', 
      '/api/cors-test', 
      '/api/apod', 
      '/api/apod/random', 
      '/api/mars/photos', 
      '/api/neo', 
      '/api/search',
      '/api/ai/status',
      '/api/ai/health'
    ]
  });
});

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NASA API Backend with AI running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 NASA API Key: ${NASA_API_KEY === 'DEMO_KEY' ? 'Using DEMO_KEY (limited)' : 'Using real API key'}`);
    console.log(`🤖 AI Services: ${process.env.HF_API_TOKEN ? 'Available with HuggingFace token' : 'Unavailable - missing HF_API_TOKEN'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🧪 CORS Test: http://localhost:${PORT}/api/cors-test`);
    console.log(`🤖 AI Status: http://localhost:${PORT}/api/ai/status`);
    console.log(`🏥 AI Health: http://localhost:${PORT}/api/ai/health`);
    console.log(`✅ CORS configured for frontend: https://nasa-react-express-app-1.onrender.com`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  if (server) {
    server.close(() => {
      console.log('Server terminated gracefully');
    });
  }
});

process.on('SIGINT', () => {
  if (server) {
    server.close(() => {
      console.log('Server terminated gracefully');
    });
  }
});

module.exports = app;
