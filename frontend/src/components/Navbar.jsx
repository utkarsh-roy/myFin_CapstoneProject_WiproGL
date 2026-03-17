import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Badge, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function Navbar({ role = 'USER', onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === 'ADMIN';

  const handleLogout = () => { logout(); navigate('/login'); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      bgcolor: isAdmin ? '#0D0F1A' : 'primary.main',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      zIndex: (theme) => theme.zIndex.drawer + 1
    }}>
      <Toolbar sx={{ minHeight: '64px' }}>
        
        {/* Mobile Menu Icon (Handled by parent layout if needed, or we just rely on Sidebar responsive toggle) */}
        {onMenuClick && (
          <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
            <span style={{ fontSize: '24px' }}>☰</span>
          </IconButton>
        )}

        {/* Brand */}
        <Box 
          component={Link} 
          to={isAdmin ? '/admin/dashboard' : '/dashboard'}
          sx={{ 
            display: 'flex', alignItems: 'center', gap: 1, 
            textDecoration: 'none', color: 'inherit' 
          }}
        >
          <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
            <AccountBalanceIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', display: { xs: 'none', sm: 'block' } }}>
            MyFin Bank
          </Typography>
          {isAdmin && (
            <Box sx={{ 
              bgcolor: 'error.main', color: 'white', px: 1, py: 0.25, 
              borderRadius: 1, fontSize: '0.65rem', fontWeight: 800, ml: 1
            }}>
              ADMIN
            </Box>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Greeting */}
        <Typography variant="body2" sx={{ 
          color: 'rgba(255,255,255,0.7)', mr: 3, 
          display: { xs: 'none', md: 'block' } 
        }}>
          {greeting}, {user?.username || user?.email?.split('@')[0] || 'User'} 👋
        </Typography>

        {/* Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/notifications')}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          {!isAdmin && (
            <Tooltip title="Profile">
              <IconButton color="inherit" onClick={() => navigate('/profile')}>
                <PersonIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }}}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
