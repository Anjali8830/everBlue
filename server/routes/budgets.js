import express from 'express';
import Budget from '../models/Budget.js';

const router = express.Router();

// GET all budgets for a user
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const budgets = await Budget.find({ userEmail: email.toLowerCase() });
        res.json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST/UPDATE budget limit (upsert)
router.post('/', async (req, res) => {
    try {
        const { userEmail, category, limit } = req.body;

        if (!userEmail || !category || limit === undefined) {
            return res.status(400).json({ message: 'userEmail, category, and limit are required' });
        }

        if (limit < 0) {
            return res.status(400).json({ message: 'Limit must be positive' });
        }

        // Upsert: update if exists, create if doesn't
        const budget = await Budget.findOneAndUpdate(
            { userEmail: userEmail.toLowerCase(), category },
            { limit },
            { new: true, upsert: true }
        );

        res.json(budget);
    } catch (error) {
        console.error('Error saving budget:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
