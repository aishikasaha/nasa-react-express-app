// Using Hugging Face's inference API
// services/aiService.js
const axios = require('axios');


class AIService {
  constructor() {
    this.HF_API_URL = 'https://api-inference.huggingface.co/models';
    this.API_TOKEN = process.env.HF_API_TOKEN;
    this.isLoading = false;
  }

  // Image captioning using BLIP model
  async analyzeImage(imageUrl) {
    try {
      this.isLoading = true;
      
      // Check if token exists
      if (!this.API_TOKEN) {
        return 'AI analysis requires API token - please add HF_API_TOKEN to your environment variables';
      }
      
      // Fetch image and convert to buffer
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'NASA-App/1.0'
        }
      });
      
      const imageBuffer = Buffer.from(imageResponse.data);
      
      // Send to Hugging Face API
      const result = await axios.post(
        `${this.HF_API_URL}/Salesforce/blip-image-captioning-large`,
        imageBuffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': `Bearer ${this.API_TOKEN}`
          },
          timeout: 60000
        }
      );
      
      return result.data[0]?.generated_text || 'Unable to analyze image';
    } catch (error) {
      
      if (error.response?.status === 403) {
        return 'AI analysis temporarily unavailable - API key may be invalid';
      }
      if (error.response?.status === 429) {
        return 'AI analysis temporarily unavailable - rate limit exceeded';
      }
      
      return 'AI analysis temporarily unavailable';
    } finally {
      this.isLoading = false;
    }
  }

  // Text summarization using BART model
  async summarizeText(text, maxLength = 100) {
    try {
      if (text.length < maxLength) return text;
      
      if (!this.API_TOKEN) {
        return text; // Return original text if no token
      }
      
      const response = await axios.post(
        `${this.HF_API_URL}/facebook/bart-large-cnn`,
        {
          inputs: text,
          parameters: {
            max_length: maxLength,
            min_length: 20
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_TOKEN}`
          },
          timeout: 60000
        }
      );
      
      return response.data[0]?.summary_text || text;
    } catch (error) {
      
      return text; // Return original text on error
    }
  }

  async analyzeSentiment(text) {
    try {
      if (!this.API_TOKEN) {
        return { label: 'NEUTRAL', score: 0.5 };
      }
      
      const response = await fetch(`${this.HF_API_URL}/nlptown/bert-base-multilingual-uncased-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_TOKEN}`
        },
        body: JSON.stringify({ inputs: text }),
        timeout: 30000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the star rating response to sentiment format
      if (Array.isArray(data) && data.length > 0) {
        // Find highest scoring item
        const highest = data.reduce((max, item) => 
          item.score > max.score ? item : max
        );
        
        // Convert star ratings to sentiment labels
        const starToSentiment = (label, score) => {
          if (label.includes('5 stars') || label.includes('4 stars')) {
            return { label: 'POSITIVE', score };
          } else if (label.includes('1 star') || label.includes('2 stars')) {
            return { label: 'NEGATIVE', score };
          } else {
            return { label: 'NEUTRAL', score };
          }
        };
        
        return starToSentiment(highest.label, highest.score);
      }
      
      return { label: 'NEUTRAL', score: 0.5 };
      
    } catch (error) {
      console.error('AI Sentiment Analysis Error:', error.message);
      return { label: 'NEUTRAL', score: 0.5 };
    }
  }

  // Local text analysis (no API needed)
  analyzeTextComplexity(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let complexity = 'Simple';
    if (avgWordsPerSentence > 15) complexity = 'Moderate';
    if (avgWordsPerSentence > 25) complexity = 'Complex';
    
    return {
      wordCount: words,
      sentenceCount: sentences,
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      complexity
    };
  }

  // Generate astronomy-related suggestions
  generateAstronomyTips(topic) {
    const tips = {
      nebula: [
        "🔭 Try viewing nebulae with different filters to see various elements",
        "🌟 Nebulae are stellar nurseries where new stars are born",
        "📊 The colors in nebulae indicate different chemical elements"
      ],
      galaxy: [
        "🌌 Our Milky Way contains over 100 billion stars",
        "🔄 Galaxies rotate, with spiral arms moving like waves",
        "🎯 Look for the galaxy's central black hole in deep images"
      ],
      planet: [
        "🪐 Each planet has unique atmospheric conditions",
        "🌡️ Temperature varies greatly across planetary surfaces",
        "🔍 Study surface features to understand geological history"
      ],
      mars: [
        "🚀 Mars has the largest volcano in the solar system",
        "❄️ Mars has polar ice caps made of water and dry ice",
        "🌪️ Dust storms on Mars can last for months"
      ],
      default: [
        "⭐ Use dark sky locations for better astronomical viewing",
        "📱 Try astronomy apps to identify objects in the night sky",
        "🌙 The best viewing is often just after sunset or before sunrise"
      ]
    };
    
    const key = Object.keys(tips).find(k => topic.toLowerCase().includes(k)) || 'default';
    return tips[key];
  }

  // Comprehensive AI analysis combining multiple services
  async performComprehensiveAnalysis(data) {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        imageAnalysis: null,
        textAnalysis: null,
        sentiment: null,
        summary: null,
        tips: null
      };

      // Analyze image if URL provided
      if (data.imageUrl) {
        results.imageAnalysis = await this.analyzeImage(data.imageUrl);
      }

      // Analyze text if provided
      if (data.text) {
        results.textAnalysis = this.analyzeTextComplexity(data.text);
        results.sentiment = await this.analyzeSentiment(data.text);
        
        // Summarize if text is long
        if (data.text.length > 200) {
          results.summary = await this.summarizeText(data.text, 150);
        }
      }

      // Generate tips based on topic
      if (data.topic) {
        results.tips = this.generateAstronomyTips(data.topic);
      }

      return results;
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  // Check if AI services are available
  isAvailable() {
    return !!this.API_TOKEN;
  }
}

module.exports = new AIService();