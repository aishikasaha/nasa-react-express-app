const axios = require('axios');
const logger = require('../utils/logger');

class NasaService {
  constructor() {
    this.baseURL = 'https://api.nasa.gov';
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  }

  async getAPOD(date = null) {
    try {
      const params = { api_key: this.apiKey };
      if (date) params.date = date;

      const response = await axios.get(`${this.baseURL}/planetary/apod`, { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching APOD:', error.message);
      throw new Error(`Failed to fetch Astronomy Picture of the Day: ${error.message}`);
    }
  }

  async getMarsRoverPhotos(rover = 'curiosity', sol = 1000, page = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/mars-photos/api/v1/rovers/${rover}/photos`,
        {
          params: {
            sol,
            page,
            api_key: this.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching Mars rover photos:', error.message);
      throw new Error(`Failed to fetch Mars rover photos: ${error.message}`);
    }
  }

  async getNearEarthObjects(startDate, endDate) {
    try {
      const response = await axios.get(`${this.baseURL}/neo/rest/v1/feed`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          api_key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching NEO data:', error.message);
      throw new Error(`Failed to fetch Near Earth Objects: ${error.message}`);
    }
  }

  async searchNasaLibrary(query, mediaType = 'image') {
    try {
      const response = await axios.get('https://images-api.nasa.gov/search', {
        params: {
          q: query,
          media_type: mediaType
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error searching NASA library:', error.message);
      throw new Error(`Failed to search NASA library: ${error.message}`);
    }
  }
}

module.exports = new NasaService();