import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Transactions from './pages/user/Transactions';
import Transfer from './pages/user/Transfer';
import Investments from './pages/user/Investments';
import LoanApplication from './pages/user/LoanApplication';
import MyLoans from './pages/user/MyLoans';
import EmiCalculator from './pages/user/EmiCalculator';
import Chat from './pages/user/Chat';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAccounts from './pages/admin/ManageAccounts';
import ManageLoans from './pages/admin/ManageLoans';
import AdminChat from './pages/admin/AdminChat';
import AuditLogs from './pages/admin/AuditLogs';
import TransactionLimits from './pages/admin/TransactionLimits';

/**
 * Layout wrappers to include Sidebar, Navbar, and Footer
 */
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Badge, Tooltip, Container } from '@mui/material';

/**
 * Layout wrappers to include Sidebar, Navbar, and Footer
 */
const UserLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flex: 1, position: 'relative', width: '100%' }}>
        <Sidebar role="USER" />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 4 }, 
            bgcolor: 'background.default',
            minHeight: '100%'
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#0D0F1A', width: '100%' }}>
      <Navbar role="ADMIN" />
      <Box sx={{ display: 'flex', flex: 1, position: 'relative', width: '100%' }}>
        <Sidebar role="ADMIN" />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 4 }, 
            bgcolor: 'background.default',
            minHeight: '100%'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

const AuthLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Basic header for auth pages if needed */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const theme = createTheme({
  palette: {
    primary: { main: '#1A237E' },    // Navy
    secondary: { main: '#0D47A1' },  // Royal Blue
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    warning: { main: '#F57F17' },
    info: { main: '#00897B' },       // Teal accent
    background: { default: '#F5F7FA' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(26,35,126,0.06)', borderRadius: 14 },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public / Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-access" element={<AdminLogin />} />
            <Route path="/admin/login" element={<Navigate to="/admin-access" replace />} />
            <Route path="/admin/register" element={<AdminRegister />} />
          </Route>

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/deposit" element={<Transfer defaultTab="deposit" />} />
            <Route path="/withdraw" element={<Transfer defaultTab="withdraw" />} />
            <Route path="/transfer" element={<Transfer defaultTab="transfer" />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/loan-apply" element={<LoanApplication />} />
            <Route path="/my-loans" element={<MyLoans />} />
            <Route path="/emi-calculator" element={<EmiCalculator />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="accounts" element={<ManageAccounts />} />
            <Route path="loans" element={<ManageLoans />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="limits" element={<TransactionLimits />} />
            <Route path="notifications" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Catch All 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
