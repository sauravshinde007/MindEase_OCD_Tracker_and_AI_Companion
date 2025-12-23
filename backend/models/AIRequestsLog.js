const mongoose = require('mongoose');

const aiRequestsLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    promptType: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIRequestsLog', aiRequestsLogSchema);