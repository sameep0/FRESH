import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    background: {
      default: mode === 'dark' ? '#18181b' : '#f4f4f7',
      paper: mode === 'dark' ? '#23232a' : '#fff',
    },
    text: {
      primary: mode === 'dark' ? '#F8FAFC' : '#18181b',
      secondary: mode === 'dark' ? '#CBD5E1' : '#23232a',
    },
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
    warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
    info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Fira Mono", "Cascadia Code", "monospace", "cursive"',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 500, letterSpacing: '-0.01em' },
    h6: { fontWeight: 500, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, letterSpacing: '0.01em' },
    subtitle2: { fontWeight: 500, letterSpacing: '0.01em' },
    body1: { fontWeight: 400, letterSpacing: '0.01em' },
    body2: { fontWeight: 400, letterSpacing: '0.01em' },
    button: { fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          padding: '12px 0',
          fontSize: '1.1rem',
          letterSpacing: '0.03em',
          border: '1px solid #2a2a2e',
          background: mode === 'dark' ? 'linear-gradient(90deg, #23232a 0%, #18181b 100%)' : 'linear-gradient(90deg, #fff 0%, #f4f4f7 100%)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(124,58,237,0.10)',
            background: mode === 'dark' ? 'linear-gradient(90deg, #23232a 0%, #23232a 100%)' : 'linear-gradient(90deg, #fff 0%, #fff 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: '1px solid #23232a',
          background: mode === 'dark' ? '#18181b' : '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          border: '1px solid #23232a',
          background: mode === 'dark' ? '#23232a' : '#fff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            background: mode === 'dark' ? '#18181b' : '#fff',
            color: mode === 'dark' ? '#fafafa' : '#18181b',
            border: '1px solid #23232a',
            transition: 'box-shadow 0.2s',
            '&.Mui-focused': {
              boxShadow: 'none',
              borderColor: '#23232a',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: mode === 'dark' ? '#18181b' : '#fff',
          color: mode === 'dark' ? '#fafafa' : '#18181b',
          '& .MuiOutlinedInput-input': {
            color: mode === 'dark' ? '#fafafa' : '#18181b',
          },
          '& .MuiInputBase-input': {
            color: mode === 'dark' ? '#fafafa' : '#18181b',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#23232a',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7C3AED',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#a78bfa',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? '#fafafa' : '#18181b',
          '&.Mui-focused': {
            color: mode === 'dark' ? '#fafafa' : '#18181b',
          },
        },
      },
    },
  },
});

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const setTheme = (newMode) => setMode(newMode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}; 