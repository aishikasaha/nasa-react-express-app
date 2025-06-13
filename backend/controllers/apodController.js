const nasaService = require('../services/nasaService');
const logger = require('../utils/logger');

const getAPOD = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    logger.info(`Fetching APOD for date: ${date || 'today'}`);
    
    const apodData = await nasaService.getAPOD(date);
    
    res.status(200).json({
      success: true,
      data: apodData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('APOD Controller Error:', error.message);
    next(error);
  }
};

const getRandomAPOD = async (req, res, next) => {
  try {
    // Generate random date in the past year
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
    const dateString = randomDate.toISOString().split('T')[0];
    
    logger.info(`Fetching random APOD for date: ${dateString}`);
    
    const apodData = await nasaService.getAPOD(dateString);
    
    res.status(200).json({
      success: true,
      data: apodData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Random APOD Controller Error:', error.message);
    next(error);
  }
};

module.exports = {
  getAPOD,
  getRandomAPOD
};