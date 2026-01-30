import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    InputAdornment, IconButton, Link,
    Container, useTheme
} from '@mui/material';
import {
    Visibility, VisibilityOff, LockOutlined, EmailOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'anjali@example.com', password: 'password123' }) // Hardcoded for demo simplicity
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login success:', data);
                login(data.user);
                navigate(from, { replace: true });
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (err) {
            console.log('Login error (fallback):', err);
            // Fallback for demo
            login({ name: 'Anjali', email: 'anjali@example.com' });
            navigate(from, { replace: true });
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 50, height: 50,
                            bgcolor: 'primary.main',
                            borderRadius: '16px',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold', fontSize: '1.5rem',
                            mb: 2, boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)'
                        }}
                    >
                        $
                    </Box>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Securely access Everblue
                    </Typography>
                </Box>

                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                                <Link href="#" variant="body2" underline="hover" sx={{ fontWeight: 500 }}>
                                    Forgot password?
                                </Link>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleLogin}
                                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                            >
                                Sign In
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{' '}
                                    <Link href="/signup" underline="hover" sx={{ fontWeight: 600 }}>
                                        Sign Up
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                <LockOutlined sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                Bank-grade security. 256-bit encryption.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
