import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAPOD, useAI } from '../hooks/useNasaData';
import LoadingAnimation from './LoadingAnimation';
import InteractiveButton from './InteractiveButton';
import AIInsights from './AIInsights';
import AIChat from './AIChat';
import soundManager from '../utils/soundManager';
import './APODCard.css';

const APODCard = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Use updated hooks that include AI analysis from backend
  const { data, loading, error, aiAnalysis, refetch, getRandomAPOD, analyzeWithAI } = useAPOD();
  const { loading: aiLoading, status: aiStatus, analyze } = useAI();

  // Show AI insights automatically when AI analysis is available
  useEffect(() => {
    if (aiAnalysis && Object.keys(aiAnalysis).length > 0) {
      setShowAI(true);
    }
  }, [aiAnalysis]);

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    setImageLoaded(false);
    refetch(date);
    soundManager.play('whoosh');
  };

  const handleRandomClick = () => {
    setImageLoaded(false);
    getRandomAPOD();
    setSelectedDate('');
    soundManager.play('success');
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    soundManager.play('success');
  };

  const handleImageError = () => {
    soundManager.play('error');
  };

  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
    soundManager.play('click');
  };

  const toggleAI = () => {
    setShowAI(!showAI);
    soundManager.play('click');
    
    // If AI analysis is not available but AI service is available, try to analyze
    if (!showAI && !aiAnalysis && data && aiStatus?.available) {
      handleManualAIAnalysis();
    }
  };

  // Manual AI analysis for cases where backend didn't include it
  const handleManualAIAnalysis = async () => {
    if (!data || aiLoading) return;
    
    try {
      await analyzeWithAI();
      soundManager.play('success');
    } catch (error) {
      console.error('Manual AI Analysis failed:', error);
      soundManager.play('error');
    }
  };

  // Format AI analysis for the AIInsights component
  const formatAIAnalysis = (analysis) => {
    if (!analysis) return null;
    
    return {
      imageDescription: analysis.imageAnalysis || 'No image analysis available',
      sentiment: analysis.sentiment || { label: 'NEUTRAL', score: 0.5 },
      textAnalysis: analysis.textAnalysis || {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        complexity: 'Unknown'
      },
      tips: analysis.tips || [],
      summary: analysis.summary || data?.explanation
    };
  };

  if (loading) return <LoadingAnimation type="space" message="Fetching cosmic imagery..." />;

  return (
    <motion.div
      className="apod-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="apod-controls"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="date-selector">
          <motion.label 
            htmlFor="apod-date"
            whileHover={{ scale: 1.05 }}
          >
            Select Date:
          </motion.label>
          <motion.input
            id="apod-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            whileFocus={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' }}
          />
        </div>
        
        <InteractiveButton
          onClick={handleRandomClick}
          variant="secondary"
          icon="🎲"
        >
          Random APOD
        </InteractiveButton>

        <InteractiveButton
          onClick={() => setShowChat(!showChat)}
          variant={showChat ? 'success' : 'warning'}
          icon="💬"
        >
          {showChat ? 'Hide Chat' : 'AI Chat'}
        </InteractiveButton>

        {data && (
          <InteractiveButton
            onClick={toggleAI}
            variant={showAI ? 'success' : 'warning'}
            icon="🤖"
            disabled={aiLoading || loading}
          >
            {aiLoading ? 'AI Analyzing...' : showAI ? 'Hide AI' : 'AI Insights'}
          </InteractiveButton>
        )}

        {/* AI Status Indicator */}
        {aiStatus && (
          <motion.div
            className="ai-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className={`status-indicator ${aiStatus.available ? 'available' : 'unavailable'}`}>
              🤖 AI: {aiStatus.available ? 'Ready' : 'Unavailable'}
            </span>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message error-animation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <p>Error: {error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {data && (
          <motion.div
            className="apod-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {data.title}
            </motion.h2>
            
            <motion.p 
              className="apod-date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              📅 {data.date}
            </motion.p>

            {/* AI Insights Panel */}
            <AnimatePresence>
              {showAI && (
                <AIInsights 
                  analysis={formatAIAnalysis(aiAnalysis)} 
                  loading={aiLoading}
                  onRefresh={handleManualAIAnalysis}
                  available={aiStatus?.available}
                />
              )}
            </AnimatePresence>

            {/* AI Chat Panel */}
            <AnimatePresence>
              {showChat && (
                <AIChat 
                  data={data} 
                  aiAnalysis={aiAnalysis}
                  available={aiStatus?.available}
                />
              )}
            </AnimatePresence>

            <motion.div 
              className="apod-media"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {data.media_type === 'image' ? (
                <motion.div className="image-container">
                  <motion.img
                    src={data.url}
                    alt={data.title}
                    className="apod-image"
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={toggleFullscreen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 10px 40px rgba(0, 212, 255, 0.3)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  />
                  
                  {!imageLoaded && (
                    <motion.div
                      className="image-placeholder shimmer"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: imageLoaded ? 0 : 1 }}
                    >
                      <LoadingAnimation type="pulse" size="small" message="Loading image..." />
                    </motion.div>
                  )}
                  
                  <motion.div
                    className="image-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InteractiveButton
                      onClick={toggleFullscreen}
                      variant="primary"
                      icon="🔍"
                    >
                      View Fullscreen
                    </InteractiveButton>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.iframe
                  src={data.url}
                  title={data.title}
                  className="apod-video"
                  allowFullScreen
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>

            <motion.div 
              className="apod-explanation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.h3
                whileHover={{ color: '#00d4ff' }}
                transition={{ duration: 0.3 }}
              >
                Explanation
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                {data.explanation}
              </motion.p>
            </motion.div>

            {/* AI Summary Section */}
            {aiAnalysis?.summary && aiAnalysis.summary !== data.explanation && (
              <motion.div
                className="ai-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
              >
                <motion.h4
                  whileHover={{ color: '#00d4ff' }}
                  transition={{ duration: 0.3 }}
                >
                  🤖 AI Summary
                </motion.h4>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  {aiAnalysis.summary}
                </motion.p>
              </motion.div>
            )}

            {data.copyright && (
              <motion.p 
                className="apod-copyright"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
              >
                📸 Copyright: {data.copyright}
              </motion.p>
            )}

            <motion.div
              className="action-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {data.hdurl && (
                <InteractiveButton
                  onClick={() => window.open(data.hdurl, '_blank')}
                  variant="success"
                  icon="🔍"
                >
                  View in HD
                </InteractiveButton>
              )}

              {/* Manual AI Analysis Button */}
              {aiStatus?.available && !aiAnalysis && (
                <InteractiveButton
                  onClick={handleManualAIAnalysis}
                  variant="warning"
                  icon="🤖"
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
                </InteractiveButton>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && data && data.media_type === 'image' && (
          <motion.div
            className="fullscreen-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleFullscreen}
          >
            <motion.div
              className="fullscreen-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <InteractiveButton
                className="close-fullscreen"
                onClick={toggleFullscreen}
                variant="secondary"
                icon="✕"
              >
              </InteractiveButton>
              
              <img
                src={data.hdurl || data.url}
                alt={data.title}
                className="fullscreen-image"
              />
              
              <motion.div
                className="fullscreen-info"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3>{data.title}</h3>
                <p>{data.date}</p>
                
                {/* Show AI image analysis in fullscreen if available */}
                {aiAnalysis?.imageAnalysis && (
                  <motion.div
                    className="fullscreen-ai-analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4>🤖 AI Analysis</h4>
                    <p>{aiAnalysis.imageAnalysis}</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default APODCard;