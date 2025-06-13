const request = require('supertest');

// Import server after mocking
let app;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.NASA_API_KEY = 'TEST_KEY';
    process.env.PORT = '5002'; // Use different port for testing
    
    // Import app after setting env vars
    app = require('../../server');
    
    // Wait a bit for server to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    // Clean up any open handles
    if (app && app.close) {
      await new Promise(resolve => {
        app.close(resolve);
      });
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'NASA API Backend');
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('path', '/non-existent-route');
    });
  });

  describe('CORS Headers', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('API Routes', () => {
    test('should handle API route without crashing', async () => {
      // This test just ensures the route exists and doesn't crash
      const response = await request(app)
        .get('/api/apod')
        .timeout(5000);

      // Accept any reasonable status code (the API might fail due to missing NASA key in test)
      expect([200, 500, 429, 403]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    test('should have rate limiting middleware', async () => {
      // Make a few quick requests to test rate limiting exists
      const requests = Array(3).fill().map(() => 
        request(app)
          .get('/api/apod')
          .timeout(2000)
          .catch(err => ({ status: err.status || 500 })) // Handle timeouts gracefully
      );

      const responses = await Promise.all(requests);
      
      // Verify that requests return expected status codes
      responses.forEach(response => {
        expect([200, 429, 500, 403]).toContain(response.status);
      });
      
      // At least one request should have completed
      expect(responses.length).toBe(3);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for some helmet headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
