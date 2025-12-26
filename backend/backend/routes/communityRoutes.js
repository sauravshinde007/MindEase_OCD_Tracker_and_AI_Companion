const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getStories, createStory, likeStory, addComment } = require('../controllers/communityController');

router.get('/', protect, getStories);
router.post('/', protect, createStory);
router.put('/:id/like', protect, likeStory);
router.post('/:id/comment', protect, addComment);

module.exports = router;
