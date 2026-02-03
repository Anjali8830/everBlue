import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Stack, IconButton, Grid, Card,
    CardContent, LinearProgress, Chip
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Flag } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import API_URL from '../config';

const GOAL_CATEGORIES = ['Savings', 'Emergency Fund', 'Vacation', 'Education', 'Home', 'Retirement', 'Other'];

const Goals = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const [goals, setGoals] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        category: 'Savings'
    });

    useEffect(() => {
        fetchGoals();
    }, [user]);

    const fetchGoals = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_URL}/api/goals?email=${user.email}`);
            const data = await res.json();
            setGoals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const handleOpenDialog = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                deadline: new Date(goal.deadline).toISOString().split('T')[0],
                category: goal.category
            });
        } else {
            setEditingGoal(null);
            setFormData({
                name: '',
                targetAmount: '',
                currentAmount: '',
                deadline: '',
                category: 'Savings'
            });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.targetAmount || !formData.deadline) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const url = editingGoal
                ? `${API_URL}/api/goals/${editingGoal._id}`
                : `${API_URL}/api/goals`;

            const method = editingGoal ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: user.email,
                    ...formData,
                    targetAmount: Number(formData.targetAmount),
                    currentAmount: Number(formData.currentAmount || 0)
                })
            });

            if (res.ok) {
                fetchGoals();
                setOpenDialog(false);
            }
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Failed to save goal');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this goal?')) return;

        try {
            const res = await fetch(`${API_URL}/api/goals/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchGoals();
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const handleUpdateProgress = async (goal, newAmount) => {
        try {
            const res = await fetch(`${API_URL}/api/goals/${goal._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentAmount: Number(newAmount),
                    targetAmount: goal.targetAmount
                })
            });
            if (res.ok) {
                fetchGoals();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const getDaysRemaining = (deadline) => {
        const today = new Date();
        const due = new Date(deadline);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getProgressPercentage = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h4" fontWeight="bold">Financial Goals</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track progress towards your financial objectives
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Goal
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">Active Goals</Typography>
                            <Typography variant="h3" fontWeight="bold">{activeGoals.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">Completed Goals</Typography>
                            <Typography variant="h3" fontWeight="bold" color="success.main">{completedGoals.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">Total Target</Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {formatAmount(activeGoals.reduce((sum, g) => sum + g.targetAmount, 0))}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Active Goals */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Active Goals</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {activeGoals.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No active goals yet. Click "Add Goal" to get started!
                            </Typography>
                        </Paper>
                    </Grid>
                ) : (
                    activeGoals.map((goal) => {
                        const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                        const daysLeft = getDaysRemaining(goal.deadline);

                        return (
                            <Grid item xs={12} md={6} key={goal._id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <div>
                                                <Typography variant="h6" fontWeight="bold">{goal.name}</Typography>
                                                <Chip
                                                    label={goal.category}
                                                    size="small"
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </div>
                                            <div>
                                                <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(goal._id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {progress.toFixed(1)}%
                                            </Typography>
                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{ height: 8, borderRadius: 5, mb: 2 }}
                                            color={progress >= 100 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
                                        />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                <Flag fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                placeholder="Update progress"
                                                sx={{ width: 150 }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdateProgress(goal, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Completed Goals ✓</Typography>
                    <Grid container spacing={3}>
                        {completedGoals.map((goal) => (
                            <Grid item xs={12} md={6} key={goal._id}>
                                <Card sx={{ bgcolor: 'success.light', opacity: 0.8 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <Typography variant="h6" fontWeight="bold">{goal.name}</Typography>
                                                <Typography variant="body2">{formatAmount(goal.targetAmount)}</Typography>
                                            </div>
                                            <CheckCircle color="success" fontSize="large" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Goal Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            placeholder="e.g., Emergency Fund, Vacation"
                        />
                        <TextField
                            select
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            fullWidth
                        >
                            {GOAL_CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Target Amount"
                            type="number"
                            value={formData.targetAmount}
                            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Current Amount (Optional)"
                            type="number"
                            value={formData.currentAmount}
                            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Goals;
