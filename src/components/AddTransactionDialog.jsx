import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, InputAdornment, Box
} from '@mui/material';

import API_URL from '../config';
import { useAuth } from '../context/AuthContext';

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Income', 'Other'];

const AddTransactionDialog = ({ open, onClose, onTransactionAdded }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.amount || !formData.category || !formData.description) return;

        try {
            const res = await fetch(`${API_URL}/api/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    amount: Number(formData.amount),
                    type: 'expense',
                    category: formData.category,
                    date: formData.date,
                    description: formData.description
                })
            });

            if (res.ok) {
                if (onTransactionAdded) onTransactionAdded();
                onClose();
                setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
            } else {
                const data = await res.json();
                alert(`Error: ${data.msg || 'Failed to add transaction'}`);
            }
        } catch (err) {
            console.error('Error adding transaction:', err);
            alert('Error adding transaction. Please try again.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle fontWeight="bold">Add New Transaction</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Description"
                        name="description"
                        fullWidth
                        required
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g. Uber to Office"
                        error={!formData.description && formData.description !== ''}
                    />
                    <TextField
                        label="Amount"
                        name="amount"
                        type="number"
                        fullWidth
                        required
                        value={formData.amount}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                    />
                    <TextField
                        select
                        label="Category"
                        name="category"
                        fullWidth
                        required
                        value={formData.category}
                        onChange={handleChange}
                    >
                        {categories.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Date"
                        name="date"
                        type="date"
                        fullWidth
                        value={formData.date}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.amount || !formData.category || !formData.description}
                >
                    Add Transaction
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddTransactionDialog;
