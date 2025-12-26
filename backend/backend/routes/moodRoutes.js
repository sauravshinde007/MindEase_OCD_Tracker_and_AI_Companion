const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createMoodLog, getMoodLogs } = require('../controllers/moodController');

router.route('/')
    .post(protect, createMoodLog)
    .get(protect, getMoodLogs);

module.exports = router;