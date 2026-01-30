import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Badge, Avatar, useTheme } from '@mui/material';
import { Menu as MenuIcon, NotificationsOutlined, Search as SearchIcon, HelpOutline } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onMenuClick }) => {
    const theme = useTheme();
    const { user } = useAuth();

    return (
        <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                bgcolor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, color: 'text.primary' }}>
                        Overview
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>


                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Avatar
                            sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}
                            alt="User"
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>{user?.name || 'User'}</Typography>
                            <Typography variant="caption" color="text.secondary">Member</Typography>
                        </Box>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;
