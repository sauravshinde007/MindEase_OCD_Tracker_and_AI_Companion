const OpenAI = require('openai');

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

module.exports = { chat };