import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserDonations, updateUserProfile, deactivateUser, subscribeToUserDonations, saveCertificate, getCertificate, createUserProfile } from '../services/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import DonationCertificate from './DonationCertificate';

import { useLocation } from 'react-router-dom';

// Estado amigable para el usuario
const STATUS_LABEL = {
    completed: { label: 'Pago exitoso', color: '#9E1B32', bg: '#fce7f3' },
    pending_verification: { label: 'En revisión', color: '#d97706', bg: '#fffbeb' },
    rejected: { label: 'No procesado', color: '#dc2626', bg: '#fef2f2' },
};

const METHOD_LABEL = {
    izipay: 'Izipay',
    'izipay-redirect': 'Izipay',
    'izipay-token': 'Izipay',
    paypal: 'PayPal',
    yape: 'Yape',
    bcp: 'BCP',
};

function MyAccount() {
    const { user, login, register, logout, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const fromNavbar = new URLSearchParams(location.search).get('from') === 'navbar';

    // Estados formulario login/registro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(false);

    // Estados dashboard
    const [donations, setDonations] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState('impacto');

    // Estados edición perfil
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Estados desactivar cuenta
    const [showDeactivate, setShowDeactivate] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    const [certDonation, setCertDonation] = useState(null);   // donación a certificar
    const [showNoAccountModal, setShowNoAccountModal] = useState(false);

    const [showNameModal, setShowNameModal] = useState(false);
    const [googleTempUser, setGoogleTempUser] = useState(null);
    const [googleName, setGoogleName] = useState('');

    // Cargar donaciones
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
        setError('');
        setLoadingAuth(true);
        try {
            const { isNew, user: u } = await loginWithGoogle();
            if (isNew) {
                setGoogleTempUser(u);
                setGoogleName(u.displayName || '');
                setShowNameModal(true);
            } else {
                navigate(fromNavbar ? '/mi-cuenta' : '/apadrinamiento'); // ← agrega esto
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, ''));
        } finally {
            setLoadingAuth(false);
        }
    };

    const handleSaveGoogleName = async () => {
        if (!googleName.trim()) return;
        await updateProfile(auth.currentUser, { displayName: googleName });
        await createUserProfile(googleTempUser.uid, googleTempUser.email, googleName);
        setShowNameModal(false);
        navigate(fromNavbar ? '/mi-cuenta' : '/apadrinamiento');
    };

    // ── Login/Registro ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingAuth(true);
        try {
            if (isRegistering) {
                await register(email, password, displayName);
            } else {
                await login(email, password);
            }
            navigate(fromNavbar ? '/mi-cuenta' : '/apadrinamiento');
        } catch (err) {
            setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, ''));
        } finally {
            setLoadingAuth(false);
        }
    };

    // ── Guardar perfil ──
    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            await updateProfile(auth.currentUser, { displayName: editName });
            await updateUserProfile(user.uid, { displayName: editName, email: editEmail });
            setProfileMsg('✅ Perfil actualizado correctamente');
            setTimeout(() => setProfileMsg(''), 3000);
        } catch {
            setProfileMsg('❌ Error al actualizar');
        } finally {
            setSavingProfile(false);
        }
    };

    // ── Desactivar cuenta ──
    const handleDeactivate = async () => {
        setDeactivating(true);
        try {
            await deactivateUser(user.uid);
            await logout();
            navigate('/');
        } catch {
            setDeactivating(false);
        }
    };

    // ── Datos para gráfica ──
    const chartData = donations
        .filter(d => d.status === 'completed')
        .slice(0, 10)
        .reverse()
        .map((d, i) => ({
            name: `#${i + 1}`,
            monto: d.amount,
        }));

    // ── Totales por moneda ──
    const completedDonations = donations.filter(d => d.status === 'completed');

    const totalDonadoSoles = completedDonations
        .filter(d => d.currency === 'soles')
        .reduce((acc, d) => acc + d.amount, 0);

    const totalDonadoDolares = completedDonations
        .filter(d => d.currency !== 'soles')
        .reduce((acc, d) => acc + d.amount, 0);

    // Desayunos: S/2.08 por desayuno, $0.60 por desayuno (en soles = $0.60 * 3.75 = S/2.25 aprox, usamos 2.08 fijo)
    const desayunosSoles = Math.floor(totalDonadoSoles / 2.08);
    const desayunosDolares = Math.floor((totalDonadoDolares * 3.75) / 2.08);
    const desayunosEntregados = desayunosSoles + desayunosDolares;

    const ninosAyudados = completedDonations.length * 2;

    // Meses activo: contar meses distintos en que hubo al menos 1 donación completada
    const mesesActivo = (() => {
        const mesesSet = new Set();
        completedDonations.forEach(d => {
            const fecha = d.createdAt?.toDate?.();
            if (fecha) {
                mesesSet.add(`${fecha.getFullYear()}-${fecha.getMonth()}`);
            }
        });
        return mesesSet.size || 0;
    })();

    // ── Pantalla de Login/Registro ──
    if (!user) {
        return (
            <div style={{
                fontFamily: "'Varela Round', sans-serif",
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    maxWidth: '440px',
                    width: '100%',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '3rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#fce7f3',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <UserCircleIcon />
                        </div>
                        <h1 style={{
                            color: '#1a1a1a',
                            marginBottom: '0.5rem',
                            fontSize: '1.8rem',
                            fontWeight: 'bold'
                        }}>
                            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            {isRegistering
                                ? 'Únete a Kusimayo y sigue el impacto de tu aporte'
                                : 'Bienvenido de vuelta a Kusimayo'}
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertIcon />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isRegistering && (
                            <div>
                                <label style={labelStyleAuth}>Nombre completo</label>
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    required
                                    style={inputStyleAuth}
                                />
                            </div>
                        )}
                        <div>
                            <label style={labelStyleAuth}>Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={inputStyleAuth}
                            />
                        </div>
                        <div>
                            <label style={labelStyleAuth}>Contraseña</label>
                            <input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={inputStyleAuth}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loadingAuth}
                            style={{
                                ...btnPrimaryAuth,
                                opacity: loadingAuth ? 0.6 : 1,
                                cursor: loadingAuth ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loadingAuth ? 'Procesando...' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                            <button
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#9E1B32', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: '500' }}
                            >
                                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                            </button>

                            <button
                                onClick={handleGoogleLogin}
                                style={{
                                    background: 'white', border: '1.5px solid #d1d5db', color: '#374151',
                                    cursor: 'pointer', fontSize: '0.9rem', padding: '0.6rem 1.2rem',
                                    borderRadius: '8px', fontFamily: "'Varela Round', sans-serif",
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continuar con Google
                            </button>

                            <button
                                onClick={() => setShowNoAccountModal(true)}
                                style={{ background: 'none', border: '1.5px solid #d1d5db', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderRadius: '8px', fontFamily: "'Varela Round', sans-serif" }}
                            >
                                Continuar sin cuenta
                            </button>
                        </div>
                    </div>
                </div>
                {/* Modal sin cuenta */}
                {showNoAccountModal && (
                    <div onClick={() => setShowNoAccountModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', maxWidth: '440px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', fontFamily: "'Varela Round', sans-serif" }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '70px', height: '70px', background: '#fce7f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9E1B32" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <h2 style={{ color: '#1a1a1a', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>¿Para qué sirve la cuenta?</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Puedes donar sin cuenta, pero te perderás de:</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                                {[
                                    { icon: '📋', title: 'Historial de pagos', desc: 'Consulta todos tus aportes anteriores con fecha y monto.' },
                                    { icon: '🏅', title: 'Certificados por donación', desc: 'Descarga un certificado PDF oficial por cada donación realizada.' },
                                    { icon: '🔍', title: 'Seguimiento del impacto', desc: 'Ve en detalle qué se hace con tu dinero: desayunos, útiles, atención médica.' },
                                    { icon: '🌟', title: 'Sistema de niveles', desc: 'Gana medallas y sube de nivel con cada donación mensual.' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#f9fafb', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                                        <div>
                                            <p style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: '0.9rem', margin: '0 0 0.2rem' }}>{item.title}</p>
                                            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <button onClick={() => {
                                    setShowNoAccountModal(false);
                                    const saved = sessionStorage.getItem('sponsorship_return');
                                    if (saved) {
                                        sessionStorage.setItem('sponsorship_skipAuth', 'true');
                                    }
                                    navigate('/apadrinamiento');
                                }} style={{ padding: '0.85rem', background: 'transparent', border: '2px solid #e5e7eb', color: '#4b5563', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Varela Round', sans-serif", fontSize: '0.9rem' }}>
                                    Continuar sin cuenta
                                </button>
                                <button onClick={() => setShowNoAccountModal(false)} style={{ padding: '0.85rem', background: '#9E1B32', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Varela Round', sans-serif", fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(158,27,50,0.3)' }}>
                                    Crear mi cuenta
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Modal nombre Google — fuera del if(!user)
    if (showNameModal) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Varela Round', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a1a1a', fontSize: '1.3rem' }}>¿Cómo te llamamos?</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ingresa tu nombre para completar tu perfil.</p>
                    <input
                        value={googleName}
                        onChange={e => setGoogleName(e.target.value)}
                        placeholder="Tu nombre completo"
                        style={inputStyleAuth}
                    />
                    <button onClick={handleSaveGoogleName} style={{ ...btnPrimaryAuth, marginTop: '1rem' }}>
                        Guardar y continuar
                    </button>
                </div>
            </div>
        );
    }

    // ── Dashboard Usuario ──
    return (
        <div style={{
            fontFamily: "'Varela Round', sans-serif",
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem 1rem'
        }}>

            {/* Header con avatar */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: '#9E1B32',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 'bold'
                    }}>
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{
                            color: '#1a1a1a',
                            fontSize: '1.5rem',
                            marginBottom: '0.25rem'
                        }}>
                            {user.displayName || 'Usuario'}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                            {user.email}
                        </p>
                        {mesesActivo > 0 && (
                            <span style={{
                                display: 'inline-block',
                                background: '#fce7f3',
                                color: '#9E1B32',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                marginTop: '0.5rem'
                            }}>
                                Padrino/Madrina · {mesesActivo} {mesesActivo === 1 ? 'mes' : 'meses'} apoyando
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => { logout(); navigate('/'); }}
                    style={{
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#4b5563',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#9E1B32';
                        e.currentTarget.style.color = '#9E1B32';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#4b5563';
                    }}
                >
                    <LogoutIcon />
                    Cerrar sesión
                </button>
            </div>

            {/* Tabs con iconos SVG */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '2rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem'
            }}>
                {[
                    { key: 'impacto', label: 'Mi Impacto', icon: <SparklesIcon /> },
                    { key: 'pagos', label: 'Pagos', icon: <CreditCardIcon /> },
                    { key: 'perfil', label: 'Mi Plan', icon: <UserIcon /> },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: activeTab === t.key ? 'bold' : '500',
                            background: activeTab === t.key ? '#9E1B32' : 'white',
                            color: activeTab === t.key ? 'white' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === t.key ? '0 4px 12px rgba(158, 27, 50, 0.3)' : '0 2px 4px rgba(0,0,0,0.06)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: Mi Impacto ── */}
            {activeTab === 'impacto' && (
                <div>
                    {/* Tarjetas resumen con SVG */}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <StatCard
                            icon={<HeartIcon />}
                            label="Total aportado (S/)"
                            value={`S/ ${totalDonadoSoles.toFixed(0)}`}
                            color="#A60D35"
                        />
                        {totalDonadoDolares > 0 && (
                            <StatCard
                                icon={<HeartIcon />}
                                label="Total aportado ($)"
                                value={`$ ${totalDonadoDolares.toFixed(0)}`}
                                color="#A60D35"
                            />
                        )}
                        <StatCard
                            icon={<UtensilsIcon />}
                            label="Desayunos"
                            value={desayunosEntregados}
                            color="#A60D35"
                        />
                        <StatCard
                            icon={<UsersIconStat />}
                            label="Niños ayudados"
                            value={ninosAyudados}
                            color="#A60D35"
                        />
                        <StatCard
                            icon={<CalendarIcon />}
                            label="Meses activo/a"
                            value={mesesActivo || 0}
                            color="#A60D35"
                        />
                    </div>

                    {/* Impacto del mes */}
                    <div style={{
                        background: 'linear-gradient(135deg, #fce7f3 0%, #fce7f3 100%)',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            color: '#1a1a1a',
                            fontSize: '1.2rem',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }}>
                            Tu impacto este mes
                        </h3>
                        <div style={{
                            fontSize: '4rem',
                            fontWeight: 'bold',
                            color: '#9E1B32',
                            marginBottom: '0.5rem'
                        }}>
                            {desayunosEntregados}
                        </div>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '1.05rem',
                            marginBottom: '0.25rem'
                        }}>
                            desayunos entregados gracias a ti
                        </p>
                        <p style={{
                            color: '#9ca3af',
                            fontSize: '0.9rem'
                        }}>
                            En comunidades de Cusco y Puno
                        </p>
                    </div>

                    {/* Testimonio de niño ayudado */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            marginBottom: '1rem'
                        }}>
                            Gracias a tu aporte, tu ahijado de Kusimayo:
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: '#f3f4f6',
                                borderRadius: '50%',
                                flexShrink: 0
                            }} />
                            <div>
                                <p style={{
                                    color: '#4b5563',
                                    fontSize: '0.95rem',
                                    fontStyle: 'italic',
                                    lineHeight: '1.6'
                                }}>
                                    puedo concentrarme mejor en mis clases de matemáticas.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gráfica */}
                    {chartData.length > 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                            <h3 style={{
                                marginBottom: '1rem',
                                color: '#1a1a1a',
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                            }}>
                                Historial de aportes
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(v) => [`S/ ${v}`, 'Monto']} />
                                    <Area type="monotone" dataKey="monto" stroke="#9E1B32" fill="#fce7f3" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{
                            background: '#fce7f3',
                            borderRadius: '16px',
                            padding: '3rem 2rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <HeartIcon size={40} />
                            </div>
                            <p style={{
                                color: '#9E1B32',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem'
                            }}>
                                Aún no tienes aportes confirmados
                            </p>
                            <p style={{
                                color: '#6b7280',
                                marginBottom: '1.5rem'
                            }}>
                                Comienza a transformar vidas hoy
                            </p>
                            <button
                                onClick={() => navigate('/apadrinamiento')}
                                style={{
                                    background: '#9E1B32',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(158, 27, 50, 0.3)'
                                }}
                            >
                                Hacer mi primer aporte
                            </button>
                        </div>
                    )}
                    {/* Barra de progreso con medallas */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1.5rem' }}>Tu nivel de padrino</h3>
                        <ProgressLevelBar donationsCount={donations.filter(d => d.status === 'completed').length} />
                    </div>
                </div>
            )}

            {/* ── TAB: Pagos ── */}
            {activeTab === 'pagos' && (
                <div>
                    {loadingData ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#6b7280' }}>Cargando tus pagos...</p>
                        </div>
                    ) : donations.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: '#f3f4f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <CreditCardIcon size={40} />
                            </div>
                            <p style={{
                                color: '#6b7280',
                                marginBottom: '1.5rem'
                            }}>
                                Aún no has realizado ningún pago
                            </p>
                            <button
                                onClick={() => navigate('/apadrinamiento')}
                                style={{
                                    background: '#9E1B32',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Hacer un aporte
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {donations.map(d => {
                                const s = STATUS_LABEL[d.status] || STATUS_LABEL.pending_verification;
                                return (
                                    <div
                                        key={d.id}
                                        style={{
                                            background: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                background: s.bg,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: s.color
                                            }}>
                                                {d.status === 'completed' ? <CheckIcon /> : <ClockIconSmall />}
                                            </div>
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: '#111827',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {d.currency === 'soles' ? 'S/' : '$'}{d.amount}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.85rem',
                                                        color: '#6b7280',
                                                        background: '#f3f4f6',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px'
                                                    }}>
                                                        {METHOD_LABEL[d.method] || d.method}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                                    {d.createdAt?.toDate?.()?.toLocaleDateString('es-PE', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) || '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ background: s.bg, color: s.color, padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                                {s.label}
                                            </span>
                                            {d.status === 'completed' && (
                                                <button
                                                    onClick={() => setCertDonation(d)}
                                                    style={{ background: 'linear-gradient(135deg, #0d0d1a, #1a0a0e)', border: '1px solid rgba(212,175,55,0.5)', color: '#d4af37', padding: '0.4rem 0.85rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontFamily: "'Varela Round', sans-serif", transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a30, #2a0f18)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #0d0d1a, #1a0a0e)'}
                                                >
                                                    🏅 Certificado
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

            {/* ── TAB: Mi Plan / Perfil ── */}
            {activeTab === 'perfil' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Editar perfil */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <h3 style={{
                            marginBottom: '1.5rem',
                            color: '#1a1a1a',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}>
                            Información personal
                        </h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Nombre completo</label>
                            <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                style={inputStyle}
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Correo electrónico</label>
                            <input
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                style={inputStyle}
                                placeholder="tu@email.com"
                            />
                        </div>
                        {profileMsg && (
                            <p style={{
                                color: profileMsg.includes('✅') ? '#15803d' : '#dc2626',
                                fontSize: '0.875rem',
                                marginBottom: '1rem'
                            }}>
                                {profileMsg}
                            </p>
                        )}
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            style={{
                                ...btnPrimary,
                                marginTop: '0.5rem',
                                opacity: savingProfile ? 0.6 : 1,
                                cursor: savingProfile ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>

                    {/* Desactivar cuenta */}
                    <div style={{
                        background: '#fef2f2',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: '1px solid #fecaca'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: '#fee2e2',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#dc2626',
                                flexShrink: 0
                            }}>
                                <AlertIcon />
                            </div>
                            <div>
                                <h3 style={{
                                    color: '#dc2626',
                                    marginBottom: '0.5rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold'
                                }}>
                                    Desactivar cuenta
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5'
                                }}>
                                    Tu cuenta se pausará temporalmente. Puedes reactivarla en cualquier momento
                                    volviendo a iniciar sesión con tu correo electrónico.
                                </p>
                            </div>
                        </div>
                        {!showDeactivate ? (
                            <button
                                onClick={() => setShowDeactivate(true)}
                                style={{
                                    background: 'white',
                                    border: '2px solid #dc2626',
                                    color: '#dc2626',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Desactivar mi cuenta
                            </button>
                        ) : (
                            <div>
                                <p style={{
                                    color: '#dc2626',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem',
                                    fontSize: '1rem'
                                }}>
                                    ¿Estás completamente seguro?
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setShowDeactivate(false)}
                                        style={{
                                            background: 'white',
                                            border: '2px solid #d1d5db',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            color: '#4b5563',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeactivate}
                                        disabled={deactivating}
                                        style={{
                                            background: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            cursor: deactivating ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold',
                                            opacity: deactivating ? 0.6 : 1
                                        }}
                                    >
                                        {deactivating ? 'Procesando...' : 'Sí, desactivar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* COMPONENTES DE ICONOS SVG */
/* ════════════════════════════════════════════════════════════════════════ */

function UserCircleIcon() {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9E1B32" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

function SparklesIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

function CreditCardIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function HeartIcon({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function UtensilsIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    );
}

function UsersIconStat() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ClockIconSmall() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* COMPONENTE AUXILIAR */
/* ════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(158, 27, 50, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}>
            <div style={{
                color,
                marginBottom: '0.75rem',
                display: 'flex',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color,
                marginBottom: '0.5rem'
            }}>
                {value}
            </div>
            <div style={{
                color: '#6b7280',
                fontSize: '0.85rem',
                fontWeight: '500'
            }}>
                {label}
            </div>
        </div>
    );
}
function ProgressLevelBar({ donationsCount }) {
    const levels = [
        { min: 0, label: 'Semilla', color: '#78716c', medal: <MedalSeed /> },
        { min: 1, label: 'Brote', color: '#16a34a', medal: <MedalSprout /> },
        { min: 3, label: 'Guardián', color: '#2563eb', medal: <MedalGuardian /> },
        { min: 6, label: 'Héroe', color: '#9333ea', medal: <MedalHero /> },
        { min: 12, label: 'Leyenda', color: '#d97706', medal: <MedalLegend /> },
    ];

    const currentLevelIdx = levels.reduce((acc, l, i) => donationsCount >= l.min ? i : acc, 0);
    const nextLevel = levels[currentLevelIdx + 1];
    const currentLevel = levels[currentLevelIdx];
    const progress = nextLevel
        ? Math.min(((donationsCount - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100, 100)
        : 100;

    return (
        <div>
            {/* Medallas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', position: 'relative' }}>
                {levels.map((l, i) => {
                    const unlocked = donationsCount >= l.min;
                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                            <div style={{
                                width: '46px', height: '46px', borderRadius: '50%',
                                background: unlocked ? `radial-gradient(circle at 35% 35%, ${l.color}dd, ${l.color}88)` : '#e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: unlocked
                                    ? `0 0 0 2px ${l.color}44, 0 0 12px ${l.color}66, 0 0 24px ${l.color}33`
                                    : 'none',
                                animation: unlocked && i === currentLevelIdx ? 'medalGlow 2s ease-in-out infinite' : 'none',
                                transition: 'all 0.4s ease',
                                opacity: unlocked ? 1 : 0.35,
                                filter: unlocked ? 'none' : 'grayscale(1)'
                            }}>
                                {l.medal}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: unlocked ? currentLevel.color : '#9ca3af', fontWeight: unlocked ? 'bold' : 'normal', textAlign: 'center' }}>
                                {l.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Barra de progreso */}
            <div style={{ position: 'relative', height: '14px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                {/* Track */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(90deg, ${currentLevel.color}22 0%, ${currentLevel.color}11 100%)`,
                }} />
                {/* Fill animado */}
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${currentLevel.color}bb, ${currentLevel.color}ff, ${currentLevel.color}cc)`,
                    borderRadius: '99px',
                    transition: 'width 1s ease',
                    animation: 'barShimmer 2.5s linear infinite',
                    backgroundSize: '200% 100%',
                }} />
                {/* Brillo sobre la barra */}
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    borderRadius: '99px',
                    animation: 'barSweep 2s linear infinite',
                    backgroundSize: '200% 100%',
                }} />
            </div>

            <p style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af' }}>
                {nextLevel
                    ? `${donationsCount} / ${nextLevel.min} donaciones para "${nextLevel.label}"`
                    : '🏆 ¡Nivel máximo alcanzado!'}
            </p>

            <style>{`
        @keyframes barShimmer {
          0% { background-position: 100% 0 }
          100% { background-position: -100% 0 }
        }
        @keyframes barSweep {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(400%) }
        }
        @keyframes medalGlow {
          0%, 100% { box-shadow: 0 0 0 2px ${currentLevel.color}44, 0 0 12px ${currentLevel.color}66, 0 0 24px ${currentLevel.color}33; }
          50% { box-shadow: 0 0 0 3px ${currentLevel.color}88, 0 0 20px ${currentLevel.color}aa, 0 0 40px ${currentLevel.color}55; }
        }
      `}</style>
        </div>
    );
}

/* ── Medallas SVG ── */
function MedalSeed() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22V12M12 12C12 12 7 10 7 5a5 5 0 0 1 10 0c0 5-5 7-5 7z" /></svg>;
}
function MedalSprout() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22v-9" /><path d="M6.5 9.5C6.5 9.5 5 15 12 13" /><path d="M17.5 9.5C17.5 9.5 19 15 12 13" /><path d="M12 13C12 9 8 5 5 5c0 3 2 9 7 8z" /><path d="M12 13C12 9 16 5 19 5c0 3-2 9-7 8z" /></svg>;
}
function MedalGuardian() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function MedalHero() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function MedalLegend() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>;
}

/* ════════════════════════════════════════════════════════════════════════ */
/* ESTILOS */
/* ════════════════════════════════════════════════════════════════════════ */

const inputStyle = {
    padding: '0.75rem',
    width: '100%',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '0.95rem',
    fontFamily: "'Varela Round', sans-serif",
    transition: 'border-color 0.2s'
};

const inputStyleAuth = {
    ...inputStyle,
    marginTop: '0.5rem'
};

const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
};

const labelStyleAuth = {
    ...labelStyle,
    fontSize: '0.85rem'
};

const btnPrimary = {
    width: '100%',
    padding: '0.75rem',
    background: '#9E1B32',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    fontFamily: "'Varela Round', sans-serif",
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(158, 27, 50, 0.3)'
};

const btnPrimaryAuth = {
    ...btnPrimary,
    padding: '1rem'
};

export default MyAccount;