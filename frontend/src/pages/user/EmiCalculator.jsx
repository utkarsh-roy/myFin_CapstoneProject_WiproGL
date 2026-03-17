import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loanApi } from '../../api/axiosConfig';
import { PageHeader, SectionCard, Button } from '../../components/ui';
import { Box } from '@mui/material';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const calcEmi = (p, r, n) => {
  if (!p || !r || !n) return 0;
  const monthly = r / 12 / 100;
  return p * monthly * Math.pow(1 + monthly, n) / (Math.pow(1 + monthly, n) - 1);
};

const SliderInput = ({ label, value, min, max, step = 1, onChange, format }) => (
  <div style={{ marginBottom: '22px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <label style={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>{label}</label>
      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1A237E' }}>{format ? format(value) : value}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: '#1A237E', height: '6px', cursor: 'pointer' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#BDBDBD' }}>
      <span>{format ? format(min) : min}</span>
      <span>{format ? format(max) : max}</span>
    </div>
  </div>
);

export default function EmiCalculator() {
  const [amount,  setAmount]  = useState(500000);
  const [rate,    setRate]    = useState(10.5);
  const [tenure,  setTenure]  = useState(60);
  const [emi,     setEmi]     = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(async () => {
    const local = calcEmi(amount, rate, tenure);
    setEmi(local);
    // Also hit API for accurate server-side calculation
    try {
      setLoading(true);
      const res = await loanApi.post('/api/emi/calculate', { amount, interestRate: rate, tenure });
      if (res.data?.emi) setEmi(res.data.emi);
    } catch {
      setEmi(local); // fallback to local calc
    } finally { setLoading(false); }
  }, [amount, rate, tenure]);

  useEffect(() => { calculate(); }, [calculate]);

  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - amount;

  /* Amortization schedule */
  const schedule = [];
  let balance = amount;
  const monthlyRate = rate / 12 / 100;
  for (let m = 1; m <= tenure; m++) {
    const interest  = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;
    schedule.push({ month: m, principal: Math.max(0, principal), interest, balance: Math.max(0, balance) });
  }
  const displayedRows = showAll ? schedule : schedule.slice(0, 12);

  const chartData = [
    { name: 'Principal', value: Math.round(amount) },
    { name: 'Interest',  value: Math.round(Math.max(0, totalInterest)) },
  ];

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader title="EMI Calculator" icon="🧮" subtitle="Calculate your monthly instalments instantly" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Input Panel */}
        <SectionCard title="Loan Parameters">
          <SliderInput label="Loan Amount"    value={amount} min={10000} max={5000000} step={10000}
            onChange={setAmount} format={fmt} />
          <SliderInput label="Interest Rate"  value={rate}   min={5}     max={24}      step={0.1}
            onChange={setRate}   format={v => `${v}%`} />
          <SliderInput label="Tenure (Months)" value={tenure} min={6}    max={360}     step={6}
            onChange={setTenure} format={v => `${v} mo`} />
        </SectionCard>

        {/* Results Panel */}
        <SectionCard title="Monthly EMI">
          <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
            <div style={{ fontSize: '13px', color: '#757575', marginBottom: '6px' }}>Monthly Payment</div>
            <div style={{ fontSize: '42px', fontWeight: 900, color: '#1A237E', letterSpacing: '-1px' }}>
              {loading ? '...' : fmt(Math.round(emi))}
            </div>
            <div style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>for {tenure} months</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              ['Total Payable',   fmt(Math.round(totalPayable)),  '#1A237E'],
              ['Principal',       fmt(amount),                    '#388E3C'],
              ['Total Interest',  fmt(Math.round(Math.max(0, totalInterest))), '#C62828'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F5F7FA', borderRadius: '9px' }}>
                <span style={{ fontSize: '14px', color: '#757575' }}>{label}</span>
                <strong style={{ fontSize: '14px', color }}>{val}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Donut Chart */}
      <SectionCard title="Principal vs Interest Breakdown" style={{ marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
              <Cell fill="#1A237E" />
              <Cell fill="#00897B" />
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Amortization Table */}
      <SectionCard title="Amortization Schedule" action={
        <Button variant="ghost" size="sm" onClick={() => setShowAll(s => !s)}>
          {showAll ? 'Show Less' : `Show All ${tenure} Months`}
        </Button>
      } padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#F5F7FA' }}>
                {['Month', 'Principal (₹)', 'Interest (₹)', 'Balance (₹)'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, i) => (
                <tr key={row.month} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFF' }}>
                  <td style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 700, color: '#1A237E' }}>{row.month}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#388E3C' }}>{fmt(row.principal)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#C62828' }}>{fmt(row.interest)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#212121' }}>{fmt(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </Box>
  );
}
