
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for NASA API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });
    
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check the backend server.');
    }
    
    // Return the actual error message from the API
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
    throw new Error(errorMessage);
  }
);

// API methods with detailed logging
export const nasaAPI = {
  // APOD endpoints
  getAPOD: async (date) => {
    console.log('📡 Fetching APOD for date:', date || 'today');
    return api.get('/apod', { params: { date } });
  },
  
  getRandomAPOD: async () => {
    console.log('🎲 Fetching random APOD');
    return api.get('/apod/random');
  },
  
  // Mars rover endpoints
  getMarsPhotos: async (rover, sol, page) => {
    console.log('🚀 Fetching Mars photos:', { rover, sol, page });
    return api.get('/mars/photos', { params: { rover, sol, page } });
  },
  
  // Near Earth Objects
  getNearEarthObjects: async (startDate, endDate) => {
    console.log('☄️ Fetching NEO data:', { startDate, endDate });
    return api.get('/neo', { params: { start_date: startDate, end_date: endDate } });
  },
  
  // NASA Library search
  searchLibrary: async (query, mediaType) => {
    console.log('🔍 Searching NASA library:', { query, mediaType });
    return api.get('/search', { params: { q: query, media_type: mediaType } });
  }
};

export default api;
