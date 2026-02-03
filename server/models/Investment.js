import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    assetName: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['stock', 'mutualfund', 'crypto', 'other'],
        default: 'stock'
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    buyPrice: {
        type: Number,
        required: true,
        min: 0
    },
    currentPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
