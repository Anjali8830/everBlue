import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        default: 'Savings'
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
