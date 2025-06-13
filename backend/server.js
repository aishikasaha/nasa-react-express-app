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

// Body parsing middleware
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

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 NASA API Backend',
    version: '1.0.0',
    description: 'Express backend for NASA React app',
    cors: 'Configured for separate frontend deployment',
    endpoints: {
      health: '/api/health',
      apod: '/api/apod',
      randomApod: '/api/apod/random',
      marsPhotos: '/api/mars/photos',
      nearEarthObjects: '/api/neo',
      search: '/api/search'
    },
    documentation: 'https://api.nasa.gov/',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint - Enhanced for debugging
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NASA API Backend',
    nasa_key_status: NASA_API_KEY !== 'DEMO_KEY' ? 'Real Key' : 'Demo Key',
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

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'NASA API Endpoints',
    endpoints: {
      'GET /api/health': 'Health check and status',
      'GET /api/cors-test': 'Test CORS configuration',
      'GET /api/apod': 'Astronomy Picture of the Day (optional ?date=YYYY-MM-DD)',
      'GET /api/apod/random': 'Random APOD from past year',
      'GET /api/mars/photos': 'Mars Rover Photos (optional ?rover=curiosity&sol=1000&page=1)',
      'GET /api/neo': 'Near Earth Objects (optional ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD)',
      'GET /api/search': 'NASA Image/Video Library Search (required ?q=search_term&media_type=image)'
    },
    timestamp: new Date().toISOString()
  });
});

// NASA APOD API
app.get('/api/apod', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching APOD from NASA API...');
    }
    const { date } = req.query;
    
    const params = {
      api_key: NASA_API_KEY
    };
    
    if (date) {
      params.date = date;
    }
    
    const response = await axios.get('https://api.nasa.gov/planetary/apod', { params });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('APOD API Response received:', response.data.title);
    }
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Random APOD (random date in past year)
app.get('/api/apod/random', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching random APOD...');
    }
    
    // Generate random date in the past year
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
    const dateString = randomDate.toISOString().split('T')[0];
    
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: NASA_API_KEY,
        date: dateString
      }
    });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('Random APOD received:', response.data.title);
    }
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Mars Rover Photos API
app.get('/api/mars/photos', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching Mars rover photos...');
    }
    const { rover = 'curiosity', sol = 1000, page = 1 } = req.query;
    
    const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`, {
      params: {
        sol: sol,
        page: page,
        api_key: NASA_API_KEY
      }
    });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Mars photos received: ${response.data.photos.length} photos`);
    }
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Near Earth Objects API
app.get('/api/neo', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Fetching Near Earth Objects...');
    }
    const { start_date, end_date } = req.query;
    
    // Default to today and next 7 days if no dates provided
    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await axios.get('https://api.nasa.gov/neo/rest/v1/feed', {
      params: {
        start_date: startDate,
        end_date: endDate,
        api_key: NASA_API_KEY
      }
    });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('NEO data received');
    }
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// NASA Image and Video Library Search
app.get('/api/search', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Searching NASA library...');
    }
    const { q, media_type = 'image' } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const response = await axios.get('https://images-api.nasa.gov/search', {
      params: {
        q: q,
        media_type: media_type
      }
    });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Library search results: ${response.data.collection?.items?.length || 0} items`);
    }
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

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
    availableEndpoints: ['/api/health', '/api/cors-test', '/api/apod', '/api/apod/random', '/api/mars/photos', '/api/neo', '/api/search']
  });
});

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NASA API Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 NASA API Key: ${NASA_API_KEY === 'DEMO_KEY' ? 'Using DEMO_KEY (limited)' : 'Using real API key'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🧪 CORS Test: http://localhost:${PORT}/api/cors-test`);
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