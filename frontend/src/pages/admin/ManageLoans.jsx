import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, Badge, Button, SectionCard, DataTable, EmptyState, Modal, statusVariant } from '../../components/ui';
import Loader from '../../components/Loader';
import { Box } from '@mui/material';

const ManageLoans = () => {
  const [tab,     setTab]     = useState(0); // 0=all, 1=pending
  const [loans,   setLoans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, type: '', loanId: null });
  const [selectedLoan, setSelectedLoan] = useState(null);

  const fetchLoans = async (pendingOnly = false) => {
    try {
      setLoading(true);
      const endpoint = pendingOnly ? '/api/admin/loans/pending' : '/api/admin/loans/all';
      const res = await adminApi.get(endpoint);
      setLoans(res.data || []);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(tab === 1); }, [tab]);

  const handleAction = async () => {
    const { type, loanId } = confirm;
    try {
      if (type === 'APPROVE') {
        await adminApi.put(`/api/admin/loans/approve/${loanId}`);
        toast.success(`Loan #${loanId} approved ✅`);
        window.dispatchEvent(new Event('accountDataUpdated'));
      } else {
        await adminApi.put(`/api/admin/loans/deny/${loanId}`);
        toast.success(`Loan #${loanId} denied`);
      }
      fetchLoans(tab === 1);
    } catch {
      toast.error(`Failed to ${type.toLowerCase()} loan`);
    } finally {
      setConfirm({ open: false, type: '', loanId: null });
      if (selectedLoan) setSelectedLoan(null);
    }
  };

  const openDetails = (loan) => {
    setSelectedLoan(loan);
  };

  // Tab switcher styles
  const tabStyle = (active) => ({
    padding: '9px 22px', fontSize: '14px', fontWeight: 700,
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    background: active ? '#1A237E' : 'transparent',
    color: active ? '#fff' : '#757575',
    transition: 'all 0.2s',
  });

  const columns = [
    { key: 'applicantName', label: 'Applicant',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: '13px', color: '#1A237E' }}>{v || 'User ' + row.userId}</strong>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>{row.applicantEmail || '—'}</span>
        </div>
      )
    },
    { key: 'loanType', label: 'Type',
      render: (v) => <Badge label={v} variant="neutral" />
    },
    { key: 'amount', label: 'Amount & EMI',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: '13px', color: '#2E7D32' }}>₹{Number(v).toLocaleString()}</strong>
          <span style={{ fontSize: '11px', color: '#1A237E', fontWeight: 700 }}>EMI: ₹{Number(row.emi || 0).toLocaleString()}</span>
        </div>
      )
    },
    { key: 'tenure', label: 'Tenure & Rate',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{v} months</span>
          <span style={{ fontSize: '11px', color: '#00897B' }}>{row.interestRate}% p.a.</span>
        </div>
      )
    },
    { key: 'status', label: 'Status',
      render: (v) => <Badge label={v || 'PENDING'} variant={statusVariant(v || 'PENDING')} />,
    },
    { key: 'id', label: 'Review',
      render: (v, row) => (
        <Button variant="ghost" size="sm" onClick={() => openDetails(row)}>
          👁️ Details
        </Button>
      )
    }
  ];

  if (loading) return <Loader message="Loading Loans…" />;

  const pendingCount = loans.filter(l => (l.status || 'PENDING') === 'PENDING').length;

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="Loan Applications"
        icon="📝"
        subtitle={`${loans.length} loans · ${pendingCount} pending review`}
        rightSlot={
          <Button variant="primary" size="sm" icon="🔄" onClick={() => fetchLoans(tab === 1)}>
            Refresh
          </Button>
        }
      />

      {/* Custom tab bar */}
      <div style={{
        display: 'flex', gap: '6px', background: '#F5F7FA',
        borderRadius: '10px', padding: '4px',
        width: 'fit-content', marginBottom: '20px',
      }}>
        <button style={tabStyle(tab === 0)} onClick={() => setTab(0)}>All Loans</button>
        <button style={tabStyle(tab === 1)} onClick={() => setTab(1)}>
          Pending {pendingCount > 0 && <span style={{ background: '#D32F2F', color: '#fff', borderRadius: '100px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' }}>{pendingCount}</span>}
        </button>
      </div>

      <SectionCard title={tab === 0 ? 'All Loan Applications' : 'Pending Loans Awaiting Review'}>
        {loans.length === 0
          ? <EmptyState
              icon={tab === 1 ? '🎉' : '📋'}
              title={tab === 1 ? 'No Pending Loans' : 'No Loans Found'}
              message={tab === 1 ? 'All loan applications have been reviewed.' : 'No loan applications yet.'}
            />
          : <DataTable columns={columns} rows={loans} />
        }
      </SectionCard>

      {/* Confirm Dialog */}
      <Modal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, type: '', loanId: null })}
        title={confirm.type === 'APPROVE' ? '✅ Approve Loan' : '❌ Deny Loan'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirm({ open: false, type: '', loanId: null })}>
              Cancel
            </Button>
            <Button
              variant={confirm.type === 'APPROVE' ? 'success' : 'danger'}
              size="sm"
              onClick={handleAction}
            >
              Confirm {confirm.type === 'APPROVE' ? 'Approval' : 'Denial'}
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#757575', lineHeight: 1.7 }}>
          Are you sure you want to <strong>{confirm.type === 'APPROVE' ? 'approve' : 'deny'}</strong> Loan{' '}
          <strong style={{ color: '#1A237E' }}>#{confirm.loanId}</strong>?
          {confirm.type === 'APPROVE' && ' The user will be notified and their records updated.'}
        </p>
      </Modal>

      {/* Full Details Modal */}
      <Modal
        open={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        title="🏦 Comprehensive Loan Review"
        maxWidth="700px"
        footer={
          selectedLoan?.status === 'PENDING' || !selectedLoan?.status ? (
            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setSelectedLoan(null)}>Close</Button>
                <Button variant="danger" onClick={() => setConfirm({ open: true, type: 'DENY', loanId: selectedLoan.id })}>Deny Application</Button>
                <Button variant="success" onClick={() => setConfirm({ open: true, type: 'APPROVE', loanId: selectedLoan.id })}>Approve Loan</Button>
            </div>
          ) : <Button variant="ghost" onClick={() => setSelectedLoan(null)}>Close Details</Button>
        }
      >
        {selectedLoan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                <div>
                   <h3 style={{ margin: 0, fontSize: '18px', color: '#1A237E' }}>{selectedLoan.applicantName || 'Applicant Profile'}</h3>
                   <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                      {selectedLoan.applicantEmail} · ID: #{selectedLoan.id}
                   </p>
                </div>
                <Badge label={selectedLoan.status || 'PENDING'} variant={statusVariant(selectedLoan.status || 'PENDING')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Profile Section */}
                <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase' }}>Personal Profile</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <DetailRow label="Age" value={`${selectedLoan.age || '—'} years`} />
                        <DetailRow label="Employment" value={selectedLoan.employmentType || '—'} />
                        <DetailRow label="Monthly Income" value={selectedLoan.monthlyIncome ? `₹${selectedLoan.monthlyIncome.toLocaleString()}` : '—'} />
                        <DetailRow label="Address" value={selectedLoan.address || '—'} />
                    </div>
                </div>

                {/* Loan Section */}
                <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase' }}>Loan Request</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <DetailRow label="Loan Type" value={selectedLoan.loanType} />
                        <DetailRow label="Amount" value={`₹${Number(selectedLoan.amount).toLocaleString()}`} bold />
                        <DetailRow label="Tenure" value={`${selectedLoan.tenure} months`} />
                        <DetailRow label="Interest Rate" value={`${selectedLoan.interestRate}% p.a.`} />
                        <DetailRow label="Monthly EMI" value={`₹${Number(selectedLoan.emi || 0).toLocaleString()}`} bold />
                    </div>
                </div>
            </div>

            <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase' }}>Statement of Purpose</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontStyle: 'italic', lineHeight: 1.5 }}>
                   "{selectedLoan.loanPurpose || 'No purpose stated.'}"
                </p>
            </div>

            {selectedLoan.verificationQuestion && (
                <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '16px', border: '1px solid #FEF3C7' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#D97706', textTransform: 'uppercase' }}>Identity Verification</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Q: {selectedLoan.verificationQuestion}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>A: <span style={{ background: '#FEF3C7', padding: '1px 4px', borderRadius: '4px' }}>{selectedLoan.verificationAnswer}</span></p>
                    </div>
                </div>
            )}
          </div>
        )}
      </Modal>
    </Box>
  );
};

const DetailRow = ({ label, value, bold }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', width: '100%' }}>
        <span style={{ color: '#6B7280' }}>{label}</span>
        <span style={{ fontWeight: bold ? 900 : 600, color: '#1F2937', textAlign: 'right', maxWidth: '140px' }}>{value}</span>
    </Box>
);

export default ManageLoans;
