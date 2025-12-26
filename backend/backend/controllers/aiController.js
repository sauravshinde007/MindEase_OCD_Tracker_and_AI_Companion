const OpenAI = require('openai');
const MoodLog = require('../models/MoodLog');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    dangerouslyAllowBrowser: false
});

const getMockResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('anx') || lowerMsg.includes('panic')) {
        return "I hear that you're feeling anxious. Let's try a grounding exercise: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Take a deep breath.";
    }
    if (lowerMsg.includes('compulsion') || lowerMsg.includes('urge') || lowerMsg.includes('check')) {
        return "It sounds like you're facing a compulsion. Remember the 15-minute rule: Can you wait just 15 minutes before acting on it? The urge often passes like a wave.";
    }
    if (lowerMsg.includes('thought') || lowerMsg.includes('obsess')) {
        return "Intrusive thoughts can be scary, but remember: thoughts are just thoughts, not facts. You don't have to engage with them. Visualize the thought floating away on a cloud.";
    }
    return "I'm here for you. Tell me more about how you're feeling. We can work through this together.";
};

const chat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    // Mock response if no API key or dummy key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here' || process.env.OPENAI_API_KEY === 'dummy-key') {
        console.log('Using Mock AI Response (No API Key)');
        // Simulate delay for realism
        setTimeout(() => {
            res.json({ reply: getMockResponse(message) });
        }, 1000);
        return;
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are MindEase AI, a supportive companion for someone with OCD. Use CBT techniques (Cognitive Behavioral Therapy) and ERP (Exposure and Response Prevention) principles. Do not give medical advice. Be calming, empathetic, concise, and warm. If someone expresses self-harm intent, provide helpline resources immediately." },
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo",
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback to mock if API fails
        res.json({ reply: getMockResponse(message) });
    }
};

const checkIn = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    // Mock Response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here' || process.env.OPENAI_API_KEY === 'dummy-key') {
         let analysis = null;
         const lowerMsg = message.toLowerCase();
         let moodLabel = 'Neutral';
         let anxietyScore = 3;

         if (lowerMsg.includes('happy') || lowerMsg.includes('good') || lowerMsg.includes('great')) {
             moodLabel = 'Happy';
             anxietyScore = 2;
         } else if (lowerMsg.includes('sad') || lowerMsg.includes('bad') || lowerMsg.includes('depressed')) {
             moodLabel = 'Sad';
             anxietyScore = 5;
         } else if (lowerMsg.includes('anxious') || lowerMsg.includes('panic') || lowerMsg.includes('scared')) {
             moodLabel = 'Anxious';
             anxietyScore = 8;
         }

         // Simple sleep extraction mock
         let sleepHours = undefined;
         const sleepMatch = lowerMsg.match(/slept (\d+) hours/);
         if (sleepMatch) {
            sleepHours = parseInt(sleepMatch[1]);
         }

         // Only log if meaningful keywords found or explicitly asked
         if (moodLabel !== 'Neutral' || sleepHours) {
             analysis = { moodLabel, anxietyScore, note: message, sleepHours };
         }

        if (analysis) {
            try {
                 const newMood = new MoodLog({
                     user: req.user._id,
                     moodLabel: analysis.moodLabel,
                     anxietyScore: analysis.anxietyScore,
                     note: analysis.note,
                     sleepHours: analysis.sleepHours
                 });
                 await newMood.save();
            } catch (err) {
                console.error("Mock Mood Save Error:", err);
            }
        }

        return res.json({
            reply: "I'm listening. Tell me more about what's on your mind.",
            analysis: analysis
        });
    }

    try {
        const messages = [
             { role: "system", content: "You are an empathetic AI Check-in Coach. Engage in a natural conversation to understand the user's mood and anxiety. If the user's input allows you to infer their mood state, output a JSON object with 'reply' (conversational response) and 'analysis' (object with 'moodLabel', 'anxietyScore' (1-10), 'note', and optional 'sleepHours' (number) if mentioned). If you need more info, just return 'reply' in the JSON. Return valid JSON." },
             ...(history || []).map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
             { role: "user", content: message }
        ];

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        
        if (result.analysis) {
             try {
                 const newMood = new MoodLog({
                     user: req.user._id,
                     moodLabel: result.analysis.moodLabel,
                     anxietyScore: result.analysis.anxietyScore,
                     note: result.analysis.note
                 });
                 await newMood.save();
                 result.savedLog = newMood;
             } catch (dbErr) {
                 console.error('Failed to save mood log automatically:', dbErr);
             }
        }

        res.json(result);
    } catch (error) {
        console.error('OpenAI Check-in Error:', error);
        res.status(500).json({ message: 'Failed to process check-in' });
    }
};

const generateExposureHierarchy = async (req, res) => {
    const { fearTheme } = req.body;

    if (!fearTheme) {
        return res.status(400).json({ message: 'Fear theme is required' });
    }

    // Mock Data for ERP
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here' || process.env.OPENAI_API_KEY === 'dummy-key') {
         const mockHierarchy = [
            { title: `Look at a picture of ${fearTheme}`, difficulty: 2, description: "Start by just looking at an image related to your fear." },
            { title: `Write down the word '${fearTheme}'`, difficulty: 3, description: "Write the fear trigger on a piece of paper." },
            { title: `Imagine being near ${fearTheme}`, difficulty: 5, description: "Close your eyes and visualize the scenario for 2 minutes." },
            { title: `Touch an object related to ${fearTheme}`, difficulty: 7, description: "Briefly touch an item that triggers mild anxiety." },
            { title: `Full exposure to ${fearTheme}`, difficulty: 10, description: "Face the fear directly without performing a compulsion." }
        ];
        return res.json({ hierarchy: mockHierarchy });
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert ERP therapist. Create a 5-step exposure hierarchy for the user's fear. Return valid JSON only: an array of objects with keys 'title', 'difficulty' (1-10), and 'description'." },
                { role: "user", content: `Create an exposure hierarchy for: ${fearTheme}` }
            ],
            model: "gpt-3.5-turbo",
        });

        // Parse JSON safely
        const hierarchy = JSON.parse(completion.choices[0].message.content);
        res.json({ hierarchy });
    } catch (error) {
        console.error('OpenAI ERP Error:', error);
        res.status(500).json({ message: 'Failed to generate hierarchy' });
    }
};

const deconstructThought = async (req, res) => {
    const { thought, distortion } = req.body;

    // Mock Data for Thought Deconstruction
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here' || process.env.OPENAI_API_KEY === 'dummy-key') {
        return res.json({
            analysis: "This sounds like 'Catastrophizing' - assuming the worst will happen.",
            challenge: "What is the evidence that this thought is 100% true? Have you survived similar feelings before?",
            reframe: "Even if I feel anxious, it doesn't mean something bad will happen. I can handle this feeling."
        });
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a CBT therapist. Analyze the user's intrusive thought. Return valid JSON with keys: 'analysis' (identify cognitive distortion), 'challenge' (socratic question), and 'reframe' (a balanced alternative thought)." },
                { role: "user", content: `Thought: "${thought}". Distortion: "${distortion || 'Unknown'}"` }
            ],
            model: "gpt-3.5-turbo",
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error('OpenAI CBT Error:', error);
        res.status(500).json({ message: 'Failed to deconstruct thought' });
    }
};

module.exports = { chat, generateExposureHierarchy, deconstructThought, checkIn };
