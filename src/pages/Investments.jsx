import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Stack, IconButton, Grid, Card,
    CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import API_URL from '../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const ASSET_TYPES = ['stock', 'mutualfund', 'crypto', 'other'];

const Investments = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const [investments, setInvestments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [formData, setFormData] = useState({
        assetName: '',
        type: 'stock',
        quantity: '',
        buyPrice: '',
        currentPrice: ''
    });

    useEffect(() => {
        fetchInvestments();
    }, [user]);

    const fetchInvestments = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_URL}/api/investments?email=${user.email}`);
            const data = await res.json();
            setInvestments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching investments:', error);
        }
    };

    const handleOpenDialog = (investment = null) => {
        if (investment) {
            setEditingInvestment(investment);
            setFormData({
                assetName: investment.assetName,
                type: investment.type,
                quantity: investment.quantity,
                buyPrice: investment.buyPrice,
                currentPrice: investment.currentPrice
            });
        } else {
            setEditingInvestment(null);
            setFormData({
                assetName: '',
                type: 'stock',
                quantity: '',
                buyPrice: '',
                currentPrice: ''
            });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.assetName || !formData.quantity || !formData.buyPrice || !formData.currentPrice) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const url = editingInvestment
                ? `${API_URL}/api/investments/${editingInvestment._id}`
                : `${API_URL}/api/investments`;

            const method = editingInvestment ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: user.email,
                    ...formData,
                    quantity: Number(formData.quantity),
                    buyPrice: Number(formData.buyPrice),
                    currentPrice: Number(formData.currentPrice)
                })
            });

            if (res.ok) {
                fetchInvestments();
                setOpenDialog(false);
            }
        } catch (error) {
            console.error('Error saving investment:', error);
            alert('Failed to save investment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this investment?')) return;

        try {
            const res = await fetch(`${API_URL}/api/investments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchInvestments();
            }
        } catch (error) {
            console.error('Error deleting investment:', error);
        }
    };

    const calculateMetrics = () => {
        let totalInvested = 0;
        let currentValue = 0;

        investments.forEach(inv => {
            totalInvested += inv.quantity * inv.buyPrice;
            currentValue += inv.quantity * inv.currentPrice;
        });

        const gainLoss = currentValue - totalInvested;
        const gainLossPercent = totalInvested > 0 ? ((gainLoss / totalInvested) * 100).toFixed(2) : 0;

        return { totalInvested, currentValue, gainLoss, gainLossPercent };
    };

    const getDistributionData = () => {
        const typeMap = {};
        investments.forEach(inv => {
            const value = inv.quantity * inv.currentPrice;
            typeMap[inv.type] = (typeMap[inv.type] || 0) + value;
        });
        return Object.entries(typeMap).map(([type, value]) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value
        }));
    };

    const metrics = calculateMetrics();
    const distributionData = getDistributionData();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h4" fontWeight="bold">Investment Portfolio</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track your investments & portfolio performance
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Investment
                </Button>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">Total Invested</Typography>
                            <Typography variant="h4" fontWeight="bold">{formatAmount(metrics.totalInvested)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">Current Value</Typography>
                            <Typography variant="h4" fontWeight="bold">{formatAmount(metrics.currentValue)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: metrics.gainLoss >= 0 ? 'success.light' : 'error.light' }}>
                        <CardContent>
                            <Typography variant="body2">Total Gain/Loss</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {formatAmount(Math.abs(metrics.gainLoss))}
                                </Typography>
                                {metrics.gainLoss >= 0 ? <TrendingUp sx={{ ml: 1 }} /> : <TrendingDown sx={{ ml: 1 }} />}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">Return %</Typography>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                color={metrics.gainLoss >= 0 ? 'success.main' : 'error.main'}
                            >
                                {metrics.gainLossPercent >= 0 ? '+' : ''}{metrics.gainLossPercent}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Distribution Chart */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Asset Distribution</Typography>
                        {distributionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => entry.name}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatAmount(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
                                No investments yet
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Holdings Table */}
                <Grid item xs={12} md={7}>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Asset Name</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell align="right"><strong>Qty</strong></TableCell>
                                    <TableCell align="right"><strong>Avg Buy</strong></TableCell>
                                    <TableCell align="right"><strong>Current</strong></TableCell>
                                    <TableCell align="right"><strong>Gain/Loss</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {investments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No investments yet. Click "Add Investment" to get started!
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    investments.map((inv) => {
                                        const invested = inv.quantity * inv.buyPrice;
                                        const current = inv.quantity * inv.currentPrice;
                                        const gainLoss = current - invested;
                                        const gainLossPercent = ((gainLoss / invested) * 100).toFixed(2);

                                        return (
                                            <TableRow key={inv._id}>
                                                <TableCell>{inv.assetName}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>{inv.type}</TableCell>
                                                <TableCell align="right">{inv.quantity}</TableCell>
                                                <TableCell align="right">{formatAmount(inv.buyPrice)}</TableCell>
                                                <TableCell align="right">{formatAmount(inv.currentPrice)}</TableCell>
                                                <TableCell align="right">
                                                    <Typography color={gainLoss >= 0 ? 'success.main' : 'error.main'}>
                                                        {gainLoss >= 0 ? '+' : ''}{formatAmount(gainLoss)}
                                                        <br />
                                                        ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => handleOpenDialog(inv)}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(inv._id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Asset Name"
                            value={formData.assetName}
                            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                            fullWidth
                            placeholder="e.g., Apple Inc., Bitcoin"
                        />
                        <TextField
                            select
                            label="Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            fullWidth
                        >
                            {ASSET_TYPES.map((type) => (
                                <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Average Buy Price"
                            type="number"
                            value={formData.buyPrice}
                            onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Current Price"
                            type="number"
                            value={formData.currentPrice}
                            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                            fullWidth
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

export default Investments;
