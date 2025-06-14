// Using Hugging Face's inference API
class AIService {
  constructor() {
    this.HF_API_URL = 'https://api-inference.huggingface.co/models';
    this.API_TOKEN = process.env.REACT_APP_HF_API_TOKEN;
    this.isLoading = false;
  }

  // Image captioning using BLIP model
  async analyzeImage(imageUrl) {
    try {
      this.isLoading = true;
      
      // Check if token exists
      if (!this.API_TOKEN) {
        console.warn('No Hugging Face API token found');
        return 'AI analysis requires API token - please add REACT_APP_HF_API_TOKEN to your .env file';
      }
      
      // Convert image URL to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Send to Hugging Face API
      const result = await fetch(`${this.HF_API_URL}/Salesforce/blip-image-captioning-large`, {
        method: 'POST',
        body: blob,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${this.API_TOKEN}`
        }
      });
      
      if (!result.ok) {
        throw new Error(`HTTP ${result.status}: ${result.statusText}`);
      }
      
      const data = await result.json();
      return data[0]?.generated_text || 'Unable to analyze image';
    } catch (error) {
      console.error('AI Image Analysis Error:', error);
      return 'AI analysis temporarily unavailable';
    } finally {
      this.isLoading = false;
    }
  }

  // Text summarization using free model
  async summarizeText(text, maxLength = 100) {
    try {
      if (text.length < maxLength) return text;
      
      if (!this.API_TOKEN) {
        return text; // Return original text if no token
      }
      
      const response = await fetch(`${this.HF_API_URL}/facebook/bart-large-cnn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_TOKEN}`
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: maxLength,
            min_length: 20
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data[0]?.summary_text || text;
    } catch (error) {
      console.error('AI Summarization Error:', error);
      return text;
    }
  }

  // Sentiment analysis for text
  async analyzeSentiment(text) {
    try {
      if (!this.API_TOKEN) {
        return { label: 'NEUTRAL', score: 0.5 }; // Return neutral if no token
      }
      
      const response = await fetch(`${this.HF_API_URL}/cardiffnlp/twitter-roberta-base-sentiment-latest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_TOKEN}`
        },
        body: JSON.stringify({ inputs: text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data[0] || { label: 'NEUTRAL', score: 0.5 };
    } catch (error) {
      console.error('AI Sentiment Analysis Error:', error);
      return { label: 'NEUTRAL', score: 0.5 };
    }
  }

  // Local browser-based text analysis (no API needed)
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

  // Check if AI services are available
  isAvailable() {
    return !!this.API_TOKEN;
  }
}

// Create a single instance and export it
const aiService = new AIService();
export default aiService;