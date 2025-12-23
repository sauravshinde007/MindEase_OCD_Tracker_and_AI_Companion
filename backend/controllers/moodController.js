const MoodLog = require('../models/MoodLog');

const createMoodLog = async (req, res) => {
    const { anxietyScore, moodLabel, note } = req.body;
    const log = await MoodLog.create({
        user: req.user._id,
        anxietyScore,
        moodLabel,
        note
    });
    res.status(201).json(log);
};

const getMoodLogs = async (req, res) => {
    const logs = await MoodLog.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
};

module.exports = { createMoodLog, getMoodLogs };