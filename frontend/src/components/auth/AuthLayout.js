import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const steps = [
  {
    label: 'Sign up / Login',
    description: 'Create an account to manage your finances securely',
  },
  {
    label: 'Track your accounts',
    description: 'Add and monitor all your bank accounts in one place',
  },
  {
    label: 'Manage transactions',
    description: 'Easily add, edit, and categorize your transactions',
  },
];

const testimonial = {
  text: 'Personal Finance Tracker helped me finally get control of my spending. The insights and reports are amazing!',
  name: 'Alex Doe',
  title: 'Happy User',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

const AuthLayout = ({ title, subtitle, children, activeStep = 0, quote, bordered = false }) => (
  <Box sx={{ height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b', fontFamily: 'inherit' }}>
    {}
    <Box
      className={bordered ? 'animated-border' : ''}
      sx={{
        width: { xs: '0', md: '420px' },
        background: '#23232a',
        color: '#e5e7eb',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'flex-start',
        p: 5,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        borderRight: '1px solid #23232a',
        boxShadow: '0 16px 64px 0 rgba(80,80,80,0.45), 0 32px 96px 0 rgba(80,80,80,0.32), 0 4px 16px 0 rgba(0,0,0,0.18)',
        zIndex: 2,
        position: 'relative',
      }}
    >
      {}
      <Box sx={{ mb: 4 }}>
        <div className="animated-border" style={{ borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center' }}>
          <Avatar src={testimonial.avatar} alt={testimonial.name} sx={{ width: 48, height: 48, mr: 2 }} />
          <Box>
            <Typography variant="body2" color="#e5e7eb" sx={{ fontStyle: 'italic', mb: 0.5, fontFamily: 'inherit' }}>
              “{testimonial.text}”
            </Typography>
            <Typography variant="subtitle2" color="#a1a1aa" fontFamily="inherit">
              {testimonial.name} <span style={{ color: '#a78bfa' }}>·</span> {testimonial.title}
            </Typography>
          </Box>
        </div>
      </Box>
      {}
      <Box>
        <List>
          {steps.map((step, idx) => (
            <ListItem key={step.label} disableGutters sx={{ alignItems: 'flex-start', mb: 2 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {idx === activeStep ? (
                  <FiberManualRecordIcon sx={{ color: '#a78bfa', fontSize: 18 }} />
                ) : (
                  <CheckCircleIcon sx={{ color: '#52525b', fontSize: 18 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={<Typography fontWeight={idx === activeStep ? 600 : 400} color={idx === activeStep ? '#a78bfa' : '#e5e7eb'} fontFamily="inherit">{step.label}</Typography>}
                secondary={<Typography variant="body2" color="#a1a1aa" fontFamily="inherit">{step.description}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
    {}
    <Box
      className="fade-in-right"
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, rgba(30,27,38,0.95) 60%, rgba(30,27,38,0.85) 100%)',
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        p: { xs: 2, md: 8 },
        fontFamily: 'inherit',
        minHeight: '100vh',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440, fontFamily: 'inherit', border: '1px solid #27272a', borderRadius: '1rem', p: 4, background: 'rgba(30,27,38,0.85)', boxShadow: '0px 10px 30px rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {}
          {typeof title === 'string' ? (
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#fff', fontFamily: 'inherit', letterSpacing: '0.5px' }}>{title}</Typography>
          ) : (
            title
          )}
          <Typography variant="subtitle1" color="#9ca3af" fontFamily="inherit">{subtitle}</Typography>
        </Box>
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthLayout; 