import express from 'express';
import RecurringBill from '../models/RecurringBill.js';

const router = express.Router();

// GET all bills for a user
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const bills = await RecurringBill.find({ userEmail: email.toLowerCase() }).sort({ nextDueDate: 1 });
        res.json(bills);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create new bill
router.post('/', async (req, res) => {
    try {
        const { userEmail, name, amount, category, frequency, nextDueDate } = req.body;

        if (!userEmail || !name || !amount || !nextDueDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const bill = new RecurringBill({
            userEmail: userEmail.toLowerCase(),
            name,
            amount,
            category: category || 'Utilities',
            frequency: frequency || 'monthly',
            nextDueDate: new Date(nextDueDate),
            isActive: true
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update bill
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const bill = await RecurringBill.findByIdAndUpdate(id, updates, { new: true });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json(bill);
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE bill
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const bill = await RecurringBill.findByIdAndDelete(id);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
