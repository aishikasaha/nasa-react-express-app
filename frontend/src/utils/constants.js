export const ROVERS = [
  { value: 'curiosity', label: 'Curiosity', maxSol: 4000 },
  { value: 'perseverance', label: 'Perseverance', maxSol: 1000 }
];

export const API_ENDPOINTS = {
  APOD: '/apod',
  MARS_PHOTOS: '/mars/photos',
  NEO: '/neo',
  SEARCH: '/search'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'Unable to fetch data from NASA API.',
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

export const DATE_UTILS = {
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  getRandomPastDate: (daysBack = 365) => {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * daysBack));
    return randomDate.toISOString().split('T')[0];
  },
  
  getTodayString: () => {
    return new Date().toISOString().split('T')[0];
  },
  
  getDateRange: (days = 7) => {
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { start, end };
  }
};
