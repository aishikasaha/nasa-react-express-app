const request = require('supertest');
const express = require('express');
const apodRoutes = require('../../routes/apod');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/apod', apodRoutes);

// Add error handling middleware for tests
app.use((err, req, res, next) => {
  console.error('Test Error Middleware:', err.message);
  
  // Handle rate limit errors specifically
  if (err.response && err.response.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'NASA API rate limit exceeded. Please try again later.'
    });
  }
  
  // Handle other API errors
  if (err.response && err.response.status >= 400) {
    return res.status(err.response.status).json({
      success: false,
      error: err.message || 'API Error'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Mock the NASA service
jest.mock('../../services/nasaService', () => ({
  getAPOD: jest.fn(),
}));

const nasaService = require('../../services/nasaService');

describe('APOD Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Cleanup to prevent worker exit issues
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('GET /api/apod', () => {
    test('should return APOD data successfully', async () => {
      const mockApodData = {
        date: '2024-01-15',
        title: 'Test Nebula',
        explanation: 'A beautiful test nebula in space.',
        url: 'https://example.com/test-image.jpg',
        media_type: 'image'
      };

      nasaService.getAPOD.mockResolvedValue(mockApodData);

      const response = await request(app)
        .get('/api/apod')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data', mockApodData);
      expect(response.body).toHaveProperty('timestamp');
      expect(nasaService.getAPOD).toHaveBeenCalledWith(undefined);
    });

    test('should return APOD data for specific date', async () => {
      const testDate = '2024-01-01';
      const mockApodData = {
        date: testDate,
        title: 'New Year Nebula',
        explanation: 'A cosmic celebration.',
        url: 'https://example.com/new-year.jpg',
        media_type: 'image'
      };

      nasaService.getAPOD.mockResolvedValue(mockApodData);

      const response = await request(app)
        .get(`/api/apod?date=${testDate}`)
        .expect(200);

      expect(response.body.data.date).toBe(testDate);
      expect(nasaService.getAPOD).toHaveBeenCalledWith(testDate);
    });

    test('should handle NASA API errors', async () => {
      const errorMessage = 'NASA API Error';
      const error = new Error(errorMessage);
      
      nasaService.getAPOD.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/apod')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', errorMessage);
      expect(typeof response.body.error).toBe('string');
    });

    test('should handle rate limit errors', async () => {
      const error = new Error('Rate limit exceeded');
      error.response = { status: 429 };
      
      nasaService.getAPOD.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/apod')
        .expect(429);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('rate limit');
    });

    test('should handle other API errors with status codes', async () => {
      const error = new Error('API Error');
      error.response = { status: 400 };
      
      nasaService.getAPOD.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/apod')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'API Error');
    });

    test('should handle date validation errors', async () => {
      const error = new Error('Invalid date format');
      error.response = { status: 400 };
      
      nasaService.getAPOD.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/apod?date=invalid-date')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/apod/random', () => {
    test('should return random APOD data', async () => {
      const mockApodData = {
        date: '2023-06-15',
        title: 'Random Space Object',
        explanation: 'A randomly selected astronomical image.',
        url: 'https://example.com/random-image.jpg',
        media_type: 'image'
      };

      nasaService.getAPOD.mockResolvedValue(mockApodData);

      const response = await request(app)
        .get('/api/apod/random')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data', mockApodData);
      expect(nasaService.getAPOD).toHaveBeenCalled();
    });

    test('should generate random date in past year', async () => {
      const mockApodData = {
        date: '2023-08-20',
        title: 'Historical Image',
        explanation: 'An image from the past.',
        url: 'https://example.com/historical.jpg',
        media_type: 'image'
      };

      nasaService.getAPOD.mockResolvedValue(mockApodData);

      const response = await request(app)
        .get('/api/apod/random')
        .expect(200);

      // Verify that getAPOD was called with a date string
      const callArgs = nasaService.getAPOD.mock.calls[0];
      expect(callArgs[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Verify the date is in the past year
      const calledDate = new Date(callArgs[0]);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      expect(calledDate.getTime()).toBeGreaterThanOrEqual(oneYearAgo.getTime());
      expect(calledDate.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    test('should handle errors in random APOD', async () => {
      const error = new Error('Random APOD API Error');
      
      nasaService.getAPOD.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/apod/random')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Random APOD API Error');
    });

    test('should handle rate limit errors in random APOD', async () => {
      const error = new Error('Rate limit exceeded for random APOD');
      error.response = { status: 429 };
      
      nasaService.getAPOD.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/apod/random')
        .expect(429);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('rate limit');
    });
  });
});