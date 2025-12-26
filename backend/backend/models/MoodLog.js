const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moodLabel: { type: String }, // e.g., "Happy", "Sad", "Neutral"
    anxietyScore: { type: Number, min: 1, max: 10 }, // 1 = Low, 10 = Panic
    sleepHours: { type: Number },
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MoodLog', moodLogSchema);