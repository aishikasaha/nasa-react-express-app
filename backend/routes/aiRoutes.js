// routes/aiRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');

const router = express.Router();

// AI-specific rate limiting (more restrictive due to external API usage)
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 AI requests per windowMs
  message: {
    success: false,
    error: 'Too many AI requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for status and health check endpoints
    return req.path === '/status' || req.path === '/health';
  }
});

// Heavy AI operations rate limiting (even more restrictive)
const heavyAIRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 heavy requests per 5 minutes
  message: {
    success: false,
    error: 'Too many intensive AI requests. Please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply AI rate limiting to all routes
router.use(aiRateLimit);

// Logging middleware for AI routes
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🤖 AI Route: ${req.method} ${req.path} - IP: ${req.ip}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('🤖 AI Request body:', {
        hasImageUrl: !!req.body.imageUrl,
        hasText: !!req.body.text,
        textLength: req.body.text?.length || 0,
        hasTopic: !!req.body.topic,
        otherFields: Object.keys(req.body).filter(k => !['imageUrl', 'text', 'topic'].includes(k))
      });
    }
  }
  next();
});

// =================
// Status & Health
// =================

/**
 * @route GET /api/ai/status
 * @desc Get AI service status and availability
 * @access Public
 */
router.get('/status', aiController.getStatus);

/**
 * @route GET /api/ai/health
 * @desc Comprehensive health check of AI services
 * @access Public
 */
router.get('/health', aiController.healthCheck);

// =================
// Comprehensive Analysis
// =================

/**
 * @route POST /api/ai/analyze
 * @desc Perform comprehensive AI analysis on provided data
 * @body { imageUrl?, text?, topic? }
 * @access Public
 * @rateLimit Heavy (10 per 5 minutes)
 */
router.post('/analyze', heavyAIRateLimit, aiController.analyzeData);

/**
 * @route POST /api/ai/batch
 * @desc Batch analysis of multiple items (max 10)
 * @body { items: Array<{imageUrl?, text?, topic?}> }
 * @access Public
 * @rateLimit Heavy (10 per 5 minutes)
 */
router.post('/batch', heavyAIRateLimit, aiController.batchAnalyze);

// =================
// Image Analysis
// =================

/**
 * @route POST /api/ai/image/analyze
 * @desc Analyze image content using AI
 * @body { imageUrl: string }
 * @access Public
 * @rateLimit Heavy (10 per 5 minutes)
 */
router.post('/image/analyze', heavyAIRateLimit, aiController.analyzeImage);

// =================
// Text Analysis
// =================

/**
 * @route POST /api/ai/text/analyze
 * @desc Comprehensive text analysis (complexity, sentiment, summary)
 * @body { text: string, summarize?: boolean, maxSummaryLength?: number }
 * @access Public
 */
router.post('/text/analyze', aiController.analyzeText);

/**
 * @route POST /api/ai/text/summarize
 * @desc Summarize text content
 * @body { text: string, maxLength?: number, minLength?: number }
 * @access Public
 */
router.post('/text/summarize', aiController.summarizeText);

/**
 * @route POST /api/ai/text/sentiment
 * @desc Analyze text sentiment
 * @body { text: string }
 * @access Public
 */
router.post('/text/sentiment', aiController.analyzeSentiment);

/**
 * @route POST /api/ai/text/complexity
 * @desc Analyze text complexity (local analysis, always available)
 * @body { text: string }
 * @access Public
 */
router.post('/text/complexity', aiController.analyzeTextComplexity);

// =================
// Astronomy Tips
// =================

/**
 * @route GET /api/ai/tips/:topic
 * @desc Get astronomy tips for a specific topic
 * @params { topic: string }
 * @query { count?: number } - Number of tips to return (default: 3)
 * @access Public
 */
router.get('/tips/:topic', aiController.getAstronomyTips);

/**
 * @route GET /api/ai/tips
 * @desc Get general astronomy tips
 * @query { count?: number, topic?: string }
 * @access Public
 */
router.get('/tips', (req, res) => {
  const topic = req.query.topic || 'default';
  req.params.topic = topic;
  aiController.getAstronomyTips(req, res);
});

// =================
// Error Handling
// =================

// Handle 404 for AI routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'AI endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/ai/status',
      'GET /api/ai/health',
      'POST /api/ai/analyze',
      'POST /api/ai/batch',
      'POST /api/ai/image/analyze',
      'POST /api/ai/text/analyze',
      'POST /api/ai/text/summarize',
      'POST /api/ai/text/sentiment',
      'POST /api/ai/text/complexity',
      'GET /api/ai/tips/:topic',
      'GET /api/ai/tips'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;