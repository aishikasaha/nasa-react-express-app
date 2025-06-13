const express = require('express');
const { getAPOD, getRandomAPOD } = require('../controllers/apodController');

const router = express.Router();

// GET /api/apod - Get Astronomy Picture of the Day
router.get('/', getAPOD);

// GET /api/apod/random - Get random APOD
router.get('/random', getRandomAPOD);

module.exports = router;