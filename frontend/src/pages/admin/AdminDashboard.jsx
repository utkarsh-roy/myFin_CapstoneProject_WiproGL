import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, StatCard, Badge, Button, SectionCard, DataTable, EmptyState } from '../../components/ui';
import Loader from '../../components/Loader';
import { Box, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, accounts: 0, totalLoans: 0, pendingLoans: 0 });
  const [recentPendingLoans, setRecentPendingLoans] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersRes, accountsRes, allLoansRes, pendingLoansRes] = await Promise.all([
          adminApi.get('/api/admin/users/all').catch(() => ({ data: [] })),
          adminApi.get('/api/admin/accounts/all').catch(() => ({ data: [] })),
          adminApi.get('/api/admin/loans/all').catch(() => ({ data: [] })),
          adminApi.get('/api/admin/loans/pending').catch(() => ({ data: [] })),
        ]);
        setStats({
          users:        usersRes.data.length || 0,
          accounts:     accountsRes.data.length || 0,
          totalLoans:   allLoansRes.data.length || 0,
          pendingLoans: pendingLoansRes.data.length || 0,
        });
        setRecentPendingLoans((pendingLoansRes.data || []).slice(0, 5));
      } catch {
        toast.error('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const columns = [
    { key: 'id',       label: 'Loan ID' },
    { key: 'userId',   label: 'User ID' },
    { key: 'loanType', label: 'Type' },
    { key: 'amount',   label: 'Amount', render: (v) => <strong style={{ color:'#1A237E' }}>₹{Number(v).toLocaleString()}</strong> },
    { key: 'status',   label: 'Status', render: () => <Badge label="PENDING" variant="warning" /> },
    { key: '_act',     label: 'Action',
      render: () => (
        <Button variant="primary" size="sm" onClick={() => navigate('/admin/loans')}>Review →</Button>
      )
    },
  ];

  if (loading) return <Loader message="Loading Admin Dashboard..." />;

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="Admin Overview"
        icon="🛠️"
        subtitle="System status and pending reviews"
        rightSlot={
          <div style={{ display:'flex', gap:'10px' }}>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/users')}>👥 Manage Users</Button>
            <Button variant="ghost"   size="sm" onClick={() => navigate('/admin/loans')}>📝 Review Loans</Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Users" value={stats.users} icon="👥" color="#1A237E" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Accounts" value={stats.accounts} icon="🏦" color="#0D47A1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Loans" value={stats.totalLoans} icon="📃" color="#388E3C" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            label="Pending Loans" 
            value={stats.pendingLoans} 
            icon="⏳" 
            color="#F57F17"
            trend={stats.pendingLoans > 0 ? `${stats.pendingLoans} Needs review` : 'All clear'}
            trendUp={stats.pendingLoans === 0}
          />
        </Grid>
      </Grid>

      {/* Pending Loans Quick Review */}
      <SectionCard
        title="⏳ Pending Loans — Top 5"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/loans')}>
            View All Pending →
          </Button>
        }
        padding="0"
      >
        {recentPendingLoans.length === 0
          ? <EmptyState icon="🎉" title="No pending reviews" message="All loan applications are up to date." />
          : <DataTable columns={columns} rows={recentPendingLoans} />
        }
      </SectionCard>
    </Box>
  );
};

export default AdminDashboard;
