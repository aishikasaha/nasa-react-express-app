import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveButton from './InteractiveButton';
import LoadingAnimation from './LoadingAnimation';
import soundManager from '../utils/soundManager';
import './AIInsights.css';

const AIInsights = ({ analysis, loading, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('summary');

  // Remove the questions tab from the tabs array
  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
    { id: 'tips', label: 'Tips', icon: '💡' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    soundManager.play('click');
  };

  // Enhanced sentiment formatting to handle both array and object formats
  const formatSentiment = (sentiment) => {
    if (Array.isArray(sentiment)) {
      // Handle array format from backend (star ratings)
      const highest = sentiment.reduce((max, item) => 
        item.score > max.score ? item : max
      );
      
      // Convert stars to sentiment labels
      let label = 'NEUTRAL';
      if (highest.label.includes('5 stars') || highest.label.includes('4 stars')) {
        label = 'POSITIVE';
      } else if (highest.label.includes('1 star') || highest.label.includes('2 stars')) {
        label = 'NEGATIVE';
      }
      
      return {
        label: label,
        score: highest.score,
        confidence: Math.round(highest.score * 100),
        originalLabel: highest.label
      };
    } else if (sentiment && typeof sentiment === 'object' && sentiment.label) {
      // Handle object format
      return {
        label: sentiment.label,
        score: sentiment.score,
        confidence: Math.round((sentiment.score || 0) * 100),
        originalLabel: sentiment.label
      };
    }
    
    // Fallback for invalid data
    return { 
      label: 'NEUTRAL', 
      score: 0.5, 
      confidence: 50,
      originalLabel: 'Unknown'
    };
  };

  const getSentimentColor = (sentiment) => {
    const formatted = formatSentiment(sentiment);
    switch (formatted.label?.toLowerCase()) {
      case 'positive': return '#4ecdc4';
      case 'negative': return '#ff6b6b';
      default: return '#00d4ff';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    const formatted = formatSentiment(sentiment);
    switch (formatted.label?.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  // Debug function to help with troubleshooting
  const debugSentiment = (sentiment) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Sentiment Debug:', {
        original: sentiment,
        isArray: Array.isArray(sentiment),
        type: typeof sentiment,
        formatted: formatSentiment(sentiment)
      });
    }
  };

  if (loading) {
    return (
      <motion.div
        className="ai-insights loading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LoadingAnimation type="pulse" message="AI is analyzing..." size="small" />
      </motion.div>
    );
  }

  if (!analysis) return null;

  // Format sentiment for display
  const formattedSentiment = formatSentiment(analysis.sentiment);
  
  // Debug sentiment in development
  debugSentiment(analysis.sentiment);

  return (
    <motion.div
      className="ai-insights"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="ai-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3>🤖 AI Insights</h3>
        <InteractiveButton
          onClick={onRefresh}
          variant="secondary"
          icon="🔄"
          className="refresh-btn"
        >
          Refresh
        </InteractiveButton>
      </motion.div>

      <motion.div
        className="ai-tabs"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="ai-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              className="ai-tab-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ai-section">
                <h4>📝 Quick Summary</h4>
                <p className="ai-summary">
                  {analysis.summary || analysis.imageDescription || 'No summary available'}
                </p>
              </div>
              
              <div className="ai-section">
                <h4>🎭 Content Sentiment</h4>
                <div className="sentiment-indicator">
                  <span 
                    className="sentiment-badge"
                    style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}
                  >
                    {getSentimentEmoji(analysis.sentiment)} {formattedSentiment.label}
                  </span>
                  <span className="sentiment-score">
                    {formattedSentiment.confidence}% confidence
                  </span>
                  {/* Show original label for debugging if it's different */}
                  {process.env.NODE_ENV === 'development' && formattedSentiment.originalLabel !== formattedSentiment.label && (
                    <span className="sentiment-debug" style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                      (Original: {formattedSentiment.originalLabel})
                    </span>
                  )}
                </div>
              </div>

              {/* Image Analysis Section - if available */}
              {analysis.imageDescription && analysis.imageDescription !== 'No image analysis available' && (
                <div className="ai-section">
                  <h4>🖼️ Image Analysis</h4>
                  <p className="ai-image-description">{analysis.imageDescription}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              className="ai-tab-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ai-section">
                <h4>📊 Text Analysis</h4>
                <div className="text-stats">
                  <div className="stat-item">
                    <span className="stat-label">Words:</span>
                    <span className="stat-value">{analysis.textAnalysis?.wordCount || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Sentences:</span>
                    <span className="stat-value">{analysis.textAnalysis?.sentenceCount || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Words/Sentence:</span>
                    <span className="stat-value">{analysis.textAnalysis?.avgWordsPerSentence || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Complexity:</span>
                    <span className="stat-value complexity">
                      {analysis.textAnalysis?.complexity || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ai-section">
                <h4>🎯 Reading Level</h4>
                <div className="reading-level">
                  <div className={`level-indicator ${analysis.textAnalysis?.complexity?.toLowerCase() || 'unknown'}`}>
                    {analysis.textAnalysis?.complexity || 'Unknown'} Reading Level
                  </div>
                  <p className="level-description">
                    {analysis.textAnalysis?.complexity === 'Simple' && 
                      "Easy to understand for most readers"}
                    {analysis.textAnalysis?.complexity === 'Moderate' && 
                      "Suitable for general science enthusiasts"}
                    {analysis.textAnalysis?.complexity === 'Complex' && 
                      "Advanced scientific content"}
                    {!analysis.textAnalysis?.complexity && 
                      "Text complexity analysis not available"}
                  </p>
                </div>
              </div>

              {/* Enhanced Sentiment Analysis Section */}
              <div className="ai-section">
                <h4>🎭 Detailed Sentiment Analysis</h4>
                <div className="sentiment-details">
                  <div className="sentiment-main">
                    <span className="sentiment-label">{formattedSentiment.label}</span>
                    <div className="sentiment-bar">
                      <div 
                        className="sentiment-fill"
                        style={{ 
                          width: `${formattedSentiment.confidence}%`,
                          backgroundColor: getSentimentColor(analysis.sentiment)
                        }}
                      ></div>
                    </div>
                    <span className="sentiment-percentage">{formattedSentiment.confidence}%</span>
                  </div>
                  
                  {/* Show breakdown if sentiment is array */}
                  {Array.isArray(analysis.sentiment) && (
                    <div className="sentiment-breakdown">
                      <h5>Rating Breakdown:</h5>
                      {analysis.sentiment.map((item, index) => (
                        <div key={index} className="sentiment-item">
                          <span className="sentiment-item-label">{item.label}:</span>
                          <div className="sentiment-item-bar">
                            <div 
                              className="sentiment-item-fill"
                              style={{ width: `${Math.round(item.score * 100)}%` }}
                            ></div>
                          </div>
                          <span className="sentiment-item-score">{Math.round(item.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              className="ai-tab-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ai-section">
                <h4>💡 Astronomy Tips</h4>
                <div className="tips-list">
                  {analysis.tips && analysis.tips.length > 0 ? (
                    analysis.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        className="tip-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="tip-text">{tip}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="no-tips">
                      <p>No astronomy tips available for this content.</p>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AIInsights;