import mongoose from 'mongoose';

const recurringBillSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        default: 'Utilities'
    },
    frequency: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    nextDueDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const RecurringBill = mongoose.model('RecurringBill', recurringBillSchema);

export default RecurringBill;
