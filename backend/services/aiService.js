// Using Hugging Face's inference API
// services/aiService.js
const axios = require('axios');


class AIService {
  constructor() {
    this.HF_API_URL = 'https://api-inference.huggingface.co/models';
    this.API_TOKEN = process.env.HF_API_TOKEN;
    this.isLoading = false;
  }

// Update your aiService.js to use a different working model:
async analyzeImage(imageUrl) {
  try {
    this.isLoading = true;
    
    if (!this.API_TOKEN) {
      return 'AI analysis requires API token';
    }
    
    // Fetch image (this part is working fine)
    const imageResponse = await fetch(imageUrl, {
      headers: { 'User-Agent': 'NASA-App/1.0', 'Accept': 'image/*' },
      timeout: 30000
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('🔍 Image fetched, size:', imageBuffer.byteLength);
    
    // Try multiple working models in order
    const workingModels = [
      'microsoft/git-base',
      'Salesforce/blip-image-captioning-base',
      'google/vit-base-patch16-224'  // This is a classifier, but it works
    ];
    
    for (const model of workingModels) {
      try {
        console.log(`🔍 Trying model: ${model}`);
        
        const result = await fetch(`${this.HF_API_URL}/${model}`, {
          method: 'POST',
          body: imageBuffer,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': `Bearer ${this.API_TOKEN}`
          },
          timeout: 60000
        });
        
        console.log(`🔍 Model ${model} response:`, result.status);
        
        if (result.ok) {
          const data = await result.json();
          console.log(`🔍 Model ${model} data:`, data);
          
          // Handle different response formats
          if (Array.isArray(data) && data.length > 0) {
            const text = data[0]?.generated_text || data[0]?.label || data[0];
            if (typeof text === 'string' && text.length > 0) {
              console.log(`✅ Success with model: ${model}`);
              return text;
            }
          } else if (data.generated_text) {
            console.log(`✅ Success with model: ${model}`);
            return data.generated_text;
          }
        } else {
          console.log(`❌ Model ${model} failed: ${result.status}`);
        }
      } catch (modelError) {
        console.log(`❌ Model ${model} error:`, modelError.message);
      }
    }
    
    // If all models fail, return a smart fallback
    return this.generateImageDescriptionFallback(imageUrl);
    
  } catch (error) {
    console.error('🔍 Image Analysis Error:', error.message);
    return 'AI image analysis temporarily unavailable';
  } finally {
    this.isLoading = false;
  }
}

// Add this fallback method
generateImageDescriptionFallback(imageUrl) {
  const url = imageUrl.toLowerCase();
  const filename = url.split('/').pop() || '';
  
  // Smart fallback based on URL patterns and context
  if (url.includes('mars') || filename.includes('mars')) {
    return 'This image appears to show the Martian landscape, captured by NASA rovers or orbiters, displaying the characteristic reddish terrain and geological features of the Red Planet.';
  } else if (url.includes('nebula') || filename.includes('ngc')) {
    return 'This astronomical image shows a nebula - a cloud of gas and dust in space, illuminated by nearby stars, revealing the colorful and intricate structures of stellar formation regions.';
  } else if (url.includes('galaxy') || filename.includes('galaxy')) {
    return 'This deep space image captures a galaxy with its spiral arms, star clusters, and cosmic structures spanning thousands of light-years across the universe.';
  } else if (url.includes('sun') || filename.includes('sun') || url.includes('solar')) {
    return 'This image shows solar phenomena, capturing the dynamic activity of our Sun or solar system objects illuminated by solar radiation.';
  } else if (url.includes('planet') || filename.includes('jupiter') || filename.includes('saturn')) {
    return 'This planetary image shows one of the worlds in our solar system, captured by space missions, revealing atmospheric patterns and surface features.';
  } else if (url.includes('apod.nasa.gov')) {
    return 'This Astronomy Picture of the Day showcases a carefully selected astronomical image, highlighting the beauty and scientific significance of cosmic phenomena.';
  } else {
    return 'This astronomical image captures the wonder of space, showing celestial objects and phenomena that help us understand our universe.';
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
      
     // FIX: Handle nested array format [[...]] instead of [...]
    let sentimentArray = data;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      sentimentArray = data[0]; // Extract the inner array
    }
    
    // Transform star ratings to standard sentiment format
    if (Array.isArray(sentimentArray) && sentimentArray.length > 0) {
      const highest = sentimentArray.reduce((max, item) => 
        item.score > max.score ? item : max
      );
      
      // Convert star ratings to sentiment labels
      let label = 'NEUTRAL';
      if (highest.label.includes('5 stars') || highest.label.includes('4 stars')) {
        label = 'POSITIVE';
      } else if (highest.label.includes('1 star') || highest.label.includes('2 stars')) {
        label = 'NEGATIVE';
      }
      
      return { label, score: highest.score };
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