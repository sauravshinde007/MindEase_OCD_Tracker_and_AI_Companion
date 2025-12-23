const mongoose = require('mongoose');

const erpTaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    difficultyLevel: { type: Number, min: 1, max: 10 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ERPTask', erpTaskSchema);