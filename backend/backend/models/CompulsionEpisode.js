const mongoose = require('mongoose');

const compulsionEpisodeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compulsionName: { type: String, required: true },
    durationMinutes: { type: Number, default: 0 }, // Duration of the compulsion itself
    resistanceDuration: { type: Number, default: 0 }, // How long they delayed/resisted
    didResist: { type: Boolean, default: false }, // Did they successfully resist performing it?
    anxietyLevelBefore: { type: Number, min: 1, max: 10 },
    anxietyLevelAfter: { type: Number, min: 1, max: 10 },
    trigger: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompulsionEpisode', compulsionEpisodeSchema);
