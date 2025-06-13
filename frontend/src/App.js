import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import FontLoader from './components/FontLoader';
import soundManager from './utils/soundManager';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize sound manager
    soundManager.setVolume(0.3);
    
    // Add global click sound to all buttons
    const addClickSounds = () => {
      document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('interactive-button')) {
          soundManager.play('click');
        }
      });
    };

    addClickSounds();

    // Add font loading class to body
    document.body.classList.add('font-loading');
    
    // Remove font loading class after fonts are loaded
    setTimeout(() => {
      document.body.classList.remove('font-loading');
      document.body.classList.add('font-loaded');
    }, 3000);
  }, []);

  return (
    <FontLoader>
      <motion.div 
        className="App"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Dashboard />
      </motion.div>
    </FontLoader>
  );
}

export default App;
