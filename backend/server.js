const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const erpRoutes = require('./routes/erpRoutes');
const compulsionRoutes = require('./routes/compulsionRoutes');
const communityRoutes = require('./routes/communityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL, 
    'http://localhost:5173',
    'https://mind-ease-ocd-tracker-and-ai-compan.vercel.app' // Explicit fallback
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Remove trailing slash for comparison if present
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        const isAllowed = allowedOrigins.some(allowed => {
            const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
            return normalizedAllowed === normalizedOrigin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        
        if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
            throw new Error('MONGO_URI is not defined in production environment.');
        }

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
        } else {
             // In production, we cannot fallback to in-memory, so we must exit if DB fails
             // This ensures Render restarts the service to try again
             console.error('Critical Error: Database connection failed in production. Exiting.');
             process.exit(1);
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
app.use('/api/seed', seedRoutes);

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