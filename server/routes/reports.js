import express from 'express';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// @route   POST api/reports/send-report
// @desc    Send monthly report to user email
// @access  Public (should be protected in prod)
router.post('/send-report', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    try {
        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 2. Fetch Transactions (Last 30 days or all)
        // Let's send current month's transactions
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = await Transaction.find({
            user: user._id,
            date: { $gte: firstDay }
        }).sort({ date: -1 });

        // 3. Generate HTML Table
        const tableRows = transactions.map(t => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(t.date).toLocaleDateString()}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${t.description}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${t.category}</td>
                <td style="padding: 8px; border: 1px solid #ddd; color: ${t.type === 'income' ? 'green' : 'red'}">
                    ${t.type === 'income' ? '+' : '-'}₹${t.amount}
                </td>
            </tr>
        `).join('');

        const htmlContent = `
            <h2>Monthly Transaction Report</h2>
            <p>Here is your spending summary for ${now.toLocaleString('default', { month: 'long' })}.</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Description</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Category</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.length > 0 ? tableRows : '<tr><td colspan="4" style="padding:8px; text-align:center">No transactions found for this month.</td></tr>'}
                </tbody>
            </table>
            <p>Total Spent: <b>₹${transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)}</b></p>
        `;

        // 4. Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // easy setup for testing
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Monthly Finance Report - ${now.toLocaleString('default', { month: 'long' })}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);

        res.json({ msg: 'Report sent successfully' });

    } catch (err) {
        console.error('Email Error:', err);
        res.status(500).json({ msg: 'Failed to send email. Check server logs.' });
    }
});

export default router;
