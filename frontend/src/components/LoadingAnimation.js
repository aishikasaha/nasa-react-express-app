import React from 'react';
import { motion } from 'framer-motion';
import './LoadingAnimation.css';

const LoadingAnimation = ({ size = 'medium', message = 'Loading...', type = 'space' }) => {
  const containerVariants = {
    start: { opacity: 0, scale: 0.8 },
    end: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const renderSpaceLoader = () => (
    <div className="space-loader">
      <motion.div
        className="planet"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="orbit"
        animate={{
          rotate: -360
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="satellite" />
      </motion.div>
      <motion.div
        className="stars"
        animate={{
          opacity: [0.3, 1, 0.3]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );

  const renderRocketLoader = () => (
    <div className="rocket-loader">
      <motion.div
        className="rocket"
        animate={{
          y: [-10, 10, -10]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🚀
      </motion.div>
      <motion.div
        className="exhaust"
        animate={{
          scaleY: [0.8, 1.2, 0.8],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );

  const renderPulseLoader = () => (
    <div className="pulse-loader">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="pulse-dot"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'rocket':
        return renderRocketLoader();
      case 'pulse':
        return renderPulseLoader();
      case 'space':
      default:
        return renderSpaceLoader();
    }
  };

  return (
    <motion.div
      className={`loading-animation ${size}`}
      variants={containerVariants}
      initial="start"
      animate="end"
    >
      {renderLoader()}
      <motion.p
        className="loading-message"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

export default LoadingAnimation;
