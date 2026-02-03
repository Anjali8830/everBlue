import express from 'express';
import Investment from '../models/Investment.js';

const router = express.Router();

// GET all investments for a user
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const investments = await Investment.find({ userEmail: email.toLowerCase() });
        res.json(investments);
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create new investment
router.post('/', async (req, res) => {
    try {
        const { userEmail, assetName, type, quantity, buyPrice, currentPrice } = req.body;

        if (!userEmail || !assetName || !quantity || !buyPrice || !currentPrice) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const investment = new Investment({
            userEmail: userEmail.toLowerCase(),
            assetName,
            type: type || 'stock',
            quantity,
            buyPrice,
            currentPrice
        });

        await investment.save();
        res.status(201).json(investment);
    } catch (error) {
        console.error('Error creating investment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update investment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const investment = await Investment.findByIdAndUpdate(id, updates, { new: true });
        
        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.json(investment);
    } catch (error) {
        console.error('Error updating investment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE investment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const investment = await Investment.findByIdAndDelete(id);
        
        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.json({ message: 'Investment deleted successfully' });
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
