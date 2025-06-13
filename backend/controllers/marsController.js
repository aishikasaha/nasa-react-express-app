const nasaService = require('../services/nasaService');
const logger = require('../utils/logger');

const getMarsPhotos = async (req, res, next) => {
  try {
    const { 
      rover = 'curiosity', 
      sol = 1000, 
      page = 1 
    } = req.query;
    
    // Convert string parameters to numbers
    const solNumber = parseInt(sol, 10);
    const pageNumber = parseInt(page, 10);
    
    // Validate parameters
    if (isNaN(solNumber) || solNumber < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sol parameter. Must be a positive number.'
      });
    }
    
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page parameter. Must be a positive number.'
      });
    }
    
    logger.info(`Fetching Mars photos for rover: ${rover}, sol: ${solNumber}, page: ${pageNumber}`);
    
    const marsData = await nasaService.getMarsRoverPhotos(rover, solNumber, pageNumber);
    
    res.status(200).json({
      success: true,
      data: marsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mars Controller Error:', error.message);
    next(error);
  }
};

const getRoverInfo = async (req, res, next) => {
  try {
    const { rover } = req.params;
    
    // Validate rover parameter
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid rover. Must be one of: ${validRovers.join(', ')}`
      });
    }
    
    logger.info(`Fetching rover info for: ${rover}`);
    
    const roverData = await nasaService.getRoverInfo(rover);
    
    res.status(200).json({
      success: true,
      data: roverData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Rover Info Controller Error:', error.message);
    next(error);
  }
};

module.exports = {
  getMarsPhotos,
  getRoverInfo
};
