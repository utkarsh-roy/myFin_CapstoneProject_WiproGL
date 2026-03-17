import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { accountApi, loanApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { AlertBanner, Button, Modal as CustomModal, InputField, EmptyState } from '../../components/ui';
import { 
  Grid, Box, Typography, Card, CardContent, Paper, 
  Divider, Avatar, Tooltip, IconButton, useTheme, useMediaQuery 
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InfoIcon from '@mui/icons-material/Info';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const fmt = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);

  const fetchDashboardData = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const accRes = await accountApi.get(`/api/accounts/${user.userId}`);
      setAccount(accRes.data);
      if (accRes.data?.id) {
        const txRes = await accountApi.get(`/api/accounts/mini-statement/${accRes.data.id}`);
        setTransactions(txRes.data || []);
      }
      const lnRes = await loanApi.get(`/api/loans/my/${user.userId}`);
      setLoans(lnRes.data || []);
      const invRes = await accountApi.get(`/api/investments/all`);
      setInvestments((invRes.data || []).filter(i => String(i.userId) === String(user.userId)));
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('accountDataUpdated', fetchDashboardData);
    return () => window.removeEventListener('accountDataUpdated', fetchDashboardData);
  }, [user]);

  const handleSetPin = async () => {
    if (newPin.length !== 4) { setPinError('PIN must be exactly 4 digits'); return; }
    try {
      setPinLoading(true);
      await accountApi.post('/api/accounts/set-pin', { accountId: account.id, pin: newPin });
      toast.success('PIN set successfully!');
      setAccount({ ...account, pinSet: true });
      setShowPinModal(false);
      setNewPin('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to set PIN'); } 
    finally { setPinLoading(false); }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      await accountApi.post('/api/accounts/create', { userId: user.userId, accountType: 'SAVINGS' });
      toast.success('Account created successfully!');
      fetchDashboardData();
    } catch (err) { toast.error('Failed to create account'); setLoading(false); }
  };

  if (loading) return <Box sx={{ p: 4 }}><Typography>Loading Dashboard...</Typography></Box>;
  if (!account) return (
    <Box sx={{ p: 4 }}>
      <EmptyState 
        icon="💳" title="Account Not Found" 
        message="You don't have an active bank account yet. Create your account to access the dashboard."
        action={<Button variant="primary" size="lg" onClick={handleCreateAccount} loading={loading}>Create Account Now</Button>}
      />
    </Box>
  );

  const activeLoans = loans.filter(l => l.status === 'APPROVED');
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
      
      {!account.pinSet && (
        <AlertBanner 
          type="warning" 
          message="⚠️ Set your 4-digit transaction PIN to enable deposits, withdrawals and transfers"
          action={<Button variant="primary" size="sm" onClick={() => setShowPinModal(true)}>Set PIN Now</Button>}
        />
      )}

      {/* Hero Header */}
      <Paper elevation={0} sx={{ 
        p: { xs: 3, md: 5 }, mb: 4, borderRadius: 4,
        background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 60%, #00897B 100%)',
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
              {greeting}, {user?.username?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}! 👋
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, fontSize: '1.1rem', mb: 3 }}>
              Your financial overview looks great today.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Paper variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', px: 2, py: 1, borderRadius: 10, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Typography variant="caption" fontWeight={700}>📅 {todayStr}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', px: 2, py: 1, borderRadius: 10, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Typography variant="caption" fontWeight={700}>🏦 Acc: {account.accountNumber}</Typography>
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {[
                { label: 'Deposit', to: '/transfer', icon: '📥' },
                { label: 'Withdraw', to: '/transfer', icon: '💸' },
                { label: 'Transfer', to: '/transfer', icon: '🔄' },
                { label: 'Invest', to: '/investments', icon: '📈' }
              ].map(btn => (
                <Grid item xs={6} key={btn.label}>
                  <Button 
                    variant="ghost" 
                    fullWidth 
                    component={Link} 
                    to={btn.to}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)', color: 'white', py: 2, 
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="h5">{btn.icon}</Typography>
                      <Typography variant="caption" fontWeight={700}>{btn.label}</Typography>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={4} sx={{ mb: 6, width: '100%', m: 0 }}>
        {[
          { label: 'Account Balance', val: fmt(account.balance), color: '#1A237E', icon: <AccountBalanceWalletIcon />, desc: 'Available funds' },
          { label: 'Portfolio Value', val: fmt(totalInvestmentValue), color: '#00897B', icon: <TrendingUpIcon />, desc: 'Total investments' },
          { label: 'Active Loans', val: activeLoans.length, color: '#E65100', icon: <RequestQuoteIcon />, desc: 'Approved loans' },
          { label: 'Recent Activity', val: transactions.length, color: '#4A148C', icon: <ReceiptLongIcon />, desc: 'Last 30 days' },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card elevation={0} sx={{ 
              height: '100%', minHeight: '220px', borderRadius: 5,
              border: '1px solid rgba(26,35,126,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              '&:hover': { transform: 'translateY(-6px)', boxShadow: 12 } 
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: `${kpi.color}15`, color: kpi.color, borderRadius: 3,
                    width: 48, height: 48, boxShadow: `inset 0 0 0 1px ${kpi.color}25`
                  }}>
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#1A237E', fontSize: '2.5rem' }}>{kpi.val || '0'}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>{kpi.label}</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>{kpi.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Layout */}
      <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
        
        {/* Recent Transactions */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#1A237E' }}>Recent Transactions</Typography>
              <Button size="sm" variant="ghost" component={Link} to="/transactions" sx={{ fontWeight: 700 }}>View All Transactions →</Button>
            </Box>
            <Divider sx={{ mx: 4, opacity: 0.5 }} />
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Details</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            width: 32, height: 32, fontSize: '14px',
                            bgcolor: ['WITHDRAW', 'DEBIT'].includes(tx.type) ? 'error.main' : 'success.main'
                          }}>
                            {(tx.type || 'T')[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={700}>{tx.type || 'Transaction'}</Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 800, 
                          color: ['WITHDRAW', 'DEBIT'].includes(tx.type) ? 'error.main' : 'success.main'
                        }}>
                          {['WITHDRAW', 'DEBIT'].includes(tx.type) ? '-' : '+'}{fmt(tx.amount || 0)}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(tx.timestamp || tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Typography variant="caption" sx={{ 
                          bgcolor: 'success.main', color: 'white', px: 1, py: 0.5, borderRadius: 10, fontWeight: 800
                        }}>COMPLETED</Typography>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>
                        <Typography color="text.disabled">No transactions yet</Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

        {/* Account Details & Chart */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant="h5" fontWeight={900} sx={{ color: '#1A237E' }}>Account Details</Typography>
                    <Tooltip title="Copy Account Number">
                      <IconButton size="small" onClick={() => { navigator.clipboard.writeText(account.accountNumber); toast.success("Copied!"); }} sx={{ bgcolor: 'rgba(26,35,126,0.05)' }}><ContentCopyIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { label: 'Account Number', val: account.accountNumber, mono: true },
                      { label: 'Account Type', val: account.type || 'Savings' },
                      { label: 'Status', val: 'Active', badge: 'success' },
                    ].map((row, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{row.label}</Typography>
                        {row.badge ? (
                          <Typography variant="caption" sx={{ bgcolor: 'success.main', color: 'white', px: 1.5, py: 0.25, borderRadius: 1, fontWeight: 800 }}>{row.val}</Typography>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.val}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ my: 2.5 }} />
                  <Button fullWidth variant="primary" component={Link} to="/profile" sx={{ py: 1.2 }}>Manage Account</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* PIN Modal */}
      <CustomModal 
        open={showPinModal} 
        onClose={() => {setShowPinModal(false); setNewPin(''); setPinError('');}} 
        title="🔐 Set Transaction PIN" 
        maxWidth="400px" 
        footer={
          <>
            <Button variant="ghost" onClick={() => {setShowPinModal(false); setNewPin(''); setPinError('');}}>Cancel</Button>
            <Button variant="primary" loading={pinLoading} onClick={handleSetPin}>Confirm PIN</Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set a secure 4-digit PIN for your account. You will need this for all future transactions.
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <input
            type="password" maxLength={4} value={newPin}
            onChange={e => { if (/^\d*$/.test(e.target.value)) { setNewPin(e.target.value); setPinError(''); } }}
            placeholder="● ● ● ●"
            style={{
              width: '100%', padding: '16px', fontSize: '32px', letterSpacing: '24px',
              border: `2px solid ${pinError ? '#C62828' : '#E5E7EB'}`, borderRadius: '14px',
              outline: 'none', background: '#F9FAFB', textAlign: 'center'
            }}
          />
          {pinError && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{pinError}</Typography>}
        </Box>
      </CustomModal>
    </Box>
  );
}
