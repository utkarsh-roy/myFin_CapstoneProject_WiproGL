import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { loanApi } from '../api/axiosConfig';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Box, Typography, Avatar, Divider, Badge, useTheme, useMediaQuery, IconButton
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalculateIcon from '@mui/icons-material/Calculate';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';

/* ─── NAV LINKS ─────────────────────────────────────── */
const USER_LINKS = [
  { text: 'Dashboard',      path: '/dashboard',      icon: <DashboardIcon /> },
  { text: 'Transactions',   path: '/transactions',   icon: <ReceiptIcon /> },
  { text: 'Transfer',       path: '/transfer',       icon: <SwapHorizIcon /> },
  { text: 'Investments',    path: '/investments',    icon: <TrendingUpIcon /> },
  { text: 'Apply for Loan', path: '/loan-apply',     icon: <AccountBalanceIcon /> },
  { text: 'My Loans',       path: '/my-loans',       icon: <ListAltIcon /> },
  { text: 'EMI Calculator', path: '/emi-calculator', icon: <CalculateIcon /> },
  { text: 'Chat',           path: '/chat',           icon: <ChatIcon />, badge: 'chat' },
  { text: 'Notifications',  path: '/notifications',  icon: <NotificationsIcon />, badge: 'notif' },
  { text: 'Profile',        path: '/profile',        icon: <PersonIcon /> },
];

const ADMIN_LINKS = [
  { text: 'Dashboard',       path: '/admin/dashboard', icon: <DashboardIcon /> },
  { text: 'Manage Users',    path: '/admin/users',     icon: <PeopleIcon /> },
  { text: 'Manage Accounts', path: '/admin/accounts',  icon: <AccountBalanceIcon /> },
  { text: 'Manage Loans',    path: '/admin/loans',     icon: <ListAltIcon /> },
  { text: 'Admin Chat',      path: '/admin/chat',      icon: <ChatIcon />, badge: 'chat' },
  { text: 'Audit Logs',      path: '/admin/logs',      icon: <ReceiptIcon /> },
  { text: 'Transfer Limits', path: '/admin/limits',    icon: <SwapHorizIcon /> },
];

const DRAWER_WIDTH = 260;

export default function Sidebar({ role = 'USER' }) {
  const location  = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [chatCount,  setChatCount]  = useState(0);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  /* Fetch unread counts */
  useEffect(() => {
    if (!user?.userId) return;
    const load = async () => {
      try {
        const endpoint = role === 'ADMIN' ? '/api/notifications/admin/all' : `/api/notifications/user/${user.userId}`;
        const res = await loanApi.get(endpoint);
        setNotifCount((res.data || []).filter(n => !n.isRead).length);
      } catch { /* silent */ }
      
      try {
        // For admin, we might need a different base for chat but usually it's unified or role-filtered
        const chatRes = await loanApi.get(role === 'ADMIN' ? '/api/chat/admin/all' : `/api/chat/${user.userId}`);
        const unreadChat = (chatRes.data || []).filter(m => {
          if (role === 'ADMIN') return !m.isRead && m.senderType === 'USER';
          return !m.isRead && m.senderType !== 'USER';
        });
        setChatCount(unreadChat.length);
      } catch { /* silent */ }
    };
    load();
    const interval = setInterval(load, 30000);
    window.addEventListener('notificationsUpdated', load);
    window.addEventListener('chatUpdated', load);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', load);
      window.removeEventListener('chatUpdated', load);
    };
  }, [role, user]);

  const links = role === 'ADMIN' ? ADMIN_LINKS : USER_LINKS;

  const badgeFor = (key) => {
    if (key === 'notif') return notifCount;
    if (key === 'chat')  return chatCount;
    return 0;
  };

  const initials = (user?.username || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1A237E', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, minHeight: '64px' }}>
        <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40, fontWeight: 800 }}>M</Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            MyFin Bank
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto' }}>
        {links.map((link) => {
          const active = location.pathname === link.path ||
            (link.path !== '/dashboard' && link.path !== '/admin/dashboard' && location.pathname.startsWith(link.path));
          const count = link.badge ? badgeFor(link.badge) : 0;

          return (
            <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={link.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: active ? '4px solid #00897B' : '4px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  transition: 'all 0.2s'
                }}
              >
                <ListItemIcon sx={{ color: active ? 'white' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  <Badge badgeContent={count} color="error">
                    {link.icon}
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary={link.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem', 
                    fontWeight: active ? 700 : 500,
                    color: active ? 'white' : 'rgba(255,255,255,0.85)'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 800 }}>
          {initials}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.username || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Hamburger overlay */}
      {isMobile && !mobileOpen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'fixed', top: 12, left: 16, zIndex: 1200, color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile.
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH, 
              borderRight: 'none',
              bgcolor: '#1A237E', // Force background color to prevent peeking
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
}
