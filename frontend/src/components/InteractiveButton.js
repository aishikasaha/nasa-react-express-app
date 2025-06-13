import React, { useState } from 'react';
import { motion } from 'framer-motion';
import soundManager from '../utils/soundManager';
import './InteractiveButton.css';

const InteractiveButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  icon = null 
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    
    setIsClicked(true);
    soundManager.play('click');
    
    setTimeout(() => setIsClicked(false), 200);
    
    if (onClick) onClick(e);
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      soundManager.play('hover');
    }
  };

  return (
    <motion.button
      className={`interactive-button ${variant} ${className} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        boxShadow: disabled ? 'none' : '0 8px 30px rgba(0, 212, 255, 0.4)'
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95 
      }}
      animate={{
        boxShadow: isClicked 
          ? '0 0 20px rgba(0, 212, 255, 0.8)' 
          : '0 4px 15px rgba(0, 212, 255, 0.3)'
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      <motion.div 
        className="button-content"
        animate={{ 
          x: isClicked ? [0, -2, 2, 0] : 0 
        }}
        transition={{ 
          duration: 0.2 
        }}
      >
        {icon && <span className="button-icon">{icon}</span>}
        {children}
      </motion.div>
      
      {!disabled && (
        <motion.div
          className="button-glow"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
};

export default InteractiveButton;
