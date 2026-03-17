import React, { useState, useEffect } from 'react';
import { accountApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, Badge, Button, DataTable, EmptyState, Modal, InputField } from '../../components/ui';
import Loader from '../../components/Loader';
import { Grid, Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const TYPES = [
  { id: 'FD', label: 'Fixed Deposit', icon: '🏛️', rate: 7.5,  color: '#1A237E', desc: 'Earn guaranteed returns with a lump-sum investment.' },
  { id: 'RD', label: 'Recurring Deposit', icon: '📅', rate: 6.8, color: '#0D47A1', desc: 'Save a fixed amount monthly and earn interest.' },
  { id: 'MUTUAL_FUND', label: 'Mutual Fund', icon: '📈', rate: null, color: '#00897B', desc: 'Market-linked returns. Higher risk, higher reward.', risk: 'Moderate' },
];

const calcMaturity = (amount, ratePercent, durationMonths) => {
  const r = ratePercent / 100;
  const t = durationMonths / 12;
  return amount * Math.pow(1 + r, t);
};

export default function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [account,     setAccount]     = useState(null); // Added account state
  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const [form, setForm] = useState({ type: 'FD', amount: '', duration: '12' });
  const [errors, setErrors] = useState({});

  const selectedType = TYPES.find(t => t.id === form.type);
  const maturity = selectedType?.rate ? calcMaturity(Number(form.amount || 0), selectedType.rate, Number(form.duration || 0)) : null;

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await accountApi.get('/api/investments/all');
      const userInvestments = (res.data || []).filter(inv => String(inv.userId) === String(user?.userId));
      setInvestments(userInvestments);
      
      // Also fetch account for balance check
      if (user?.userId) {
        const accRes = await accountApi.get(`/api/accounts/${user.userId}`);
        setAccount(accRes.data);
      }
    } catch {
      toast.error('Failed to load portfolio data');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvestments(); }, [user]);

  const validate = () => {
    const e = {};
    const amt = Number(form.amount);
    if (!form.amount || amt < 100) e.amount = 'Minimum investment is ₹100';
    if (account && amt > account.balance) e.amount = 'Insufficient balance in your account';
    if (!form.duration || Number(form.duration) < 1) e.duration = 'Enter duration in months';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      setSubmitting(true);
      await accountApi.post('/api/investments/create', {
        userId: user.userId,
        type: form.type,
        amount: Number(form.amount),
        duration: Number(form.duration),
      });
      toast.success('Investment created successfully!');
      setShowModal(false);
      setForm({ type: 'FD', amount: '', duration: '12' });
      setErrors({});
      fetchInvestments();
      // Dispatch event to refresh balance on other tabs (Dashboard etc)
      window.dispatchEvent(new Event('accountDataUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create investment');
    } finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'type',     label: 'Type',
      render: (v) => <Badge label={v} variant={v === 'MUTUAL_FUND' ? 'info' : 'primary'} /> },
    { key: 'amount',   label: 'Amount (₹)',
      render: (v) => <strong style={{ color: '#1A237E' }}>{fmt(v)}</strong> },
    { key: 'duration', label: 'Duration',
      render: (v) => `${v} months` },
    { key: 'createdAt', label: 'Start Date',
      render: (v) => v ? fmtDate(v) : '—' },
    { key: 'maturityDate', label: 'Maturity',
      render: (v) => v ? fmtDate(v) : '—' },
    { key: 'estimatedReturn', label: 'Est. Returns',
      render: (v, row) => {
        const t = TYPES.find(t => t.id === row.type);
        const est = t?.rate ? calcMaturity(row.amount, t.rate, row.duration) : null;
        return est ? <strong style={{ color: '#388E3C' }}>{fmt(Math.round(est))}</strong> : '—';
      }
    },
  ];

  if (loading) return <Loader message="Loading investments..." />;

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="Investments"
        icon="📈"
        subtitle={`${investments.length} active investment${investments.length !== 1 ? 's' : ''}`}
        rightSlot={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ New Investment</Button>}
      />

      {/* Type cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {TYPES.map(t => (
          <Grid item xs={12} sm={6} md={4} key={t.id}>
            <Card sx={{ 
              height: '100%',
              border: `1px solid ${t.color}20`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${t.color}15`,
                borderColor: t.color
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ fontSize: '32px', mb: 1.5 }}>{t.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: t.color, mb: 0.5 }}>
                  {t.label}
                </Typography>
                {t.rate ? (
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main', mb: 1 }}>
                    {t.rate}% p.a.
                  </Typography>
                ) : (
                  <Box sx={{ mb: 1.5 }}>
                    <Badge label={`Risk: ${t.risk}`} variant="warning" />
                  </Box>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {t.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* My Investments table */}
      <SectionCard title="My Investments" action={<Button variant="ghost" size="sm" icon="🔄" onClick={fetchInvestments}>Refresh</Button>} padding="0">
        {investments.length === 0
          ? <EmptyState icon="📈" title="No investments yet" message="Start growing your wealth with FD, RD, or Mutual Funds."
              action={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}>Start Investing</Button>}
            />
          : <DataTable columns={columns} rows={investments} />
        }
      </SectionCard>

      {/* Create Investment Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setErrors({}); }}
        title="📈 New Investment"
        maxWidth="460px"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={submitting} onClick={handleSubmit}>Create Investment</Button>
          </>
        }
      >
        {/* Type selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '8px' }}>Investment Type</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setForm(f => ({ ...f, type: t.id }))}
                style={{
                  padding: '7px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '13px',
                  border: `1.5px solid ${form.type === t.id ? t.color : '#E8EAF6'}`,
                  background: form.type === t.id ? t.color + '15' : '#fff',
                  color: form.type === t.id ? t.color : '#757575',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <InputField label="Amount (₹)" name="amount" type="number" icon="₹"
          value={form.amount} onChange={e => {
            setForm(f => ({ ...f, amount: e.target.value }));
            setErrors(prev => ({ ...prev, amount: null }));
          }}
          placeholder="e.g. 50000" error={errors.amount} required />
        
        {account && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-8px', marginBottom: '16px', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', color: '#757575', fontWeight: 600 }}>Available Balance:</span>
            <span style={{ fontSize: '12px', color: '#1A237E', fontWeight: 800 }}>{fmt(account.balance)}</span>
          </div>
        )}

        <InputField label="Duration (months)" name="duration" type="number" icon="📅"
          value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
          placeholder="e.g. 12" error={errors.duration} required />

        {/* Preview */}
        {form.amount && form.duration && selectedType?.rate && (
          <div style={{ background: '#E8F5E9', borderRadius: '10px', padding: '12px 14px', marginTop: '8px' }}>
            <div style={{ fontSize: '12px', color: '#388E3C', fontWeight: 600, marginBottom: '4px' }}>Estimated Maturity</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#2E7D32' }}>{fmt(Math.round(maturity))}</div>
            <div style={{ fontSize: '12px', color: '#757575' }}>
              Interest earned: {fmt(Math.round(maturity - Number(form.amount)))} at {selectedType.rate}% p.a.
            </div>
          </div>
        )}
      </Modal>
    </Box>
  );
}
