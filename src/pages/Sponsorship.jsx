// src/pages/Sponsorship.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerDonation } from '../services/donations';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AnonDonorModal from '../components/AnonDonorModal';
import Footer from '../components/Footer';

// ── Configuración de pagos ──────────────────────────────
const IZIPAY_SOLES = 'https://secure.micuentaweb.pe/vads-site/IZI_Kusimayo';
const IZIPAY_DOLARES = 'https://secure.micuentaweb.pe/vads-site/IZI_KUSIMAYO1';
const PAYPAL_URL = 'https://www.paypal.com/donate?token=i1G0YJS6s3UbdVHvtlKIsFwpFKZtSgR9LHvkjI2K9ZZ4o1vYAPzmn_QjzfD6XwPw_KcUIkHeN_hB7QWi';

const PLANS_BASE = {
  flexible: { name: 'flexible', priceSoles: null, priceDolares: null, description: 'flexible_desc' },
  mensual: { name: 'mensual', priceSoles: 62.5, priceDolares: 40, description: 'mensual_desc' },
  anual: { name: 'anual', priceSoles: 750, priceDolares: 200, description: 'anual_desc' },
};

/* ════════════════════════════════════════════════════════════════════════ */
/* GLOBAL STYLES + ANIMATIONS                                               */
/* ════════════════════════════════════════════════════════════════════════ */

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0);     }
  }

  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0);     }
  }

  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: translateX(0);    }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1);    }
  }

  @keyframes floatY {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-8px); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(158,27,50,0); }
    50%       { box-shadow: 0 0 0 10px rgba(158,27,50,0.15); }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @keyframes heartBeat {
    0%   { transform: scale(1);    }
    14%  { transform: scale(1.15); }
    28%  { transform: scale(1);    }
    42%  { transform: scale(1.1);  }
    70%  { transform: scale(1);    }
  }

  @keyframes rippleOut {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(2.5); opacity: 0;   }
  }

  @keyframes checkDraw {
    from { stroke-dashoffset: 60; }
    to   { stroke-dashoffset: 0;  }
  }

  @keyframes successPop {
    0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
    60%  { transform: scale(1.1) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg);   opacity: 1; }
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%;   }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%;   }
  }

  @keyframes particleFloat {
    0%   { transform: translateY(0) translateX(0) rotate(0deg);   opacity: 0.7; }
    33%  { transform: translateY(-40px) translateX(15px) rotate(120deg); }
    66%  { transform: translateY(-20px) translateX(-10px) rotate(240deg); }
    100% { transform: translateY(-60px) translateX(5px) rotate(360deg); opacity: 0; }
  }

  @keyframes badgePulse {
    0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(158,27,50,0.4); }
    50%       { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(158,27,50,0); }
  }

  @keyframes slideInCard {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1);        }
  }

  @keyframes progressLine {
    from { width: 0%; }
    to   { width: 100%; }
  }

  @keyframes iconSpin {
    0%   { transform: rotate(0deg)   scale(1);    }
    25%  { transform: rotate(10deg)  scale(1.1);  }
    75%  { transform: rotate(-10deg) scale(1.1);  }
    100% { transform: rotate(0deg)   scale(1);    }
  }

  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 0px rgba(158,27,50,0); }
    50%       { text-shadow: 0 0 20px rgba(158,27,50,0.3); }
  }

  @keyframes stepComplete {
    0%   { transform: scale(0) rotate(180deg); opacity: 0; }
    60%  { transform: scale(1.2) rotate(-5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg);    opacity: 1; }
  }

  .plan-card {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .plan-card:hover {
    transform: translateY(-8px) scale(1.02) !important;
    box-shadow: 0 20px 40px rgba(158,27,50,0.18) !important;
  }
  .plan-card.selected {
    animation: pulseGlow 2.5s ease-in-out infinite;
  }

  .method-card {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .method-card:hover {
    transform: translateX(6px) !important;
    border-color: #9E1B32 !important;
    box-shadow: 0 6px 20px rgba(158,27,50,0.15) !important;
  }

  .btn-primary-animated {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .btn-primary-animated::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 0; height: 0;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.55s ease, height 0.55s ease;
  }
  .btn-primary-animated:hover::before {
    /* 400% del ancho cubre cualquier botón sin importar su largo */
    width: 400%;
    height: 400%;
  }
  .btn-primary-animated:hover {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 8px 25px rgba(158,27,50,0.45) !important;
  }
  .btn-primary-animated:active {
    transform: translateY(0) scale(0.98) !important;
  }

  .currency-btn {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .currency-btn:hover {
    transform: scale(1.05) !important;
  }

  .benefit-icon-wrap {
    transition: all 0.3s ease;
  }
  .benefit-icon-wrap:hover {
    animation: iconSpin 0.6s ease;
  }
  .benefit-icon-wrap:hover .benefit-circle {
    animation: floatY 1.5s ease-in-out infinite;
  }

  .step-indicator {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .step-indicator.completed {
    animation: stepComplete 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .float-heart {
    animation: floatY 3s ease-in-out infinite;
  }
  .float-heart-2 {
    animation: floatY 3s ease-in-out infinite 0.8s;
  }
  .float-heart-3 {
    animation: floatY 3s ease-in-out infinite 1.6s;
  }

  .shimmer-btn {
    background: linear-gradient(90deg, #9E1B32 0%, #c4384f 50%, #9E1B32 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
  }

  .header-title {
    animation: fadeInDown 0.7s ease both;
  }
  .header-subtitle {
    animation: fadeInUp 0.7s ease 0.15s both;
  }
  .header-badge {
    animation: scaleIn 0.5s ease both;
  }

  .success-icon {
    animation: successPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .success-title {
    animation: fadeInUp 0.6s ease 0.3s both;
  }
  .success-text {
    animation: fadeInUp 0.6s ease 0.45s both;
  }
  .success-btn {
    animation: fadeInUp 0.6s ease 0.6s both;
  }

  .card-main {
    animation: slideInCard 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: particleFloat linear infinite;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .plans-grid { grid-template-columns: 1fr !important; }
    .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .step-progress { gap: 0.5rem !important; }
    .step-line { width: 24px !important; }
    .card-inner { padding: 1.5rem !important; }
  }
  @media (max-width: 480px) {
    .benefits-grid { grid-template-columns: 1fr 1fr !important; gap: 1.2rem !important; }
    .expiry-cvv-grid { grid-template-columns: 1fr !important; }
    .confirm-btns { flex-direction: column !important; }
  }
`;

/* ════════════════════════════════════════════════════════════════════════ */
/* SVG ICONS                                                                */
/* ════════════════════════════════════════════════════════════════════════ */

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const HeartIcon = ({ size = 18, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const UtensilsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const BookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const HeartPulseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ToiletryIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12v4H6z" />
    <path d="M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
    <path d="M10 11v4" />
    <path d="M14 11v4" />
  </svg>
);

const UsersIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CreditCardIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const PaypalIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 3h7c2.761 0 5 2.239 5 5 0 2.761-2.239 5-5 5h-3l-1 5H7l2-15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M5.5 8h7c2.761 0 5 2.239 5 5 0 2.761-2.239 5-5 5h-3l-1 5H5l2-15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const RefreshIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const EyeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckCircleIcon = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MobileIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const BankIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 2 7 22 7" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════════════ */
/* FLOATING PARTICLES BACKGROUND                                            */
/* ════════════════════════════════════════════════════════════════════════ */

function FloatingParticles() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 6,
    left: 5 + Math.random() * 90,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    opacity: 0.15 + Math.random() * 0.2,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.left}%`,
          bottom: '-10px',
          background: '#9E1B32',
          opacity: p.opacity,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* IZIPAY TOKENIZATION FORM                                                 */
/* ════════════════════════════════════════════════════════════════════════ */

function IzipayTokenForm({ plan, currency, onSuccess, onBack }) {
  const { t: T } = useTranslation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const price = currency === 'soles' ? plan.priceSoles : +(plan.priceSoles / 3.75).toFixed(2);
  const symbol = currency === 'soles' ? 'S/' : '$';

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  const validate = () => {
    const e = {};
    if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = T('Número de tarjeta inválido');
    if (expiry.length < 5) e.expiry = T('Fecha de expiración inválida');
    if (cvv.length < 3) e.cvv = T('CVV inválido');
    if (!cardName.trim()) e.cardName = T('Ingresa el nombre del titular');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    onSuccess();
  };

  const getCardBrand = () => {
    const n = cardNumber.replace(/\s/g, '');
    if (n.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    return null;
  };

  const brand = getCardBrand();

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      <button onClick={onBack} style={backBtn}>
        <ArrowLeftIcon /> {T('Volver a métodos de pago')}
      </button>

      <div style={planSummaryBox(currency)}>
        <div>
          <p style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.2rem' }}>{plan.name}</p>
          <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>{T('Cobro mensual automático')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{price}</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{T('/mes')}</div>
        </div>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', animation: 'fadeInLeft 0.5s ease 0.1s both' }}>
        <span style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }}><ShieldIcon size={18} /></span>
        <div style={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: '1.5' }}>
          <strong>{T('Pago seguro con tokenización.')}</strong> {T('Los datos de tu tarjeta se envían directamente a Izipay y nunca pasan por nuestros servidores. Recibirás un cobro mensual automático de')} <strong>{symbol}{price}</strong>.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ animation: 'fadeInUp 0.4s ease 0.15s both' }}>
          <label style={labelStyle}>{T('Titular de la tarjeta')}</label>
          <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder={T('NOMBRE APELLIDO')} style={{ ...inputStyle, borderColor: errors.cardName ? '#ef4444' : '#d1d5db' }} />
          {errors.cardName && <p style={errorText}>{errors.cardName}</p>}
        </div>

        <div style={{ animation: 'fadeInUp 0.4s ease 0.2s both' }}>
          <label style={labelStyle}>{T('Número de tarjeta')}</label>
          <div style={{ position: 'relative' }}>
            <input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" style={{ ...inputStyle, borderColor: errors.cardNumber ? '#ef4444' : '#d1d5db', paddingRight: '3rem' }} />
            {brand && (
              <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 'bold', color: brand === 'VISA' ? '#1a1f71' : brand === 'Mastercard' ? '#eb001b' : '#2557d6', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', animation: 'scaleIn 0.3s ease both' }}>
                {brand}
              </span>
            )}
          </div>
          {errors.cardNumber && <p style={errorText}>{errors.cardNumber}</p>}
        </div>

        <div className="expiry-cvv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', animation: 'fadeInUp 0.4s ease 0.25s both' }}>
          <div>
            <label style={labelStyle}>{T('Vencimiento (MM/AA)')}</label>
            <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" style={{ ...inputStyle, borderColor: errors.expiry ? '#ef4444' : '#d1d5db' }} />
            {errors.expiry && <p style={errorText}>{errors.expiry}</p>}
          </div>
          <div>
            <label style={labelStyle}>{T('CVV')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showCvv ? 'text' : 'password'} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" style={{ ...inputStyle, borderColor: errors.cvv ? '#ef4444' : '#d1d5db', paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowCvv(v => !v)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                {showCvv ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.cvv && <p style={errorText}>{errors.cvv}</p>}
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={processing} className={processing ? '' : 'btn-primary-animated shimmer-btn'} style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', background: processing ? '#c4a4ab' : '#9E1B32', color: 'white', border: 'none', borderRadius: '10px', cursor: processing ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: processing ? 'none' : '0 4px 12px rgba(158,27,50,0.3)', fontFamily: "'Varela Round', sans-serif" }}>
        {processing ? (
          <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><RefreshIcon size={18} /></span>{T('Procesando...')}</>
        ) : (
          <><LockIcon size={18} />{T('Confirmar apadrinamiento')} — {symbol}{price}{T('/mes')}</>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
        <LockIcon size={13} /> {T('Pago encriptado y procesado por Izipay')}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                            */
/* ════════════════════════════════════════════════════════════════════════ */

function Sponsorship() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t: T } = useTranslation();

  const [currency, setCurrency] = useState('soles');
  const [showPlans, setShowPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [donationType, setDonationType] = useState('sponsorship');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [flexAmount, setFlexAmount] = useState('');
  const [flexType, setFlexType] = useState('unico');
  const [flexError, setFlexError] = useState('');
  const [skipAuth, setSkipAuth] = useState(false);
  const [showAnonModal, setShowAnonModal] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('sponsorship_return');
    const isSkip = sessionStorage.getItem('sponsorship_skipAuth') === 'true';
    if (saved && (user || isSkip)) {
      try {
        const { selectedPlan: sp, currency: c, flexAmount: fa, method: m, step: s } = JSON.parse(saved);
        if (sp) setSelectedPlan(sp);
        if (c) setCurrency(c);
        if (fa) setFlexAmount(fa);
        if (isSkip) {
          setSkipAuth(true);
          setShowPlans(false);
          if (m) { setMethod(m); setStep(2); } else { setStep(1); }
        } else if (m) {
          setMethod(m); setShowPlans(false); setStep(s || 2);
        } else if (sp) {
          setShowPlans(false);
        }
        sessionStorage.removeItem('sponsorship_return');
        sessionStorage.removeItem('sponsorship_skipAuth');
      } catch { }
    }
  }, [user]);

  const symbol = currency === 'soles' ? 'S/' : '$';
  const getPrice = (priceSoles, priceDolares) => currency === 'soles' ? priceSoles : priceDolares;

  const plans = {
    flexible: { ...PLANS_BASE.flexible, name: T('Donación Flexible'), description: T('Elige el monto que deseas aportar mensualmente'), price: null },
    mensual:  { ...PLANS_BASE.mensual,  name: T('Apadrinamiento Mensual'),  description: T('Apoyo completo y seguimiento'),  price: getPrice(PLANS_BASE.mensual.priceSoles, PLANS_BASE.mensual.priceDolares) },
    anual:    { ...PLANS_BASE.anual,    name: T('Apadrinamiento Anual'),    description: T('Impacto a un niño durante un año'),    price: getPrice(750, 200) },
  };

  const getEffectivePrice = () => {
    if (selectedPlan === 'flexible') { const v = parseFloat(flexAmount); return isNaN(v) ? null : v; }
    return plans[selectedPlan]?.price ?? null;
  };

  const currentPlan = selectedPlan ? { ...plans[selectedPlan], price: getEffectivePrice() } : null;

  const buildIzipayUrl = () => {
    const base = currency === 'soles' ? IZIPAY_SOLES : IZIPAY_DOLARES;
    const email = user?.email || '';
    const name = user?.displayName || '';
    return `${base}?vads_cust_email=${encodeURIComponent(email)}&vads_amount=${currentPlan?.price}&vads_cust_first_name=${encodeURIComponent(name)}`;
  };

  const handleConfirm = async (anonymousName) => {
    setLoading(true);
    setShowAnonModal(false);
    try {
      await registerDonation({
        userId: user?.uid || 'anonimo',
        email: user?.email || null,
        amount: currentPlan?.price,
        type: donationType,
        method,
        currency,
        status: 'pending_verification',
        isAnonymous: !user,
        anonymousName: user ? null : anonymousName,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1); setMethod(null); setSelectedPlan(null);
    setDonationType('sponsorship'); setSuccess(false); setShowPlans(true);
    setFlexAmount(''); setFlexType('unico'); setFlexError('');
    window.scrollTo(0, 0);
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <>
        <style>{globalCSS}</style>
        <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: "'Varela Round', sans-serif", position: 'relative', overflow: 'hidden' }}>
          <FloatingParticles />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="success-icon" style={{ color: '#9E1B32', marginBottom: '1rem', display: 'inline-block' }}>
              <CheckCircleIcon size={64} />
            </div>
            <h2 className="success-title" style={{ color: '#9E1B32', marginBottom: '1rem', fontSize: '1.8rem' }}>{T('¡Gracias por tu apadrinamiento!')}</h2>
            <p className="success-text" style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              {T('Tu aporte ha sido registrado y será verificado pronto. ¡Juntos transformamos vidas!')}
            </p>
            <button onClick={resetAll} className="success-btn btn-primary-animated shimmer-btn" style={{ ...btnPrimary, display: 'inline-flex', width: 'auto', padding: '0.9rem 2.5rem', alignItems: 'center', gap: '0.5rem' }}>
              <HeartIcon size={16} filled /> {T('Hacer otro apadrinamiento')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: "'Varela Round', sans-serif", position: 'relative' }}>

        <button onClick={() => navigate('/')} style={{ ...backBtn, animation: 'fadeInLeft 0.5s ease both' }}>
          <ArrowLeftIcon /> {T('Volver al inicio')}
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="header-badge" style={{ ...badgeStyle, animation: 'badgePulse 3s ease-in-out infinite' }}>
            {T('Programa de Apadrinamiento')}
          </div>
          <h1 className="header-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontWeight: 'bold', color: '#1a1a1a', margin: '1rem 0' }}>
            {T('Apadrina a un niño permanentemente')}
          </h1>
          <p className="header-subtitle" style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            {T('Tu apadrinamiento garantiza desayunos, útiles y seguimiento continuo. Un compromiso mensual que cambia vidas para siempre.')}
          </p>
        </div>

        {/* Currency Selector */}
        {showPlans && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease 0.2s both' }}>
            <div style={{ display: 'inline-flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px', gap: '4px' }}>
              {['soles', 'dolares'].map(c => (
                <button key={c} onClick={() => setCurrency(c)} className="currency-btn" style={{ padding: '0.55rem 1.8rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', background: currency === c ? '#9E1B32' : 'transparent', color: currency === c ? 'white' : '#6b7280', boxShadow: currency === c ? '0 2px 8px rgba(158,27,50,0.25)' : 'none', fontFamily: "'Varela Round', sans-serif", transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  {c === 'soles' ? T('🇵🇪 Soles (S/)') : T('🇺🇸 Dólares ($)')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PANTALLA 1: PLANES ═══ */}
        {showPlans && (
          <div>
            <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>

              {/* FLEXIBLE */}
              <div className={`plan-card ${selectedPlan === 'flexible' ? 'selected' : ''}`} onClick={() => setSelectedPlan('flexible')} style={{ background: selectedPlan === 'flexible' ? '#fce7f3' : 'white', border: `2px solid ${selectedPlan === 'flexible' ? '#9E1B32' : '#e5e7eb'}`, borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer', position: 'relative', minHeight: '340px', display: 'flex', flexDirection: 'column', animation: 'slideInCard 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#9E1B32' }}>{T('Apadrina a tu manera')}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{T('monto libre')}</div>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>{T('Donación Flexible')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>{T('Elige el monto que deseas aportar mensualmente')}</p>
                <div onClick={e => e.stopPropagation()} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.82rem' }}>{T('Ingresa el monto')}</label>
                    {flexError && <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '600', animation: 'scaleIn 0.3s ease both' }}>{flexError}</span>}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9E1B32', fontWeight: 'bold', fontSize: '0.9rem' }}>{symbol}</span>
                    <input type="number" placeholder={currency === 'soles' ? '20' : '6'} value={flexAmount} onChange={e => { const val = e.target.value; setFlexAmount(val); setSelectedPlan('flexible'); const min = currency === 'soles' ? 20 : 6; const v = parseFloat(val); if (val !== '' && (isNaN(v) || v < min)) { setFlexError(T('Mínimo') + ` ${currency === 'soles' ? 'S/20' : '$6'}`); } else { setFlexError(''); } }} style={{ padding: '0.55rem 0.9rem 0.55rem 1.8rem', width: '100%', borderRadius: '8px', border: `1.5px solid ${flexError ? '#ef4444' : '#d1d5db'}`, fontSize: '0.9rem', outline: 'none', fontFamily: "'Varela Round', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                  </div>
                </div>
                {selectedPlan === 'flexible' && (
                  <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto auto 0', color: 'white', animation: 'stepComplete 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    <CheckIcon size={16} />
                  </div>
                )}
              </div>

              {/* MENSUAL */}
              <div className={`plan-card ${selectedPlan === 'mensual' ? 'selected' : ''}`} onClick={() => setSelectedPlan('mensual')} style={{ background: selectedPlan === 'mensual' ? '#fce7f3' : 'white', border: `2px solid ${selectedPlan === 'mensual' ? '#9E1B32' : '#e5e7eb'}`, borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer', position: 'relative', minHeight: '340px', animation: 'slideInCard 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#9E1B32', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', whiteSpace: 'nowrap', animation: 'badgePulse 2.5s ease-in-out infinite' }}>
                  {T('Recomendado')}
                </div>
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                  <div style={{ color: '#9E1B32', display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{symbol}{plans.mensual.price}</span>
                    <sub style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 'normal', bottom: 0 }}>{T('/mes')}</sub>
                  </div>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>{T('Apadrinamiento Mensual')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>{T('Pago mensual recurrente')}</p>
                <div>
                  {[{ icon: <UtensilsIcon size={16} />, text: T('Desayunos nutritivos diarios') }, { icon: <BookIcon size={16} />, text: T('Acompañamiento a madres y docentes') }, { icon: <HeartPulseIcon size={16} />, text: T('Monitoreo permanente') }, { icon: <ToiletryIcon  size={16} />, text: T('Kits de aseo y útiles') }].map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
                      <span style={{ color: '#9E1B32', flexShrink: 0 }}>{b.icon}</span>
                      <span style={{ fontSize: '0.82rem', color: '#4b5563' }}>{b.text}</span>
                    </div>
                  ))}
                </div>
                {selectedPlan === 'mensual' && (
                  <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 0', color: 'white', animation: 'stepComplete 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    <CheckIcon size={16} />
                  </div>
                )}
              </div>

              {/* ANUAL */}
              <div className={`plan-card ${selectedPlan === 'anual' ? 'selected' : ''}`} onClick={() => setSelectedPlan('anual')} style={{ background: selectedPlan === 'anual' ? '#fce7f3' : 'white', border: `2px solid ${selectedPlan === 'anual' ? '#9E1B32' : '#e5e7eb'}`, borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer', position: 'relative', minHeight: '340px', animation: 'slideInCard 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                  <div style={{ color: '#9E1B32', display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{symbol}{plans.anual.price}</span>
                    <sub style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 'normal', bottom: 0 }}>{T('/año')}</sub>
                  </div>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>{T('Apadrinamiento Anual')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>{T('Pago único anual')}</p>
                <div>
                  {[{ icon: <UtensilsIcon size={16} />, text: T('Desayunos nutritivos diarios') }, { icon: <BookIcon size={16} />, text: T('Acompañamiento a madres y docentes') }, { icon: <HeartPulseIcon size={16} />, text: T('Monitoreo permanente') }, { icon: <ToiletryIcon  size={16} />, text: T('Kits de aseo y útiles') }].map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
                      <span style={{ color: '#9E1B32', flexShrink: 0 }}>{b.icon}</span>
                      <span style={{ fontSize: '0.82rem', color: '#4b5563' }}>{b.text}</span>
                    </div>
                  ))}
                </div>
                {selectedPlan === 'anual' && (
                  <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 0', color: 'white', animation: 'stepComplete 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    <CheckIcon size={16} />
                  </div>
                )}
              </div>
            </div>

            {/* Botón continuar */}
            {selectedPlan && (
              <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                {(() => {
                  const min = currency === 'soles' ? 20 : 6;
                  const v = parseFloat(flexAmount);
                  const flexInvalid = selectedPlan === 'flexible' && (!flexAmount || isNaN(v) || v < min || !!flexError);
                  return (
                    <button disabled={flexInvalid} onClick={() => { if (!flexInvalid) { setShowPlans(false); window.scrollTo(0, 0); } }} className={flexInvalid ? '' : 'btn-primary-animated shimmer-btn'} style={{ background: flexInvalid ? '#d1d5db' : '#9E1B32', color: flexInvalid ? '#9ca3af' : 'white', padding: '1rem 3rem', borderRadius: '10px', border: 'none', cursor: flexInvalid ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.05rem', boxShadow: flexInvalid ? 'none' : '0 4px 12px rgba(158,27,50,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Varela Round', sans-serif" }}>
                      {selectedPlan === 'flexible' && `${T('Continuar con')} ${symbol}${flexAmount || '...'}`}
                      {selectedPlan === 'mensual' && `${T('Continuar con')} ${symbol}${plans.mensual.price}${T('/mes')}`}
                      {selectedPlan === 'anual' && `${T('Continuar con')} ${symbol}${plans.anual.price}${T('/año')}`}
                      <ArrowRightIcon />
                    </button>
                  );
                })()}
              </div>
            )}

            {/* ¿A dónde va? */}
            <div style={{ background: '#fafafa', padding: '3rem 2rem', borderRadius: '16px', marginBottom: '3rem', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem', color: '#1a1a1a' }}>
                {T('¿A dónde va tu apadrinamiento?')}
              </h2>
              <div className="benefits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                <BenefitIcon icon={<UtensilsIcon size={28} />} title={T('Alimentación')} subtitle={T('Desayunos diarios nutritivos')} delay="0s" />
                <BenefitIcon icon={<BookIcon size={28} />} title={T('Educación')} subtitle={T('Útiles y materiales escolares')} delay="0.1s" />
                <BenefitIcon icon={<HeartPulseIcon size={28} />} title={T('Salud')} subtitle={T('Controles y atención médica')} delay="0.2s" />
                <BenefitIcon icon={<UsersIcon size={28} />} title={T('Acompañamiento')} subtitle={T('Seguimiento continuo')} delay="0.3s" />
              </div>
            </div>
          </div>
        )}

        {/* ═══ PANTALLA 2: MÉTODOS DE PAGO ═══ */}
        {!showPlans && (
          <div className="card-main">
            <button onClick={() => { setShowPlans(true); setStep(1); setMethod(null); window.scrollTo(0, 0); }} style={{ ...backBtn, animation: 'fadeInLeft 0.4s ease both' }}>
              <ArrowLeftIcon /> {T('Volver a planes')}
            </button>

            {/* Progress */}
            <div className="step-progress" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <StepIndicator number={1} active completed />
              <div style={{ width: '40px', height: '2px', background: '#9E1B32', borderRadius: '2px', transition: 'background 0.4s' }} className="step-line" />
              <StepIndicator number={2} active={step >= 2} completed={step > 2} />
              <div style={{ width: '40px', height: '2px', background: step >= 3 ? '#9E1B32' : '#e5e7eb', borderRadius: '2px', transition: 'background 0.4s' }} className="step-line" />
              <StepIndicator number={3} active={step === 3} />
            </div>

            {/* Card */}
            <div className="card-inner" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxWidth: '680px', margin: '0 auto' }}>

              {/* ── PASO 1: elegir método ── */}
              {step === 1 && (
                <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#1a1a1a' }}>{T('Método de pago')}</h2>
                  <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>{T('Elige cómo deseas realizar tu apadrinamiento mensual.')}</p>

                  <div style={planSummaryBox(currency)}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>{currentPlan?.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{T('/mes')}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currency === 'soles' && (
                      <MethodCard icon={<CreditCardIcon size={22} />} label="Izipay" sub={T('Pago con tarjeta vía pasarela Izipay')} badge={T('Soles')} onClick={() => { setMethod('izipay-redirect'); setStep(2); window.scrollTo(0, 0); }} delay="0.1s" />
                    )}
                    {currency === 'dolares' && (<>
                      <MethodCard icon={<CreditCardIcon size={22} />} label="Izipay" sub={T('Pago con tarjeta vía pasarela Izipay')} badge={T('Dólares')} onClick={() => { setMethod('izipay-redirect'); setStep(2); window.scrollTo(0, 0); }} delay="0.1s" />
                      <MethodCard icon={<PaypalIcon size={22} />} label="PayPal" sub={T('Paga de forma segura con tu cuenta PayPal')} badge={T('Dólares')} onClick={() => { setMethod('paypal'); setStep(2); window.scrollTo(0, 0); }} delay="0.2s" />
                    </>)}
                  </div>
                </div>
              )}

              {/* ── PASO 2: detalle del método ── */}
              {step === 2 && (
                <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
                  <button onClick={() => setStep(1)} style={backBtn}>
                    <ArrowLeftIcon /> {T('Volver')}
                  </button>

                  {method === 'yape' && (
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MobileIcon size={20} /> {T('Yape / Plin')}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{T('Yapea o realiza un Plin al siguiente número.')}</p>
                      <div style={planSummaryBox(currency)}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>{T('Monto a enviar')}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                        </div>
                      </div>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.2rem 1.4rem', marginBottom: '1.5rem', animation: 'scaleIn 0.4s ease both' }}>
                        <p style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem' }}>{T('Número de Yape / Plin:')}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9E1B32', marginBottom: '0.5rem' }}>966 796 532</p>
                        <p style={{ fontSize: '0.85rem', color: '#166534' }}>{T('A nombre de:')} <strong>KUSIMAYO PERÚ</strong></p>
                      </div>
                      <button onClick={() => { if (!user && !skipAuth) { sessionStorage.setItem('sponsorship_return', JSON.stringify({ selectedPlan, currency, flexAmount, method, step: 2 })); navigate('/mi-cuenta'); return; } setStep(3);  window.scrollTo(0, 0);}} className="btn-primary-animated shimmer-btn" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckIcon size={16} /> {T('Ya realicé el Yape / Plin')}
                      </button>
                    </div>
                  )}

                  {method === 'transferencia' && (
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BankIcon size={20} /> {T('Transferencia bancaria')}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{T('Realiza la transferencia a la siguiente cuenta.')}</p>
                      <div style={planSummaryBox(currency)}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>{T('Monto a transferir')}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                        </div>
                      </div>
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem 1.4rem', marginBottom: '1rem', animation: 'fadeInLeft 0.4s ease 0.1s both' }}>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{T('BCP — Soles')}</p>
                        <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>{T('Cuenta:')} <strong>193-1785158-0-97</strong></p>
                        <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>{T('CCI:')} <strong>00219300178515809711</strong></p>
                      </div>
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem 1.4rem', marginBottom: '1.5rem', animation: 'fadeInLeft 0.4s ease 0.2s both' }}>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{T('BCP — Dólares')}</p>
                        <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>{T('Cuenta:')} <strong>193-1786425-1-05</strong></p>
                        <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>{T('CCI:')} <strong>00219300178642510517</strong></p>
                      </div>
                      <button onClick={() => { if (!user && !skipAuth) { sessionStorage.setItem('sponsorship_return', JSON.stringify({ selectedPlan, currency, flexAmount, method, step: 2 })); navigate('/mi-cuenta'); return; } setStep(3); window.scrollTo(0, 0); }} className="btn-primary-animated shimmer-btn" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckIcon size={16} /> {T('Ya realicé la transferencia')}
                      </button>
                    </div>
                  )}

                  {method === 'izipay-redirect' && (
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCardIcon size={20} /> {T('Pagar con Izipay')}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{T('Serás redirigido a la pasarela de pago segura de Izipay.')}</p>
                      <div style={planSummaryBox(currency)}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>{T('Cobro mensual')}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{T('/mes')}</div>
                        </div>
                      </div>
                      <button onClick={() => { if (!user && !skipAuth) { sessionStorage.setItem('sponsorship_return', JSON.stringify({ selectedPlan, currency, flexAmount, method, step: 2 })); navigate('/mi-cuenta'); return; } window.open(buildIzipayUrl(), '_blank'); setStep(3); window.scrollTo(0, 0);}} className="btn-primary-animated shimmer-btn" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <LockIcon size={16} />
                        {T('Ir a pagar con Izipay')} — {symbol}{currentPlan?.price}
                      </button>
                    </div>
                  )}

                  {method === 'izipay-token' && (
                    <IzipayTokenForm plan={currentPlan} currency={currency} onSuccess={() => { setSuccess(true); }} onBack={() => setStep(1)} />
                  )}

                  {method === 'paypal' && (
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PaypalIcon size={20} /> {T('Pagar con PayPal')}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{T('Serás redirigido a PayPal para completar tu donación en dólares.')}</p>
                      <div style={planSummaryBox('dolares')}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>{T('Monto en dólares (USD)')}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>
                            ${selectedPlan === 'flexible' ? Math.ceil(parseFloat(flexAmount || 0) / 3.75) : plans[selectedPlan]?.price !== null ? (currency === 'soles' ? Math.ceil(plans[selectedPlan].price / 3.75) : plans[selectedPlan].price) : '—'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>USD</div>
                        </div>
                      </div>
                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#92400e', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
                        <strong>{T('Importante')}:</strong> {T('PayPal procesa pagos en dólares. Una vez en la página de PayPal, ingresa el monto en USD que aparece arriba.')}
                      </div>
                      <button onClick={() => { if (!user && !skipAuth) { sessionStorage.setItem('sponsorship_return', JSON.stringify({ selectedPlan, currency, flexAmount, method, step: 2 })); navigate('/mi-cuenta'); return; } window.open(PAYPAL_URL, '_blank'); setStep(3); window.scrollTo(0, 0);}} className="btn-primary-animated shimmer-btn" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <LockIcon size={16} />
                        {T('Ir a PayPal')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── PASO 3: confirmación ── */}
              {step === 3 && (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', animation: 'fadeInUp 0.5s ease both' }}>
                  <div style={{ color: '#9E1B32', marginBottom: '1rem', animation: 'successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    <CheckCircleIcon size={56} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#1a1a1a' }}>{T('¿Completaste el pago?')}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    {T('Una vez realizado el pago, confírmalo aquí para registrar tu apadrinamiento.')}
                  </p>
                  <div className="confirm-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => { setStep(1); setShowPlans(true); setMethod(null); window.scrollTo(0, 0); }} style={{ background: 'transparent', border: '2px solid #e5e7eb', padding: '0.85rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', color: '#4b5563', fontFamily: "'Varela Round', sans-serif", transition: 'all 0.2s' }}>
                      {T('Cancelar')}
                    </button>
                    <button onClick={() => { if (!user) { setShowAnonModal(true); return; } handleConfirm(null); }} disabled={loading} className={loading ? '' : 'btn-primary-animated shimmer-btn'} style={{ background: '#9E1B32', color: 'white', padding: '0.85rem 2rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Varela Round', sans-serif" }}>
                      {loading ? (
                        <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><RefreshIcon size={16} /></span> {T('Registrando...')}</>
                      ) : (
                        <><CheckIcon size={16} /> {T('Sí, ya pagué')}</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showAnonModal && (
          <AnonDonorModal onConfirm={(name) => handleConfirm(name)} onClose={() => setShowAnonModal(false)} />
        )}
      </div>
      <Footer />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* HELPER COMPONENTS                                                         */
/* ════════════════════════════════════════════════════════════════════════ */

function BenefitIcon({ icon, title, subtitle, delay = '0s' }) {
  return (
    <div className="benefit-icon-wrap" style={{ textAlign: 'center', animation: `fadeInUp 0.5s ease ${delay} both` }}>
      <div className="benefit-circle" style={{ width: '64px', height: '64px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'white', transition: 'all 0.3s ease' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#1a1a1a' }}>{title}</h3>
      <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>{subtitle}</p>
    </div>
  );
}

function StepIndicator({ number, active, completed }) {
  return (
    <div className={`step-indicator ${completed ? 'completed' : ''}`} style={{ width: '40px', height: '40px', borderRadius: '50%', background: completed || active ? '#9E1B32' : '#e5e7eb', color: completed || active ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
      {completed ? <CheckIcon size={16} /> : number}
    </div>
  );
}

function MethodCard({ icon, label, sub, badge, badgeColor = '#9E1B32', onClick, delay = '0s' }) {
  return (
    <button onClick={onClick} className="method-card" style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '1.1rem 1.4rem', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', fontFamily: "'Varela Round', sans-serif", animation: `fadeInRight 0.4s ease ${delay} both` }}>
      <span style={{ color: '#9E1B32', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>{sub}</div>
      </div>
      {badge && <span style={{ background: badgeColor, color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.25rem 0.65rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>{badge}</span>}
      <span style={{ color: '#9ca3af', flexShrink: 0 }}><ArrowRightIcon /></span>
    </button>
  );
}

/* ── Estilos reutilizables ── */
const btnPrimary = { width: '100%', padding: '0.85rem', background: '#9E1B32', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)', fontFamily: "'Varela Round', sans-serif" };
const inputStyle = { padding: '0.65rem 0.9rem', width: '100%', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '0.95rem', outline: 'none', fontFamily: "'Varela Round', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s' };
const labelStyle = { fontWeight: 'bold', marginBottom: '0.45rem', color: '#374151', display: 'block', fontSize: '0.88rem' };
const errorText = { color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', margin: '0.3rem 0 0' };
const badgeStyle = { display: 'inline-block', background: '#fce7f3', color: '#9E1B32', padding: '0.5rem 1.5rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 'bold' };
const backBtn = { background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.92rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, fontFamily: "'Varela Round', sans-serif" };
const planSummaryBox = (currency) => ({ background: currency === 'soles' ? '#fafafa' : '#f0f9ff', border: `1px solid ${currency === 'soles' ? '#e5e7eb' : '#bae6fd'}`, padding: '1rem 1.4rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });


export default Sponsorship;