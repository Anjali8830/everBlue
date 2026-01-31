import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    InputAdornment, IconButton, Link, Checkbox, FormControlLabel,
    Container, LinearProgress
} from '@mui/material';
import {
    Visibility, VisibilityOff, PersonOutline, EmailOutlined, LockOutlined
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

    // Error State
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Password Strength
    const [passwordStrength, setPasswordStrength] = useState(0);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name') {
            if (!value.trim()) error = 'Name is required';
        }
        if (name === 'email') {
            if (!value) error = 'Email is required';
            else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                error = 'Enter a valid email address';
            }
        }
        if (name === 'password') {
            if (!value) error = 'Password is required';
            else if (value.length < 8) error = 'at least 8 characters';
            else if (!/[A-Z]/.test(value)) error = 'at least 1 uppercase letter';
            else if (!/[a-z]/.test(value)) error = 'at least 1 lowercase letter';
            else if (!/[0-9]/.test(value)) error = 'at least 1 number';
            else if (!/[^A-Za-z0-9]/.test(value)) error = 'at least 1 special character';
        }
        return error;
    };

    const checkStrength = (pass) => {
        let strength = 0;
        if (!pass) return 0;
        if (pass.length >= 8) strength += 20;
        if (/[A-Z]/.test(pass)) strength += 20;
        if (/[a-z]/.test(pass)) strength += 20; // Added lowercase check
        if (/[0-9]/.test(pass)) strength += 20;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
        return strength;
    };

    useEffect(() => {
        // Real-time validation for button state
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'agreed') {
                const err = validateField(key, formData[key]);
                if (err) newErrors[key] = err;
            }
        });
        // We generally don't setErrors here to avoid showing errors before typing, 
        // but for button disable logic we check validity.
    }, [formData]);

    const isFormValid = () => {
        const nameError = validateField('name', formData.name);
        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);
        return !nameError && !emailError && !passwordError && formData.agreed;
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        const val = name === 'agreed' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        // Validate on change if touched
        if (name !== 'agreed') {
            const error = validateField(name, val);
            setErrors(prev => ({ ...prev, [name]: error }));
        }

        if (name === 'password') {
            setPasswordStrength(checkStrength(val));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const getStrengthLabel = () => {
        if (!formData.password) return { label: '', color: 'transparent', progressColor: 'primary' };
        if (passwordStrength < 40) return { label: 'Weak', color: 'error.main', progressColor: 'error' };
        if (passwordStrength < 80) return { label: 'Medium', color: 'warning.main', progressColor: 'warning' };
        return { label: 'Strong', color: 'success.main', progressColor: 'success' };
    };

    const handleSignup = async () => {
        if (!isFormValid()) return;

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await res.json();
            if (res.ok) {
                console.log('Signup result:', data);
                login(data);
                navigate('/');
            } else {
                alert(data.msg || 'Signup failed'); // Server error usage is acceptable or inline general error
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
                                onBlur={handleBlur}
                                error={touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
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
                                onBlur={handleBlur}
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
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
                                onBlur={handleBlur}
                                error={touched.password && !!errors.password}
                                helperText={touched.password && errors.password}
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined color="action" />
                                        </InputAdornment>
                                    ),
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
                                    {/* Clarify requirements if weak */}
                                    {errors.password && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                            Must include: 8+ chars, Uppercase, Lowercase, Number, Special.
                                        </Typography>
                                    )}
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
                                disabled={!isFormValid()}
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
