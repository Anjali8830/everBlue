import React, { useState } from 'react';
import {
    Box, Grid, Paper, Typography, Card, CardContent, Button,
    IconButton, LinearProgress, Chip, Stack, useTheme
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { useCurrency } from '../context/CurrencyContext';
import {
    TrendingUp, TrendingDown, AccountBalanceWallet,
    NotificationsActive, Close
} from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Mock Data
const spendingData = [
    { day: 'Mon', amount: 450 },
    { day: 'Tue', amount: 1200 },
    { day: 'Wed', amount: 320 },
    { day: 'Thu', amount: 850 },
    { day: 'Fri', amount: 1500 },
    { day: 'Sat', amount: 2100 },
    { day: 'Sun', amount: 1800 },
];

const insights = [
    {
        id: 1,
        type: 'warning',
        message: 'You spent ₹1,200 on dining out this week. Thats 20% higher than usual.',
        action: 'View Details'
    },
    {
        id: 2,
        type: 'success',
        message: 'Good job! You saved ₹500 on transport.',
        action: null
    }
];

const SummaryCard = ({ title, amount, subtitle, trend, color }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                {amount}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                    label={trend}
                    size="small"
                    color={color === 'success' ? 'success' : 'error'}
                    variant="soft" // Custom variant if supported, else default
                    sx={{
                        bgcolor: color === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(229, 57, 53, 0.1)',
                        color: color === 'success' ? 'success.main' : 'error.main',
                        fontWeight: 600
                    }}
                />
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            </Stack>
        </CardContent>
    </Card>
);

import AddTransactionDialog from '../components/AddTransactionDialog';
import SetBudgetDialog from '../components/SetBudgetDialog';

const Dashboard = () => {
    const theme = useTheme();
    const { user, updateUser } = useAuth();
    const { currency } = useCurrency();
    const [openTransaction, setOpenTransaction] = useState(false);
    const [openBudget, setOpenBudget] = useState(false);
    const [spendingData, setSpendingData] = React.useState([
        { day: 'Mon', amount: 0 }, { day: 'Tue', amount: 0 }, { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 }, { day: 'Fri', amount: 0 }, { day: 'Sat', amount: 0 }, { day: 'Sun', amount: 0 }
    ]);
    const [dailySpend, setDailySpend] = useState(0);
    const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

    React.useEffect(() => {
        const fetchData = async () => {
            // Use the user from context
            if (!user?.email) return;

            try {
                // Fetch User Data (Budget) Freshly
                const userRes = await fetch(`http://localhost:5000/api/auth/user?email=${user.email}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    // Only update if budget changed to avoid infinite loop
                    if (userData.monthlyBudget !== user.monthlyBudget) {
                        updateUser({ monthlyBudget: userData.monthlyBudget });
                    }
                }

                // Fetch Transactions
                const res = await fetch(`${API_URL}/api/transactions?email=${user.email}`);
                const transactions = await res.json();

                if (Array.isArray(transactions)) {
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    // Calculate Totals for Current Month
                    const income = transactions
                        .filter(t => {
                            const d = new Date(t.date);
                            return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                        })
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);

                    const expense = transactions
                        .filter(t => {
                            const d = new Date(t.date);
                            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                        })
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);

                    setTotals({
                        income,
                        expense,
                        balance: income - expense
                    });

                    // Daily Spend (Expenses today)
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todaySum = transactions
                        .filter(t => t.type === 'expense' && t.date.startsWith(todayStr))
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);
                    setDailySpend(todaySum);

                    // Weekly Trend (Last 7 days)
                    const last7Days = [...Array(7)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d.toISOString().split('T')[0];
                    });

                    const chartData = last7Days.map(dateStr => {
                        const daySum = transactions
                            .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
                            .reduce((acc, curr) => acc + Number(curr.amount), 0);
                        return {
                            day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
                            amount: daySum
                        };
                    });
                    setSpendingData(chartData);
                }
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, [user?.email]); // API Loop Fix: Depend only on email, not entire user object

    return (
        <Box>
            <AddTransactionDialog open={openTransaction} onClose={() => setOpenTransaction(false)} />
            <SetBudgetDialog open={openBudget} onClose={() => setOpenBudget(false)} />

            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Hello, {user?.name || 'User'} 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here is your daily financial snapshot.
                </Typography>
            </Box>

            {/* Financial Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <SummaryCard
                        title="Daily Spending"
                        amount={`${currency.symbol}${dailySpend}`}
                        subtitle="Total expenses today"
                        trend="Live"
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <SummaryCard
                        title="Remaining Budget"
                        amount={`${currency.symbol}${(user?.monthlyBudget || 0) - (totals?.expense || 0)}`}
                        subtitle="Left from monthly limit"
                        trend={(user?.monthlyBudget || 0) - (totals?.expense || 0) >= 0 ? "Safe" : "Over"}
                        color={(user?.monthlyBudget || 0) - (totals?.expense || 0) >= 0 ? "success" : "error"}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <SummaryCard
                        title="Month Spending"
                        amount={`${currency.symbol}${totals?.expense || 0}`}
                        subtitle="Total spent this month"
                        trend="Total"
                        color="info"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Main Chart Section */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" fontWeight="600">Weekly Spending Trend</Typography>
                            <Button size="small">View Report</Button>
                        </Box>
                        <Box sx={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={spendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                        {spendingData.map((entry, index) => (
                                            <Cell key={`cell - ${index} `} fill={index === 5 ? theme.palette.error.main : theme.palette.primary.main} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* AI Insights & Actions */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* AI Insight Card */}


                        {/* Quick Actions */}
                        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 3 }}>
                                Quick Actions
                            </Typography>
                            <Stack spacing={3}>
                                <Button
                                    variant="contained"
                                    startIcon={<AccountBalanceWallet />}
                                    fullWidth
                                    size="large"
                                    onClick={() => setOpenTransaction(true)}
                                >
                                    Add Transaction
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    fullWidth
                                    size="large"
                                    onClick={() => setOpenBudget(true)}
                                >
                                    Check Budget
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
