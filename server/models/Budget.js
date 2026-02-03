import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// Compound unique index to ensure one limit per category per user
budgetSchema.index({ userEmail: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
