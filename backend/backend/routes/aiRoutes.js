const express = require('express');
const router = express.Router();
const { chat, generateExposureHierarchy, deconstructThought, checkIn } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chat);
router.post('/check-in', protect, checkIn);
router.post('/generate-erp', protect, generateExposureHierarchy);
router.post('/deconstruct-thought', protect, deconstructThought);

module.exports = router;
