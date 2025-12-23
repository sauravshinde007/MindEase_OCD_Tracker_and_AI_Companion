const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTasks, createTask, toggleTaskCompletion, deleteTask } = require('../controllers/erpController');

router.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router.route('/:id')
    .put(protect, toggleTaskCompletion)
    .delete(protect, deleteTask);

module.exports = router;