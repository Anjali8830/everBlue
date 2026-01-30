import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1565C0', // Primary Blue
            light: '#64B5F6',
            dark: '#0D47A1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#1E88E5', // Accent Blue
            contrastText: '#ffffff',
        },
        background: {
            default: '#F6F8FA', // Neutral background
            paper: '#FFFFFF',
        },
        text: {
            primary: '#0F1724', // Deep dark blue-grey
            secondary: '#213547',
        },
        success: {
            main: '#2E7D32',
        },
        warning: {
            main: '#FF9800',
        },
        error: {
            main: '#E53935',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            color: '#0F1724',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
            color: '#0F1724',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            color: '#0F1724',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#0F1724',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#0F1724',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
            color: '#0F1724',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
            color: '#213547',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            color: '#546E7A',
        },
        button: {
            textTransform: 'none', // No all-caps buttons for modern feel
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8, // Soft rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Subtle shadow
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Disable overlay in dark mode if we ever switch
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.05)',
                    backgroundColor: '#FFFFFF',
                    color: '#0F1724',
                },
            },
        },
    },
});

export default theme;
