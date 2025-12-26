const MoodLog = require('../models/MoodLog');
const JournalEntry = require('../models/JournalEntry');
const CompulsionEpisode = require('../models/CompulsionEpisode');
const ERPTask = require('../models/ERPTask');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    dangerouslyAllowBrowser: false
});

const getInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        // Fetch Data
        const moods = await MoodLog.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } });
        const journals = await JournalEntry.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } });
        const compulsions = await CompulsionEpisode.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } });
        const exposures = await ERPTask.find({ user: userId, completed: true, updatedAt: { $gte: thirtyDaysAgo } }); // Assuming completed flag or check logic

        // --- Tiny Wins ---
        const tinyWins = [];
        if (exposures.length > 0) tinyWins.push(`You completed ${exposures.length} exposures this month!`);
        if (journals.length >= 3) tinyWins.push("Consistent journaling streak!");
        
        // Check for delayed compulsions (using resistanceDuration or didResist)
        const resistedCompulsions = compulsions.filter(c => c.didResist === true);
        const delayedCompulsions = compulsions.filter(c => c.resistanceDuration > 0);

        if (resistedCompulsions.length > 0) {
            tinyWins.push(`You fully resisted ${resistedCompulsions.length} compulsions! Amazing!`);
        }
        if (delayedCompulsions.length > 0) {
             tinyWins.push(`You delayed ${delayedCompulsions.length} compulsions before acting. That's progress!`);
        }

        // --- AI Analysis for Themes & Drift ---
        let themes = {};
        let drift = [];

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here' || process.env.OPENAI_API_KEY === 'dummy-key') {
            // Mock Analysis
            themes = {
                "Contamination": 40,
                "Checking": 30,
                "Harm": 10
            };
            drift = [
                "Your anxiety tends to spike on Monday mornings.",
                "You've been logging more entries about 'uncertainty' lately.",
                "Great job reducing reassurance seeking this week."
            ];
        } else {
            // Real AI Analysis
            // Prepare data summary for AI
            const dataSummary = `
                Moods: ${JSON.stringify(moods.map(m => ({ date: m.createdAt, score: m.anxietyScore, label: m.moodLabel, sleep: m.sleepHours })))}
                Journals: ${JSON.stringify(journals.map(j => ({ date: j.createdAt, content: j.content.substring(0, 100) })))}
                Compulsions: ${JSON.stringify(compulsions.map(c => ({ date: c.createdAt, type: c.compulsionType })))}
            `;

            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "Analyze the user's OCD data. Output valid JSON with two keys: 'themes' (object mapping theme name to percentage integer) and 'drift' (array of 3 short insight strings about patterns, e.g., 'Anxiety spikes on Sundays', 'Poor sleep correlates with higher anxiety'). Detect themes like Contamination, Harm, Checking, etc." },
                        { role: "user", content: dataSummary }
                    ],
                    model: "gpt-3.5-turbo",
                    response_format: { type: "json_object" }
                });
                const result = JSON.parse(completion.choices[0].message.content);
                themes = result.themes || {};
                drift = result.drift || [];
            } catch (aiErr) {
                console.error("AI Insight Error:", aiErr);
                drift.push("Could not generate AI insights at this time.");
            }
        }

        res.json({
            tinyWins,
            themes,
            drift
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getInsights };
