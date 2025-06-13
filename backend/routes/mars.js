const express = require('express');
const { getMarsPhotos, getRoverInfo } = require('../controllers/marsController');

const router = express.Router();

// GET /api/mars/photos - Get Mars rover photos
router.get('/photos', getMarsPhotos);

// GET /api/mars/rovers/:rover - Get rover information
router.get('/rovers/:rover', getRoverInfo);

module.exports = router;