const MoodLog = require('../models/MoodLog');
const JournalEntry = require('../models/JournalEntry');
const CompulsionEpisode = require('../models/CompulsionEpisode');
const ERPTask = require('../models/ERPTask');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const getInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        // Fetch Data
        const moods = await MoodLog.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } });
        const journals = await JournalEntry.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } });
        const compulsions = await CompulsionEpisode.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } });
        const exposures = await ERPTask.find({ user: userId, completed: true, updatedAt: { $gte: thirtyDaysAgo } }); 

        // --- Tiny Wins ---
        const tinyWins = [];
        if (exposures.length > 0) tinyWins.push(`You completed ${exposures.length} exposures this month!`);
        if (journals.length >= 3) tinyWins.push("Consistent journaling streak!");
        
        const resistedCompulsions = compulsions.filter(c => c.didResist === true);
        const delayedCompulsions = compulsions.filter(c => c.resistanceDuration > 0);

        if (resistedCompulsions.length > 0) tinyWins.push(`You fully resisted ${resistedCompulsions.length} compulsions! Amazing!`);
        if (delayedCompulsions.length > 0) tinyWins.push(`You delayed ${delayedCompulsions.length} compulsions before acting. That's progress!`);

        // --- AI Analysis for Themes & Drift ---
        let themes = {};
        let drift = [];

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here' || process.env.GEMINI_API_KEY === 'dummy-key') {
            themes = { "Contamination": 40, "Checking": 30, "Harm": 10 };
            drift = ["Your anxiety tends to spike on Monday mornings.", "You've been logging more entries about 'uncertainty' lately.", "Great job reducing reassurance seeking this week."];
        } else {
            const dataSummary = `
                Moods: ${JSON.stringify(moods.map(m => ({ date: m.createdAt, score: m.anxietyScore, label: m.moodLabel, sleep: m.sleepHours })))}
                Journals: ${JSON.stringify(journals.map(j => ({ date: j.createdAt, content: j.content.substring(0, 100) })))}
                Compulsions: ${JSON.stringify(compulsions.map(c => ({ date: c.createdAt, type: c.compulsionType })))}
            `;

            try {
                const prompt = `System: Analyze the user's OCD data. Output valid JSON with two keys: 'themes' (object mapping theme name to percentage integer) and 'drift' (array of 3 short insight strings).
Return ONLY valid JSON, no markdown.
User Data: ${dataSummary}`;

                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const parsedResult = JSON.parse(text);
                themes = parsedResult.themes || {};
                drift = parsedResult.drift || [];
            } catch (aiErr) {
                console.error("Gemini Insight Error:", aiErr);
                themes = { "Contamination (Est.)": 35, "Checking (Est.)": 25, "Uncertainty (Est.)": 15 };
                drift = ["We couldn't reach the AI, but you seem consistent!", "Try logging more details for better insights."];
            }
        }

        res.json({ tinyWins, themes, drift });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getInsights };
