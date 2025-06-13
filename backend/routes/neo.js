// backend/routes/neo.js
const express = require('express');
const { getNearEarthObjects, getNeoStats } = require('../controllers/neoController');

const router = express.Router();

// GET /api/neo - Get Near Earth Objects
router.get('/', getNearEarthObjects);

// GET /api/neo/stats - Get NEO statistics
router.get('/stats', getNeoStats);

module.exports = router;