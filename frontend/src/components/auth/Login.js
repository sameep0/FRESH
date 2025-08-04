import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogContent
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useRef } from 'react';

const recentEmails = [
  'samip@gmail.com',
  'shiva@gmail.com',
  'matherssameep01@gmail.com',
  'hekar32@gmail.com',
  'hekar@gmail.com',
  'poudel@gmail.com',
];

const financialQuote = "The art is not in making money, but in keeping it. – Proverb";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState(recentEmails);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [fadeQuote, setFadeQuote] = useState(false);
  const [showAnim, setShowAnim] = useState(false);
  const inputRef = useRef();
  const cardRef = useRef();
  
  const { login } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    const loginQuoteShown = localStorage.getItem('loginQuoteShown');
    
    if (!loginQuoteShown) {
      
      setShowQuoteDialog(true);
      setShowAnim(true);
      
      const fadeTimer = setTimeout(() => setFadeQuote(true), 3700);
      const hideTimer = setTimeout(() => {
        setShowQuoteDialog(false);
        localStorage.setItem('loginQuoteShown', 'true');
      }, 4000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'identifier') {
      const val = e.target.value.toLowerCase();
      setFilteredEmails(
        val.length === 0
          ? recentEmails
          : recentEmails.filter(email => email.toLowerCase().includes(val))
      );
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (email) => {
    setFormData({ ...formData, identifier: email });
    setShowSuggestions(false);
  };

  const handleBlur = (e) => {
    
    setTimeout(() => setShowSuggestions(false), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.identifier, formData.password);
    
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };
 
  return (
    <>
    <AuthLayout
      title={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
          <img src="/Titlelogo.png" alt="App Logo" style={{ width: 88, height: 88, objectFit: 'contain', borderRadius: '50%', background: '#23232a', marginBottom: 12, boxShadow: '0 2px 16px 0 rgba(120,80,255,0.10)' }} />
          <span style={{ fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 600, fontSize: 22, letterSpacing: 1, color: '#fafaff', textShadow: '0 2px 12px rgba(120,80,255,0.10)' }}>Login</span>
        </Box>
      }
      subtitle="Login into your Personal Finance Tracker account"
      activeStep={0}
    >
      <Paper elevation={0} sx={{ background: 'transparent', boxShadow: 'none', p: 0, position: 'relative' }} ref={cardRef}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            fullWidth
            id="identifier"
            label="Email or Phone number"
            name="identifier"
            autoComplete="off"
            autoFocus
            value={formData.identifier}
            onChange={handleChange}
            onFocus={() => {
              setFilteredEmails(
                formData.identifier.length === 0
                  ? recentEmails
                  : recentEmails.filter(email => email.toLowerCase().includes(formData.identifier.toLowerCase()))
              );
              setShowSuggestions(true);
            }}
            onBlur={handleBlur}
            inputRef={inputRef}
            variant="outlined"
            InputProps={{
              sx: { background: '#23232a', color: '#fafafa', borderRadius: 2 },
            }}
            InputLabelProps={{ sx: { color: '#a1a1aa' } }}
          />
          {}
          {showSuggestions && filteredEmails.length > 0 && inputRef.current && cardRef.current && (
            <Box
              sx={{
                position: 'fixed',
                left: cardRef.current.getBoundingClientRect().right + 8,
                top: inputRef.current.getBoundingClientRect().top,
                width: 260,
                zIndex: 1300,
                background: '#18181b',
                border: '1px solid #23232a',
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                color: '#fafafa',
                textAlign: 'right',
                pr: 2,
                py: 1,
              }}
            >
              {filteredEmails.map(email => (
                <Box
                  key={email}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { background: '#23232a', color: '#a78bfa' },
                    borderRadius: 1,
                  }}
                  onMouseDown={() => handleSuggestionClick(email)}
                >
                  {email}
                </Box>
              ))}
            </Box>
          )}
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: { background: '#23232a', color: '#fafafa', borderRadius: 2 }
            }}
            InputLabelProps={{ sx: { color: '#a1a1aa' } }}
          />
          <Box display="flex" justifyContent="flex-end" sx={{ mt: -1, mb: 1 }}>
            <Link to="/forgot-password" style={{ color: '#a78bfa', fontSize: 14, textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              mb: 1,
              background: '#a78bfa',
              color: '#23232a',
              fontWeight: 600,
              borderRadius: 2,
              fontSize: 18,
              boxShadow: 'none',
              '&:hover': { background: '#c4b5fd' }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
          <Divider sx={{
            my: 3,
            color: '#a78bfa',
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '0.1em',
            '&::before, &::after': {
              borderColor: '#a78bfa',
            },
            '& span': {
              background: '#23232a',
              px: 2,
              borderRadius: 2,
              color: '#a78bfa',
              fontWeight: 700,
              fontFamily: 'inherit',
            }
          }}>or</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{
              borderColor: '#a78bfa',
              color: '#fafafa',
              fontWeight: 600,
              borderRadius: 2,
              background: 'transparent',
              '&:hover': { background: '#23232a', borderColor: '#c4b5fd', color: '#a78bfa' },
              mb: 1
            }}
            
            onClick={() => alert('Google login coming soon!')}
          >
            Login with Google
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="#a1a1aa">
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#a78bfa', fontWeight: 500, textDecoration: 'none' }}>
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </AuthLayout>

      {}
      <Dialog
        open={showQuoteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
            borderRadius: 3,
            border: '1px solid rgba(168, 139, 250, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative',
          }
        }}
      >
        {}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(168, 139, 250, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'quote-glow 2s ease-in-out infinite alternate',
          }}
        />
        <style>{`
          @keyframes quote-glow {
            0% { opacity: 0.2; }
            100% { opacity: 0.4; }
          }
          @keyframes quote-bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0, -8px, 0); }
            70% { transform: translate3d(0, -4px, 0); }
            90% { transform: translate3d(0, -2px, 0); }
          }
          @keyframes quote-scale {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <DialogContent sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '2.8rem 2.8rem 2.2rem 2.8rem',
              borderRadius: '2rem',
              background: 'rgba(35,35,42,0.96)',
              boxShadow: '0 12px 48px 0 rgba(120,80,255,0.13)',
              border: '1.5px solid rgba(160, 120, 255, 0.22)',
              maxWidth: 520,
              minWidth: 320,
              textAlign: 'center',
              opacity: showAnim && !fadeQuote ? 1 : 0,
              transform:
                showAnim && !fadeQuote
                  ? 'translateY(0) scale(1)'
                  : 'translateY(40px) scale(0.96)',
              transition:
                'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)',
              willChange: 'opacity, transform',
              animation:
                showAnim && !fadeQuote
                  ? 'quote-scale-pop 1.1s cubic-bezier(.4,0,.2,1)'
                  : 'none',
            }}
          >
            <style>{`
              @keyframes quote-scale-pop {
                0% { transform: translateY(40px) scale(0.96); }
                60% { transform: translateY(-8px) scale(1.02); }
                100% { transform: translateY(0) scale(1); }
              }
            `}</style>
            <span style={{
              display: 'block',
              fontSize: '2.1rem',
              color: '#e0e7ff',
              fontStyle: 'italic',
              fontFamily: 'DM Sans, Poppins, Inter, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.01em',
              lineHeight: 1.5,
              textShadow: '0 4px 24px rgba(120,80,255,0.13)',
              filter: 'drop-shadow(0 2px 12px rgba(120,80,255,0.10))',
            }}>
              "{financialQuote}"
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login; 