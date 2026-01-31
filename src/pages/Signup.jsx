import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    InputAdornment, IconButton, Link, Checkbox, FormControlLabel,
    Container, LinearProgress
} from '@mui/material';
import {
    Visibility, VisibilityOff, PersonOutline, EmailOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        agreed: false
    });

    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkStrength = (pass) => {
        let strength = 0;
        if (pass.length > 5) strength += 20;
        if (pass.length > 8) strength += 20;
        if (/[A-Z]/.test(pass)) strength += 20;
        if (/[0-9]/.test(pass)) strength += 20;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
        return strength;
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        const val = name === 'agreed' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'password') {
            setPasswordStrength(checkStrength(val));
        }
    };

    const getStrengthLabel = () => {
        if (passwordStrength <= 20) return { label: 'Weak', color: 'error.main', progressColor: 'error' };
        if (passwordStrength <= 60) return { label: 'Medium', color: 'warning.main', progressColor: 'warning' };
        return { label: 'Strong', color: 'success.main', progressColor: 'success' };
    };

    const handleSignup = async () => {
        const { name, email, password, agreed } = formData;

        // Basic Validation
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!agreed) {
            alert('You must agree to the Terms and Privacy Policy');
            return;
        }

        // Strict Email Regex
        // Enforces: chars@chars.domain (at least 2 chars for TLD), no typical invalid chars
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                console.log('Signup result:', data);
                login(data); // Auto login
                navigate('/');
            } else {
                alert(data.msg || 'Signup failed');
            }
        } catch (e) {
            console.error(e);
            alert('Server error. Check console.');
        }
    };

    const strengthInfo = getStrengthLabel();

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
                        Create Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Start your journey to financial freedom
                    </Typography>
                </Box>

                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
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
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <Box sx={{ mt: 1, mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">Password Strength</Typography>
                                        <Typography variant="caption" sx={{ color: strengthInfo.color, fontWeight: 600 }}>
                                            {strengthInfo.label}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength}
                                        color={strengthInfo.progressColor}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Box>
                            )}

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="agreed"
                                        checked={formData.agreed}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2">I agree to the <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link></Typography>}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSignup}
                                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                            >
                                Create Account
                            </Button>

                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <Link href="/login" underline="hover" sx={{ fontWeight: 600 }}>
                                        Sign In
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

export default Signup;
