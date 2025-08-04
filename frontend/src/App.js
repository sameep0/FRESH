import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeModeProvider } from './contexts/ThemeContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import Accounts from './components/user/Accounts';
import Transactions from './components/user/Transactions';
import Categories from './components/user/Categories';
import Reports from './components/user/Reports';
import Settings from './components/user/Settings';
import Export from './components/user/Export';
import Layout from './components/layout/Layout';
import AdminUsers from './components/admin/AdminUsers';
import AdminStats from './components/admin/AdminStats';

// Theme configuration for future use
const theme = createTheme({
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
  palette: {
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
      default: '#18181b',
      paper: '#23232a',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
    },
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
    warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
    info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  },
  shape: { borderRadius: 10 },
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
          background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(124,58,237,0.10)',
            background: 'linear-gradient(90deg, #23232a 0%, #23232a 100%)',
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
          background: '#18181b',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          border: '1px solid #23232a',
          background: '#23232a',
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
            background: '#18181b',
            color: '#fafafa',
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
          background: '#18181b',
          color: '#fafafa',
          '& .MuiOutlinedInput-input': {
            color: '#fafafa',
          },
          '& .MuiInputBase-input': {
            color: '#fafafa',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#23232a',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#fff',
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
          color: '#fafafa',
          '&.Mui-focused': {
            color: '#fafafa',
          },
        },
      },
    },
  },
});

const financialQuote = "The art is not in making money, but in keeping it. – Proverb";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [fadeSplash, setFadeSplash] = useState(false);
  const [showAnim, setShowAnim] = useState(false);
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    const splashShown = localStorage.getItem('splashShown');
    
    if (!splashShown) {
      setShowSplash(true);
      setShowAnim(true);
      
      const fadeTimer = setTimeout(() => setFadeSplash(true), 3700);
      const hideTimer = setTimeout(() => {
        setShowSplash(false);
        setHasShownSplash(true);
        localStorage.setItem('splashShown', 'true');
      }, 4000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setHasShownSplash(true);
    }
  }, []);

  if (showSplash) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(24, 24, 27, 0.88)',
          backdropFilter: 'blur(18px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
          opacity: fadeSplash ? 0 : 1,
          transition: 'opacity 0.5s',
          pointerEvents: fadeSplash ? 'none' : 'auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 520,
            height: 320,
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            pointerEvents: 'none',
            borderRadius: 40,
            background: 'radial-gradient(circle at 60% 40%, rgba(168,139,250,0.22) 0%, rgba(80,208,255,0.13) 60%, rgba(40,40,60,0.01) 100%)',
            filter: 'blur(48px)',
            opacity: 0.98,
            animation: 'splash-glow-fade 5s ease-in-out infinite alternate',
          }}
        />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 520, height: 320, transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none' }}>
          <span className="dollar-shadow" style={{ position: 'absolute', left: 60, top: 60, fontSize: 64, color: 'rgba(168,139,250,0.18)', filter: 'blur(2.5px)', fontWeight: 700, animation: 'dollar-float 3.2s ease-in-out infinite alternate' }}>$</span>
          <span className="dollar-shadow" style={{ position: 'absolute', left: 380, top: 80, fontSize: 48, color: 'rgba(80,208,255,0.13)', filter: 'blur(2.5px)', fontWeight: 700, animation: 'dollar-float2 3.6s ease-in-out infinite alternate' }}>$</span>
          <span className="dollar-shadow" style={{ position: 'absolute', left: 180, top: 200, fontSize: 56, color: 'rgba(255,255,255,0.10)', filter: 'blur(3.5px)', fontWeight: 700, animation: 'dollar-float3 3.8s ease-in-out infinite alternate' }}>$</span>
          <span className="dollar-shadow" style={{ position: 'absolute', left: 320, top: 180, fontSize: 38, color: 'rgba(168,139,250,0.13)', filter: 'blur(2.5px)', fontWeight: 700, animation: 'dollar-float4 4.1s ease-in-out infinite alternate' }}>$</span>
          <span className="dollar-shadow" style={{ position: 'absolute', left: 120, top: 120, fontSize: 32, color: 'rgba(80,208,255,0.10)', filter: 'blur(2.5px)', fontWeight: 700, animation: 'dollar-float5 3.5s ease-in-out infinite alternate' }}>$</span>
          <style>{`
            @keyframes dollar-float {
              0% { opacity: 0.7; transform: translateY(0) scale(1); }
              100% { opacity: 0.3; transform: translateY(-18px) scale(1.08); }
            }
            @keyframes dollar-float2 {
              0% { opacity: 0.5; transform: translateY(0) scale(1); }
              100% { opacity: 0.2; transform: translateY(-12px) scale(1.10); }
            }
            @keyframes dollar-float3 {
              0% { opacity: 0.6; transform: translateY(0) scale(1); }
              100% { opacity: 0.25; transform: translateY(-22px) scale(1.07); }
            }
            @keyframes dollar-float4 {
              0% { opacity: 0.4; transform: translateY(0) scale(1); }
              100% { opacity: 0.18; transform: translateY(-10px) scale(1.13); }
            }
            @keyframes dollar-float5 {
              0% { opacity: 0.5; transform: translateY(0) scale(1); }
              100% { opacity: 0.22; transform: translateY(-16px) scale(1.09); }
            }
          `}</style>
        </div>
        <style>{`
          @keyframes splash-glow-fade {
            0% { opacity: 0.92; filter: blur(40px); }
            100% { opacity: 1; filter: blur(56px); }
          }
        `}</style>
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
            opacity: showAnim && !fadeSplash ? 1 : 0,
            transform:
              showAnim && !fadeSplash
                ? 'translateY(0) scale(1)'
                : 'translateY(40px) scale(0.96)',
            transition:
              'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)',
            willChange: 'opacity, transform',
            animation:
              showAnim && !fadeSplash
                ? 'splash-scale-pop 1.1s cubic-bezier(.4,0,.2,1)'
                : 'none',
          }}
        >
          <img src="/Titlelogo.png" alt="App Logo" style={{ width: 96, height: 96, marginBottom: 24, borderRadius: 16, background: '#23232a', boxShadow: '0 2px 16px 0 rgba(120,80,255,0.10)' }} />
          <style>{`
            @keyframes splash-scale-pop {
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
      </div>
    );
  }

  if (hasShownSplash) {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/user/*" element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/stats" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminStats />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/accounts" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout>
                <Accounts />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/categories" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/export" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout>
                <Export />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
  }

  return null;
};

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
