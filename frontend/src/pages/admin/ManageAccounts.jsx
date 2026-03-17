import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, DataTable, EmptyState, InputField, Button, Badge, Modal, statusVariant } from '../../components/ui';
import Loader from '../../components/Loader';
import { Box } from '@mui/material';

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resetModal, setResetModal] = useState({ open: false, accountId: null });
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const res = await adminApi.get('/api/admin/accounts/all');
        setAccounts(res.data || []);
      } catch {
        toast.error('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
    window.addEventListener('accountDataUpdated', fetchAccounts);
    return () => window.removeEventListener('accountDataUpdated', fetchAccounts);
  }, []);

  const handleResetPin = async () => {
    try {
      setResetting(true);
      await adminApi.put(`/api/admin/accounts/reset-pin/${resetModal.accountId}`);
      toast.success(`PIN reset for Account #${resetModal.accountId}`);
      setResetModal({ open: false, accountId: null });
    } catch {
      toast.error('Failed to reset PIN');
    } finally {
      setResetting(false);
    }
  };

  const filtered = accounts.filter(acc =>
    String(acc.accountId || '').includes(search) ||
    String(acc.userId || '').includes(search) ||
    String(acc.username || '').toLowerCase().includes(search.toLowerCase()) ||
    String(acc.email || '').toLowerCase().includes(search.toLowerCase()) ||
    String(acc.accountNumber || '').includes(search)
  );

  const columns = [
    { key: 'username',    label: 'Username', render: (v) => <strong style={{color:'#1A237E'}}>{v}</strong> },
    { key: 'email',       label: 'Email', render: (v) => <span style={{fontSize:'12px', color:'#6B7280'}}>{v}</span> },
    { key: 'accountNumber', label: 'A/C Number', render: (v) => <code style={{ fontSize:'12px', background:'#F5F7FA', padding:'2px 6px', borderRadius:'5px' }}>{v || '—'}</code> },
    {
      key: 'balance', label: 'Balance',
      render: (v) => <strong style={{ color: '#388E3C' }}>₹{Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>,
    },
    {
      key: 'createdAt', label: 'Created On',
      render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A',
    },
    {
      key: 'pinSet', label: 'PIN Status',
      render: (v) => <Badge label={v ? 'Set' : 'Not Set'} variant={v ? 'success' : 'warning'} />
    },
    {
      key: 'userActive', label: 'User Status',
      render: (v) => <Badge label={v ? 'Active' : 'Inactive'} variant={v ? 'success' : 'danger'} />
    },
    {
      key: 'accountId', label: 'Actions',
      render: (v) => (
        <Button variant="ghost" size="sm" onClick={() => setResetModal({ open: true, accountId: v })}>
          🔑 Reset PIN
        </Button>
      )
    }
  ];

  if (loading) return <Loader message="Loading Bank Accounts..." />;

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="Account Ledger"
        icon="🏦"
        subtitle={`${accounts.length} total accounts across all users`}
        rightSlot={
          <Button variant="primary" size="sm" icon="🔄" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      />

      <SectionCard
        title="All Bank Accounts"
        action={
          <InputField
            name="search"
            placeholder="Search by ID, account number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon="🔍"
            style={{ margin: 0, width: '260px' }}
          />
        }
      >
        {filtered.length === 0
          ? <EmptyState icon="🏦" title="No accounts found" message="Try adjusting your search term." />
            : <DataTable columns={columns} rows={filtered} />
        }
      </SectionCard>

      <Modal
        open={resetModal.open}
        onClose={() => !resetting && setResetModal({ open: false, accountId: null })}
        title="🔑 Reset Account PIN"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetModal({ open: false, accountId: null })} disabled={resetting}>Cancel</Button>
            <Button variant="primary" onClick={handleResetPin} disabled={resetting}>
              {resetting ? 'Resetting...' : 'Confirm Reset'}
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
          Are you sure you want to reset the PIN for Account <strong style={{color:'#1A237E'}}>#{resetModal.accountId}</strong>? 
          The user will be required to set a new PIN on their next transaction.
        </p>
      </Modal>
    </Box>
  );
};

export default ManageAccounts;
