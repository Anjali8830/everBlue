import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Slider, Typography, Box, InputAdornment
} from '@mui/material';
import API_URL from '../config';

import { useAuth } from '../context/AuthContext';

const SetBudgetDialog = ({ open, onClose }) => {
    const { user, updateUser } = useAuth();
    const [limit, setLimit] = useState(user?.monthlyBudget || 20000);

    const handleSliderChange = (event, newValue) => {
        setLimit(newValue);
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/budget`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, monthlyBudget: Number(limit) })
            });

            const data = await res.json();
            if (res.ok) {
                updateUser({ monthlyBudget: data.monthlyBudget });
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle fontWeight="bold">Set Monthly Spend Limit</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ pt: 2 }}>
                    <Typography gutterBottom>
                        Global Monthly Budget
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <TextField
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            type="number"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            fullWidth
                        />
                    </Box>

                    <Typography gutterBottom color="text.secondary" variant="body2">
                        Adjust Limit
                    </Typography>
                    <Slider
                        value={limit}
                        onChange={handleSliderChange}
                        min={5000}
                        max={100000}
                        step={1000}
                        valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        *We will alert you when you reach 80% of this limit.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Set Limit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SetBudgetDialog;
