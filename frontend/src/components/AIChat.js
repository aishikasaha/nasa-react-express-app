import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveButton from './InteractiveButton';
import soundManager from '../utils/soundManager';
import './AIChat.css';

const AIChat = ({ data }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '🤖 Hi! I\'m your NASA AI assistant. Ask me anything about this image or space in general!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple AI response generator (rule-based)
  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Astronomy keywords and responses
    const responses = {
      // General space questions
      'what is': [
        'That\'s a great question! Based on the image, this appears to be a fascinating astronomical object.',
        'From what I can see, this is an incredible example of cosmic phenomena.',
        'This represents one of the many wonders we can observe in our universe.'
      ],
      'how': [
        'The formation process is quite fascinating! These cosmic structures typically develop over millions of years.',
        'The mechanisms behind this involve complex physics including gravity, nuclear fusion, and electromagnetic forces.',
        'This process demonstrates the incredible forces at work in our universe.'
      ],
      'why': [
        'The underlying physics involves fundamental forces that govern how matter behaves in space.',
        'This phenomenon occurs due to the unique conditions present in the cosmic environment.',
        'The answer lies in understanding how different elements interact under extreme conditions.'
      ],
      'when': [
        'These cosmic events often occur over timescales that are difficult to comprehend - sometimes millions or billions of years.',
        'The timing depends on various factors including stellar evolution and galactic dynamics.',
        'Astronomical events like this follow predictable patterns based on celestial mechanics.'
      ],
      'where': [
        'This type of object can be found throughout our universe, from our local galaxy to distant cosmic regions.',
        'The location and distribution of such phenomena help us understand the structure of the universe.',
        'These objects are scattered across the cosmos, each telling a unique story of cosmic evolution.'
      ],
      
      // Specific space objects
      'nebula': [
        'Nebulae are clouds of gas and dust in space, often called "stellar nurseries" where new stars are born! 🌟',
        'These colorful cosmic clouds can span several light-years and contain the building blocks of future star systems.',
        'Nebulae come in different types: emission, reflection, and planetary nebulae, each with unique characteristics.'
      ],
      'galaxy': [
        'Galaxies are massive collections of stars, gas, dust, and dark matter held together by gravity! 🌌',
        'Our Milky Way is just one of billions of galaxies in the observable universe.',
        'Galaxies can contain anywhere from millions to trillions of stars!'
      ],
      'star': [
        'Stars are massive nuclear fusion reactors that convert hydrogen into helium, releasing enormous amounts of energy! ⭐',
        'The life cycle of a star depends on its mass - larger stars burn brighter but live shorter lives.',
        'Stars are the cosmic factories that create most of the elements we find on Earth.'
      ],
      'planet': [
        'Planets are celestial bodies that orbit stars and have cleared their orbital neighborhood! 🪐',
        'There are eight planets in our solar system, but thousands of exoplanets have been discovered orbiting other stars.',
        'Each planet has unique characteristics based on its composition, distance from its star, and formation history.'
      ],
      'black hole': [
        'Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape! 🕳️',
        'They form when massive stars collapse at the end of their lives.',
        'Supermassive black holes sit at the centers of most galaxies, including our own Milky Way.'
      ],
      
      // Current image specific
      'image': [
        data ? `This image shows "${data.title}" captured on ${data.date}. It's a beautiful example of what we can observe in space!` : 'This astronomical image showcases the incredible beauty and complexity of our universe.',
        data ? `The image "${data.title}" demonstrates the amazing detail we can capture with modern space telescopes and instruments.` : 'Each astronomical image tells a story about the cosmic processes happening throughout the universe.',
        'What you\'re seeing represents just a tiny fraction of the wonders that exist in the vast cosmos around us.'
      ],
      'color': [
        'The colors in astronomical images often represent different elements, temperatures, or wavelengths of light! 🎨',
        'Many space images use false color to highlight features invisible to the human eye.',
        'Different filters and instruments can reveal various aspects of cosmic objects.'
      ],
      'distance': [
        'Astronomical distances are measured in light-years - the distance light travels in one year! 📏',
        'Space is incredibly vast. Even our nearest star neighbor is over 4 light-years away.',
        'The scale of the universe is mind-boggling - what looks close in images might be millions of light-years apart.'
      ],
      
      // General conversation
      'hello': ['Hello! I\'m excited to talk about space with you! 👋', 'Hi there, fellow space enthusiast! 🚀'],
      'thanks': ['You\'re very welcome! Happy to help explore the cosmos with you! 😊', 'My pleasure! Keep asking those great questions! ⭐'],
      'amazing': ['Space truly is amazing! There\'s always something new to discover! ✨', 'I agree! The universe never fails to amaze us with its beauty and complexity! 🌟'],
      'cool': ['Right?! Space is incredibly cool! Each image reveals new wonders! 😎', 'Absolutely! The cosmos is full of cool phenomena waiting to be explored! 🔥'],
      'wow': ['I know, right?! Space has a way of leaving us speechless! 🤯', 'The universe is full of "wow" moments like this! 🌠'],
      
      // Default responses
      'default': [
        'That\'s an interesting question! While I may not have all the answers, space exploration continues to reveal new mysteries.',
        'Great question! The universe is full of phenomena we\'re still learning about.',
        'I love your curiosity! Space science is constantly evolving as we make new discoveries.',
        'That\'s the kind of question that drives scientific discovery! Keep wondering about the cosmos!',
        'Fascinating topic! Astronomy and astrophysics help us understand these cosmic mysteries.'
      ]
    };

    // Find matching keywords
    for (const [keyword, responseArray] of Object.entries(responses)) {
      if (keyword !== 'default' && message.includes(keyword)) {
        return responseArray[Math.floor(Math.random() * responseArray.length)];
      }
    }

    // Return default response
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    soundManager.play('click');

    // Simulate typing delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(input),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      soundManager.play('success');
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What am I looking at?",
    "How was this formed?",
    "How far away is this?",
    "What colors represent different elements?",
    "When was this image taken?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    soundManager.play('click');
  };

  return (
    <motion.div
      className="ai-chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="chat-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4>🤖 AI Space Assistant</h4>
        <span className="chat-status">Online</span>
      </motion.div>

      <motion.div
        className="quick-questions"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p>Quick questions:</p>
        <div className="quick-buttons">
          {quickQuestions.map((question, index) => (
            <motion.button
              key={index}
              className="quick-btn"
              onClick={() => handleQuickQuestion(question)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              {question}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.type}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="message-avatar">
                {message.type === 'ai' ? '🤖' : '👨‍🚀'}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="message ai typing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <motion.div
        className="chat-input"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about space, this image, or astronomy..."
            className="chat-textarea"
            rows="2"
            disabled={isTyping}
          />
          <InteractiveButton
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            variant="primary"
            icon="🚀"
            className="send-btn"
          >
            Send
          </InteractiveButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIChat;
