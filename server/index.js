import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import reportsRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        "https://www.anjali.net.in",
        "https://d3sm9zpe96oz73.cloudfront.net",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Database configuration
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_coach';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // process.exit(1); // Keep running for demo even if DB fails
    }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/', (req, res) => {
    res.send('Smart Finance Coach API is running (MongoDB)');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
