import React from 'react';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Box, Typography, useMediaQuery, useTheme, Button
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Receipt as ReceiptIcon,
    PieChart as PieChartIcon,
    Psychology as PsychologyIcon,
    Settings as SettingsIcon,
    Description as ReportIcon,
    ReceiptLong as BillsIcon,
    TrendingUp as InvestmentsIcon,
    Flag as GoalsIcon,
    Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Budget & Insights', icon: <PieChartIcon />, path: '/budget' },
    { text: 'Recurring Bills', icon: <BillsIcon />, path: '/bills' },
    { text: 'Investments', icon: <InvestmentsIcon />, path: '/investments' },
    { text: 'Goals', icon: <GoalsIcon />, path: '/goals' },
    { text: 'AI Coach', icon: <PsychologyIcon />, path: '/coach' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, onClose, variant }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path) => {
        navigate(path);
        if (variant === 'temporary') {
            onClose();
        }
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Brand Logo Area */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', bgcolor: 'background.paper' }}>
                <Box
                    sx={{
                        width: 40, height: 40,
                        bgcolor: 'primary.main',
                        borderRadius: '12px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                        mr: 2, boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)'
                    }}
                >
                    $
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Everblue
                    </Typography>
                </Box>
            </Box>

            {/* Navigation List */}
            <List sx={{ px: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => handleNavigate(item.path)}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '& .MuiListItemIcon-root': { color: 'white' }
                                    },
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Footer / User Profile Snippet */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Logout />}
                    onClick={() => {
                        window.location.href = '/login';
                    }}
                >
                    Sign Out
                </Button>
                <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                    v1.0.0 • Fintech 2026
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Drawer
            variant={variant}
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper', // Adaptive background
                    color: 'text.primary'
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default Sidebar;
