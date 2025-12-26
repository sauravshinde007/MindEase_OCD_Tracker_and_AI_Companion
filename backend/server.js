const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const erpRoutes = require('./routes/erpRoutes');
const compulsionRoutes = require('./routes/compulsionRoutes');
const communityRoutes = require('./routes/communityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // In production (Vercel), we must have a valid MONGO_URI
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        
        // Only use In-Memory fallback in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Attempting to start In-Memory MongoDB...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                await mongoose.connect(uri);
                console.log('MongoDB Connected (In-Memory Fallback)');
            } catch (memErr) {
                console.error('MongoDB In-Memory Connection Failed:', memErr);
            }
        }
    }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.send('MindEase API is running');
});

// Export app for Vercel
module.exports = app;

// Start Server if running directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}