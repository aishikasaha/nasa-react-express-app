// controllers/aiController.js
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

class AIController {
  // Get AI service status
  async getStatus(req, res) {
    try {
      const isAvailable = aiService.isAvailable();
      
      res.json({
        success: true,
        data: {
          available: isAvailable,
          message: isAvailable 
            ? 'AI services are available' 
            : 'AI services require HF_API_TOKEN environment variable',
          services: {
            imageAnalysis: isAvailable,
            textSummarization: isAvailable,
            sentimentAnalysis: isAvailable,
            textComplexity: true, // Always available (local)
            astronomyTips: true   // Always available (local)
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error checking AI status:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to check AI service status',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Comprehensive AI analysis
  async analyzeData(req, res) {
    try {
      const { imageUrl, text, topic } = req.body;
      
      // Validation
      if (!imageUrl && !text && !topic) {
        return res.status(400).json({
          success: false,
          error: 'At least one of imageUrl, text, or topic is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Performing comprehensive AI analysis', { 
        hasImage: !!imageUrl, 
        hasText: !!text, 
        hasTopic: !!topic 
      });
      
      const analysis = await aiService.performComprehensiveAnalysis({
        imageUrl,
        text,
        topic
      });
      
      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in comprehensive AI analysis:', error.message);
      res.status(500).json({
        success: false,
        error: `AI analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Image analysis only
  async analyzeImage(req, res) {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Analyzing image:', imageUrl);
      
      const analysis = await aiService.analyzeImage(imageUrl);
      
      res.json({
        success: true,
        data: { 
          analysis,
          imageUrl,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in image analysis:', error.message);
      res.status(500).json({
        success: false,
        error: `Image analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Text analysis (complexity, sentiment, summarization)
  async analyzeText(req, res) {
    try {
      const { text, summarize = true, maxSummaryLength = 150 } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Analyzing text', { 
        textLength: text.length, 
        summarize,
        maxSummaryLength 
      });
      
      // Perform multiple text analyses
      const [complexity, sentiment, summary] = await Promise.all([
        Promise.resolve(aiService.analyzeTextComplexity(text)),
        aiService.analyzeSentiment(text),
        summarize && text.length > 200 
          ? aiService.summarizeText(text, maxSummaryLength)
          : Promise.resolve(null)
      ]);
      
      res.json({
        success: true,
        data: {
          complexity,
          sentiment,
          summary,
          originalLength: text.length,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in text analysis:', error.message);
      res.status(500).json({
        success: false,
        error: `Text analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Text summarization only
  async summarizeText(req, res) {
    try {
      const { text, maxLength = 150, minLength = 20 } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
          timestamp: new Date().toISOString()
        });
      }

      if (text.length < minLength) {
        return res.json({
          success: true,
          data: {
            summary: text,
            originalLength: text.length,
            summarized: false,
            reason: 'Text too short to summarize'
          },
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Summarizing text', { 
        originalLength: text.length, 
        maxLength, 
        minLength 
      });
      
      const summary = await aiService.summarizeText(text, maxLength);
      
      res.json({
        success: true,
        data: {
          summary,
          originalLength: text.length,
          summaryLength: summary.length,
          summarized: summary !== text,
          compressionRatio: text.length > 0 ? (summary.length / text.length).toFixed(2) : 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in text summarization:', error.message);
      res.status(500).json({
        success: false,
        error: `Text summarization failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Sentiment analysis only
  async analyzeSentiment(req, res) {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Analyzing sentiment', { textLength: text.length });
      
      const sentiment = await aiService.analyzeSentiment(text);
      
      res.json({
        success: true,
        data: {
          sentiment,
          textLength: text.length,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in sentiment analysis:', error.message);
      res.status(500).json({
        success: false,
        error: `Sentiment analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Text complexity analysis (local, always available)
  async analyzeTextComplexity(req, res) {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Analyzing text complexity', { textLength: text.length });
      
      const complexity = aiService.analyzeTextComplexity(text);
      
      res.json({
        success: true,
        data: {
          complexity,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in text complexity analysis:', error.message);
      res.status(500).json({
        success: false,
        error: `Text complexity analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get astronomy tips
  async getAstronomyTips(req, res) {
    try {
      const { topic } = req.params;
      const { count = 3 } = req.query;
      
      if (!topic) {
        return res.status(400).json({
          success: false,
          error: 'Topic parameter is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Getting astronomy tips', { topic, count });
      
      const allTips = aiService.generateAstronomyTips(topic);
      const tips = allTips.slice(0, parseInt(count));
      
      res.json({
        success: true,
        data: { 
          tips,
          topic,
          totalAvailable: allTips.length,
          returned: tips.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting astronomy tips:', error.message);
      res.status(500).json({
        success: false,
        error: `Failed to get astronomy tips: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Batch analysis for multiple items
  async batchAnalyze(req, res) {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Items array is required and must not be empty',
          timestamp: new Date().toISOString()
        });
      }

      if (items.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 items allowed per batch',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Performing batch AI analysis', { itemCount: items.length });
      
      const results = await Promise.allSettled(
        items.map(async (item, index) => {
          try {
            const analysis = await aiService.performComprehensiveAnalysis(item);
            return { index, success: true, data: analysis };
          } catch (error) {
            return { 
              index, 
              success: false, 
              error: error.message,
              item: { ...item, sensitiveData: undefined } // Remove sensitive data
            };
          }
        })
      );

      const successful = results.filter(r => r.value.success).map(r => r.value);
      const failed = results.filter(r => !r.value.success).map(r => r.value);
      
      res.json({
        success: true,
        data: {
          results: successful,
          errors: failed,
          summary: {
            total: items.length,
            successful: successful.length,
            failed: failed.length,
            successRate: `${((successful.length / items.length) * 100).toFixed(1)}%`
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in batch analysis:', error.message);
      res.status(500).json({
        success: false,
        error: `Batch analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Health check for AI services
  async healthCheck(req, res) {
    try {
      const isAvailable = aiService.isAvailable();
      const timestamp = new Date().toISOString();
      
      // Quick test of each service
      const serviceTests = {
        textComplexity: true, // Always available
        astronomyTips: true   // Always available
      };

      if (isAvailable) {
        try {
          // Quick test of external services
          const testText = "NASA's Astronomy Picture of the Day showcases stunning cosmic imagery.";
          await Promise.race([
            aiService.analyzeSentiment(testText),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          serviceTests.sentimentAnalysis = true;
          serviceTests.textSummarization = true;
          serviceTests.imageAnalysis = true;
        } catch (error) {
          logger.warn('AI service health check failed:', error.message);
          serviceTests.sentimentAnalysis = false;
          serviceTests.textSummarization = false;
          serviceTests.imageAnalysis = false;
        }
      }

      const overallHealth = Object.values(serviceTests).some(v => v);
      
      res.status(overallHealth ? 200 : 503).json({
        success: overallHealth,
        data: {
          status: overallHealth ? 'healthy' : 'degraded',
          available: isAvailable,
          services: serviceTests,
          timestamp
        },
        timestamp
      });
    } catch (error) {
      logger.error('Error in AI health check:', error.message);
      res.status(503).json({
        success: false,
        error: 'AI health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new AIController();