const { GoogleGenerativeAI } = require('@google/generative-ai');
const MoodLog = require('../models/MoodLog');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const getMockResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    // Helper to pick random response
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (lowerMsg.includes('anx') || lowerMsg.includes('panic') || lowerMsg.includes('scared') || lowerMsg.includes('fear')) {
        return pickRandom([
            "I hear that you're feeling anxious. Let's try a grounding exercise: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Take a deep breath.",
            "Anxiety can be overwhelming, but remember it is a temporary wave. Try to breathe in for 4 seconds, hold for 7, and exhale for 8.",
            "It's okay to feel scared. You are safe right now. Focus on your feet on the floor and the weight of your body in the chair."
        ]);
    }
    
    if (lowerMsg.includes('compulsion') || lowerMsg.includes('urge') || lowerMsg.includes('check') || lowerMsg.includes('wash') || lowerMsg.includes('repeat')) {
        return pickRandom([
            "It sounds like you're facing a compulsion. Remember the 15-minute rule: Can you wait just 15 minutes before acting on it? The urge often passes like a wave.",
            "Resisting the urge is hard, but it breaks the cycle. Try to delay the compulsion by just a few minutes longer than last time.",
            "You are stronger than this urge. What would happen if you didn't do it? Sit with the uncertainty for a moment."
        ]);
    }
    
    if (lowerMsg.includes('thought') || lowerMsg.includes('obsess') || lowerMsg.includes('mind') || lowerMsg.includes('worry')) {
        return pickRandom([
            "Intrusive thoughts can be scary, but remember: thoughts are just thoughts, not facts. You don't have to engage with them. Visualize the thought floating away on a cloud.",
            "Just because you think it, doesn't mean it's true. Label it: 'I am having a thought that...'",
            "Try to observe the thought without judging it. Let it pass through your mind like a car driving past your house."
        ]);
    }

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('wassup') || lowerMsg.includes('sup') || lowerMsg.includes('howdy') || lowerMsg.includes('greeting')) {
        return pickRandom([
            "Hello! I'm here to support you. How are you feeling today?",
            "Hi there. You're not alone. What's on your mind?",
            "Hey. I'm listening. Feel free to share whatever is bothering you."
        ]);
    }

    if (lowerMsg.includes('thank') || lowerMsg.includes('ok') || lowerMsg.includes('cool') || lowerMsg.includes('good') || lowerMsg.includes('bye')) {
        return pickRandom([
            "You're welcome. I'm here if you need anything else.",
            "Take care. Remember to be kind to yourself.",
            "Glad I could help. Wishing you a peaceful day."
        ]);
    }

    return pickRandom([
        "I'm here for you. Tell me more about how you're feeling.",
        "That sounds important. How does that make you feel?",
        "I'm listening. Feel free to share more if you're comfortable.",
        "Thank you for sharing. What usually helps you when you feel this way?"
    ]);
};

const getMockCheckInResult = (message) => {
    const lowerMsg = message.toLowerCase();
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let analysis = null;
    let reply = "";

    if (lowerMsg.includes('anx') || lowerMsg.includes('panic') || lowerMsg.includes('fear') || lowerMsg.includes('scared')) {
        analysis = { moodLabel: 'Anxious', anxietyScore: 7, note: 'User mentioned anxiety or fear.' };
        reply = pickRandom([
            "I hear that you're feeling anxious. Let's try a grounding exercise.",
            "Anxiety can be overwhelming. Try to breathe in for 4 seconds, hold for 7, and exhale for 8."
        ]);
    } else if (lowerMsg.includes('sad') || lowerMsg.includes('depress') || lowerMsg.includes('down') || lowerMsg.includes('cry')) {
        analysis = { moodLabel: 'Sad', anxietyScore: 5, note: 'User mentioned sadness.' };
        reply = pickRandom([
            "I'm sorry you're feeling down. Be kind to yourself today.",
            "It's okay to feel sad. I'm here to listen."
        ]);
    } else if (lowerMsg.includes('happy') || lowerMsg.includes('good') || lowerMsg.includes('great') || lowerMsg.includes('excited')) {
        analysis = { moodLabel: 'Happy', anxietyScore: 2, note: 'User mentioned feeling good.' };
        reply = pickRandom([
            "That's wonderful to hear!",
            "I'm glad you're feeling well!"
        ]);
    } else {
        reply = pickRandom([
            "I'm here for you. Tell me more.",
            "I'm listening. How has your day been?"
        ]);
    }
    return { reply, analysis };
};

const getMockDeconstruction = () => {
    return {
        analysis: "This sounds like 'Catastrophizing' - assuming the worst will happen.",
        challenge: "What is the evidence that this thought is 100% true?",
        reframe: "Even if I feel anxious, it doesn't mean something bad will happen."
    };
};

const chat = async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here' || process.env.GEMINI_API_KEY === 'dummy-key') {
        setTimeout(() => res.json({ reply: getMockResponse(message) }), 1000);
        return;
    }

    try {
        const prompt = `System: You are MindEase AI, a supportive companion for someone with OCD. Use CBT techniques and ERP principles. Be calming, empathetic, concise, and warm.
User: ${message}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.json({ reply: getMockResponse(message) });
    }
};

const checkIn = async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here' || process.env.GEMINI_API_KEY === 'dummy-key') {
        const result = getMockCheckInResult(message);
        if (result.analysis) {
            try {
                 const newMood = new MoodLog({
                     user: req.user._id,
                     moodLabel: result.analysis.moodLabel,
                     anxietyScore: result.analysis.anxietyScore,
                     note: result.analysis.note,
                     sleepHours: result.analysis.sleepHours
                 });
                 await newMood.save();
            } catch (err) { console.error("Mock Mood Save Error:", err); }
        }
        return res.json(result);
    }

    try {
        const historyText = (history || []).map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
        const prompt = `System: You are an empathetic AI Check-in Coach. Engage in a natural conversation. 
If the user's input allows you to infer their mood state, output a JSON object with 'reply' and 'analysis' (object with 'moodLabel', 'anxietyScore' (1-10), 'note'). 
If you need more info, just return 'reply' in the JSON. Return ONLY valid JSON, no markdown.
Conversation History:
${historyText}
User: ${message}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(text);
        
        if (parsedResult.analysis) {
             try {
                 const newMood = new MoodLog({
                     user: req.user._id,
                     moodLabel: parsedResult.analysis.moodLabel,
                     anxietyScore: parsedResult.analysis.anxietyScore,
                     note: parsedResult.analysis.note
                 });
                 await newMood.save();
                 parsedResult.savedLog = newMood;
             } catch (dbErr) { console.error('Failed to save mood log:', dbErr); }
        }
        res.json(parsedResult);
    } catch (error) {
        console.error('Gemini Check-in Error:', error);
        const result = getMockCheckInResult(message);
        if (result.analysis) {
             try {
                 const newMood = new MoodLog({
                     user: req.user._id,
                     moodLabel: result.analysis.moodLabel,
                     anxietyScore: result.analysis.anxietyScore,
                     note: result.analysis.note
                 });
                 await newMood.save();
            } catch (err) { console.error("Mock Mood Save Error:", err); }
        }
        res.json(result);
    }
};

const generateExposureHierarchy = async (req, res) => {
    const { fearTheme } = req.body;
    if (!fearTheme) return res.status(400).json({ message: 'Fear theme is required' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here' || process.env.GEMINI_API_KEY === 'dummy-key') {
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
        const prompt = `System: You are an expert ERP therapist. Create a 5-step exposure hierarchy for the user's fear. 
Return a JSON object with a single key 'hierarchy' containing an array of objects. 
Each object must have keys: 'title', 'difficulty' (1-10), and 'description'.
Return ONLY valid JSON, no markdown.
User Fear: ${fearTheme}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        let parsedContent;
        try {
            parsedContent = JSON.parse(text);
        } catch (parseError) {
            console.error('[ERP] JSON Parse Error:', parseError);
            throw new Error('Failed to parse Gemini response');
        }
        
        const hierarchy = Array.isArray(parsedContent) ? parsedContent : (parsedContent.hierarchy || parsedContent.steps || []);
        res.json({ hierarchy });
    } catch (error) {
        console.error('[ERP] Detailed Error:', error);
        const mockHierarchy = [
            { title: `Look at a picture of ${fearTheme}`, difficulty: 2, description: "Start by just looking at an image related to your fear." },
            { title: `Write down the word '${fearTheme}'`, difficulty: 3, description: "Write the fear trigger on a piece of paper." },
            { title: `Imagine being near ${fearTheme}`, difficulty: 5, description: "Close your eyes and visualize the scenario for 2 minutes." },
            { title: `Touch an object related to ${fearTheme}`, difficulty: 7, description: "Briefly touch an item that triggers mild anxiety." },
            { title: `Full exposure to ${fearTheme}`, difficulty: 10, description: "Face the fear directly without performing a compulsion." }
        ];
        return res.json({ hierarchy: mockHierarchy });
    }
};

const deconstructThought = async (req, res) => {
    const { thought, distortion } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here' || process.env.GEMINI_API_KEY === 'dummy-key') {
        return res.json(getMockDeconstruction());
    }

    try {
        const prompt = `System: You are a CBT therapist. Analyze the user's intrusive thought. 
Return valid JSON with keys: 'analysis' (identify cognitive distortion), 'challenge' (socratic question), and 'reframe' (a balanced alternative thought).
Return ONLY valid JSON, no markdown.
Thought: "${thought}"
Distortion: "${distortion || 'Unknown'}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(text);
        res.json(parsedResult);
    } catch (error) {
        console.error('Gemini Deconstruction Error:', error);
        res.json(getMockDeconstruction());
    }
};

module.exports = { chat, generateExposureHierarchy, deconstructThought, checkIn };
