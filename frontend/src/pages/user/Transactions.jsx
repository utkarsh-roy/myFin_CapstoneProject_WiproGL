import React, { useState, useEffect } from 'react';
import { accountApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { PageHeader, Badge, Button, SectionCard, DataTable, EmptyState, InputField } from '../../components/ui';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';

const Transactions = () => {
  const { user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType]   = useState('ALL');
  const [searchId, setSearchId]       = useState('');
  const [page, setPage]               = useState(0);
  const ROWS                          = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        if (!user?.userId) return;
        const accountRes = await accountApi.get(`/api/accounts/${user.userId}`);
        if (accountRes.data?.id) {
          const txRes = await accountApi.get(`/api/accounts/transactions/${accountRes.data.id}`);
          setTransactions(txRes.data || []);
        }
      } catch (error) {
        if (error.response?.status !== 404) toast.error('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
    window.addEventListener('accountDataUpdated', fetchTransactions);
    return () => window.removeEventListener('accountDataUpdated', fetchTransactions);
  }, [user]);

  const handleExport = () => {
    const headers = ['ID,Date,Type,Amount,Status'];
    const rows = filtered.map(tx =>
      `${tx.id},${new Date(tx.transactionDate || new Date()).toISOString()},${tx.transactionType || tx.type},${tx.amount},${tx.status || 'COMPLETED'}`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `transactions_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const txVariant = (type) => {
    if (type === 'DEPOSIT')  return 'success';
    if (type === 'WITHDRAW') return 'danger';
    if (type === 'TRANSFER') return 'info';
    return 'neutral';
  };

  if (loading) return <Loader message="Fetching transaction history..." />;

  const filtered = transactions
    .filter(t => filterType === 'ALL' || (t.transactionType || t.type) === filterType)
    .filter(t => !searchId || (t.id && String(t.id).toLowerCase().includes(searchId.toLowerCase())));

  const totalPages = Math.ceil(filtered.length / ROWS);
  const paged = filtered.slice(page * ROWS, (page + 1) * ROWS);

  const columns = [
    { key: 'id', label: 'Tx ID' },
    { key: 'transactionDate', label: 'Date & Time',
      render: (v) => new Date(v || Date.now()).toLocaleString('en-IN') },
    { key: 'transactionType', label: 'Type',
      render: (v) => <Badge label={v || 'TRANSFER'} variant={txVariant(v || 'TRANSFER')} /> },
    { key: 'amount', label: 'Amount',
      render: (v, row) => {
        const type = row.transactionType || row.type;
        return (
          <strong style={{ color: ['WITHDRAW', 'DEBIT'].includes(type) ? '#D32F2F' : '#388E3C' }}>
            {['WITHDRAW', 'DEBIT'].includes(type) ? '−' : '+'}₹{Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </strong>
        );
      }
    },
    { key: 'status', label: 'Status',
      render: (v) => <Badge label={v || 'COMPLETED'} variant="success" /> },
  ];

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="Transaction History"
        icon="↔"
        subtitle={`${transactions.length} total transactions`}
        rightSlot={
          <Button variant="ghost" size="sm" icon="⬇" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
          </Button>
        }
      />

      <SectionCard
        title="All Transactions"
        action={
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(0); }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                {['ALL','DEPOSIT','WITHDRAW','TRANSFER'].map(t => (
                  <MenuItem key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <InputField
              name="search"
              placeholder="Search by ID…"
              value={searchId}
              onChange={e => { setSearchId(e.target.value); setPage(0); }}
              icon="🔍"
              style={{ margin: 0, width: '180px' }}
            />
          </Box>
        }
      >
        {paged.length === 0
          ? <EmptyState icon="💳" title="No transactions" message="No transactions match your filter." />
          : <Box sx={{ mt: 1 }}>
              <DataTable columns={columns} rows={paged} keyField="id" />
              {/* Pagination */}
              <Box sx={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                p: 2, flexWrap: 'wrap', gap: 2, borderTop: '1px solid #F3F4F6' 
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {page * ROWS + 1}–{Math.min((page + 1) * ROWS, filtered.length)} of {filtered.length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </Box>
              </Box>
            </Box>
        }
      </SectionCard>
    </Box>
  );
};

export default Transactions;
