import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Add } from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import API_URL from '../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B9D', '#C449C2', '#2ECC71'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health'];

const Budget = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const [chartData, setChartData] = useState([]);
    const [budgetLimits, setBudgetLimits] = useState({});
    const [categorySpending, setCategorySpending] = useState({});
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [limitAmount, setLimitAmount] = useState('');

    // Fetch transactions and budgets
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                // Fetch transactions
                const transRes = await fetch(`${API_URL}/api/transactions?email=${user.email}`);
                const transactions = await transRes.json();

                if (Array.isArray(transactions)) {
                    const categoryTotals = transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, curr) => {
                            acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
                            return acc;
                        }, {});

                    setCategorySpending(categoryTotals);

                    const chartData = Object.keys(categoryTotals).map(cat => ({
                        name: cat,
                        value: categoryTotals[cat]
                    }));

                    setChartData(chartData.length > 0 ? chartData : [{ name: 'No Data', value: 1 }]);
                }

                // Fetch budgets
                const budgetRes = await fetch(`${API_URL}/api/budgets?email=${user.email}`);
                const budgets = await budgetRes.json();

                const budgetMap = {};
                budgets.forEach(b => {
                    budgetMap[b.category] = b.limit;
                });
                setBudgetLimits(budgetMap);

            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, [user]);

    const handleSetBudget = async () => {
        if (!selectedCategory || !limitAmount || limitAmount <= 0) {
            alert('Please select a category and enter a valid limit');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/budgets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: user.email,
                    category: selectedCategory,
                    limit: Number(limitAmount)
                })
            });

            if (res.ok) {
                const newBudget = await res.json();
                setBudgetLimits(prev => ({ ...prev, [newBudget.category]: newBudget.limit }));
                setOpenDialog(false);
                setSelectedCategory('');
                setLimitAmount('');
            }
        } catch (error) {
            console.error('Error setting budget:', error);
            alert('Failed to set budget');
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return 'error';
        if (percentage >= 70) return 'warning';
        return 'success';
    };

    const getProgressValue = (category) => {
        const spent = categorySpending[category] || 0;
        const limit = budgetLimits[category];
        if (!limit) return 0;
        return Math.min((spent / limit) * 100, 100);
    };

    // Get all categories that have either spending or a budget
    const allCategories = [...new Set([
        ...Object.keys(categorySpending),
        ...Object.keys(budgetLimits)
    ])].sort();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h4" fontWeight="bold">Budget & Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">Track your spending limits</Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                >
                    Set Budget Limit
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Monthly Breakdown</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatAmount(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Category Limits</Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            {allCategories.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                    No budgets set yet. Click "Set Budget Limit" to get started!
                                </Typography>
                            ) : (
                                allCategories.map((category, idx) => {
                                    const spent = categorySpending[category] || 0;
                                    const limit = budgetLimits[category];
                                    const hasLimit = limit !== undefined;
                                    const progress = hasLimit ? getProgressValue(category) : 0;

                                    return (
                                        <Box key={category}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">{category}</Typography>
                                                <Typography variant="body2" color={hasLimit && spent > limit ? 'error.main' : 'text.primary'}>
                                                    {formatAmount(spent)} {hasLimit && `of ${formatAmount(limit)}`}
                                                </Typography>
                                            </Box>
                                            {hasLimit ? (
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    color={getProgressColor(progress)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        bgcolor: 'grey.200'
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    No limit set - Click "Set Budget Limit" to add one
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Set Budget Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Set Budget Limit</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            fullWidth
                        >
                            {CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Monthly Limit"
                            type="number"
                            value={limitAmount}
                            onChange={(e) => setLimitAmount(e.target.value)}
                            fullWidth
                            placeholder="e.g., 5000"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSetBudget} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Budget;
