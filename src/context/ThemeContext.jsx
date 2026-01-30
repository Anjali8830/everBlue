import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ColorModeContext = createContext({ toggleColorMode: () => { }, mode: 'light' });

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: '#2563EB', // Blue 600
                    },
                    secondary: {
                        main: '#7C3AED', // Violet 600
                    },
                    background: {
                        default: mode === 'light' ? '#F8FAFC' : '#0F172A',
                        paper: mode === 'light' ? '#ffffff' : '#1E293B',
                    },
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: { backgroundImage: 'none' } // Fix for dark mode elevation overlay
                        }
                    }
                },
            }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ColorModeContext.Provider>
    );
};
