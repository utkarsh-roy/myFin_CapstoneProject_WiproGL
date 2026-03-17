import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loanApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import { PageHeader, Badge, Button, SectionCard, EmptyState, Modal, statusVariant } from '../../components/ui';

const calculateEmi = (p, rBase, n) => {
  if (!p || !rBase || !n) return 0;
  const r = rBase / 12 / 100;
  return p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
};

const MyLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, loanId: null });

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      if (!user?.userId) return;
      const res = await loanApi.get(`/api/loans/my/${user.userId}`);
      setLoans(res.data || []);
    } catch (err) {
      if (![400, 404, 500].includes(err.response?.status)) {
        toast.error('Failed to load your loans.');
      }
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyLoans(); }, [user]);

  const handleConfirmCancel = async () => {
    try {
      await loanApi.delete(`/api/loans/cancel/${cancelDialog.loanId}`);
      toast.success('Loan application cancelled.');
      fetchMyLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel loan.');
    } finally {
      setCancelDialog({ open: false, loanId: null });
    }
  };

  if (loading) return <Loader message="Loading your loan history..." />;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <PageHeader
        title="My Loans"
        icon="📃"
        subtitle={`${loans.length} loan application${loans.length !== 1 ? 's' : ''}`}
        rightSlot={
          <Link to="/loan-apply" style={{ textDecoration:'none' }}>
            <Button variant="primary" size="sm">+ Apply for Loan</Button>
          </Link>
        }
      />

      {loans.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="📃"
            title="No loan applications yet"
            message="Apply for a personal or home loan and track approval status right here."
            action={
              <Link to="/loan-apply" style={{ textDecoration:'none' }}>
                <Button variant="primary" size="md">Apply for a Loan →</Button>
              </Link>
            }
          />
        </SectionCard>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px' }}>
          {loans.map((loan) => {
            const emiValue = loan.emi || calculateEmi(loan.amount, loan.interestRate, loan.tenure);
            const emi = Number(emiValue).toFixed(2);
            const status = loan.status || 'PENDING';
            const isPending = status === 'PENDING';

            return (
              <div key={loan.id} style={{
                background: '#FFFFFF', borderRadius: '16px',
                border: `1.5px solid ${isPending ? '#FFE082' : 'rgba(26,35,126,0.08)'}`,
                boxShadow: '0 2px 12px rgba(26,35,126,0.07)',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ margin:0, fontSize:'17px', fontWeight:800, color:'#1A237E' }}>
                    {loan.loanType} Loan
                  </h3>
                  <Badge label={status} variant={statusVariant(status)} />
                </div>

                {/* Amount */}
                <div style={{ fontSize:'30px', fontWeight:900, color:'#1A237E', letterSpacing:'-1px' }}>
                  ₹{Number(loan.amount).toLocaleString('en-IN')}
                </div>

                {/* Details */}
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', fontSize:'14px', color:'#757575' }}>
                  <span>🗓 Tenure: <strong style={{ color:'#212121' }}>{loan.tenure} Months</strong></span>
                  <span>📈 Rate: <strong style={{ color:'#212121' }}>{loan.interestRate}% p.a.</strong></span>
                  <span>💳 Est. EMI: <strong style={{ color:'#1A237E' }}>₹{emi}/mo</strong></span>
                </div>

                <div style={{ borderTop:'1px solid #F0F0F0', paddingTop:'10px', fontSize:'12px', color:'#BDBDBD' }}>
                  Applied: {new Date(loan.createdAt || loan.appliedDate || Date.now()).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                </div>

                {isPending && (
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => setCancelDialog({ open: true, loanId: loan.id })}
                  >
                    Cancel Application
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, loanId: null })}
        title="Cancel Loan Application"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCancelDialog({ open: false, loanId: null })}>
              Keep It
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Yes, Cancel It
            </Button>
          </>
        }
      >
        <p style={{ margin:0, fontSize:'14px', color:'#757575', lineHeight:1.7 }}>
          Are you sure you want to cancel this pending loan application?
          <br />
          This action <strong>cannot be undone</strong>.
        </p>
      </Modal>
    </div>
  );
};

export default MyLoans;
