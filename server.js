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
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // Mask the URI for logging safety
        const maskedURI = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'Undefined';
        console.log(`Using Mongo URI: ${maskedURI}`);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000 // Increase timeout to 10s
        });
        console.log('MongoDB Connected (Atlas/Local)');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        
        // Only fallback if explicitly allowed or in dev (but prefer real DB)
        if (process.env.USE_IN_MEMORY_DB === 'true') {
            console.log('Attempting to start In-Memory MongoDB (Data will NOT persist)...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                await mongoose.connect(uri);
                console.log('MongoDB Connected (In-Memory Fallback - DATA WILL BE LOST ON RESTART)');
            } catch (memErr) {
                console.error('MongoDB In-Memory Connection Failed:', memErr);
                process.exit(1);
            }
        } else {
             console.log('Retrying connection in 5 seconds...');
             setTimeout(connectDB, 5000);
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});