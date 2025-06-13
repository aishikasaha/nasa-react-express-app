import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveButton from './InteractiveButton';
import soundManager from '../utils/soundManager';

const SoundToggle = () => {
  const [enabled, setEnabled] = useState(soundManager.isEnabled());

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setEnabled(newState);
    if (newState) {
      soundManager.play('success');
    }
  };

  return (
    <motion.div
      className="sound-toggle"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 500 }}
    >
      <InteractiveButton
        onClick={toggleSound}
        variant={enabled ? 'success' : 'secondary'}
        icon={enabled ? '🔊' : '🔇'}
      >
        {enabled ? 'Sound ON' : 'Sound OFF'}
      </InteractiveButton>
    </motion.div>
  );
};

export default SoundToggle;
