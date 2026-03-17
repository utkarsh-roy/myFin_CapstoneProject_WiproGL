import React, { useState, useEffect } from 'react';
import { loanApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, Button, InputField, AlertBanner } from '../../components/ui';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const LOAN_TYPES = [
  { id: 'HOME',      label: 'Home Loan',      icon: '🏠', rate: 8.5,  desc: 'Own your dream home with flexible tenure up to 30 years.' },
  { id: 'PERSONAL',  label: 'Personal Loan',  icon: '💼', rate: 12.0, desc: 'For emergencies, travel, weddings — no collateral needed.' },
  { id: 'CAR',       label: 'Car Loan',       icon: '🚗', rate: 10.5, desc: 'Drive your dream car with our competitive rates.' },
  { id: 'EDUCATION', label: 'Education Loan', icon: '🎓', rate: 9.0,  desc: 'Invest in yourself — finance your higher education.' },
];

const SECURITY_QUESTIONS = [
    "What is your mother's maiden name?",
    "What was your first school name?",
    "What is your pet's name?",
    "What city were you born in?"
];

const calcEmi = (p, r, n) => {
  if (!p || !r || !n) return 0;
  const m = r / 12 / 100;
  return p * m * Math.pow(1 + m, n) / (Math.pow(1 + m, n) - 1);
};

export default function LoanApplication() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1: Loan Logic
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(60);
  const [emi, setEmi] = useState(0);

  // Step 2: Personal info
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Step 3: Purpose & Verification
  const [loanPurpose, setLoanPurpose] = useState('');
  const [verificationQuestion, setVerificationQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [verificationAnswer, setVerificationAnswer] = useState('');

  const selectedType = LOAN_TYPES.find(t => t.id === selected);
  const rate = selectedType?.rate || 0;

  useEffect(() => {
    if (!amount || !rate || !tenure) { setEmi(0); return; }
    const localEmi = calcEmi(Number(amount), rate, Number(tenure));
    setEmi(localEmi);
  }, [amount, rate, tenure]);

  const validateStep = () => {
      if (step === 1) {
          if (!selected) { toast.error("Please select a loan type"); return false; }
          if (amount < 1000) { toast.error("Min amount is ₹1,000"); return false; }
          return true;
      }
      if (step === 2) {
          if (!age || age < 18 || age > 70) { toast.error("Age must be between 18 and 70"); return false; }
          if (!address) { toast.error("Address is required"); return false; }
          if (!monthlyIncome) { toast.error("Monthly income is required"); return false; }
          return true;
      }
      if (step === 3) {
          if (!loanPurpose) { toast.error("Please state your loan purpose"); return false; }
          if (!verificationAnswer) { toast.error("Verification answer is required"); return false; }
          return true;
      }
      return true;
  };

  const nextStep = () => {
      if (validateStep()) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await loanApi.post('/api/loans/apply', {
        userId: user.userId,
        loanType: selected,
        amount: Number(amount),
        tenure: Number(tenure),
        interestRate: rate,
        applicantName: user.username,
        applicantEmail: user.email,
        age: Number(age),
        address,
        loanPurpose,
        monthlyIncome: Number(monthlyIncome),
        employmentType,
        verificationQuestion,
        verificationAnswer
      });
      setSuccess(true);
      window.dispatchEvent(new Event('loanStatusChanged'));
      toast.success('Loan application submitted for review!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <PageHeader title="Loan Application Status" icon="🏦" />
        <SectionCard>
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✔️</div>
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#2E7D32' }}>Application Received!</h2>
            <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#6B7280', maxWidth: '400px', marginInline: 'auto' }}>
                Your {selectedType?.label} for {fmt(amount)} is now in queue. Our verification team will contact you at <strong>{user.email}</strong> shortly.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/my-loans'}>View Application Timeline</Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader title="Loan Application" icon="🏦" subtitle="Complete the 4-step process to apply for credit" />

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ 
                  flex: 1, height: '4px', borderRadius: '2px',
                  background: s <= step ? '#1A237E' : '#E5E7EB',
                  transition: 'all 0.3s'
              }} />
          ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* STEP 1: LOAN DETAILS */}
          {step === 1 && (
              <>
                <SectionCard title="Step 1: Loan Selection" subtitle="Choose your loan category and set basics">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        {LOAN_TYPES.map(lt => (
                            <div key={lt.id} onClick={() => setSelected(lt.id)} style={{
                                padding: '16px', borderRadius: '12px', cursor: 'pointer',
                                border: `2px solid ${selected === lt.id ? '#1A237E' : '#F3F4F6'}`,
                                background: selected === lt.id ? '#F8FAFF' : '#FFF',
                                transition: '0.2s'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{lt.icon}</div>
                                <div style={{ fontWeight: 800, fontSize: '13px', color: '#1A237E' }}>{lt.label}</div>
                                <div style={{ fontSize: '11px', color: '#757575', marginTop: '4px' }}>{lt.desc}</div>
                                <div style={{ fontSize: '12px', color: '#2E7D32', fontWeight: 800, marginTop: '8px' }}>{lt.rate}% p.a.</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <InputField 
                                label="Requested Amount (₹)" 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(Number(e.target.value))} 
                            />
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 700 }}>Tenure: {tenure} months</label>
                                    <span style={{ fontSize: '12px', color: '#757575' }}>{(tenure/12).toFixed(1)} years</span>
                                </div>
                                <input type="range" min={12} max={360} step={12} value={tenure} onChange={e => setTenure(Number(e.target.value))} style={{ width: '100%', accentColor: '#1A237E' }} />
                            </div>
                        </div>
                        <div style={{ background: '#F8FAFF', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#757575', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated EMI</div>
                            <div style={{ fontSize: '32px', fontWeight: 900, color: '#1A237E', margin: '8px 0' }}>{fmt(emi)}</div>
                            <div style={{ fontSize: '11px', color: '#5C6BC0' }}>* Final EMI subject to approval</div>
                        </div>
                    </div>
                </SectionCard>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="primary" onClick={nextStep}>Personal Details →</Button>
                </div>
              </>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {step === 2 && (
              <>
                <SectionCard title="Step 2: Personal Profile" subtitle="Verify your contact info and personal data">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <InputField label="Full Name" value={user.username} disabled icon="👤" />
                        <InputField label="Email Address" value={user.email} disabled icon="📧" />
                        <InputField label="Age" type="number" placeholder="Between 18-70" value={age} onChange={e => setAge(e.target.value)} icon="🎂" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700 }}>Employment Type</label>
                            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontFamily: 'inherit' }}>
                                <option>Salaried</option>
                                <option>Self-Employed</option>
                                <option>Business Owner</option>
                            </select>
                        </div>
                        <InputField label="Monthly Net Income (₹)" type="number" placeholder="Net salary or profit" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} icon="💰" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700 }}>Current Residential Address</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="House #, Street, City, ZIP" style={{ padding: '12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', minHeight: '80px', fontFamily: 'inherit' }} />
                        </div>
                    </div>
                </SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="ghost" onClick={prevStep}>← Back</Button>
                    <Button variant="primary" onClick={nextStep}>Verification →</Button>
                </div>
              </>
          )}

          {/* STEP 3: PURPOSE & VERIFICATION */}
          {step === 3 && (
              <>
                <SectionCard title="Step 3: Intent & Verification" subtitle="Help us understand your requirement">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700 }}>What is the main purpose of this loan?</label>
                            <textarea value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} placeholder="e.g. Buying a new apartment in Mumbai, Higher studies in London..." style={{ padding: '12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', minHeight: '80px', fontFamily: 'inherit' }} />
                        </div>
                        <Divider />
                        <div style={{ background: '#FFF9C4', padding: '16px', borderRadius: '8px', border: '1px solid #FFF176' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#F57F17' }}>🔒 IDENTITY CHALLENGE</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 700 }}>Security Question</label>
                                    <select value={verificationQuestion} onChange={e => setVerificationQuestion(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #FFD54F', background: '#FFF' }}>
                                        {SECURITY_QUESTIONS.map(q => <option key={q}>{q}</option>)}
                                    </select>
                                </div>
                                <InputField label="Challenge Answer" placeholder="Enter your answer" value={verificationAnswer} onChange={e => setVerificationAnswer(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="ghost" onClick={prevStep}>← Back</Button>
                    <Button variant="primary" onClick={nextStep}>Review Application →</Button>
                </div>
              </>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
              <>
                <SectionCard title="Step 4: Review & Confirm" subtitle="Verify all details before submission">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#757575', marginBottom: '8px' }}>PERSONAL PROFILE</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div><small>Name</small><div style={{ fontSize: '13px', fontWeight: 700 }}>{user.username}</div></div>
                                    <div><small>Age</small><div style={{ fontSize: '13px', fontWeight: 700 }}>{age} yrs</div></div>
                                    <div style={{ gridColumn: 'span 2' }}><small>Address</small><div style={{ fontSize: '13px', fontWeight: 700 }}>{address}</div></div>
                                    <div><small>Employment</small><div style={{ fontSize: '13px', fontWeight: 700 }}>{employmentType}</div></div>
                                    <div><small>Income</small><div style={{ fontSize: '13px', fontWeight: 700 }}>{fmt(monthlyIncome)}</div></div>
                                </div>
                            </div>
                            <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#757575', marginBottom: '8px' }}>LOAN INTENT</div>
                                <p style={{ fontSize: '13px', margin: 0, fontStyle: 'italic' }}>"{loanPurpose}"</p>
                            </div>
                        </div>
                        <div style={{ background: '#1A237E', color: 'white', padding: '24px', borderRadius: '16px' }}>
                            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', opacity: 0.7 }}>PROPOSED EMI</div>
                                <div style={{ fontSize: '36px', fontWeight: 900 }}>{fmt(emi)}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Loan Type</span><strong>{selectedType?.label}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Base Amount</span><strong>{fmt(amount)}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Interest Rate</span><strong>{rate}%</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Tenure</span><strong>{tenure} months</strong></div>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
                            <div style={{ fontSize: '11px', opacity: 0.6, lineHeight: 1.5 }}>
                                By submitting, you agree to MyFin Bank's terms and credit assessment policies.
                            </div>
                        </div>
                    </div>
                </SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="ghost" onClick={prevStep}>← Back</Button>
                    <Button variant="success" onClick={handleSubmit} loading={loading}>Finalize & Submit Application</Button>
                </div>
              </>
          )}
      </div>
    </div>
  );
}

const Divider = () => <div style={{ height: '1px', background: '#F3F4F6', margin: '4px 0' }} />;
