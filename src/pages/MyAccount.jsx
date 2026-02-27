import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, deactivateUser, subscribeToUserDonations, saveCertificate, getCertificate, createUserProfile } from '../services/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DonationCertificate from './DonationCertificate';
import { useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

const STATUS_LABEL = (t) => ({
    completed: { label: t('account.status.completed'), color: '#9E1B32', bg: '#fce7f3' },
    pending_verification: { label: t('account.status.pending'), color: '#d97706', bg: '#fffbeb' },
    rejected: { label: t('account.status.rejected'), color: '#dc2626', bg: '#fef2f2' },
});

const METHOD_LABEL = {
    izipay: 'Izipay', 'izipay-redirect': 'Izipay', 'izipay-token': 'Izipay',
    paypal: 'PayPal', yape: 'Yape', bcp: 'BCP',
};

/* ── Responsive hook ── */
function useWindowWidth() {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const h = () => setWidth(window.innerWidth);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);
    return width;
}

/* ── Hide navbar when modal open ── */
function useNavbarVisibility(hide) {
    useEffect(() => {
        const navbar = document.querySelector('nav, header, #navbar, .navbar, [data-navbar]');
        if (!navbar) return;
        navbar.style.display = hide ? 'none' : '';
        return () => { navbar.style.display = ''; };
    }, [hide]);
}

/* ════════════════════════════════════════════════════════════════════════
   LEVEL SIDEBAR
   ════════════════════════════════════════════════════════════════════════ */
function LevelSidebar({ donationsCount }) {
    const { t } = useTranslation();
    const levels = [
        { min: 0, label: t('account.levels.seed'), color: '#78716c', medal: <MedalSeed /> },
        { min: 1, label: t('account.levels.sprout'), color: '#16a34a', medal: <MedalSprout /> },
        { min: 3, label: t('account.levels.guardian'), color: '#2563eb', medal: <MedalGuardian /> },
        { min: 6, label: t('account.levels.hero'), color: '#9333ea', medal: <MedalHero /> },
        { min: 12, label: t('account.levels.legend'), color: '#d97706', medal: <MedalLegend /> },
    ];
    const currentLevelIdx = levels.reduce((acc, l, i) => donationsCount >= l.min ? i : acc, 0);
    const nextLevel = levels[currentLevelIdx + 1];
    const currentLevel = levels[currentLevelIdx];
    const progress = nextLevel
        ? Math.min(((donationsCount - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100, 100)
        : 100;

    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {t('account.sidebar.title')}
            </h3>

            {/* Current level badge */}
            <div style={{ background: `linear-gradient(135deg, ${currentLevel.color}18, ${currentLevel.color}08)`, border: `1.5px solid ${currentLevel.color}33`, borderRadius: '12px', padding: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', margin: '0 auto 0.5rem', background: `radial-gradient(circle at 35% 35%, ${currentLevel.color}ee, ${currentLevel.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 3px ${currentLevel.color}33, 0 0 16px ${currentLevel.color}44`, animation: 'sidebarGlow 2.5s ease-in-out infinite' }}>
                    {currentLevel.medal}
                </div>
                <p style={{ fontWeight: 'bold', color: currentLevel.color, fontSize: '0.95rem', margin: 0 }}>{currentLevel.label}</p>
                <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0.2rem 0 0' }}>
                    {donationsCount} {t('account.sidebar.donationsLabel')}
                </p>
            </div>

            {/* All medals — reversed so Leyenda on top */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                {[...levels].reverse().map((l, i) => {
                    const unlocked = donationsCount >= l.min;
                    const isCurrent = levels.indexOf(l) === currentLevelIdx;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.45rem 0.6rem', borderRadius: '10px', background: isCurrent ? `${l.color}12` : 'transparent', border: `1px solid ${isCurrent ? l.color + '30' : 'transparent'}`, transition: 'all 0.2s' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: unlocked ? `radial-gradient(circle at 35% 35%, ${l.color}dd, ${l.color}88)` : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: unlocked ? `0 0 8px ${l.color}44` : 'none', opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(1)', transition: 'all 0.3s' }}>
                                {l.medal}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: isCurrent ? 'bold' : '500', color: unlocked ? (isCurrent ? l.color : '#374151') : '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.label}</p>
                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#9ca3af' }}>{l.min === 0 ? t('account.sidebar.start') : `${l.min}+ ${t('account.sidebar.donationsLabel')}`}</p>
                            </div>
                            {isCurrent && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            {nextLevel ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{t('account.sidebar.progress')}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: currentLevel.color }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: '7px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${currentLevel.color}99, ${currentLevel.color})`, borderRadius: '99px', transition: 'width 1s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.35rem', textAlign: 'right' }}>
                        {donationsCount}/{nextLevel.min} {t('account.sidebar.toReach')} {nextLevel.label}
                    </p>
                </div>
            ) : (
                <p style={{ fontSize: '0.75rem', color: currentLevel.color, fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>
                    🏆 {t('account.sidebar.maxLevel')}
                </p>
            )}

            <style>{`
                @keyframes sidebarGlow {
                    0%,100% { box-shadow: 0 0 0 3px ${currentLevel.color}33, 0 0 14px ${currentLevel.color}44; }
                    50%     { box-shadow: 0 0 0 4px ${currentLevel.color}55, 0 0 22px ${currentLevel.color}66; }
                }
            `}</style>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
function MyAccount() {
    const { t } = useTranslation();
    const { user, login, register, logout, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const width = useWindowWidth();
    const isDesktop = width >= 900;

    const location = useLocation();
    const fromNavbar = new URLSearchParams(location.search).get('from') === 'navbar';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(false);

    const [donations, setDonations] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState('impacto');

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    const [showDeactivate, setShowDeactivate] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    const [certDonation, setCertDonation] = useState(null);
    const [showNoAccountModal, setShowNoAccountModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [googleTempUser, setGoogleTempUser] = useState(null);
    const [googleName, setGoogleName] = useState('');

    useNavbarVisibility(!!certDonation);

    useEffect(() => {
        if (!user) return;
        setEditName(user.displayName || '');
        setEditEmail(user.email || '');
        setLoadingData(true);
        const unsubscribe = subscribeToUserDonations(user.uid, (data) => {
            setDonations(data);
            setLoadingData(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleGoogleLogin = async () => {
        setError(''); setLoadingAuth(true);
        try {
            const { isNew, user: u } = await loginWithGoogle();
            if (isNew) { setGoogleTempUser(u); setGoogleName(u.displayName || ''); setShowNameModal(true); }
            else navigate(fromNavbar ? '/mi-cuenta' : '/apadrinamiento');
        } catch (err) { setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, '')); }
        finally { setLoadingAuth(false); }
    };

    const handleSaveGoogleName = async () => {
        if (!googleName.trim()) return;
        await updateProfile(auth.currentUser, { displayName: googleName });
        await createUserProfile(googleTempUser.uid, googleTempUser.email, googleName);
        setShowNameModal(false);
        navigate(fromNavbar ? '/mi-cuenta' : '/apadrinamiento');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoadingAuth(true);
        try {
            if (isRegistering) await register(email, password, displayName);
            else await login(email, password);
            navigate(fromNavbar ? '/mi-cuenta' : '/apadrinamiento');
        } catch (err) { setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, '')); }
        finally { setLoadingAuth(false); }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            await updateProfile(auth.currentUser, { displayName: editName });
            await updateUserProfile(user.uid, { displayName: editName, email: editEmail });
            setProfileMsg(t('account.profile.saved'));
            setTimeout(() => setProfileMsg(''), 3000);
        } catch { setProfileMsg(t('account.profile.error')); }
        finally { setSavingProfile(false); }
    };

    const handleDeactivate = async () => {
        setDeactivating(true);
        try { await deactivateUser(user.uid); await logout(); navigate('/'); }
        catch { setDeactivating(false); }
    };

    const completedDonations = donations.filter(d => d.status === 'completed');
    const totalDonadoSoles = completedDonations.filter(d => d.currency === 'soles').reduce((a, d) => a + d.amount, 0);
    const totalDonadoDolares = completedDonations.filter(d => d.currency !== 'soles').reduce((a, d) => a + d.amount, 0);
    const desayunosEntregados = Math.floor(totalDonadoSoles / 2.08) + Math.floor((totalDonadoDolares * 3.75) / 2.08);
    const ninosAyudados = completedDonations.length * 2;
    const mesesActivo = (() => {
        const s = new Set();
        completedDonations.forEach(d => { const f = d.createdAt?.toDate?.(); if (f) s.add(`${f.getFullYear()}-${f.getMonth()}`); });
        return s.size || 0;
    })();
    const chartData = completedDonations.slice(0, 10).reverse().map((d, i) => ({ name: `#${i + 1}`, monto: d.amount }));

    /* ── Login screen ── */
    if (!user) {
        return (
            <div style={{ fontFamily: "'Varela Round', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: '440px', width: '100%', background: 'white', borderRadius: '16px', padding: 'clamp(1.5rem, 5vw, 3rem)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#fce7f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <UserCircleIcon />
                        </div>
                        <h1 style={{ color: '#1a1a1a', marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: 'bold' }}>
                            {isRegistering ? t('account.auth.register') : t('account.auth.login')}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            {isRegistering ? t('account.auth.registerSub') : t('account.auth.loginSub')}
                        </p>
                    </div>
                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertIcon />{error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isRegistering && (
                            <div>
                                <label style={labelStyleAuth}>{t('account.auth.fullName')}</label>
                                <input type="text" placeholder={t('account.auth.namePlaceholder')} value={displayName} onChange={e => setDisplayName(e.target.value)} required style={inputStyleAuth} />
                            </div>
                        )}
                        <div>
                            <label style={labelStyleAuth}>{t('account.auth.email')}</label>
                            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyleAuth} />
                        </div>
                        <div>
                            <label style={labelStyleAuth}>{t('account.auth.password')}</label>
                            <input type="password" placeholder={t('account.auth.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} required style={inputStyleAuth} />
                        </div>
                        <button type="submit" disabled={loadingAuth} style={{ ...btnPrimaryAuth, opacity: loadingAuth ? 0.6 : 1, cursor: loadingAuth ? 'not-allowed' : 'pointer' }}>
                            {loadingAuth ? t('account.auth.processing') : isRegistering ? t('account.auth.register') : t('account.auth.login')}
                        </button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} style={{ background: 'none', border: 'none', color: '#9E1B32', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Varela Round', sans-serif" }}>
                                {isRegistering ? t('account.auth.alreadyHaveAccount') : t('account.auth.noAccount')}
                            </button>
                            <button onClick={handleGoogleLogin} style={{ background: 'white', border: '1.5px solid #d1d5db', color: '#374151', cursor: 'pointer', fontSize: '0.9rem', padding: '0.6rem 1.2rem', borderRadius: '8px', fontFamily: "'Varela Round', sans-serif", display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {t('account.auth.google')}
                            </button>
                            <button onClick={() => setShowNoAccountModal(true)} style={{ background: 'none', border: '1.5px solid #d1d5db', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderRadius: '8px', fontFamily: "'Varela Round', sans-serif" }}>
                                {t('account.auth.continueWithout')}
                            </button>
                        </div>
                    </div>
                </div>

                {showNoAccountModal && (
                    <ModalWrapper onClose={() => setShowNoAccountModal(false)}>
                        <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: 'clamp(1.5rem, 5vw, 2.5rem)', maxWidth: '440px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', fontFamily: "'Varela Round', sans-serif" }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '70px', height: '70px', background: '#fce7f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9E1B32" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <h2 style={{ color: '#1a1a1a', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('account.noAccountModal.title')}</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('account.noAccountModal.sub')}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                                {['history', 'certificates', 'tracking', 'levels'].map((key, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#f9fafb', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{['📋', '🏅', '🔍', '🌟'][i]}</span>
                                        <div>
                                            <p style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: '0.9rem', margin: '0 0 0.2rem' }}>{t(`account.noAccountModal.features.${key}.title`)}</p>
                                            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>{t(`account.noAccountModal.features.${key}.desc`)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <button onClick={() => { setShowNoAccountModal(false); navigate('/apadrinamiento'); }} style={{ padding: '0.85rem', background: 'transparent', border: '2px solid #e5e7eb', color: '#4b5563', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Varela Round', sans-serif", fontSize: '0.9rem' }}>
                                    {t('account.auth.continueWithout')}
                                </button>
                                <button onClick={() => setShowNoAccountModal(false)} style={{ padding: '0.85rem', background: '#9E1B32', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Varela Round', sans-serif", fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)' }}>
                                    {t('account.noAccountModal.create')}
                                </button>
                            </div>
                        </div>
                    </ModalWrapper>
                )}
            </div>
        );
    }

    if (showNameModal) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Varela Round', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a1a1a', fontSize: '1.3rem' }}>{t('account.auth.howToCall')}</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('account.auth.enterName')}</p>
                    <input value={googleName} onChange={e => setGoogleName(e.target.value)} placeholder={t('account.auth.namePlaceholder')} style={inputStyleAuth} />
                    <button onClick={handleSaveGoogleName} style={{ ...btnPrimaryAuth, marginTop: '1rem' }}>{t('account.auth.saveAndContinue')}</button>
                </div>
            </div>
        );
    }

    const statusLabels = STATUS_LABEL(t);

    /* ── Dashboard ── */
    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                @media (max-width: 899px) {
                    .account-layout { flex-direction: column !important; }
                    .account-sidebar-col { display: none !important; }
                    .account-sidebar-col-mobile { display: block !important; }
                    .account-main { width: 100% !important; flex: none !important; min-width: 0 !important; }
                }
                @media (max-width: 600px) {
                    .donation-row { flex-direction: column !important; align-items: flex-start !important; }
                    .header-card  { flex-direction: column !important; align-items: flex-start !important; }
                    .logout-btn   { width: 100% !important; justify-content: center !important; }
                    .tabs-wrap button { padding: 0.55rem 0.75rem !important; font-size: 0.76rem !important; }
                    .stat-grid    { grid-template-columns: repeat(2, 1fr) !important; }
                    .donation-row .cert-btn { width: 100% !important; justify-content: center !important; }
                }
            `}</style>

            <div style={{ fontFamily: "'Varela Round', sans-serif", background: '#f9fafb', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1rem)' }}>

                    {/* Header */}
                    <div className="header-card" style={{ background: 'white', borderRadius: '16px', padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#9E1B32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 style={{ color: '#1a1a1a', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', marginBottom: '0.15rem' }}>
                                    {user.displayName || t('account.dashboard.user')}
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user.email}</p>
                                {mesesActivo > 0 && (
                                    <span style={{ display: 'inline-block', background: '#fce7f3', color: '#9E1B32', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginTop: '0.4rem' }}>
                                        {t('account.dashboard.sponsor')} · {mesesActivo} {mesesActivo === 1 ? t('account.dashboard.month') : t('account.dashboard.months')} {t('account.dashboard.supporting')}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="logout-btn" style={{ background: 'white', border: '2px solid #e5e7eb', padding: '0.55rem 1.25rem', borderRadius: '8px', cursor: 'pointer', color: '#4b5563', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', fontFamily: "'Varela Round', sans-serif" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9E1B32'; e.currentTarget.style.color = '#9E1B32'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#4b5563'; }}>
                            <LogoutIcon /> {t('account.dashboard.logout')}
                        </button>
                    </div>

                    {/* Two-column layout */}
                    <div className="account-layout" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                        {/* Main */}
                        <div className="account-main" style={{ flex: 1, minWidth: 0 }}>

                            {/* Tabs */}
                            <div className="tabs-wrap" style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.3rem', WebkitOverflowScrolling: 'touch' }}>
                                {[
                                    { key: 'impacto', label: t('account.tabs.impact'), icon: <SparklesIcon /> },
                                    { key: 'pagos', label: t('account.tabs.payments'), icon: <CreditCardIcon /> },
                                    { key: 'perfil', label: t('account.tabs.plan'), icon: <UserIcon /> },
                                ].map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '0.7rem clamp(0.8rem, 2vw, 1.3rem)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: activeTab === tab.key ? 'bold' : '500', background: activeTab === tab.key ? '#9E1B32' : 'white', color: activeTab === tab.key ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', transition: 'all 0.2s', boxShadow: activeTab === tab.key ? '0 4px 12px rgba(158,27,50,0.3)' : '0 2px 4px rgba(0,0,0,0.06)', whiteSpace: 'nowrap', fontFamily: "'Varela Round', sans-serif" }}>
                                        {tab.icon}{tab.label}
                                    </button>
                                ))}
                                {user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        style={{
                                            padding: '0.7rem clamp(0.8rem, 2vw, 1.3rem)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            background: 'linear-gradient(135deg, #9E1B32 0%, #c0293f 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(158,27,50,0.3)',
                                            whiteSpace: 'nowrap',
                                            fontFamily: "'Varela Round', sans-serif",
                                            marginLeft: 'auto',
                                        }}
                                    >
                                        <ShieldIcon /> Panel Admin
                                    </button>
                                )}
                            </div>

                            {/* ── TAB: Impacto ── */}
                            {activeTab === 'impacto' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
                                        <StatCard icon={<HeartIcon />} label={t('account.impact.totalSoles')} value={`S/ ${totalDonadoSoles.toFixed(0)}`} color="#A60D35" />
                                        {totalDonadoDolares > 0 && <StatCard icon={<HeartIcon />} label={t('account.impact.totalUSD')} value={`$ ${totalDonadoDolares.toFixed(0)}`} color="#A60D35" />}
                                        <StatCard icon={<UtensilsIcon />} label={t('account.impact.breakfasts')} value={desayunosEntregados} color="#A60D35" />
                                        <StatCard icon={<UsersIconStat />} label={t('account.impact.children')} value={ninosAyudados} color="#A60D35" />
                                        <StatCard icon={<CalendarIcon />} label={t('account.impact.months')} value={mesesActivo || 0} color="#A60D35" />
                                    </div>

                                    <div style={{ background: 'linear-gradient(135deg, #fce7f3, #ffe4ec)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                                        <h3 style={{ color: '#1a1a1a', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('account.impact.thisMonth')}</h3>
                                        <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 'bold', color: '#9E1B32', marginBottom: '0.35rem' }}>{desayunosEntregados}</div>
                                        <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.2rem' }}>{t('account.impact.breakfastDelivered')}</p>
                                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{t('account.impact.communities')}</p>
                                    </div>

                                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1rem' }}>{t('account.impact.testimonialTitle')}</h3>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ width: '50px', height: '50px', background: '#f3f4f6', borderRadius: '50%', flexShrink: 0 }} />
                                            <p style={{ color: '#4b5563', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>{t('account.impact.testimonialText')}</p>
                                        </div>
                                    </div>

                                    {chartData.length > 0 ? (
                                        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                            <h3 style={{ marginBottom: '1rem', color: '#1a1a1a', fontSize: '1rem', fontWeight: 'bold' }}>{t('account.impact.history')}</h3>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <AreaChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} />
                                                    <Tooltip formatter={(v) => [`S/ ${v}`, t('account.impact.amount')]} />
                                                    <Area type="monotone" dataKey="monto" stroke="#9E1B32" fill="#fce7f3" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div style={{ background: '#fce7f3', borderRadius: '16px', padding: '2.5rem 2rem', textAlign: 'center' }}>
                                            <div style={{ width: '70px', height: '70px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                                <HeartIcon size={36} />
                                            </div>
                                            <p style={{ color: '#9E1B32', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>{t('account.impact.noDonations')}</p>
                                            <p style={{ color: '#6b7280', marginBottom: '1.25rem' }}>{t('account.impact.startToday')}</p>
                                            <button onClick={() => navigate('/apadrinamiento')} style={{ background: '#9E1B32', color: 'white', border: 'none', padding: '0.7rem 1.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)', fontFamily: "'Varela Round', sans-serif" }}>
                                                {t('account.impact.firstDonation')}
                                            </button>
                                        </div>
                                    )}

                                </div>
                            )}

                            {/* ── TAB: Pagos ── */}
                            {activeTab === 'pagos' && (
                                <div>
                                    {loadingData ? (
                                        <div style={{ textAlign: 'center', padding: '3rem' }}><p style={{ color: '#6b7280' }}>{t('account.payments.loading')}</p></div>
                                    ) : donations.length === 0 ? (
                                        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                            <div style={{ width: '70px', height: '70px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}><CreditCardIcon size={36} /></div>
                                            <p style={{ color: '#6b7280', marginBottom: '1.25rem' }}>{t('account.payments.noDonations')}</p>
                                            <button onClick={() => navigate('/apadrinamiento')} style={{ background: '#9E1B32', color: 'white', border: 'none', padding: '0.7rem 1.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Varela Round', sans-serif" }}>{t('account.payments.donate')}</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                            {donations.map(d => {
                                                const s = statusLabels[d.status] || statusLabels.pending_verification;
                                                return (
                                                    <div key={d.id} className="donation-row" style={{ background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                            <div style={{ width: '46px', height: '46px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                                                                {d.status === 'completed' ? <CheckIcon /> : <ClockIconSmall />}
                                                            </div>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                                                                    <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem' }}>{d.currency === 'soles' ? 'S/' : '$'}{d.amount}</span>
                                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.65rem', borderRadius: '20px' }}>{METHOD_LABEL[d.method] || d.method}</span>
                                                                </div>
                                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                                    {d.createdAt?.toDate?.()?.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) || '—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <span style={{ background: s.bg, color: s.color, padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{s.label}</span>
                                                            {d.status === 'completed' && (
                                                                <button
                                                                    onClick={() => setCertDonation(d)}
                                                                    className="cert-btn" style={{ background: 'linear-gradient(135deg, #7a1020, #9E1B32)', border: '1px solid rgba(212,175,55,0.5)', color: '#f0c040', padding: '0.45rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', fontFamily: "'Varela Round', sans-serif", boxShadow: '0 2px 8px rgba(158,27,50,0.35)', transition: 'all 0.2s ease', letterSpacing: '0.02em' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(158,27,50,0.45)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.9)'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(158,27,50,0.35)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; }}
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                                                                    {t('account.payments.certificate')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: Perfil ── */}
                            {activeTab === 'perfil' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                        <h3 style={{ marginBottom: '1.25rem', color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 'bold' }}>{t('account.profile.title')}</h3>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={labelStyle}>{t('account.auth.fullName')}</label>
                                            <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} placeholder={t('account.auth.namePlaceholder')} />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={labelStyle}>{t('account.auth.email')}</label>
                                            <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} placeholder="tu@email.com" />
                                        </div>
                                        {profileMsg && <p style={{ color: profileMsg.includes('✅') ? '#15803d' : '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{profileMsg}</p>}
                                        <button onClick={handleSaveProfile} disabled={savingProfile} style={{ ...btnPrimary, marginTop: '0.5rem', opacity: savingProfile ? 0.6 : 1, cursor: savingProfile ? 'not-allowed' : 'pointer' }}>
                                            {savingProfile ? t('account.profile.saving') : t('account.profile.save')}
                                        </button>
                                    </div>

                                    <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '2rem', border: '1px solid #fecaca' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}><AlertIcon /></div>
                                            <div>
                                                <h3 style={{ color: '#dc2626', marginBottom: '0.4rem', fontSize: '1.05rem', fontWeight: 'bold' }}>{t('account.deactivate.title')}</h3>
                                                <p style={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: '1.5' }}>{t('account.deactivate.desc')}</p>
                                            </div>
                                        </div>
                                        {!showDeactivate ? (
                                            <button onClick={() => setShowDeactivate(true)} style={{ background: 'white', border: '2px solid #dc2626', color: '#dc2626', padding: '0.7rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', fontFamily: "'Varela Round', sans-serif" }}>{t('account.deactivate.btn')}</button>
                                        ) : (
                                            <div>
                                                <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '0.85rem', fontSize: '0.95rem' }}>{t('account.deactivate.confirm')}</p>
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    <button onClick={() => setShowDeactivate(false)} style={{ background: 'white', border: '2px solid #d1d5db', padding: '0.7rem 1.4rem', borderRadius: '8px', cursor: 'pointer', color: '#4b5563', fontWeight: 'bold', fontFamily: "'Varela Round', sans-serif" }}>{t('account.deactivate.cancel')}</button>
                                                    <button onClick={handleDeactivate} disabled={deactivating} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', cursor: deactivating ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: deactivating ? 0.6 : 1, fontFamily: "'Varela Round', sans-serif" }}>
                                                        {deactivating ? t('account.deactivate.processing') : t('account.deactivate.yes')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* ── Mobile level sidebar — shown on all tabs ── */}
                            <div className="account-sidebar-col-mobile" style={{ marginTop: '1.25rem', display: 'none' }}>
                                <LevelSidebar donationsCount={completedDonations.length} />
                            </div>
                        </div>

                        {/* Sidebar desktop */}
                        <div className="account-sidebar-col" style={{ width: '220px', flexShrink: 0 }}>
                            <LevelSidebar donationsCount={completedDonations.length} />
                        </div>
                    </div>
                </div>
            </div>

            {certDonation && (
                <DonationCertificate
                    donation={certDonation}
                    userName={user.displayName || user.email}
                    userId={user.uid}
                    onClose={() => setCertDonation(null)}
                    saveCertificate={saveCertificate}
                    getCertificate={getCertificate}
                />
            )}
            <Footer />
        </>
    );
}

/* ════ ICONS ════ */
function UserCircleIcon() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9E1B32" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>; }
function AlertIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function LogoutIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function SparklesIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>; }
function CreditCardIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>; }
function UserIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
function HeartIcon({ size = 24 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function UtensilsIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>; }
function UsersIconStat() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function CalendarIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>; }
function CheckIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>; }
function ClockIconSmall() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function ShieldIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }

/* ════ STAT CARD ════ */
function StatCard({ icon, label, value, color }) {
    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem 1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(158,27,50,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
            <div style={{ color, marginBottom: '0.6rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.7rem)', fontWeight: 'bold', color, marginBottom: '0.3rem' }}>{value}</div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>{label}</div>
        </div>
    );
}

/* ════ MEDALS ════ */
function MedalSeed() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22V12M12 12C12 12 7 10 7 5a5 5 0 0 1 10 0c0 5-5 7-5 7z" /></svg>; }
function MedalSprout() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22v-9" /><path d="M12 13C12 9 8 5 5 5c0 3 2 9 7 8z" /><path d="M12 13C12 9 16 5 19 5c0 3-2 9-7 8z" /></svg>; }
function MedalGuardian() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }
function MedalHero() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>; }
function MedalLegend() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>; }

/* ════ MODAL WRAPPER ════ */
function ModalWrapper({ children, onClose }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            {children}
        </div>
    );
}

/* ════ STYLES ════ */
const inputStyle = { padding: '0.75rem', width: '100%', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '0.95rem', fontFamily: "'Varela Round', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box' };
const inputStyleAuth = { ...inputStyle, marginTop: '0.5rem' };
const labelStyle = { display: 'block', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' };
const labelStyleAuth = { ...labelStyle, fontSize: '0.85rem' };
const btnPrimary = { width: '100%', padding: '0.75rem', background: '#9E1B32', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', fontFamily: "'Varela Round', sans-serif", transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(158,27,50,0.3)' };
const btnPrimaryAuth = { ...btnPrimary, padding: '1rem' };

export default MyAccount;