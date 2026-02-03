import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Stack, IconButton, Chip, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Add, Edit, Delete, Pause, PlayArrow } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import API_URL from '../config';

const CATEGORIES = ['Utilities', 'Subscriptions', 'Rent', 'Insurance', 'Other'];

const Bills = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const [bills, setBills] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: 'Subscriptions',
        frequency: 'monthly',
        nextDueDate: ''
    });

    useEffect(() => {
        fetchBills();
    }, [user]);

    const fetchBills = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_URL}/api/bills?email=${user.email}`);
            const data = await res.json();
            setBills(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const handleOpenDialog = (bill = null) => {
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name,
                amount: bill.amount,
                category: bill.category,
                frequency: bill.frequency,
                nextDueDate: new Date(bill.nextDueDate).toISOString().split('T')[0]
            });
        } else {
            setEditingBill(null);
            setFormData({
                name: '',
                amount: '',
                category: 'Subscriptions',
                frequency: 'monthly',
                nextDueDate: ''
            });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.amount || !formData.nextDueDate) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const url = editingBill
                ? `${API_URL}/api/bills/${editingBill._id}`
                : `${API_URL}/api/bills`;

            const method = editingBill ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: user.email,
                    ...formData,
                    amount: Number(formData.amount)
                })
            });

            if (res.ok) {
                fetchBills();
                setOpenDialog(false);
            }
        } catch (error) {
            console.error('Error saving bill:', error);
            alert('Failed to save bill');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this bill?')) return;

        try {
            const res = await fetch(`${API_URL}/api/bills/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBills();
            }
        } catch (error) {
            console.error('Error deleting bill:', error);
        }
    };

    const handleToggleActive = async (bill) => {
        try {
            const res = await fetch(`${API_URL}/api/bills/${bill._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !bill.isActive })
            });
            if (res.ok) {
                fetchBills();
            }
        } catch (error) {
            console.error('Error toggling bill:', error);
        }
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusChip = (bill) => {
        if (!bill.isActive) {
            return <Chip label="Paused" size="small" color="default" />;
        }
        const days = getDaysUntilDue(bill.nextDueDate);
        if (days < 0) return <Chip label="Overdue" size="small" color="error" />;
        if (days <= 3) return <Chip label={`Due in ${days}d`} size="small" color="warning" />;
        return <Chip label={`Due in ${days}d`} size="small" color="success" />;
    };

    const totalMonthly = bills
        .filter(b => b.isActive && b.frequency === 'monthly')
        .reduce((sum, b) => sum + b.amount, 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h4" fontWeight="bold">Recurring Bills</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage subscriptions & recurring payments
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Bill
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="h6">Total Monthly</Typography>
                        <Typography variant="h3" fontWeight="bold">{formatAmount(totalMonthly)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Active Bills</Typography>
                        <Typography variant="h3" fontWeight="bold">{bills.filter(b => b.isActive).length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Due Soon (≤3 days)</Typography>
                        <Typography variant="h3" fontWeight="bold" color="warning.main">
                            {bills.filter(b => b.isActive && getDaysUntilDue(b.nextDueDate) <= 3 && getDaysUntilDue(b.nextDueDate) >= 0).length}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Amount</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Frequency</strong></TableCell>
                            <TableCell><strong>Next Due</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No recurring bills yet. Click "Add Bill" to get started!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            bills.map((bill) => (
                                <TableRow key={bill._id} sx={{ opacity: bill.isActive ? 1 : 0.5 }}>
                                    <TableCell>{bill.name}</TableCell>
                                    <TableCell>{formatAmount(bill.amount)}</TableCell>
                                    <TableCell>{bill.category}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{bill.frequency}</TableCell>
                                    <TableCell>{new Date(bill.nextDueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{getStatusChip(bill)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleToggleActive(bill)}>
                                            {bill.isActive ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleOpenDialog(bill)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(bill._id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Bill Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            placeholder="e.g., Netflix, Rent"
                        />
                        <TextField
                            label="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            fullWidth
                        >
                            {CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Frequency"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </TextField>
                        <TextField
                            label="Next Due Date"
                            type="date"
                            value={formData.nextDueDate}
                            onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
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

export default Bills;
