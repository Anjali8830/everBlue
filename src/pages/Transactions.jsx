import React from 'react';
import {
    Box, Typography, Paper, Chip,
    InputAdornment, TextField, Button, Stack, MenuItem
} from '@mui/material';
import { Search, FilterList, Download } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

// Mock Data
const rows = [
    { id: 1, date: '2026-01-30', description: 'Uber Trip', category: 'Transport', amount: 450, type: 'expense' },
    { id: 2, date: '2026-01-29', description: 'FreshMenu Order', category: 'Food', amount: 320, type: 'expense' },
    { id: 3, date: '2026-01-28', description: 'Salary Credit', category: 'Income', amount: 80000, type: 'income' },
    { id: 4, date: '2026-01-28', description: 'Netflix Subscription', category: 'Entertainment', amount: 649, type: 'expense' },
    { id: 5, date: '2026-01-27', description: 'Grocery Store', category: 'Groceries', amount: 1200, type: 'expense' },
    { id: 6, date: '2026-01-26', description: 'Starbucks', category: 'Food', amount: 450, type: 'expense' },
    { id: 7, date: '2026-01-25', description: 'Petrol Pump', category: 'Transport', amount: 2100, type: 'expense' },
    { id: 8, date: '2026-01-25', description: 'Amazon Purchase', category: 'Shopping', amount: 3500, type: 'expense' },
];

const columns = [
    { field: 'date', headerName: 'Date', width: 130 },
    { field: 'description', headerName: 'Description', width: 250, flex: 1 },
    {
        field: 'category',
        headerName: 'Category',
        width: 150,
        renderCell: (params) => {
            let color = 'default';
            if (params.value === 'Food') color = 'warning';
            if (params.value === 'Transport') color = 'info';
            if (params.value === 'Income') color = 'success';
            if (params.value === 'Entertainment') color = 'secondary';
            return <Chip label={params.value} size="small" color={color} variant="outlined" />;
        }
    },
    {
        field: 'amount',
        headerName: 'Amount',
        width: 150,
        renderCell: (params) => (
            <Typography fontWeight={500} color={params.row.type === 'income' ? 'success.main' : 'text.primary'}>
                {params.row.type === 'income' ? '+' : '-'}₹{params.value}
            </Typography>
        )
    },
];

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Income', 'Other'];

const Transactions = () => {
    const [rows, setRows] = React.useState([]);
    const { user } = useAuth();

    // Filter States
    const [search, setSearch] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
    const [amountRange, setAmountRange] = React.useState({ min: '', max: '' });

    React.useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`${API_URL}/api/transactions?email=${user.email}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setRows(data.map(d => ({
                        ...d,
                        id: d._id,
                        date: new Date(d.date).toISOString().split('T')[0]
                    })));
                }
            } catch (e) { console.error(e); }
        };
        fetchTransactions();
    }, [user]);

    // Derived Filtered Rows
    const filteredRows = React.useMemo(() => {
        return rows.filter(row => {
            const matchesSearch = row.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter ? row.category === categoryFilter : true;

            const rowDate = new Date(row.date);
            const matchesStartDate = dateRange.start ? rowDate >= new Date(dateRange.start) : true;
            const matchesEndDate = dateRange.end ? rowDate <= new Date(dateRange.end) : true;

            const matchesMinAmount = amountRange.min ? row.amount >= Number(amountRange.min) : true;
            const matchesMaxAmount = amountRange.max ? row.amount <= Number(amountRange.max) : true;

            return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
        });
    }, [rows, search, categoryFilter, dateRange, amountRange]);

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setDateRange({ start: '', end: '' });
        setAmountRange({ min: '', max: '' });
    };

    const handleExport = () => {
        const header = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const csvContent = [
            header.join(','),
            ...filteredRows.map(row => [
                row.date,
                `"${row.description.replace(/"/g, '""')}"`, // Escape quotes
                row.category,
                row.type,
                row.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'transactions.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Transactions</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        startIcon={<Download />}
                        variant="outlined"
                        onClick={handleExport}
                        disabled={filteredRows.length === 0}
                    >
                        Export
                    </Button>
                </Stack>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2}>
                    {/* Search Bar */}
                    <TextField
                        fullWidth
                        placeholder="Search by description..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                        }}
                    />

                    {/* Advanced Filters Row */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            select
                            label="Category"
                            size="small"
                            sx={{ minWidth: 150 }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>

                        <TextField
                            label="Start Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />

                        <TextField
                            label="Min Amount"
                            type="number"
                            size="small"
                            placeholder="Min"
                            sx={{ width: 100 }}
                            value={amountRange.min}
                            onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                        />
                        <TextField
                            label="Max Amount"
                            type="number"
                            size="small"
                            placeholder="Max"
                            sx={{ width: 100 }}
                            value={amountRange.max}
                            onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                        />

                        <Button variant="text" onClick={clearFilters}>Clear</Button>
                    </Stack>
                </Stack>
            </Paper>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                    disableSelectionOnClick
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'background.default',
                            fontWeight: 600
                        },
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none'
                        }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default Transactions;
