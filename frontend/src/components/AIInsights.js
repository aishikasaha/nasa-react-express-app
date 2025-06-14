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

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.label?.toLowerCase()) {
      case 'positive': return '#4ecdc4';
      case 'negative': return '#ff6b6b';
      default: return '#00d4ff';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.label?.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
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
                <p className="ai-summary">{analysis.summary}</p>
              </div>
              
              <div className="ai-section">
                <h4>🎭 Content Sentiment</h4>
                <div className="sentiment-indicator">
                  <span 
                    className="sentiment-badge"
                    style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}
                  >
                    {getSentimentEmoji(analysis.sentiment)} {analysis.sentiment?.label}
                  </span>
                  <span className="sentiment-score">
                    {Math.round(analysis.sentiment?.score * 100)}% confidence
                  </span>
                </div>
              </div>

        
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
                    <span className="stat-value">{analysis.textAnalysis?.wordCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Sentences:</span>
                    <span className="stat-value">{analysis.textAnalysis?.sentenceCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Words/Sentence:</span>
                    <span className="stat-value">{analysis.textAnalysis?.avgWordsPerSentence}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Complexity:</span>
                    <span className="stat-value complexity">
                      {analysis.textAnalysis?.complexity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ai-section">
                <h4>🎯 Reading Level</h4>
                <div className="reading-level">
                  <div className={`level-indicator ${analysis.textAnalysis?.complexity?.toLowerCase()}`}>
                    {analysis.textAnalysis?.complexity} Reading Level
                  </div>
                  <p className="level-description">
                    {analysis.textAnalysis?.complexity === 'Simple' && 
                      "Easy to understand for most readers"}
                    {analysis.textAnalysis?.complexity === 'Moderate' && 
                      "Suitable for general science enthusiasts"}
                    {analysis.textAnalysis?.complexity === 'Complex' && 
                      "Advanced scientific content"}
                  </p>
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
                  {analysis.tips?.map((tip, index) => (
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
                  ))}
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
