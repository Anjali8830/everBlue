import React from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Download, Print } from '@mui/icons-material';

const Reports = () => {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Monthly Reports</Typography>
                <Box>
                    <Button startIcon={<Print />} sx={{ mr: 1 }}>Print</Button>
                    <Button variant="contained" startIcon={<Download />}>Download PDF</Button>
                </Box>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>January 2026 Summary</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Budget</TableCell>
                                <TableCell align="right">Actual</TableCell>
                                <TableCell align="right">Difference</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Food & Dining</TableCell>
                                <TableCell align="right">₹8,000</TableCell>
                                <TableCell align="right">₹8,450</TableCell>
                                <TableCell align="right" sx={{ color: 'error.main' }}>+₹450</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Transportation</TableCell>
                                <TableCell align="right">₹5,000</TableCell>
                                <TableCell align="right">₹4,200</TableCell>
                                <TableCell align="right" sx={{ color: 'success.main' }}>-₹800</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default Reports;
