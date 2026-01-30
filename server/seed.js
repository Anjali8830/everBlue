import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const users = [
    { name: 'Anjali', email: 'anjali@example.com', password: 'password123' },
    { name: 'Hitesh', email: 'hitesh@example.com', password: 'password123' },
    { name: 'Ayush', email: 'ayush@example.com', password: 'password123' }
];

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Income'];

const seed = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_coach';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected for Seeding');

        // Cleanup
        await User.deleteMany({});
        await Transaction.deleteMany({});
        console.log('Database Cleared');

        // Insert Users
        for (const userData of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const newUser = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword
            });

            const savedUser = await newUser.save();
            console.log(`User created: ${savedUser.name}`);

            // Insert Dummy Transactions
            const transactions = [];
            for (let i = 0; i < 10; i++) {
                const isIncome = Math.random() > 0.8;
                const type = isIncome ? 'income' : 'expense';
                const amount = isIncome ? (Math.random() * 50000 + 10000).toFixed(2) : (Math.random() * 2000 + 100).toFixed(2);
                const category = isIncome ? 'Income' : categories[Math.floor(Math.random() * (categories.length - 1))];

                transactions.push({
                    user: savedUser._id,
                    description: `${type === 'income' ? 'Salary/Freelance' : 'Purchase'} ${i + 1}`,
                    amount,
                    category,
                    type,
                    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                });
            }
            await Transaction.insertMany(transactions);
        }

        console.log('Seeding complete.');
        process.exit(0);

    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
