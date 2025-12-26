const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getInsights } = require('../controllers/analyticsController');

router.get('/insights', protect, getInsights);

module.exports = router;
