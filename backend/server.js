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

// Security middleware
app.use(helmet());

// CORS middleware - Updated for production deployment
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, /\.vercel\.app$/, /\.onrender\.com$/]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

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

// Logging middleware for requests
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// ROOT ROUTE - This was missing!
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 NASA API Backend',
    version: '1.0.0',
    description: 'Express backend for NASA React app',
    endpoints: {
      health: '/health',
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NASA API Backend',
    nasa_key_status: NASA_API_KEY !== 'DEMO_KEY' ? 'Real Key' : 'Demo Key',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'NASA API Endpoints',
    endpoints: {
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

// Serve static files from React build (for full-stack deployment)
if (process.env.NODE_ENV === 'production' && process.env.SERVE_STATIC === 'true') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // The "catchall" handler: send back React's index.html file for non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
} else {
  // 404 handler for API-only deployment
  app.use('*', (req, res) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`404: ${req.method} ${req.originalUrl}`);
    }
    res.status(404).json({ 
      success: false,
      error: 'Route not found',
      path: req.originalUrl,
      message: 'This endpoint does not exist. Check /api for available endpoints.'
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Server Error:', err);
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

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 NASA API Backend running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Documentation: http://localhost:${PORT}/api`);
    console.log(`NASA API Key: ${NASA_API_KEY === 'DEMO_KEY' ? 'Using DEMO_KEY (limited)' : 'Using real API key'}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
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