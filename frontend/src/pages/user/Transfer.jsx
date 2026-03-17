
import React, { useState, useEffect } from 'react';
import { accountApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  PageHeader,
  SectionCard,
  AlertBanner,
  Button,
  InputField,
  Modal
} from '../../components/ui';
import Loader from '../../components/Loader';
import { Grid, Box, Typography, Tabs, Tab, Card, CardContent, Divider, useTheme, useMediaQuery, Paper } from '@mui/material';

const fmt = (n) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
}).format(n);

/* ─── PIN INPUT ───────────────────────────────────────── */
function PinInput({ value, onChange, label = 'Transaction PIN', error }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        fontSize: '13px',
        fontWeight: 700,
        color: error ? '#C62828' : '#212121',
        display: 'block',
        marginBottom: '6px'
      }}>
        {label} *
      </label>
      <input
        type="password"
        maxLength={4}
        value={value}
        inputMode="numeric"
        // ✅ Only allow digits
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 4) onChange(val);
        }}
        placeholder="● ● ● ●"
        style={{
          width: '100%',
          maxWidth: '200px',
          padding: '12px 16px',
          fontSize: '24px',
          letterSpacing: '12px',
          border: `1.5px solid ${error ? '#C62828' : '#E5E7EB'}`,
          borderRadius: '12px',
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          textAlign: 'center',
          color: '#1A1A2E',
          transition: 'border-color 0.2s',
          backgroundColor: '#FFFFFF',
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = '#1A237E';
          e.target.style.boxShadow = error
            ? 'none'
            : '0 0 0 3px rgba(26,35,126,0.08)';
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = '#E5E7EB';
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p style={{
          margin: '5px 0 0',
          fontSize: '12px',
          color: '#C62828'
        }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

/* ─── RECEIPT MODAL ───────────────────────────────────── */
function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  const print = () => window.print();
  return (
    <Modal
      open={!!receipt}
      onClose={onClose}
      title="✅ Transaction Receipt"
      maxWidth="420px"
      footer={
        <>
          <Button variant="ghost" size="sm"
            onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm"
            onClick={print}>
            🖨 Print
          </Button>
        </>
      }
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          <div style={{ fontSize: '44px' }}>✅</div>
          <div style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#1A237E'
          }}>
            {fmt(receipt.amount)}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#757575'
          }}>
            {receipt.type}
          </div>
        </div>
        {[
          ['Transaction ID', receipt.txId || '—'],
          ['From Account', receipt.from || '—'],
          ['To Account', receipt.to || '—'],
          ['Date & Time', new Date().toLocaleString('en-IN')],
          ['Status', 'SUCCESS ✅'],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F5F7FA',
            paddingBottom: '8px'
          }}>
            <span style={{
              fontSize: '13px',
              color: '#757575'
            }}>
              {k}
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#212121',
              wordBreak: 'break-all',
              maxWidth: '220px',
              textAlign: 'right'
            }}>
              {v}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────── */
export default function Transfer({ defaultTab = 'transfer' }) {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(defaultTab);
  const [receipt, setReceipt] = useState(null);

  // Set PIN state
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [setPinErr, setSetPinErr] = useState('');

  // Deposit state
  const [depAmount, setDepAmount] = useState('');
  const [depPin, setDepPin] = useState('');
  const [depLoading, setDepLoading] = useState(false);
  const [depErrors, setDepErrors] = useState({});

  // Withdraw state
  const [wdAmount, setWdAmount] = useState('');
  const [wdPin, setWdPin] = useState('');
  const [wdLoading, setWdLoading] = useState(false);
  const [wdErrors, setWdErrors] = useState({});

  // Transfer state
  const [toAccount, setToAccount] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPin, setTxPin] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txErrors, setTxErrors] = useState({});

  /* ── Load account ── */
  useEffect(() => {
    const load = async () => {
      if (!user?.userId) return;
      try {
        setLoading(true);
        const res = await accountApi.get(
          `/api/accounts/${user.userId}`);
        setAccount(res.data);
      } catch {
        setAccount(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  /* ── Refresh account balance ── */
  const refreshAccount = async () => {
    try {
      const res = await accountApi.get(
        `/api/accounts/${user.userId}`);
      setAccount(res.data);
    } catch { }
  };

  /* ── Set PIN ── */
  const handleSetPin = async () => {
    if (newPin.length !== 4) {
      setSetPinErr('PIN must be exactly 4 digits');
      return;
    }
    try {
      await accountApi.post('/api/accounts/set-pin', {
        accountId: account.id,
        pin: newPin
      });
      toast.success('PIN set successfully!');
      setAccount(a => ({ ...a, pinSet: true }));
      setShowSetPin(false);
      setNewPin('');
      setSetPinErr('');
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Failed to set PIN');
    }
  };

  /* ── Deposit ── */
  const handleDeposit = async () => {
    const errs = {};
    if (!depAmount ||
      isNaN(depAmount) ||
      Number(depAmount) <= 0) {
      errs.amount = 'Enter a valid amount';
    }
    if (depPin.length !== 4) {
      errs.pin = 'Enter your 4-digit PIN';
    }
    if (Object.keys(errs).length) {
      setDepErrors(errs);
      return;
    }
    setDepErrors({});

    try {
      setDepLoading(true);

      // ✅ Fixed - params sent correctly
      const res = await accountApi.post(
        `/api/accounts/deposit/${account.id}`,
        null,
        {
          params: {
            amount: Number(depAmount),
            pin: depPin
          }
        }
      );

      toast.success('Deposit successful!');
      window.dispatchEvent(new Event('accountDataUpdated'));

      // ✅ Fixed - correct txId from response
      setReceipt({
        type: 'DEPOSIT',
        amount: Number(depAmount),
        from: account.accountNumber,
        to: '—',
        txId: res.data?.transactionId || res.data?.id
      });

      setDepAmount('');
      setDepPin('');
      await refreshAccount();

    } catch (err) {
      // ✅ Show exact backend error
      const msg = err.response?.data?.message
        || 'Deposit failed!';
      toast.error(msg);

      // ✅ Show PIN error specifically
      if (msg.toLowerCase().includes('pin')) {
        setDepErrors({ pin: msg });
      }
    } finally {
      setDepLoading(false);
    }
  };

  /* ── Withdraw ── */
  const handleWithdraw = async () => {
    const errs = {};
    if (!wdAmount ||
      isNaN(wdAmount) ||
      Number(wdAmount) <= 0) {
      errs.amount = 'Enter a valid amount';
    }
    if (Number(wdAmount) > (account?.balance || 0)) {
      errs.amount = 'Insufficient balance';
    }
    if (wdPin.length !== 4) {
      errs.pin = 'Enter your 4-digit PIN';
    }
    if (Object.keys(errs).length) {
      setWdErrors(errs);
      return;
    }
    setWdErrors({});

    try {
      setWdLoading(true);

      // ✅ Fixed - params sent correctly
      const res = await accountApi.post(
        `/api/accounts/withdraw/${account.id}`,
        null,
        {
          params: {
            amount: Number(wdAmount),
            pin: wdPin
          }
        }
      );

      toast.success('Withdrawal successful!');
      window.dispatchEvent(new Event('accountDataUpdated'));

      // ✅ Fixed - correct txId
      setReceipt({
        type: 'WITHDRAW',
        amount: Number(wdAmount),
        from: account.accountNumber,
        to: '—',
        txId: res.data?.transactionId || res.data?.id
      });

      setWdAmount('');
      setWdPin('');
      await refreshAccount();

    } catch (err) {
      const msg = err.response?.data?.message
        || 'Withdrawal failed!';
      toast.error(msg);

      if (msg.toLowerCase().includes('pin')) {
        setWdErrors({ pin: msg });
      }
    } finally {
      setWdLoading(false);
    }
  };

  /* ── Transfer ── */
  const handleTransfer = async () => {
    const errs = {};

    // ✅ Validate account number format
    if (!toAccount) {
      errs.to = 'Enter recipient account number';
    } else if (!toAccount.startsWith('MYFIN')) {
      errs.to = 'Account number must start with MYFIN';
    } else if (toAccount === account.accountNumber) {
      errs.to = 'Cannot transfer to your own account';
    }

    if (!txAmount ||
      isNaN(txAmount) ||
      Number(txAmount) <= 0) {
      errs.amount = 'Enter a valid amount';
    }
    if (Number(txAmount) > (account?.balance || 0)) {
      errs.amount = 'Insufficient balance';
    }
    if (txPin.length !== 4) {
      errs.pin = 'Enter your 4-digit PIN';
    }
    if (Object.keys(errs).length) {
      setTxErrors(errs);
      return;
    }
    setTxErrors({});

    try {
      setTxLoading(true);

      // ✅ Fixed - send toAccountNumber not toAccountId
      const res = await accountApi.post(
        '/api/accounts/transfer',
        {
          fromAccountId: account.id,
          toAccountNumber: toAccount.toUpperCase(),
          amount: parseFloat(txAmount),
          pin: txPin
        }
      );

      toast.success('Transfer successful!');
      window.dispatchEvent(new Event('accountDataUpdated'));

      setReceipt({
        type: 'TRANSFER',
        amount: Number(txAmount),
        from: account.accountNumber,
        to: toAccount.toUpperCase(),
        txId: res.data?.transactionId || res.data?.id
      });

      setToAccount('');
      setTxAmount('');
      setTxPin('');
      await refreshAccount();

    } catch (err) {
      const msg = err.response?.data?.message
        || err.message
        || 'Transfer failed!';
      toast.error(msg);

      // ✅ Show specific errors
      if (msg.toLowerCase().includes('pin')) {
        setTxErrors({ pin: msg });
      } else if (msg.toLowerCase().includes('account')) {
        setTxErrors({ to: msg });
      } else if (msg.toLowerCase().includes('balance')) {
        setTxErrors({ amount: msg });
      }
    } finally {
      setTxLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '10px',
    background: active ? '#FFFFFF' : 'transparent',
    color: active ? '#1A237E' : '#6B7280',
    transition: 'all 0.2s',
    boxShadow: active
      ? '0 2px 8px rgba(0,0,0,0.08)'
      : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  });

  if (loading) return <Loader message="Loading account..." />;

  return (
    <Box sx={{
      width: '100%',
      paddingBottom: '40px',
      p: 0
    }}>
      <PageHeader
        title="Transfer & Payments"
        icon="💸"
        subtitle={account
          ? `Balance: ${fmt(account.balance || 0)} · Acc: ${account.accountNumber}`
          : 'No account found'
        }
      />

      {/* ── PIN not set warning ── */}
      {account && !account.pinSet && (
        <AlertBanner
          type="warning"
          message="⚠️ Set your 4-digit transaction PIN to enable deposits, withdrawals and transfers."
          dismissible={false}
        />
      )}

      {/* ── Transaction Limit Info ── */}
      <AlertBanner
        type="info"
        message="Bank Limits: Max deposit: ₹1,00,000 | Max withdrawal: ₹50,000 | Max transfer: ₹25,000"
        style={{ marginBottom: '24px' }}
      />

      {/* ── Set PIN form ── */}
      {account && !account.pinSet && (
        <SectionCard
          title="🔑 Set Transaction PIN"
          style={{ marginBottom: '20px' }}>
          {!showSetPin ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSetPin(true)}>
              Set PIN Now
            </Button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <PinInput
                label="New 4-digit PIN"
                value={newPin}
                onChange={setNewPin}
                error={setPinErr}
              />
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleSetPin}>
                    Confirm PIN
                  </Button>
                </div>
                <div style={{ flex: 1 }}>
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setShowSetPin(false);
                      setNewPin('');
                      setSetPinErr('');
                    }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {account && (
        <>
      {/* ── Tab Bar ── */}
      <Paper elevation={0} sx={{ p: 0.5, mb: 4, borderRadius: 3, bgcolor: '#F5F7FA', border: '1px solid #E5E7EB' }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              borderRadius: 2,
              fontWeight: 800,
              fontSize: '0.85rem',
              minHeight: 48,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                bgcolor: 'white',
                color: 'primary.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }
            }
          }}
        >
          <Tab value="deposit" label="📥 Deposit" />
          <Tab value="withdraw" label="📤 Withdraw" />
          <Tab value="transfer" label="🔄 Transfer" />
        </Tabs>
      </Paper>

          {/* ── DEPOSIT ── */}
          {tab === 'deposit' && (
            <SectionCard title="💰 Deposit Funds">
              <InputField
                label="Amount (₹)"
                name="depAmount"
                type="number"
                icon="₹"
                value={depAmount}
                onChange={e =>
                  setDepAmount(e.target.value)}
                placeholder="Enter amount"
                error={depErrors.amount}
                required
              />
              <PinInput
                value={depPin}
                onChange={setDepPin}
                error={depErrors.pin}
              />
              <Button
                variant="success"
                size="md"
                fullWidth
                loading={depLoading}
                onClick={handleDeposit}
                disabled={!account.pinSet
                  || depLoading}>
                Deposit
              </Button>
              {!account.pinSet && (
                <p style={{
                  fontSize: '12px',
                  color: '#C62828',
                  marginTop: '8px'
                }}>
                  Please set your PIN first
                </p>
              )}
            </SectionCard>
          )}

          {/* ── WITHDRAW ── */}
          {tab === 'withdraw' && (
            <SectionCard title="💸 Withdraw Funds">
              <div style={{
                marginBottom: '20px',
                fontSize: '14px',
                color: '#6B7280',
                padding: '12px 16px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                Available Balance:{' '}
                <strong style={{ color: '#1A237E' }}>
                  {fmt(account.balance || 0)}
                </strong>
              </div>
              <InputField
                label="Amount (₹)"
                name="wdAmount"
                type="number"
                icon="₹"
                value={wdAmount}
                onChange={e =>
                  setWdAmount(e.target.value)}
                placeholder="Enter amount"
                error={wdErrors.amount}
                required
              />
              <PinInput
                value={wdPin}
                onChange={setWdPin}
                error={wdErrors.pin}
              />
              <Button
                variant="danger"
                size="md"
                fullWidth
                loading={wdLoading}
                onClick={handleWithdraw}
                disabled={!account.pinSet
                  || wdLoading}>
                Withdraw
              </Button>
              {!account.pinSet && (
                <p style={{
                  fontSize: '12px',
                  color: '#C62828',
                  marginTop: '8px'
                }}>
                  Please set your PIN first
                </p>
              )}
            </SectionCard>
          )}

          {/* ── TRANSFER ── */}
          {tab === 'transfer' && (
            <SectionCard title="↔ Transfer Money">
              <div style={{
                marginBottom: '20px',
                fontSize: '14px',
                color: '#6B7280',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <span>
                  From:{' '}
                  <strong style={{
                    color: '#1A237E',
                    fontFamily: 'monospace'
                  }}>
                    {account.accountNumber}
                  </strong>
                </span>
                <span>
                  Available:{' '}
                  <strong style={{
                    color: '#2E7D32'
                  }}>
                    {fmt(account.balance || 0)}
                  </strong>
                </span>
              </div>

              {/* ✅ Fixed input - text type, uppercase */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: txErrors.to
                    ? '#C62828'
                    : '#212121',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Recipient Account Number *
                </label>
                <input
                  type="text"
                  value={toAccount}
                  onChange={e =>
                    setToAccount(
                      e.target.value
                        .toUpperCase()
                        .replace(/\s/g, '')
                    )
                  }
                  placeholder="e.g. MYFIN1234567890"
                  maxLength={20}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: `1.5px solid ${txErrors.to ? '#C62828' : '#E5E7EB'}`,
                    borderRadius: '10px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#1A1A2E',
                    letterSpacing: '1px',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={e => {
                    if (!txErrors.to)
                      e.target.style.borderColor
                        = '#1A237E';
                  }}
                  onBlur={e => {
                    if (!txErrors.to)
                      e.target.style.borderColor
                        = '#E5E7EB';
                  }}
                />
                {txErrors.to && (
                  <p style={{
                    margin: '5px 0 0',
                    fontSize: '12px',
                    color: '#C62828'
                  }}>
                    ⚠ {txErrors.to}
                  </p>
                )}
              </div>

              <InputField
                label="Amount (₹)"
                name="txAmount"
                type="number"
                icon="₹"
                value={txAmount}
                onChange={e =>
                  setTxAmount(e.target.value)}
                placeholder="Enter amount"
                error={txErrors.amount}
                required
              />
              <PinInput
                value={txPin}
                onChange={setTxPin}
                error={txErrors.pin}
              />
              <Button
                variant="primary"
                size="md"
                fullWidth
                loading={txLoading}
                onClick={handleTransfer}
                disabled={!account.pinSet
                  || txLoading}>
                Transfer Funds
              </Button>
              {!account.pinSet && (
                <p style={{
                  fontSize: '12px',
                  color: '#C62828',
                  marginTop: '8px'
                }}>
                  Please set your PIN first
                </p>
              )}
            </SectionCard>
          )}
        </>
      )}

      {/* ── No account state ── */}
      {!account && !loading && (
        <SectionCard>
          <p style={{
            textAlign: 'center',
            color: '#757575',
            fontSize: '15px',
            padding: '24px'
          }}>
            You don't have a bank account yet.
            Create one from the{' '}
            <strong>Dashboard</strong>.
          </p>
        </SectionCard>
      )}

      <ReceiptModal
        receipt={receipt}
        onClose={() => setReceipt(null)}
      />
    </Box>
  );
}