// src/pages/Sponsorship.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerDonation } from '../services/donations';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// ── Configuración de pagos ──────────────────────────────
const IZIPAY_SOLES = 'https://secure.micuentaweb.pe/vads-site/IZI_Kusimayo';
const IZIPAY_DOLARES = 'https://secure.micuentaweb.pe/vads-site/IZI_KUSIMAYO1';
// CAMBIO 1: URL PayPal actualizada
const PAYPAL_URL = 'https://www.paypal.com/donate?token=i1G0YJS6s3UbdVHvtlKIsFwpFKZtSgR9LHvkjI2K9ZZ4o1vYAPzmn_QjzfD6XwPw_KcUIkHeN_hB7QWi';

const PLANS_BASE = {
  flexible: { name: 'Donación Flexible', priceSoles: null, priceDolares: null, description: 'Elige el monto que deseas aportar' },
  mensual: { name: 'Apadrinamiento Mensual', priceSoles: 62.5, priceDolares: 40, description: 'Apoyo completo y seguimiento' },
  anual: { name: 'Apadrinamiento Anual', priceSoles: 750, priceDolares: 200, description: 'Impacto a un niño durante un año' },
};

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

const UsersIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const HomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
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
/* IZIPAY TOKENIZATION FORM                                                 */
/* ════════════════════════════════════════════════════════════════════════ */

function IzipayTokenForm({ plan, currency, onSuccess, onBack }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const price = currency === 'soles'
    ? plan.priceSoles
    : +(plan.priceSoles / EXCHANGE_RATE).toFixed(2);
  const symbol = currency === 'soles' ? 'S/' : '$';

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validate = () => {
    const e = {};
    if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Número de tarjeta inválido';
    if (expiry.length < 5) e.expiry = 'Fecha de expiración inválida';
    if (cvv.length < 3) e.cvv = 'CVV inválido';
    if (!cardName.trim()) e.cardName = 'Ingresa el nombre del titular';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setProcessing(true);
    // Simulación de tokenización — aquí integrarías el SDK real de Izipay
    // El SDK envía los datos de tarjeta directamente a Izipay y retorna un token
    // Tu servidor nunca ve la tarjeta real
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
    <div>
      <button onClick={onBack} style={backBtn}>
        <ArrowLeftIcon /> Volver a métodos de pago
      </button>

      {/* Resumen del plan */}
      <div style={planSummaryBox(currency)}>
        <div>
          <p style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.2rem' }}>{plan.name}</p>
          <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>Cobro mensual automático</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>
            {symbol}{price}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>/ mes</div>
        </div>
      </div>

      {/* Aviso tokenización */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '0.9rem 1.2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start'
      }}>
        <span style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }}><ShieldIcon size={18} /></span>
        <div style={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: '1.5' }}>
          <strong>Pago seguro con tokenización.</strong> Los datos de tu tarjeta se envían
          directamente a Izipay y nunca pasan por nuestros servidores. Recibirás un cobro
          mensual automático de <strong>{symbol}{price}</strong>.
        </div>
      </div>

      {/* Formulario */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Nombre del titular */}
        <div>
          <label style={labelStyle}>Titular de la tarjeta</label>
          <input
            value={cardName}
            onChange={e => setCardName(e.target.value.toUpperCase())}
            placeholder="NOMBRE APELLIDO"
            style={{ ...inputStyle, borderColor: errors.cardName ? '#ef4444' : '#d1d5db' }}
          />
          {errors.cardName && <p style={errorText}>{errors.cardName}</p>}
        </div>

        {/* Número de tarjeta */}
        <div>
          <label style={labelStyle}>Número de tarjeta</label>
          <div style={{ position: 'relative' }}>
            <input
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              placeholder="0000 0000 0000 0000"
              style={{ ...inputStyle, borderColor: errors.cardNumber ? '#ef4444' : '#d1d5db', paddingRight: '3rem' }}
            />
            {brand && (
              <span style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                fontSize: '0.7rem', fontWeight: 'bold', color: brand === 'VISA' ? '#1a1f71' : brand === 'Mastercard' ? '#eb001b' : '#2557d6',
                background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px'
              }}>
                {brand}
              </span>
            )}
          </div>
          {errors.cardNumber && <p style={errorText}>{errors.cardNumber}</p>}
        </div>

        {/* Expiry + CVV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Vencimiento (MM/AA)</label>
            <input
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              style={{ ...inputStyle, borderColor: errors.expiry ? '#ef4444' : '#d1d5db' }}
            />
            {errors.expiry && <p style={errorText}>{errors.expiry}</p>}
          </div>
          <div>
            <label style={labelStyle}>CVV</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCvv ? 'text' : 'password'}
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                style={{ ...inputStyle, borderColor: errors.cvv ? '#ef4444' : '#d1d5db', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowCvv(v => !v)}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                {showCvv ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {errors.cvv && <p style={errorText}>{errors.cvv}</p>}
          </div>
        </div>
      </div>

      {/* Botón pagar */}
      <button
        onClick={handleSubmit}
        disabled={processing}
        style={{
          width: '100%',
          marginTop: '1.5rem',
          padding: '0.9rem',
          background: processing ? '#c4a4ab' : '#9E1B32',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: processing ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s',
          boxShadow: processing ? 'none' : '0 4px 12px rgba(158,27,50,0.3)'
        }}
      >
        {processing ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><RefreshIcon size={18} /></span>
            Procesando...
          </>
        ) : (
          <>
            <LockIcon size={18} />
            Confirmar apadrinamiento — {symbol}{price}/mes
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
        <LockIcon size={13} /> Pago encriptado y procesado por Izipay
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
          if (m) { setMethod(m); setStep(2); }
          else { setStep(1); }
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

  const getPrice = (priceSoles, priceDolares) =>
    currency === 'soles' ? priceSoles : priceDolares;

  const plans = {
    flexible: { ...PLANS_BASE.flexible, price: null },
    mensual: { ...PLANS_BASE.mensual, price: getPrice(PLANS_BASE.mensual.priceSoles, PLANS_BASE.mensual.priceDolares) },
    anual: { ...PLANS_BASE.anual, price: getPrice(750, 200) },
  };

  // Precio efectivo según plan
  const getEffectivePrice = () => {
    if (selectedPlan === 'flexible') {
      const v = parseFloat(flexAmount);
      return isNaN(v) ? null : v;
    }
    return plans[selectedPlan]?.price ?? null;
  };

  const currentPlan = selectedPlan ? { ...plans[selectedPlan], price: getEffectivePrice() } : null;

  const buildIzipayUrl = () => {
    const base = currency === 'soles' ? IZIPAY_SOLES : IZIPAY_DOLARES;
    const email = user?.email || '';
    const name = user?.displayName || '';
    return `${base}?vads_cust_email=${encodeURIComponent(email)}&vads_amount=${currentPlan?.price}&vads_cust_first_name=${encodeURIComponent(name)}`;
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const docRef = await registerDonation({
        userId: user?.uid || 'anonimo',
        email: user?.email || 'anonimo@kusimayo.pe',
        amount: currentPlan?.price,
        type: donationType,
        method,
        currency,
        status: 'pending_verification',
        isAnonymous: !user,
      });

      // Actualiza el documento con su propio ID
      if (docRef?.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        await updateDoc(doc(db, 'donations', docRef.id), { id: docRef.id });
      }
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
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: "'Varela Round', sans-serif" }}>
        <div style={{ color: '#9E1B32', marginBottom: '1rem' }}><CheckCircleIcon size={64} /></div>
        <h2 style={{ color: '#9E1B32', marginBottom: '1rem', fontSize: '1.8rem' }}>¡Gracias por tu apadrinamiento!</h2>
        <p style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          Tu aporte ha sido registrado y será verificado pronto. ¡Juntos transformamos vidas!
        </p>
        <button onClick={resetAll} style={{ ...btnPrimary, display: 'inline-block', width: 'auto', padding: '0.9rem 2.5rem' }}>
          Hacer otro apadrinamiento
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: "'Varela Round', sans-serif" }}>

      {/* Back to home */}
      <button onClick={() => navigate('/')} style={backBtn}>
        <ArrowLeftIcon /> Volver al inicio
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={badgeStyle}>Programa de Apadrinamiento</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontWeight: 'bold', color: '#1a1a1a', margin: '1rem 0' }}>
          Apadrina a un niño permanentemente
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          Tu apadrinamiento garantiza desayunos, útiles y seguimiento continuo.
          Un compromiso mensual que cambia vidas para siempre.
        </p>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* CURRENCY SELECTOR — solo visible en planes */}
      {/* ════════════════════════════════════════ */}
      {showPlans && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            {['soles', 'dolares'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                style={{
                  padding: '0.55rem 1.8rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.2s ease',
                  background: currency === c ? '#9E1B32' : 'transparent',
                  color: currency === c ? 'white' : '#6b7280',
                  boxShadow: currency === c ? '0 2px 8px rgba(158,27,50,0.25)' : 'none',
                  fontFamily: "'Varela Round', sans-serif"
                }}
              >
                {c === 'soles' ? '🇵🇪 Soles (S/)' : '🇺🇸 Dólares ($)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* PANTALLA 1: PLANES                       */}
      {/* ════════════════════════════════════════ */}
      {showPlans && (
        <div>
          {/* Tarjetas de planes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>

            {/* FLEXIBLE */}
            <div
              onClick={() => setSelectedPlan('flexible')}
              style={{
                background: selectedPlan === 'flexible' ? '#fce7f3' : 'white',
                border: `2px solid ${selectedPlan === 'flexible' ? '#9E1B32' : '#e5e7eb'}`,
                borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer',
                transition: 'all 0.3s ease', position: 'relative',
                boxShadow: selectedPlan === 'flexible' ? '0 8px 20px rgba(158,27,50,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: '340px', display: 'flex', flexDirection: 'column'
              }}
              onMouseEnter={e => { if (selectedPlan !== 'flexible') { e.currentTarget.style.borderColor = '#9E1B32'; e.currentTarget.style.transform = 'translateY(-4px)'; } }}
              onMouseLeave={e => { if (selectedPlan !== 'flexible') { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#9E1B32' }}>Apadrina a tu manera</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>monto libre</div>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>Donación Flexible</h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>Elige el monto que deseas aportar mensualmente</p>

              {/* CAMBIO 2: sin auto-corrección, error inline en label, botón bloqueado */}
              <div onClick={e => e.stopPropagation()} style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.82rem' }}>
                    Ingresa el monto
                  </label>
                  {flexError && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '600' }}>{flexError}</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9E1B32', fontWeight: 'bold', fontSize: '0.9rem' }}>{symbol}</span>
                  <input
                    type="number"
                    placeholder={currency === 'soles' ? '20' : '6'}
                    value={flexAmount}
                    onChange={e => {
                      const val = e.target.value;
                      setFlexAmount(val);
                      setSelectedPlan('flexible');
                      const min = currency === 'soles' ? 20 : 6;
                      const v = parseFloat(val);
                      if (val !== '' && (isNaN(v) || v < min)) {
                        setFlexError(`Mínimo ${currency === 'soles' ? 'S/20' : '$6'}`);
                      } else {
                        setFlexError('');
                      }
                    }}
                    style={{
                      padding: '0.55rem 0.9rem 0.55rem 1.8rem', width: '100%', borderRadius: '8px',
                      border: `1.5px solid ${flexError ? '#ef4444' : '#d1d5db'}`,
                      fontSize: '0.9rem', outline: 'none',
                      fontFamily: "'Varela Round', sans-serif", boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {selectedPlan === 'flexible' && (
                <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto auto 0', color: 'white' }}>
                  <CheckIcon size={16} />
                </div>
              )}
            </div>

            {/* MENSUAL */}
            <div
              onClick={() => setSelectedPlan('mensual')}
              style={{
                background: selectedPlan === 'mensual' ? '#fce7f3' : 'white',
                border: `2px solid ${selectedPlan === 'mensual' ? '#9E1B32' : '#e5e7eb'}`,
                borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer',
                transition: 'all 0.3s ease', position: 'relative',
                boxShadow: selectedPlan === 'mensual' ? '0 8px 20px rgba(158,27,50,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: '340px'
              }}
              onMouseEnter={e => { if (selectedPlan !== 'mensual') { e.currentTarget.style.borderColor = '#9E1B32'; e.currentTarget.style.transform = 'translateY(-4px)'; } }}
              onMouseLeave={e => { if (selectedPlan !== 'mensual') { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#9E1B32', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                Recomendado
              </div>
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ color: '#9E1B32', display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{symbol}{plans.mensual.price}</span>
                  <sub style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 'normal', bottom: 0 }}>/mes</sub>
                </div>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>Apadrinamiento Mensual</h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>Pago mensual recurrente</p>
              <div>
                {[{ icon: <UtensilsIcon size={16} />, text: 'Desayunos nutritivos diarios' }, { icon: <BookIcon size={16} />, text: 'Acompañamiento a madres y docentes' }, { icon: <HeartPulseIcon size={16} />, text: 'Monitoreo permanente' }, { icon: <HeartPulseIcon size={16} />, text: 'Kits de aseo y útiles' }].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
                    <span style={{ color: '#9E1B32', flexShrink: 0 }}>{b.icon}</span>
                    <span style={{ fontSize: '0.82rem', color: '#4b5563' }}>{b.text}</span>
                  </div>
                ))}
              </div>
              {selectedPlan === 'mensual' && (
                <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 0', color: 'white' }}>
                  <CheckIcon size={16} />
                </div>
              )}
            </div>

            {/* ANUAL */}
            <div
              onClick={() => setSelectedPlan('anual')}
              style={{
                background: selectedPlan === 'anual' ? '#fce7f3' : 'white',
                border: `2px solid ${selectedPlan === 'anual' ? '#9E1B32' : '#e5e7eb'}`,
                borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer',
                transition: 'all 0.3s ease', position: 'relative',
                boxShadow: selectedPlan === 'anual' ? '0 8px 20px rgba(158,27,50,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: '340px'
              }}
              onMouseEnter={e => { if (selectedPlan !== 'anual') { e.currentTarget.style.borderColor = '#9E1B32'; e.currentTarget.style.transform = 'translateY(-4px)'; } }}
              onMouseLeave={e => { if (selectedPlan !== 'anual') { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ color: '#9E1B32', display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{symbol}{plans.anual.price}</span>
                  <sub style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 'normal', bottom: 0 }}>/año</sub>
                </div>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>Apadrinamiento Anual</h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>Pago único anual</p>
              <div>
                {[{ icon: <UtensilsIcon size={16} />, text: 'Desayunos nutritivos diarios' }, { icon: <BookIcon size={16} />, text: 'Acompañamiento a madres y docentes' }, { icon: <HeartPulseIcon size={16} />, text: 'Monitoreo permanente' }, { icon: <HeartPulseIcon size={16} />, text: 'Kits de aseo y útiles' }].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
                    <span style={{ color: '#9E1B32', flexShrink: 0 }}>{b.icon}</span>
                    <span style={{ fontSize: '0.82rem', color: '#4b5563' }}>{b.text}</span>
                  </div>
                ))}
              </div>
              {selectedPlan === 'anual' && (
                <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 0', color: 'white' }}>
                  <CheckIcon size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Botón continuar */}
          {selectedPlan && (
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              {(() => {
                const min = currency === 'soles' ? 20 : 6;
                const v = parseFloat(flexAmount);
                // CAMBIO 2: también bloquea si hay flexError activo
                const flexInvalid = selectedPlan === 'flexible' && (!flexAmount || isNaN(v) || v < min || !!flexError);
                return (
                  <button
                    disabled={flexInvalid}
                    onClick={() => { if (!flexInvalid) setShowPlans(false); }}
                    style={{
                      background: flexInvalid ? '#d1d5db' : '#9E1B32',
                      color: flexInvalid ? '#9ca3af' : 'white',
                      padding: '1rem 3rem', borderRadius: '10px', border: 'none',
                      cursor: flexInvalid ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold', fontSize: '1.05rem',
                      boxShadow: flexInvalid ? 'none' : '0 4px 12px rgba(158,27,50,0.3)',
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      fontFamily: "'Varela Round', sans-serif", transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => { if (!flexInvalid) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(158,27,50,0.4)'; } }}
                    onMouseLeave={e => { if (!flexInvalid) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(158,27,50,0.3)'; } }}
                  >
                    {selectedPlan === 'flexible' && `Continuar con ${symbol}${flexAmount || '...'}`}
                    {selectedPlan === 'mensual' && `Continuar con ${symbol}${plans.mensual.price}/mes`}
                    {selectedPlan === 'anual' && `Continuar con ${symbol}${plans.anual.price}/año`}
                    <ArrowRightIcon />
                  </button>
                );
              })()}
            </div>
          )}

          {/* ¿A dónde va? */}
          <div style={{ background: '#fafafa', padding: '3rem 2rem', borderRadius: '16px', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem', color: '#1a1a1a' }}>
              ¿A dónde va tu apadrinamiento?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
              <BenefitIcon icon={<UtensilsIcon size={28} />} title="Alimentación" subtitle="Desayunos diarios nutritivos" />
              <BenefitIcon icon={<BookIcon size={28} />} title="Educación" subtitle="Útiles y materiales escolares" />
              <BenefitIcon icon={<HeartPulseIcon size={28} />} title="Salud" subtitle="Controles y atención médica" />
              <BenefitIcon icon={<UsersIcon size={28} />} title="Acompañamiento" subtitle="Seguimiento continuo" />
            </div>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* PANTALLA 2: MÉTODOS DE PAGO             */}
      {/* ════════════════════════════════════════ */}
      {!showPlans && (
        <div>
          <button onClick={() => { setShowPlans(true); setStep(1); setMethod(null); }} style={backBtn}>
            <ArrowLeftIcon /> Volver a planes
          </button>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <StepIndicator number={1} active completed />
            <div style={{ width: '40px', height: '2px', background: '#9E1B32' }} />
            <StepIndicator number={2} active={step >= 2} completed={step > 2} />
            <div style={{ width: '40px', height: '2px', background: step >= 3 ? '#9E1B32' : '#e5e7eb' }} />
            <StepIndicator number={3} active={step === 3} />
          </div>

          {/* Card */}
          <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px',
            padding: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxWidth: '680px', margin: '0 auto'
          }}>

            {/* ── PASO 1: elegir método ── */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#1a1a1a' }}>
                  Método de pago
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Elige cómo deseas realizar tu apadrinamiento mensual.
                </p>

                {/* Plan resumen */}
                <div style={planSummaryBox(currency)}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>{currentPlan?.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>/ mes</div>
                  </div>
                </div>

                {/* CAMBIO 3: métodos filtrados por moneda */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currency === 'soles' && (
                    <MethodCard icon={<CreditCardIcon size={22} />} label="Izipay" sub="Pago con tarjeta vía pasarela Izipay" badge="Soles" onClick={() => { setMethod('izipay-redirect'); setStep(2); }} />
                  )}
                  {currency === 'dolares' && (<>
                    <MethodCard icon={<CreditCardIcon size={22} />} label="Izipay" sub="Pago con tarjeta vía pasarela Izipay" badge="Dólares" onClick={() => { setMethod('izipay-redirect'); setStep(2); }} />
                    <MethodCard icon={<PaypalIcon size={22} />} label="PayPal" sub="Paga de forma segura con tu cuenta PayPal" badge="Dólares" onClick={() => { setMethod('paypal'); setStep(2); }} />
                  </>)}
                </div>
              </div>
            )}

            {/* ── PASO 2: detalle del método ── */}
            {step === 2 && (
              <div>
                <button onClick={() => setStep(1)} style={backBtn}>
                  <ArrowLeftIcon /> Volver
                </button>

                {/* Yape / Plin */}
                {method === 'yape' && (
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MobileIcon size={20} /> Yape / Plin
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Yapea o realiza un Plin al siguiente número.</p>
                    <div style={planSummaryBox(currency)}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>Monto a enviar</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                      </div>
                    </div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.2rem 1.4rem', marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem' }}>Número de Yape / Plin:</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9E1B32', marginBottom: '0.5rem' }}>966 796 532</p>
                      <p style={{ fontSize: '0.85rem', color: '#166534' }}>A nombre de: <strong>KUSIMAYO PERÚ</strong></p>
                    </div>

                    <button onClick={() => {
                      if (!user && !skipAuth) {
                        sessionStorage.setItem('sponsorship_return', JSON.stringify({
                          selectedPlan,
                          currency,
                          flexAmount,
                          method,
                          step: 2
                        }));
                        navigate('/mi-cuenta');
                        return;
                      } setStep(3);
                    }}
                      style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <CheckIcon size={16} /> Ya realicé el Yape / Plin
                    </button>
                  </div>
                )}

                {/* Transferencia bancaria */}
                {method === 'transferencia' && (
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BankIcon size={20} /> Transferencia bancaria
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Realiza la transferencia a la siguiente cuenta.</p>
                    <div style={planSummaryBox(currency)}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>Monto a transferir</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                      </div>
                    </div>
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem 1.4rem', marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.75rem', fontSize: '0.9rem' }}>BCP — Soles</p>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>Cuenta: <strong>193-1785158-0-97</strong></p>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>CCI: <strong>00219300178515809711</strong></p>
                    </div>
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem 1.4rem', marginBottom: '1.5rem' }}>
                      <p style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.75rem', fontSize: '0.9rem' }}>BCP — Dólares</p>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>Cuenta: <strong>193-1786425-1-05</strong></p>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>CCI: <strong>00219300178642510517</strong></p>
                    </div>

                    <button onClick={() => {
                      if (!user && !skipAuth) {
                        sessionStorage.setItem('sponsorship_return', JSON.stringify({
                          selectedPlan,
                          currency,
                          flexAmount,
                          method,
                          step: 2
                        }));
                        navigate('/mi-cuenta');
                        return;
                      } setStep(3);
                    }}
                      style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <CheckIcon size={16} /> Ya realicé la transferencia
                    </button>
                  </div>
                )}

                {/* Izipay Redirect */}
                {method === 'izipay-redirect' && (
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCardIcon size={20} /> Pagar con Izipay
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      Serás redirigido a la pasarela de pago segura de Izipay.
                    </p>

                    <div style={planSummaryBox(currency)}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>Cobro mensual</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{currentPlan?.price}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>/ mes</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!user && !skipAuth) {
                          sessionStorage.setItem('sponsorship_return', JSON.stringify({
                            selectedPlan,
                            currency,
                            flexAmount,
                            method,
                            step: 2
                          }));
                          navigate('/mi-cuenta');
                          return;
                        }
                        window.open(buildIzipayUrl(), '_blank');
                        setStep(3);
                      }}
                      style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <LockIcon size={16} />
                      Ir a pagar con Izipay — {symbol}{currentPlan?.price}
                    </button>
                  </div>
                )}

                {/* Izipay Token */}
                {method === 'izipay-token' && (
                  <IzipayTokenForm
                    plan={currentPlan}
                    currency={currency}
                    onSuccess={() => { setSuccess(true); }}
                    onBack={() => setStep(1)}
                  />
                )}

                {/* PayPal */}
                {method === 'paypal' && (
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PaypalIcon size={20} /> Pagar con PayPal
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      Serás redirigido a PayPal para completar tu donación en dólares.
                    </p>

                    <div style={planSummaryBox('dolares')}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{currentPlan?.name}</p>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>Monto en dólares (USD)</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#9E1B32' }}>
                          ${selectedPlan === 'flexible'
                            ? Math.ceil(parseFloat(flexAmount || 0) / 3.75)
                            : plans[selectedPlan]?.price !== null
                              ? (currency === 'soles' ? Math.ceil(plans[selectedPlan].price / 3.75) : plans[selectedPlan].price)
                              : '—'
                          }
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>USD</div>
                      </div>
                    </div>

                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#92400e' }}>
                      <strong>Importante:</strong> PayPal procesa pagos en dólares. Una vez en la página de PayPal, ingresa el monto en USD que aparece arriba.
                    </div>

                    <button
                      onClick={() => {
                        if (!user && !skipAuth) {
                          sessionStorage.setItem('sponsorship_return', JSON.stringify({
                            selectedPlan,
                            currency,
                            flexAmount,
                            method,
                            step: 2
                          }));
                          navigate('/mi-cuenta');
                          return;
                        }
                        window.open(PAYPAL_URL, '_blank');
                        setStep(3);
                      }}
                      style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <LockIcon size={16} />
                      Ir a PayPal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── PASO 3: confirmación ── */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ color: '#9E1B32', marginBottom: '1rem' }}><CheckCircleIcon size={56} /></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#1a1a1a' }}>
                  ¿Completaste el pago?
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto 2rem' }}>
                  Una vez realizado el pago, confírmalo aquí para registrar tu apadrinamiento.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => { setStep(1); setShowPlans(true); setMethod(null); }}
                    style={{ background: 'transparent', border: '2px solid #e5e7eb', padding: '0.85rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', color: '#4b5563', fontFamily: "'Varela Round', sans-serif" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!user && !skipAuth) {
                        sessionStorage.setItem('sponsorship_skipAuth', 'true');
                        sessionStorage.setItem('sponsorship_return', JSON.stringify({
                          selectedPlan,
                          currency,
                          flexAmount,
                          method,
                          step: 2
                        }));
                        navigate('/mi-cuenta');
                        return;
                      }
                      handleConfirm();
                    }}
                    disabled={loading}
                    style={{ background: '#9E1B32', color: 'white', padding: '0.85rem 2rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Varela Round', sans-serif" }}
                  >
                    {loading ? (
                      <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><RefreshIcon size={16} /></span> Registrando...</>
                    ) : (
                      <><CheckIcon size={16} /> Sí, ya pagué</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* HELPER COMPONENTS                                                         */
/* ════════════════════════════════════════════════════════════════════════ */

function PlanCard({ symbol, price, name, description, benefits, onClick, isSelected, isRecommended }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#fce7f3' : 'white',
        border: `2px solid ${isSelected ? '#9E1B32' : '#e5e7eb'}`,
        borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer',
        transition: 'all 0.3s ease', position: 'relative',
        boxShadow: isSelected ? '0 8px 20px rgba(158,27,50,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
        minHeight: '340px'
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#9E1B32'; e.currentTarget.style.transform = 'translateY(-4px)'; } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      {isRecommended && (
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#9E1B32', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          Recomendado
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9E1B32' }}>{symbol}{price}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>al mes</div>
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.4rem', color: '#1a1a1a' }}>{name}</h3>
      <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>{description}</p>
      <div>
        {benefits.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem', color: '#4b5563' }}>
            <span style={{ color: '#9E1B32', flexShrink: 0 }}>{b.icon}</span>
            <span style={{ fontSize: '0.82rem' }}>{b.text}</span>
          </div>
        ))}
      </div>
      {isSelected && (
        <div style={{ width: '36px', height: '36px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 0', color: 'white' }}>
          <CheckIcon size={16} />
        </div>
      )}
    </div>
  );
}

function BenefitIcon({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'white' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#1a1a1a' }}>{title}</h3>
      <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>{subtitle}</p>
    </div>
  );
}

function StepIndicator({ number, active, completed }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: completed || active ? '#9E1B32' : '#e5e7eb',
      color: completed || active ? 'white' : '#9ca3af',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 'bold', fontSize: '1rem'
    }}>
      {completed ? <CheckIcon size={16} /> : number}
    </div>
  );
}

function MethodCard({ icon, label, sub, badge, badgeColor = '#9E1B32', onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px',
        padding: '1.1rem 1.4rem', cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
        fontFamily: "'Varela Round', sans-serif"
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#9E1B32'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(158,27,50,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
    >
      <span style={{ color: '#9E1B32', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>{sub}</div>
      </div>
      {badge && (
        <span style={{ background: badgeColor, color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.25rem 0.65rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
          {badge}
        </span>
      )}
      <span style={{ color: '#9ca3af', flexShrink: 0 }}><ArrowRightIcon /></span>
    </button>
  );
}

/* ── Estilos reutilizables ── */
const btnPrimary = {
  width: '100%', padding: '0.85rem', background: '#9E1B32', color: 'white',
  border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
  fontSize: '1rem', marginTop: '1rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)',
  fontFamily: "'Varela Round', sans-serif"
};

const btnSelected = {
  padding: '0.5rem 1.25rem', background: '#9E1B32', color: 'white',
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
  fontFamily: "'Varela Round', sans-serif"
};

const btnUnselected = {
  padding: '0.5rem 1.25rem', background: '#e5e7eb', color: '#111827',
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: "'Varela Round', sans-serif"
};

const inputStyle = {
  padding: '0.65rem 0.9rem', width: '100%', borderRadius: '8px',
  border: '1.5px solid #d1d5db', fontSize: '0.95rem', outline: 'none',
  fontFamily: "'Varela Round', sans-serif", boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const labelStyle = {
  fontWeight: 'bold', marginBottom: '0.45rem', color: '#374151',
  display: 'block', fontSize: '0.88rem'
};

const errorText = {
  color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', margin: '0.3rem 0 0'
};

const badgeStyle = {
  display: 'inline-block', background: '#fce7f3', color: '#9E1B32',
  padding: '0.5rem 1.5rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 'bold'
};

const backBtn = {
  background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer',
  fontSize: '0.92rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
  gap: '0.4rem', padding: 0, fontFamily: "'Varela Round', sans-serif"
};

const planSummaryBox = (currency) => ({
  background: currency === 'soles' ? '#fafafa' : '#f0f9ff',
  border: `1px solid ${currency === 'soles' ? '#e5e7eb' : '#bae6fd'}`,
  padding: '1rem 1.4rem', borderRadius: '12px', marginBottom: '1.5rem',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
});

export default Sponsorship;