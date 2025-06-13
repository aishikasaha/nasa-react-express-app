import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FontLoader = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const fonts = [
      'Orbitron',
      'Exo 2',
      'Space Mono',
      'Rajdhani',
      'Aldrich',
      'Electrolize',
      'Audiowide',
      'Jura',
      'Michroma',
      'Saira'
    ];

    const loadFont = (fontName) => {
      return new Promise((resolve) => {
        const font = new FontFace(fontName, `url(https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700;900&display=swap)`);
        
        font.load().then(() => {
          document.fonts.add(font);
          resolve();
        }).catch(() => {
          // Font failed to load, but continue anyway
          resolve();
        });
      });
    };

    const loadAllFonts = async () => {
      for (let i = 0; i < fonts.length; i++) {
        await loadFont(fonts[i]);
        setLoadingProgress(((i + 1) / fonts.length) * 100);
      }
      
      // Add a small delay to show the completion
      setTimeout(() => {
        setFontsLoaded(true);
      }, 500);
    };

    loadAllFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <motion.div
        className="font-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white'
        }}
      >
        <motion.h1
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '3rem',
            marginBottom: '2rem',
            background: 'linear-gradient(45deg, #00d4ff, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          animate={{
            textShadow: [
              '0 0 10px rgba(0, 212, 255, 0.5)',
              '0 0 20px rgba(0, 212, 255, 0.8)',
              '0 0 10px rgba(0, 212, 255, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🌌 NASA DATA EXPLORER
        </motion.h1>
        
        <motion.div
          style={{
            width: '300px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(45deg, #00d4ff, #4ecdc4)',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
            }}
            animate={{
              width: `${loadingProgress}%`
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut"
            }}
          />
        </motion.div>
        
        <motion.p
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Loading Space Fonts... {Math.round(loadingProgress)}%
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="font-loaded"
    >
      {children}
    </motion.div>
  );
};

export default FontLoader;
