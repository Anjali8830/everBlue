import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress, Alert
} from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import API_URL from '../config';

const Reports = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch transactions for the user (Backend expects email query param)
                const response = await fetch(`${API_URL}/api/transactions?email=${user?.email}`);

                if (!response.ok) throw new Error('Failed to load data');
                const data = await response.json();
                setTransactions(data);
                processData(data);
            } catch (err) {
                console.error(err);
                setError('Could not load report data.');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const processData = (data) => {
        // Group by category
        const stats = {};
        let total = 0;
        data.forEach(t => {
            // Only count expenses for "Spending by Category"
            if (t.type === 'expense') {
                stats[t.category] = (stats[t.category] || 0) + Number(t.amount);
                total += Number(t.amount);
            }
        });

        const sorted = Object.entries(stats)
            .map(([cat, amount]) => ({
                category: cat,
                amount,
                percentage: total ? ((amount / total) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        setCategoryStats(sorted);
    };

    const downloadPDF = () => {
        const element = document.getElementById('report-content');
        const opt = {
            margin: 10,
            filename: `everblue-report-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (loading) return <LinearProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box id="report-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Monthly Reports</Typography>
                <Box className="no-print">
                    <Button startIcon={<Print />} sx={{ mr: 1 }} onClick={() => window.print()}>Print</Button>
                    <Button variant="contained" startIcon={<Download />} onClick={downloadPDF}>Download PDF</Button>
                </Box>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Spending Summary ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
                </Typography>

                {categoryStats.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No expense data found for this month.
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">% of Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categoryStats.map((row) => (
                                    <TableRow key={row.category}>
                                        <TableCell>{row.category}</TableCell>
                                        <TableCell align="right">{formatAmount(row.amount)}</TableCell>
                                        <TableCell align="right">{row.percentage}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default Reports;
