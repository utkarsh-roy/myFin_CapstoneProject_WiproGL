import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ─── Design Tokens (exact brand palette from index.css) ─── */
const C = {
  primary:    '#1A237E',  // Deep Navy Blue
  secondary:  '#0D47A1',  // Royal Blue
  accent:     '#00897B',  // Teal Green
  bg:         '#F5F7FA',  // Light Gray
  white:      '#FFFFFF',
  error:      '#D32F2F',
  success:    '#388E3C',
  text:       '#212121',  // Dark
  textLight:  '#757575',  // Gray
};

/* ─── Shared style helpers ─── */
const S = {
  // NAVBAR
  navbar: (scrolled) => ({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 60px', height: '68px',
    background: scrolled ? C.white : 'transparent',
    boxShadow: scrolled ? '0 2px 16px rgba(26,35,126,0.10)' : 'none',
    transition: 'all 0.35s ease',
    borderBottom: scrolled ? `1px solid rgba(26,35,126,0.08)` : 'none',
  }),
  logoText: {
    fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px',
    color: C.white, textDecoration: 'none',
  },
  logoTextScrolled: {
    fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px',
    color: C.primary, textDecoration: 'none',
  },
  logoMark: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: `linear-gradient(135deg, ${C.accent} 0%, ${C.secondary} 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '17px', fontWeight: 900, color: C.white, marginRight: '10px',
    boxShadow: '0 3px 10px rgba(0,137,123,0.3)',
    flexShrink: 0,
  },
  navLink: (scrolled) => ({
    color: scrolled ? C.textLight : 'rgba(255,255,255,0.85)',
    fontSize: '15px', fontWeight: 500, textDecoration: 'none',
    transition: 'color 0.2s', cursor: 'pointer',
  }),
  btnGhost: (scrolled) => ({
    padding: '8px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    border: `1.5px solid ${scrolled ? C.primary : 'rgba(255,255,255,0.55)'}`,
    color: scrolled ? C.primary : C.white,
    background: 'transparent', textDecoration: 'none', cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  btnFilled: {
    padding: '8px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    background: C.accent, color: C.white, border: 'none',
    textDecoration: 'none', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,137,123,0.32)',
    transition: 'all 0.2s',
  },

  // HERO
  hero: {
    minHeight: '100vh',
    background: `linear-gradient(145deg, ${C.primary} 0%, ${C.secondary} 60%, #1565C0 100%)`,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center',
    padding: '130px 24px 100px', position: 'relative', overflow: 'hidden',
  },

  // SECTIONS
  secWhite: { background: C.white, padding: '96px 60px' },
  secGray:  { background: C.bg,    padding: '96px 60px' },

  tag: {
    fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px',
    textTransform: 'uppercase', color: C.accent,
    textAlign: 'center', marginBottom: '12px',
  },
  h2: {
    fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900,
    color: C.primary, textAlign: 'center',
    marginBottom: '14px', letterSpacing: '-1px',
  },
  lead: {
    fontSize: '17px', color: C.textLight, textAlign: 'center',
    maxWidth: '540px', margin: '0 auto 56px', lineHeight: 1.75,
  },
};

/* ─── NAVBAR ─── */
function Navbar({ scrolled }) {
  return (
    <nav style={S.navbar(scrolled)}>
      {/* Left: Logo */}
      <Link to="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
        <div style={S.logoMark}>M</div>
        <span style={scrolled ? S.logoTextScrolled : S.logoText}>MyFin Bank</span>
      </Link>

      {/* Center: Nav Links */}
      <ul style={{ display:'flex', gap:'32px', listStyle:'none', margin:0, padding:0 }}>
        {['Features','Why Us','About','Contact'].map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase().replace(' ','-')}`} style={S.navLink(scrolled)}
               onMouseEnter={e => e.target.style.color = C.accent}
               onMouseLeave={e => e.target.style.color = scrolled ? C.textLight : 'rgba(255,255,255,0.85)'}
            >{l}</a>
          </li>
        ))}
      </ul>

      {/* Right: CTAs */}
      <div style={{ display:'flex', gap:'12px' }}>
        <Link to="/login"    style={S.btnGhost(scrolled)}>Sign In</Link>
        <Link to="/register" style={S.btnFilled}>Get Started →</Link>
      </div>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section style={S.hero}>
      {/* Decorative circles */}
      {[
        { size:420, top:'-15%', right:'-10%', opacity:.07 },
        { size:280, bottom:'-8%', left:'-6%', opacity:.08 },
        { size:180, top:'30%', left:'12%', opacity:.06 },
      ].map((c,i) => (
        <div key={i} style={{
          position:'absolute', width:c.size, height:c.size, borderRadius:'50%',
          border:`2px solid rgba(255,255,255,${c.opacity * 3})`,
          background:`rgba(255,255,255,${c.opacity})`,
          top:c.top, bottom:c.bottom, left:c.left, right:c.right,
          pointerEvents:'none',
        }} />
      ))}

      <div style={{ position:'relative', zIndex:1, maxWidth:'780px' }}>
        {/* Badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'8px',
          background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)',
          padding:'6px 18px', borderRadius:'100px', color:'rgba(255,255,255,0.92)',
          fontSize:'13px', fontWeight:600, marginBottom:'28px',
          backdropFilter:'blur(8px)',
        }}>
          <span style={{
            width:'7px', height:'7px', borderRadius:'50%',
            background:'#4DB6AC', boxShadow:'0 0 8px #4DB6AC',
            animation:'pulse 2s infinite', display:'inline-block',
          }}/>
          Trusted by 10,000+ customers across India
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:'clamp(40px,7vw,76px)', fontWeight:900, color:C.white,
          lineHeight:1.08, letterSpacing:'-2.5px', marginBottom:'22px',
        }}>
          Banking Reimagined<br />
          <span style={{ color:'#4DB6AC' }}>for the Digital Age</span>
        </h1>

        <p style={{
          fontSize:'18px', color:'rgba(255,255,255,0.72)',
          maxWidth:'560px', margin:'0 auto 40px', lineHeight:1.75,
        }}>
          MyFin Bank delivers a complete digital banking experience — from instant fund transfers and smart investments to loan management and 24/7 live support.
        </p>

        <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" style={{
            padding:'14px 36px', borderRadius:'10px', fontSize:'16px', fontWeight:700,
            background:C.accent, color:C.white, textDecoration:'none',
            boxShadow:'0 6px 24px rgba(0,137,123,0.45)', transition:'all 0.25s',
          }}>Open Free Account</Link>
          <a href="#features" style={{
            padding:'14px 36px', borderRadius:'10px', fontSize:'16px', fontWeight:700,
            background:'rgba(255,255,255,0.12)', color:C.white, textDecoration:'none',
            border:'1.5px solid rgba(255,255,255,0.28)', backdropFilter:'blur(6px)',
          }}>Explore Features</a>
        </div>
      </div>

      {/* Wave divider */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={C.white} />
        </svg>
      </div>
    </section>
  );
}

/* ─── STATS BAR ─── */
function StatsBar() {
  const stats = [
    { num:'₹500Cr+', label:'Transactions Processed' },
    { num:'10K+',    label:'Active Account Holders' },
    { num:'99.9%',   label:'Platform Uptime' },
    { num:'4.9★',    label:'Customer Satisfaction' },
  ];
  return (
    <div style={{
      background:C.white, borderTop:`4px solid ${C.accent}`,
      borderBottom:`1px solid rgba(26,35,126,0.08)`,
    }}>
      <div style={{
        display:'flex', justifyContent:'space-around', flexWrap:'wrap',
        maxWidth:'1100px', margin:'0 auto',
      }}>
        {stats.map((s,i) => (
          <div key={i} style={{ textAlign:'center', padding:'36px 24px' }}>
            <div style={{ fontSize:'38px', fontWeight:900, color:C.primary, letterSpacing:'-1px' }}>
              {s.num}
            </div>
            <div style={{ fontSize:'14px', color:C.textLight, marginTop:'6px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURES ─── */
const features = [
  { icon:'💳', color:C.accent,     title:'Smart Banking Cards',     desc:'Manage virtual and physical debit cards with real-time spend controls, international use, and instant freeze/unfreeze.' },
  { icon:'📊', color:C.secondary,  title:'Investment Portfolio',     desc:'Grow your wealth with Fixed Deposits, Recurring Deposits, and Mutual Fund investments — all in one dashboard.' },
  { icon:'🏦', color:C.primary,    title:'Instant Fund Transfers',   desc:'Send money instantly to any MyFin account. Deposit and withdraw funds seamlessly with full transaction history.' },
  { icon:'📝', color:'#01579B',    title:'Loan Management',          desc:'Apply for personal and home loans with transparent EMI calculation. Track approval status in real time.' },
  { icon:'🔔', color:C.success,    title:'Smart Notifications',      desc:'Get real-time alerts for transactions, loan updates, and account activity delivered directly to your dashboard.' },
  { icon:'💬', color:'#D84315',    title:'24/7 Live Chat Support',   desc:'Connect directly with our support agents through the in-app chat. Get issues resolved within minutes, any time.' },
];

function Features() {
  const [hovered, setHovered] = useState(null);
  return (
    <section id="features" style={S.secGray}>
      <div style={S.tag}>Everything You Need</div>
      <h2 style={S.h2}>Powerful Banking Features</h2>
      <p style={S.lead}>A complete financial ecosystem giving you full control of your money — securely and effortlessly.</p>
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
        gap:'24px', maxWidth:'1100px', margin:'0 auto',
      }}>
        {features.map((f,i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background:C.white, borderRadius:'16px', padding:'32px 28px',
              border:`1.5px solid ${hovered===i ? f.color : 'rgba(26,35,126,0.08)'}`,
              boxShadow: hovered===i ? `0 12px 40px rgba(26,35,126,0.12)` : '0 2px 8px rgba(26,35,126,0.05)',
              transition:'all 0.28s', transform: hovered===i ? 'translateY(-5px)' : 'none',
              cursor:'default',
            }}
          >
            <div style={{
              width:'52px', height:'52px', borderRadius:'14px', fontSize:'24px',
              display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px',
              background:`${f.color}14`,
            }}>{f.icon}</div>
            <h3 style={{ fontSize:'17px', fontWeight:800, color: hovered===i ? f.color : C.primary, marginBottom:'10px' }}>
              {f.title}
            </h3>
            <p style={{ fontSize:'14px', color:C.textLight, lineHeight:1.75, margin:0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── WHY US ─── */
const whyUs = [
  { icon:'🔒', title:'Bank-Grade Security',        desc:'Every transaction is protected by end-to-end encryption, BCrypt password hashing, and JWT-based authentication. Your money is always safe.' },
  { icon:'⚡', title:'Lightning Fast Transactions', desc:'Built on a distributed microservices architecture — deposits, withdrawals, and transfers process in milliseconds, with no downtime.' },
  { icon:'🌐', title:'Always Available',            desc:'99.9% uptime SLA with active monitoring. Access your account from any device, browser, or location, around the clock.' },
  { icon:'📱', title:'Beautiful User Experience',   desc:'A professionally designed, intuitive interface that works for everyone — whether you\'re a first-time saver or a power investor.' },
  { icon:'📈', title:'Wealth Management Tools',     desc:'Track your FD, RD, and Mutual Fund investments, monitor returns, and plan your financial goals from one unified dashboard.' },
  { icon:'🛡️', title:'Regulated & Compliant',      desc:'MyFin adheres to strict data privacy standards and financial compliance protocols to keep your data and assets protected at all times.' },
];

function WhyUs() {
  return (
    <section id="why-us" style={S.secWhite}>
      <div style={S.tag}>Our Advantage</div>
      <h2 style={S.h2}>Why Choose MyFin Bank?</h2>
      <p style={S.lead}>Built with cutting-edge technology and a customer-first philosophy, we deliver banking that's in a class of its own.</p>
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',
        gap:'24px', maxWidth:'1100px', margin:'0 auto',
      }}>
        {whyUs.map((w,i) => (
          <div key={i} style={{
            background:C.bg, borderRadius:'14px', padding:'28px 24px',
            display:'flex', gap:'18px', alignItems:'flex-start',
            border:'1.5px solid rgba(26,35,126,0.06)',
          }}>
            <div style={{
              width:'48px', height:'48px', borderRadius:'12px', fontSize:'22px', flexShrink:0,
              background:`linear-gradient(135deg, ${C.accent} 0%, ${C.secondary} 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:`0 4px 12px rgba(0,137,123,0.28)`,
            }}>{w.icon}</div>
            <div>
              <div style={{ fontSize:'16px', fontWeight:800, color:C.primary, marginBottom:'7px' }}>{w.title}</div>
              <p style={{ fontSize:'14px', color:C.textLight, lineHeight:1.7, margin:0 }}>{w.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ABOUT ─── */
function About() {
  return (
    <section id="about" style={S.secGray}>
      <div style={{ maxWidth:'1060px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center' }}>
        <div>
          <div style={{ ...S.tag, textAlign:'left' }}>Our Story</div>
          <h2 style={{ ...S.h2, textAlign:'left', fontSize:'clamp(26px,3.5vw,40px)' }}>
            Built for the Next Generation of Banking
          </h2>
          <p style={{ fontSize:'15px', color:C.textLight, lineHeight:1.85, marginBottom:'18px' }}>
            MyFin Bank was founded with a single mission — make financial services accessible, transparent, and powerful for everyone. We built our platform from the ground up using modern microservices architecture to ensure scale, reliability, and speed.
          </p>
          <p style={{ fontSize:'15px', color:C.textLight, lineHeight:1.85 }}>
            From day one, we've prioritized your security: BCrypt-encrypted credentials, JWT-secured APIs, and role-based access control ensure your account is never compromised.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[
            { v:'Transparent', sub:'No hidden fees, ever', ic:'✅' },
            { v:'Secure',      sub:'Military-grade encryption', ic:'🔐' },
            { v:'Fast',        sub:'Sub-second processing', ic:'⚡' },
            { v:'Accessible',  sub:'Any device, anytime', ic:'📱' },
          ].map((item,i) => (
            <div key={i} style={{
              background:C.white, borderRadius:'14px', padding:'26px 20px', textAlign:'center',
              border:`1.5px solid rgba(26,35,126,0.08)`,
              boxShadow:'0 2px 10px rgba(26,35,126,0.05)',
            }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>{item.ic}</div>
              <div style={{ fontSize:'16px', fontWeight:800, color:C.primary, marginBottom:'4px' }}>{item.v}</div>
              <div style={{ fontSize:'12px', color:C.textLight }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BANNER ─── */
function CTABanner() {
  return (
    <section style={{
      background:`linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
      padding:'80px 60px', textAlign:'center',
    }}>
      <h2 style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, color:C.white, marginBottom:'14px', letterSpacing:'-1px' }}>
        Ready to Take Control of Your Finances?
      </h2>
      <p style={{ fontSize:'17px', color:'rgba(255,255,255,0.7)', marginBottom:'38px' }}>
        Join thousands of smart savers and investors on MyFin Bank. Open your account in under 2 minutes.
      </p>
      <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
        <Link to="/register" style={{
          padding:'14px 36px', borderRadius:'10px', fontSize:'16px', fontWeight:700,
          background:C.accent, color:C.white, textDecoration:'none',
          boxShadow:'0 6px 24px rgba(0,137,123,0.45)',
        }}>Create Free Account →</Link>
        <Link to="/login" style={{
          padding:'14px 36px', borderRadius:'10px', fontSize:'16px', fontWeight:700,
          background:'rgba(255,255,255,0.12)', color:C.white, textDecoration:'none',
          border:'1.5px solid rgba(255,255,255,0.3)',
        }}>Sign In to Dashboard</Link>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer id="contact" style={{ background:C.primary, padding:'60px 60px 28px' }}>
      <div style={{
        display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
        gap:'40px', maxWidth:'1100px', margin:'0 auto 48px',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={S.logoMark}>M</div>
            <span style={{ ...S.logoText, fontSize:'20px' }}>MyFin Bank</span>
          </div>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.52)', lineHeight:1.85, marginBottom:'20px' }}>
            Your complete digital banking partner — safe, smart, always available. Empowering financial freedom for everyone.
          </p>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {['🔒 RBI Regulated','🛡️ ISO 27001','✅ FDIC Insured'].map((b,i)=>(
              <span key={i} style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.08)', padding:'4px 10px', borderRadius:'6px' }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div style={{ fontSize:'13px', fontWeight:700, color:C.white, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'18px' }}>Products</div>
          {['Savings Account','Fund Transfers','Fixed Deposits','Mutual Funds','Personal Loans','EMI Calculator'].map(l=>(
            <a key={l} href="#" style={{ display:'block', fontSize:'14px', color:'rgba(255,255,255,0.5)', textDecoration:'none', marginBottom:'10px' }}>{l}</a>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize:'13px', fontWeight:700, color:C.white, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'18px' }}>Company</div>
          {['About Us','Careers','Blog','Press','Security','Compliance'].map(l=>(
            <a key={l} href="#" style={{ display:'block', fontSize:'14px', color:'rgba(255,255,255,0.5)', textDecoration:'none', marginBottom:'10px' }}>{l}</a>
          ))}
        </div>

        {/* Support */}
        <div>
          <div style={{ fontSize:'13px', fontWeight:700, color:C.white, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'18px' }}>Support</div>
          {['Help Center','Live Chat','Contact Us','Privacy Policy','Terms of Service'].map(l=>(
            <a key={l} href="#" style={{ display:'block', fontSize:'14px', color:'rgba(255,255,255,0.5)', textDecoration:'none', marginBottom:'10px' }}>{l}</a>
          ))}
          <div style={{ marginTop:'20px' }}>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>Email Us</div>
            <div style={{ fontSize:'14px', color:'#4DB6AC', fontWeight:600 }}>support@myfin.bank</div>
          </div>
        </div>
      </div>

      <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.1)', maxWidth:'1100px', margin:'0 auto' }} />

      <div style={{ maxWidth:'1100px', margin:'22px auto 0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>
          © 2026 MyFin Bank Pvt. Ltd. All rights reserved.
        </div>
        <div style={{ display:'flex', gap:'20px', fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN EXPORT ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ fontFamily:"'Inter', 'Roboto', 'Helvetica Neue', sans-serif", background:C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50% { opacity:.4; }
        }
        a:hover { text-decoration: none !important; }
        * { box-sizing: border-box; }
      `}</style>
      <Navbar scrolled={scrolled} />
      <Hero />
      <StatsBar />
      <Features />
      <WhyUs />
      <About />
      <CTABanner />
      <Footer />
    </div>
  );
}
