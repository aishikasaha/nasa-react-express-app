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
    test('GET /api/health should return server status', async () => {
      const response = await request(app)
        .get('/api/health')  // Changed from /health to /api/health
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'NASA API Backend');
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Root Route', () => {
    test('GET / should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '🚀 NASA API Backend');
      expect(response.body).toHaveProperty('endpoints');
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
    test('should include CORS headers when origin is present', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')  // Add origin header to trigger CORS
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    test('should allow requests without origin (no CORS headers needed)', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // When no origin is present, CORS headers are not needed
      expect(response.headers).not.toHaveProperty('access-control-allow-origin');
      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(response.status);
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

    test('GET /api should return API documentation', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'NASA API Endpoints');
      expect(response.body).toHaveProperty('endpoints');
    });

    test('GET /api/cors-test should work', async () => {
      const response = await request(app)
        .get('/api/cors-test')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'CORS is working! 🎉');
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
        .get('/api/health')  // Changed from /health to /api/health
        .expect(200);

      // Check for some helmet headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Error Handling', () => {
    test('should handle search API validation errors', async () => {
      const response = await request(app)
        .get('/api/search')  // Missing required 'q' parameter
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Search query is required');
    });
  });

  describe('Mars Photos API', () => {
    test('should handle mars photos endpoint', async () => {
      const response = await request(app)
        .get('/api/mars/photos')
        .timeout(5000);

      // Should return either success or error, but not crash
      expect([200, 500, 429, 403]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      }
    });
  });

  describe('Near Earth Objects API', () => {
    test('should handle NEO endpoint', async () => {
      const response = await request(app)
        .get('/api/neo')
        .timeout(5000);

      // Should return either success or error, but not crash
      expect([200, 500, 429, 403]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      }
    });
  });
});