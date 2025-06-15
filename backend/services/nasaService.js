// services/nasaService.js
const axios = require('axios');
const logger = require('../utils/logger');
const aiService = require('./aiService');

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
      const apodData = response.data;
      
      // Add AI analysis if available
      if (aiService.isAvailable()) {
        try {
          const aiAnalysis = await aiService.performComprehensiveAnalysis({
            imageUrl: apodData.url,
            text: apodData.explanation,
            topic: apodData.title
          });
          
          apodData.aiAnalysis = aiAnalysis;
        } catch (aiError) {
          logger.warn('AI analysis failed for APOD:', aiError.message);
          apodData.aiAnalysis = {
            error: 'AI analysis temporarily unavailable',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      return apodData;
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
      
      const marsData = response.data;
      
      // Add AI analysis to first few photos if available
      if (aiService.isAvailable() && marsData.photos && marsData.photos.length > 0) {
        try {
          // Analyze first photo only to avoid rate limits
          const firstPhoto = marsData.photos[0];
          const aiAnalysis = await aiService.performComprehensiveAnalysis({
            imageUrl: firstPhoto.img_src,
            topic: `Mars ${rover} rover`
          });
          
          marsData.aiAnalysis = aiAnalysis;
        } catch (aiError) {
          logger.warn('AI analysis failed for Mars photos:', aiError.message);
        }
      }
      
      return marsData;
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
      
      const neoData = response.data;
      
      // Add AI analysis for NEO data
      if (aiService.isAvailable()) {
        try {
          const objectCount = neoData.element_count || 0;
          const analysisText = `Near Earth Objects data for ${startDate} to ${endDate}. Found ${objectCount} objects.`;
          
          const aiAnalysis = await aiService.performComprehensiveAnalysis({
            text: analysisText,
            topic: 'near earth objects asteroids'
          });
          
          neoData.aiAnalysis = aiAnalysis;
        } catch (aiError) {
          logger.warn('AI analysis failed for NEO data:', aiError.message);
        }
      }
      
      return neoData;
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
      
      const searchData = response.data;
      
      // Add AI analysis for search results
      if (aiService.isAvailable() && searchData.collection?.items?.length > 0) {
        try {
          const firstItem = searchData.collection.items[0];
          const itemData = firstItem.data?.[0];
          
          if (itemData) {
            const aiAnalysis = await aiService.performComprehensiveAnalysis({
              text: itemData.description || itemData.title,
              topic: query
            });
            
            searchData.aiAnalysis = aiAnalysis;
          }
        } catch (aiError) {
          logger.warn('AI analysis failed for library search:', aiError.message);
        }
      }
      
      return searchData;
    } catch (error) {
      logger.error('Error searching NASA library:', error.message);
      throw new Error(`Failed to search NASA library: ${error.message}`);
    }
  }

  // New method: Get AI analysis for any NASA data
  async getAIAnalysis(data) {
    try {
      if (!aiService.isAvailable()) {
        throw new Error('AI service not available - missing API token');
      }
      
      return await aiService.performComprehensiveAnalysis(data);
    } catch (error) {
      logger.error('Error in AI analysis:', error.message);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }
}

module.exports = new NasaService();