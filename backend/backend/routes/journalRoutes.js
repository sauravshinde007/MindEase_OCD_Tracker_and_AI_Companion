const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getEntries, createEntry, deleteEntry } = require('../controllers/journalController');

router.route('/')
    .get(protect, getEntries)
    .post(protect, createEntry);

router.route('/:id')
    .delete(protect, deleteEntry);

module.exports = router;