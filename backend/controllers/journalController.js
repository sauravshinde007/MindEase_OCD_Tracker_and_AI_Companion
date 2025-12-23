const JournalEntry = require('../models/JournalEntry');

const getEntries = async (req, res) => {
    const entries = await JournalEntry.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(entries);
};

const createEntry = async (req, res) => {
    const { title, content, mood, tags, isPrivate } = req.body;
    
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    const entry = await JournalEntry.create({
        user: req.user._id,
        title,
        content,
        mood,
        tags,
        isPrivate
    });

    res.status(201).json(entry);
};

const deleteEntry = async (req, res) => {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await entry.deleteOne();
    res.json({ message: 'Entry removed' });
};

module.exports = { getEntries, createEntry, deleteEntry };