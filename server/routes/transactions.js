import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = express.Router();

const getUserId = async (req) => {
    const headers = req.headers || {};
    const query = req.query || {};
    const email = headers['x-user-email'] || query.email;

    if (!email) return null;

    try {
        const user = await User.findOne({ email });
        return user ? user._id : null;
    } catch (e) { return null; }
};

router.get('/', async (req, res) => {
    const email = req.query.email || req.headers['x-user-email'];

    if (!email) return res.status(400).json({ msg: 'User email required' });

    try {
        const userId = await getUserId(req);

        if (userId) {
            const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
            return res.json(transactions);
        } else {
            return res.json([]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/', async (req, res) => {
    const { email, description, amount, category, type, date } = req.body;

    try {
        const userId = await getUserId({ headers: { 'x-user-email': email } });

        if (userId) {
            const newTx = new Transaction({
                user: userId,
                description,
                amount,
                category,
                type,
                date: date || Date.now()
            });

            const savedTx = await newTx.save();
            return res.json(savedTx);
        } else {
            return res.status(400).json({ msg: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
