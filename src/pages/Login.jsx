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

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Error State
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');

    const from = location.state?.from?.pathname || '/';

    const validateEmail = (val) => {
        if (!val) return 'Email is required';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
            return 'Enter a valid email address';
        }
        return '';
    };

    const handleLogin = async () => {
        // Reset errors
        const eErr = validateEmail(email);
        const pErr = !password ? 'Password is required' : '';

        if (eErr || pErr) {
            setEmailError(eErr);
            setPasswordError(pErr);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login success:', data);
                login(data.user);
                navigate(from, { replace: true });
            } else {
                setLoginError(data.msg || 'Login failed');
            }
        } catch (err) {
            console.log('Login error:', err);
            setLoginError('Login failed due to server/network error.');
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
                            {loginError && (
                                <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
                                    {loginError}
                                </Typography>
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(validateEmail(e.target.value) ? emailError : '');
                                }}
                                onBlur={() => setEmailError(validateEmail(email))}
                                error={!!emailError}
                                helperText={emailError}
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
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError && e.target.value) setPasswordError('');
                                }}
                                error={!!passwordError}
                                helperText={passwordError}
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
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
