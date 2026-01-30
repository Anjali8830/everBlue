import React from 'react';
import { Box, Typography, Grid, Paper, Stack, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Budget = () => {
    const { user } = useAuth();
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`${API_URL}/api/transactions?email=${user.email}`);
                const transactions = await res.json();

                if (Array.isArray(transactions)) {
                    // Aggregate by Category
                    const categoryTotals = transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, curr) => {
                            acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
                            return acc;
                        }, {});

                    const chartData = Object.keys(categoryTotals).map(cat => ({
                        name: cat,
                        value: categoryTotals[cat]
                    }));

                    setData(chartData.length > 0 ? chartData : [{ name: 'No Data', value: 1 }]);
                }
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, [user]);
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Budget & Analytics
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Monthly Breakdown</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Category Limits</Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            {data.map((item, idx) => (
                                <Box key={item.name}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">{item.name}</Typography>
                                        <Typography variant="body2" fontWeight="bold">₹{item.value}</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={70}
                                        sx={{ height: 8, borderRadius: 5, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: COLORS[idx % COLORS.length] } }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Budget;
