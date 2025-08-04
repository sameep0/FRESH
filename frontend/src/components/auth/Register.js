import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';

const financialQuote = "The art is not in making money, but in keeping it. – Proverb";

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      setRegisteredUser(result.data.user);
      setShowSuccess(true);
      
      setFormData({
        email: '',
        username: '',
        password: '',
        name: ''
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/login');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <>
    <AuthLayout
      title={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
          <img src="/Titlelogo.png" alt="App Logo" style={{ width: 88, height: 88, objectFit: 'contain', borderRadius: '50%', background: '#23232a', marginBottom: 12, boxShadow: '0 2px 16px 0 rgba(120,80,255,0.10)' }} />
        </Box>
      }
      subtitle="Create your account to get started"
      activeStep={0}
      quote={financialQuote}
      bordered={true}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto' }}>
        <div className="glow-bg" />
        <Box
            component="form"
            onSubmit={handleSubmit}
          className="glassy-card"
          sx={{
            width: '100%',
            maxWidth: 420,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'none', 
            background: 'none', 
            border: 'none', 
          }}
        >
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}
            
          {}
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="off"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: { background: '#23232a', color: '#fafafa', borderRadius: 2, boxShadow: '0 1px 6px 0 rgba(120,80,255,0.04) inset' },
            }}
            InputLabelProps={{ sx: { color: '#a1a1aa' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="off"
            value={formData.username}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: { background: '#23232a', color: '#fafafa', borderRadius: 2, boxShadow: '0 1px 6px 0 rgba(120,80,255,0.04) inset' },
            }}
            InputLabelProps={{ sx: { color: '#a1a1aa' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
              id="name"
            label="Full Name"
              name="name"
            autoComplete="off"
              value={formData.name}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: { background: '#23232a', color: '#fafafa', borderRadius: 2, boxShadow: '0 1px 6px 0 rgba(120,80,255,0.04) inset' },
            }}
            InputLabelProps={{ sx: { color: '#a1a1aa' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="off"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: { background: '#23232a', color: '#fafafa', borderRadius: 2, boxShadow: '0 1px 6px 0 rgba(120,80,255,0.04) inset' },
            }}
            InputLabelProps={{ sx: { color: '#a1a1aa' } }}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
              disabled={loading}
            sx={{
              mt: 2,
              mb: 2,
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 2,
              background: '#a78bfa',
              color: '#181825',
              boxShadow: 'none',
              letterSpacing: 1,
              transition: 'background 0.3s',
              '&:hover': {
                background: '#c4b5fd',
              },
                '&:disabled': {
                  background: '#6b7280',
                  color: '#9ca3af',
                },
            }}
          >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="#a1a1aa">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#a78bfa', fontWeight: 500, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </div>
    </AuthLayout>

      {}
      <Dialog
        open={showSuccess}
        onClose={handleSuccessClose}
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
            animation: 'success-glow 2s ease-in-out infinite alternate',
          }}
        />
        <style>{`
          @keyframes success-glow {
            0% { opacity: 0.2; }
            100% { opacity: 0.4; }
          }
          @keyframes success-bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0, -8px, 0); }
            70% { transform: translate3d(0, -4px, 0); }
            90% { transform: translate3d(0, -2px, 0); }
          }
          @keyframes success-scale {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <DialogContent sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              animation: 'success-bounce 1s ease-out',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
                animation: 'success-scale 0.6s ease-out',
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: 'white' }} />
            </Box>
          </Box>

          {}
          <Typography
            variant="h4"
            sx={{
              color: '#f8fafc',
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'success-scale 0.6s ease-out 0.2s both',
            }}
          >
            Welcome aboard! 🎉
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#cbd5e1',
              mb: 3,
              fontWeight: 500,
              animation: 'success-scale 0.6s ease-out 0.4s both',
            }}
          >
            Your account has been successfully created
          </Typography>

          {}
          {registeredUser && (
            <Box
              sx={{
                background: 'rgba(168, 139, 250, 0.1)',
                borderRadius: 2,
                p: 3,
                mb: 3,
                border: '1px solid rgba(168, 139, 250, 0.2)',
                animation: 'success-scale 0.6s ease-out 0.6s both',
              }}
            >
              <Typography variant="body1" sx={{ color: '#e2e8f0', mb: 1 }}>
                <strong>Username:</strong> {registeredUser.username}
              </Typography>
              <Typography variant="body1" sx={{ color: '#e2e8f0', mb: 1 }}>
                <strong>Email:</strong> {registeredUser.email}
              </Typography>
              <Typography variant="body1" sx={{ color: '#e2e8f0' }}>
                <strong>Name:</strong> {registeredUser.name}
              </Typography>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              mb: 3,
              animation: 'success-scale 0.6s ease-out 0.8s both',
            }}
          >
            You can now sign in to your account and start managing your finances!
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleSuccessClose}
            variant="outlined"
            sx={{
              color: '#94a3b8',
              borderColor: '#475569',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
              },
              animation: 'success-scale 0.6s ease-out 1s both',
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleGoToLogin}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
              },
              animation: 'success-scale 0.6s ease-out 1.2s both',
            }}
          >
            Sign In Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Register; 