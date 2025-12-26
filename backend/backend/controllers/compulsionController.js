const CompulsionEpisode = require('../models/CompulsionEpisode');

const logEpisode = async (req, res) => {
    try {
        const { compulsionName, durationMinutes, resistanceDuration, didResist, anxietyLevelBefore, anxietyLevelAfter, trigger, notes } = req.body;

        const episode = await CompulsionEpisode.create({
            user: req.user._id,
            compulsionName,
            durationMinutes,
            resistanceDuration,
            didResist,
            anxietyLevelBefore,
            anxietyLevelAfter,
            trigger,
            notes
        });

        res.status(201).json(episode);
    } catch (error) {
        console.error('Error logging compulsion episode:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEpisodes = async (req, res) => {
    try {
        const episodes = await CompulsionEpisode.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(episodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { logEpisode, getEpisodes };
