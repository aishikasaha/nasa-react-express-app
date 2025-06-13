import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import APODCard from './APODCard';
import MarsRoverGallery from './MarsRoverGallery';
import NeoChart from './NeoChart';
import AnimatedBackground from './AnimatedBackground';
import InteractiveButton from './InteractiveButton';
import soundManager from '../utils/soundManager';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('apod');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const tabs = [
    { id: 'apod', label: 'Picture of the Day', icon: '🌟', color: '#00d4ff' },
    { id: 'mars', label: 'Mars Rovers', icon: '🚀', color: '#ff6b6b' },
    { id: 'neo', label: 'Near Earth Objects', icon: '☄️', color: '#4ecdc4' }
  ];

  useEffect(() => {
    soundManager.play('space');
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      soundManager.play('whoosh');
    }
  };

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
    if (newState) {
      soundManager.play('success');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const tabContentVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      scale: 0.95,
      transition: { 
        duration: 0.3 
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'apod':
        return <APODCard key="apod" />;
      case 'mars':
        return <MarsRoverGallery key="mars" />;
      case 'neo':
        return <NeoChart key="neo" />;
      default:
        return <APODCard key="default" />;
    }
  };

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatedBackground />
      
      {/* Settings Panel */}
      <motion.div 
        className={`settings-panel ${showSettings ? 'open' : ''}`}
        animate={{ x: showSettings ? 0 : '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h3>Settings</h3>
        <div className="setting-item">
          <label>Sound Effects</label>
          <InteractiveButton
            onClick={toggleSound}
            variant={soundEnabled ? 'success' : 'secondary'}
            icon={soundEnabled ? '🔊' : '🔇'}
          >
            {soundEnabled ? 'ON' : 'OFF'}
          </InteractiveButton>
        </div>
        <div className="setting-item">
          <label>Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.3"
            onChange={(e) => soundManager.setVolume(e.target.value)}
            className="volume-slider"
          />
        </div>
      </motion.div>

      {/* Settings Toggle */}
      <motion.div
        className="settings-toggle"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <InteractiveButton
          onClick={() => setShowSettings(!showSettings)}
          icon="⚙️"
          variant="secondary"
        >
        </InteractiveButton>
      </motion.div>

      <motion.header 
        className="dashboard-header"
        variants={itemVariants}
      >
        <motion.h1
          animate={{
            textShadow: [
              '0 0 10px rgba(0, 212, 255, 0.5)',
              '0 0 20px rgba(0, 212, 255, 0.8)',
              '0 0 10px rgba(0, 212, 255, 0.5)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🌌 NASA Data Explorer
        </motion.h1>
        <motion.p
          variants={itemVariants}
          animate={{
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Explore the cosmos with real NASA data
        </motion.p>
      </motion.header>

      <motion.nav 
        className="dashboard-nav"
        variants={itemVariants}
      >
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            whileHover={{ y: -5 }}
            whileTap={{ y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InteractiveButton
              onClick={() => handleTabChange(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              icon={tab.icon}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeTab"
                  style={{ backgroundColor: tab.color }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </InteractiveButton>
          </motion.div>
        ))}
      </motion.nav>

      <motion.main 
        className="dashboard-content"
        variants={itemVariants}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* Floating particles effect */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              y: [-20, -100, -20],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '0%'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
