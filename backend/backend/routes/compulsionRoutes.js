const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { logEpisode, getEpisodes } = require('../controllers/compulsionController');

router.route('/')
    .get(protect, getEpisodes)
    .post(protect, logEpisode);

module.exports = router;
