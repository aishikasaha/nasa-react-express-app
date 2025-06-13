import axios from 'axios';

// Updated API base URL configuration for separate deployments
const getAPIBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable or fallback to your backend URL
    return process.env.REACT_APP_API_URL || 'https://nasa-react-express-app.onrender.com';
  }
  
  // For local development
  return 'http://localhost:5000';
};

const API_BASE_URL = getAPIBaseURL();

console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔧 Environment Variable:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // Increased timeout for NASA API and Render cold starts
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Important for CORS with separate deployments
  withCredentials: false, // Set to false for separate domains unless you need cookies
});

// Request interceptor for logging and debugging
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${fullUrl}`);
    console.log('📋 Request details:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      headers: config.headers,
      timeout: config.timeout
    });
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataPreview: response.data.success ? 'Success' : 'Data received'
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      code: error.code
    });

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The server might be sleeping (Render cold start). Please try again.');
    }

    if (error.code === 'ERR_NETWORK') {
      throw new Error(`Network error: Cannot connect to ${API_BASE_URL}. Check if backend is running.`);
    }

    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check the backend server.');
    }

    if (error.response?.status === 0) {
      throw new Error('CORS error: Backend not allowing frontend domain. Check CORS configuration.');
    }

    // Return the actual error message from the API
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Unknown error occurred';
    throw new Error(errorMessage);
  }
);

// Health check function to test API connectivity
export const testAPIConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/api/health');
    console.log('✅ API connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    throw error;
  }
};

// API methods with detailed logging
export const nasaAPI = {
  // Health check
  healthCheck: async () => {
    console.log('🏥 Health check');
    return api.get('/api/health');
  },

  // APOD endpoints
  getAPOD: async (date) => {
    console.log('📡 Fetching APOD for date:', date || 'today');
    return api.get('/api/apod', { params: date ? { date } : {} });
  },

  getRandomAPOD: async () => {
    console.log('🎲 Fetching random APOD');
    return api.get('/api/apod/random');
  },

  // Mars rover endpoints
  getMarsPhotos: async (rover = 'curiosity', sol = 1000, page = 1) => {
    console.log('🚀 Fetching Mars photos:', { rover, sol, page });
    return api.get('/api/mars/photos', { 
      params: { rover, sol, page },
      timeout: 60000 // Mars photos can take longer
    });
  },

  // Near Earth Objects
  getNearEarthObjects: async (startDate, endDate) => {
    console.log('☄️ Fetching NEO data:', { startDate, endDate });
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/api/neo', { params });
  },

  // NASA Library search
  searchLibrary: async (query, mediaType = 'image') => {
    console.log('🔍 Searching NASA library:', { query, mediaType });
    if (!query) {
      throw new Error('Search query is required');
    }
    return api.get('/api/search', { 
      params: { q: query, media_type: mediaType },
      timeout: 60000 // Search can take longer
    });
  }
};

// Debug function to check configuration
export const debugAPIConfig = () => {
  console.log('🔧 API Configuration Debug:', {
    environment: process.env.NODE_ENV,
    apiBaseURL: API_BASE_URL,
    environmentVariable: process.env.REACT_APP_API_URL,
    currentDomain: window.location.origin,
    userAgent: navigator.userAgent,
    axiosDefaults: {
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      headers: api.defaults.headers
    }
  });
};

// Wake up function for Render free tier (to handle cold starts)
export const wakeUpBackend = async () => {
  try {
    console.log('☕ Waking up backend (Render cold start)...');
    await testAPIConnection();
    console.log('✅ Backend is awake and ready!');
    return true;
  } catch (error) {
    console.log('⏰ Backend might be cold starting, waiting...');
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
      await testAPIConnection();
      console.log('✅ Backend is now awake!');
      return true;
    } catch (retryError) {
      console.error('❌ Backend wake up failed:', retryError);
      return false;
    }
  }
};

export default api;