const request = require('supertest');
const express = require('express');
const marsRoutes = require('../../routes/mars');
const errorHandler = require('../../middleware/errorHandler');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/mars', marsRoutes);
app.use(errorHandler);

// Mock the NASA service
jest.mock('../../services/nasaService', () => ({
  getMarsRoverPhotos: jest.fn(),
}));

const nasaService = require('../../services/nasaService');

describe('Mars Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('GET /api/mars/photos', () => {
    test('should return Mars rover photos successfully', async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 123,
            sol: 1000,
            camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
            img_src: 'https://example.com/mars-photo.jpg',
            earth_date: '2023-05-30',
            rover: { name: 'Curiosity', status: 'active' }
          }
        ]
      };

      nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotosData);

      const response = await request(app)
        .get('/api/mars/photos')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data', mockPhotosData);
      expect(nasaService.getMarsRoverPhotos).toHaveBeenCalledWith('curiosity', 1000, 1);
    });

    test('should handle custom rover and sol parameters', async () => {
      const mockPhotosData = { photos: [] };
      nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotosData);

      await request(app)
        .get('/api/mars/photos?rover=perseverance&sol=500&page=2')
        .expect(200);

      // Expect numbers (after conversion in controller)
      expect(nasaService.getMarsRoverPhotos).toHaveBeenCalledWith('perseverance', 500, 2);
    });

    test('should handle invalid sol parameter', async () => {
      const response = await request(app)
        .get('/api/mars/photos?sol=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid sol parameter');
    });

    test('should handle invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/mars/photos?page=0')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid page parameter');
    });

    test('should handle negative sol parameter', async () => {
      const response = await request(app)
        .get('/api/mars/photos?sol=-1')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid sol parameter');
    });

    test('should use default values when parameters are not provided', async () => {
      const mockPhotosData = { photos: [] };
      nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotosData);

      await request(app)
        .get('/api/mars/photos')
        .expect(200);

      expect(nasaService.getMarsRoverPhotos).toHaveBeenCalledWith('curiosity', 1000, 1);
    });

    test('should handle NASA API errors', async () => {
      const error = new Error('Mars API Error');
      nasaService.getMarsRoverPhotos.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/mars/photos')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle string numbers correctly', async () => {
      const mockPhotosData = { photos: [] };
      nasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotosData);

      await request(app)
        .get('/api/mars/photos?rover=curiosity&sol=1500&page=3')
        .expect(200);

      // Should convert string "1500" and "3" to numbers 1500 and 3
      expect(nasaService.getMarsRoverPhotos).toHaveBeenCalledWith('curiosity', 1500, 3);
    });
  });
});
