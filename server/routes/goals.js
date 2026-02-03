import express from 'express';
import Goal from '../models/Goal.js';

const router = express.Router();

// GET all goals for a user
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const goals = await Goal.find({ userEmail: email.toLowerCase() }).sort({ deadline: 1 });
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create new goal
router.post('/', async (req, res) => {
    try {
        const { userEmail, name, targetAmount, currentAmount, deadline, category } = req.body;

        if (!userEmail || !name || !targetAmount || !deadline) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const goal = new Goal({
            userEmail: userEmail.toLowerCase(),
            name,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline: new Date(deadline),
            category: category || 'Savings'
        });

        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update goal (including progress)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Auto-complete if target reached
        if (updates.currentAmount >= updates.targetAmount) {
            updates.isCompleted = true;
        }

        const goal = await Goal.findByIdAndUpdate(id, updates, { new: true });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.json(goal);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE goal
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const goal = await Goal.findByIdAndDelete(id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
