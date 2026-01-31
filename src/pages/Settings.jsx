import React from 'react';
import {
    Box, Typography, Paper, Switch, List, ListItem,
    ListItemText, ListItemSecondaryAction, Divider, Button,
    Select, MenuItem
} from '@mui/material';
import { useColorMode } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import API_URL from '../config';

import { useAuth } from '../context/AuthContext';
// ... imports ...

const Settings = () => {
    const { toggleColorMode, mode } = useColorMode();
    const { currency, changeCurrency, currencies } = useCurrency();
    const { user } = useAuth(); // Get user for email

    const handleSendReport = async () => {
        try {
            // In a real app we'd use a toast, for now alert is fine
            const confirmed = window.confirm(`Send report to ${user?.email}?`);
            if (!confirmed) return;

            const res = await fetch(`${API_URL}/api/reports/send-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Report sent successfully! Check your inbox.');
            } else {
                alert(`Failed: ${data.msg}`);
            }
        } catch (e) {
            console.error(e);
            alert('Error sending report.');
        }
    };

    return (
        <Box maxWidth="md">
            {/* ... header ... */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>Settings</Typography>

            <Paper sx={{ mb: 3 }}>
                <List>
                    {/* ... Dark Mode ... */}
                    <ListItem>
                        <ListItemText primary="Dark Mode" secondary="Switch between light and dark themes" />
                        <ListItemSecondaryAction>
                            <Switch checked={mode === 'dark'} onChange={toggleColorMode} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="Email Notifications" secondary="Receive monthly transaction reports" />
                        <ListItemSecondaryAction>
                            <Button variant="contained" size="small" onClick={handleSendReport}>
                                Send Report
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="Currency" secondary={`Current: ${currency.name} (${currency.symbol})`} />
                        <ListItemSecondaryAction>
                            <Select
                                value={currency.code}
                                onChange={(e) => changeCurrency(e.target.value)}
                                size="small"
                                sx={{ minWidth: 100 }}
                            >
                                {currencies.map((c) => (
                                    <MenuItem key={c.code} value={c.code}>{c.code} ({c.symbol})</MenuItem>
                                ))}
                            </Select>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>


        </Box>
    );
};

export default Settings;
