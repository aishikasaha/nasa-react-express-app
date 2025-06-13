// backend/controllers/neoController.js
const nasaService = require('../services/nasaService');
const logger = require('../utils/logger');

const getNearEarthObjects = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Default to today and next 7 days if no dates provided
    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    logger.info(`Fetching NEO data from ${startDate} to ${endDate}`);
    
    const neoData = await nasaService.getNearEarthObjects(startDate, endDate);
    
    res.status(200).json({
      success: true,
      data: neoData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('NEO Controller Error:', error.message);
    next(error);
  }
};

const getNeoStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    logger.info(`Fetching NEO stats from ${startDate} to ${endDate}`);
    
    const neoData = await nasaService.getNearEarthObjects(startDate, endDate);
    
    // Calculate statistics
    const allNeos = Object.values(neoData.near_earth_objects).flat();
    const stats = {
      total_count: allNeos.length,
      potentially_hazardous_count: allNeos.filter(neo => neo.is_potentially_hazardous_asteroid).length,
      average_diameter: allNeos.reduce((sum, neo) => {
        const diameter = (neo.estimated_diameter.kilometers.estimated_diameter_min + 
                         neo.estimated_diameter.kilometers.estimated_diameter_max) / 2;
        return sum + diameter;
      }, 0) / allNeos.length,
      closest_approach: Math.min(...allNeos.map(neo => 
        parseFloat(neo.close_approach_data[0]?.miss_distance.kilometers || Infinity)
      )),
      fastest_velocity: Math.max(...allNeos.map(neo => 
        parseFloat(neo.close_approach_data[0]?.relative_velocity.kilometers_per_hour || 0)
      ))
    };
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('NEO Stats Controller Error:', error.message);
    next(error);
  }
};

module.exports = {
  getNearEarthObjects,
  getNeoStats
};

