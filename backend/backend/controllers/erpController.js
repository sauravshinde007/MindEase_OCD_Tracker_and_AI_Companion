const ERPTask = require('../models/ERPTask');

const getTasks = async (req, res) => {
    const tasks = await ERPTask.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
};

const createTask = async (req, res) => {
    const { title, description, difficultyLevel } = req.body;
    
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    const task = await ERPTask.create({
        user: req.user._id,
        title,
        description,
        difficultyLevel
    });

    res.status(201).json(task);
};

const toggleTaskCompletion = async (req, res) => {
    const task = await ERPTask.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? Date.now() : null;
    await task.save();

    res.json(task);
};

const deleteTask = async (req, res) => {
    const task = await ERPTask.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
};

module.exports = { getTasks, createTask, toggleTaskCompletion, deleteTask };