import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // 4. Return user info (excluding password)
        res.json({ id: user._id, name: user.name, email: user.email });

    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Return user info
        res.json({
            msg: 'Login Success',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                email: user.email,
                monthlyBudget: user.monthlyBudget || 0
            }
        });

    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Update Monthly Budget
router.put('/budget', async (req, res) => {
    try {
        const { email, monthlyBudget } = req.body;
        const user = await User.findOneAndUpdate(
            { email },
            { monthlyBudget },
            { new: true }
        );
        res.json({ monthlyBudget: user.monthlyBudget });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get User Profile (including Budget)
router.get('/user', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ msg: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            monthlyBudget: user.monthlyBudget || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
