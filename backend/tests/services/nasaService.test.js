const axios = require('axios');
const nasaService = require('../../services/nasaService');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('NASA Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAPOD', () => {
    test('should fetch APOD data successfully', async () => {
      const mockResponse = {
        data: {
          date: '2024-01-15',
          title: 'Test Galaxy',
          explanation: 'A test galaxy image.',
          url: 'https://example.com/galaxy.jpg',
          media_type: 'image'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getAPOD();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { params: { api_key: 'TEST_KEY' } }
      );
    });

    test('should fetch APOD data for specific date', async () => {
      const testDate = '2024-01-01';
      const mockResponse = {
        data: {
          date: testDate,
          title: 'New Year Galaxy',
          explanation: 'A galaxy to celebrate the new year.',
          url: 'https://example.com/new-year-galaxy.jpg',
          media_type: 'image'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getAPOD(testDate);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { params: { api_key: 'TEST_KEY', date: testDate } }
      );
    });

    test('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(nasaService.getAPOD()).rejects.toThrow('Failed to fetch Astronomy Picture of the Day');
    });
  });

  describe('getMarsRoverPhotos', () => {
    test('should fetch Mars rover photos successfully', async () => {
      const mockResponse = {
        data: {
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
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getMarsRoverPhotos('curiosity', 1000, 1);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos',
        {
          params: {
            sol: 1000,
            page: 1,
            api_key: 'TEST_KEY'
          }
        }
      );
    });
  });
});
