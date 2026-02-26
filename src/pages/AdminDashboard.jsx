import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    getAllDonations, getAllUsers, confirmDonation,
    deactivateUser, getGlobalStats, rejectDonation,
    updateStatsOnConfirm, subscribeToStats, subscribeToDonations
} from '../services/firestore';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kusimayo.org';

const STATUS_LABEL = {
    completed: { label: 'Confirmado', color: '#15803d', bg: '#f0fdf4' },
    pending_verification: { label: 'Pendiente', color: '#d97706', bg: '#fffbeb' },
    rejected: { label: 'Rechazado', color: '#dc2626', bg: '#fef2f2' },
};

const METHOD_LABEL = {
    izipay: 'Izipay',
    paypal: 'PayPal',
    yape: 'Yape',
    bcp: 'BCP',
};

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('resumen');
    const [donations, setDonations] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState('');
    const [rejecting, setRejecting] = useState('');
    const [showRejectConfirm, setShowRejectConfirm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchUser, setSearchUser] = useState('');

    useEffect(() => {
        if (!user) { navigate('/mi-cuenta'); return; }
        if (user.email !== ADMIN_EMAIL) { navigate('/'); return; }

        getAllUsers().then(setUsers).finally(() => setLoading(false));

        const unsubDonations = subscribeToDonations(setDonations);
        const unsubStats = subscribeToStats((data) => {
            console.log('📊 Stats recibidas en callback:', data);
            setStats(data);
        });

        return () => {
            unsubDonations();
            unsubStats();
        };
    }, [user, navigate]);

    const handleConfirm = async (donationId) => {
        setConfirming(donationId);
        try {
            const donation = donations.find(d => d.id === donationId);
            await confirmDonation(donationId);
            await updateStatsOnConfirm(donation);
        } finally {
            setConfirming('');
        }
    };

    const handleReject = async (donationId) => {
        setRejecting(donationId);
        try {
            await rejectDonation(donationId);
            setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'rejected' } : d));
            setShowRejectConfirm('');
        } finally { setRejecting(''); }
    };

    const handleDeactivateUser = async (userId) => {
        await deactivateUser(userId);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u));
    };

    const exportExcel = () => {
        const rows = donations.map(d => ({
            'ID': d.id,
            'Email': d.email,
            'Monto': d.amount,
            'Moneda': d.currency === 'soles' ? 'Soles' : 'USD',
            'Método': METHOD_LABEL[d.method] || d.method,
            'Tipo': d.type === 'sponsorship' ? 'Mensual' : 'Única',
            'Estado': STATUS_LABEL[d.status]?.label || d.status,
            'Fecha': d.createdAt?.toDate?.()?.toLocaleDateString('es-PE') || '—',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Donaciones');

        const usersRows = users.map(u => ({
            'Nombre': u.displayName || 'Sin nombre',
            'Email': u.email,
            'Total donado': u.totalDonated || 0,
            'Estado': u.isActive !== false ? 'Activo' : 'Inactivo',
        }));
        const ws2 = XLSX.utils.json_to_sheet(usersRows);
        XLSX.utils.book_append_sheet(wb, ws2, 'Usuarios');

        XLSX.writeFile(wb, 'kusimayo_reporte.xlsx');
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(158, 27, 50);
        doc.text('Kusimayo Peru - Reporte de Donaciones', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Resumen General', 14, 40);
        autoTable(doc, {
            startY: 44,
            head: [['Total Recaudado', 'Donaciones', 'Padrinos', 'Únicas']],
            body: [[
                `$${stats?.totalAmount || 0}`,
                stats?.totalDonations || 0,
                stats?.totalSponsors || 0,
                stats?.totalUnique || 0,
            ]],
            headStyles: { fillColor: [158, 27, 50] },
        });

        doc.text('Detalle de Donaciones', 14, doc.lastAutoTable.finalY + 12);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 16,
            head: [['Email', 'Monto', 'Moneda', 'Método', 'Tipo', 'Estado', 'Fecha']],
            body: donations.map(d => [
                d.email,
                d.amount,
                d.currency === 'soles' ? 'S/' : '$',
                METHOD_LABEL[d.method] || d.method,
                d.type === 'sponsorship' ? 'Mensual' : 'Única',
                STATUS_LABEL[d.status]?.label?.replace(/[^\w\s]/gi, '') || d.status,
                d.createdAt?.toDate?.()?.toLocaleDateString('es-PE') || '—',
            ]),
            headStyles: { fillColor: [158, 27, 50] },
            styles: { fontSize: 8 },
        });

        doc.save('kusimayo_reporte.pdf');
    };

    const chartByMethod = ['izipay', 'paypal', 'yape', 'bcp'].map(m => ({
        name: METHOD_LABEL[m],
        confirmadas: donations.filter(d => d.method === m && d.status === 'completed').length,
        pendientes: donations.filter(d => d.method === m && d.status === 'pending_verification').length,
        total: donations.filter(d => d.method === m).reduce((a, d) => a + d.amount, 0),
    }));

    const last7 = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
        const total = donations
            .filter(don => {
                const dd = don.createdAt?.toDate?.();
                return dd && dd.toDateString() === d.toDateString() && don.status === 'completed';
            })
            .reduce((acc, don) => acc + don.amount, 0);
        return { name: label, total };
    });

    const filteredDonations = donations
        .filter(d => filterStatus === 'all' || d.status === filterStatus)
        .filter(d => !searchUser || d.email.includes(searchUser));

    const filteredUsers = users.filter(u =>
        !searchUser || u.email?.includes(searchUser) || u.displayName?.includes(searchUser)
    );

    if (!user || user.email !== ADMIN_EMAIL) return null;
    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Varela Round', sans-serif"
            }}>
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Cargando panel admin...</p>
            </div>
        );
    }

    console.log('🎨 Stats state antes de renderizar:', stats);

    return (
        <div style={{ 
            fontFamily: "'Varela Round', sans-serif",
            background: '#f9fafb',
            minHeight: '100vh',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Badge de Admin */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #fce7f3 0%, #fce7f3 100%)',
                    border: '2px solid #9E1B32',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: '0 4px 12px rgba(158, 27, 50, 0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#9E1B32',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <ShieldIcon />
                        </div>
                        <div>
                            <span style={{ 
                                color: '#9E1B32', 
                                fontWeight: 'bold', 
                                fontSize: '1.1rem',
                                display: 'block'
                            }}>
                                Panel de Administración
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                                {user.email}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/mi-cuenta')} 
                        style={{
                            background: 'white',
                            border: '2px solid #9E1B32',
                            color: '#9E1B32',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#9E1B32';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#9E1B32';
                        }}
                    >
                        <UserIcon />
                        Ver Mi Cuenta
                    </button>
                </div>

                {/* Header con acciones */}
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
                    <div>
                        <h1 style={{ 
                            color: '#1a1a1a',
                            fontSize: '2rem',
                            marginBottom: '0.25rem'
                        }}>
                            Dashboard Kusimayo
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            Gestión y análisis de donaciones
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button 
                            onClick={exportExcel} 
                            style={exportButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            <FileExcelIcon />
                            Excel
                        </button>
                        <button 
                            onClick={exportPDF} 
                            style={exportButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            <FilePdfIcon />
                            PDF
                        </button>
                        <button 
                            onClick={() => { logout(); navigate('/'); }} 
                            style={{
                                ...exportButton,
                                borderColor: '#dc2626',
                                color: '#dc2626'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            <LogoutIcon />
                            Salir
                        </button>
                    </div>
                </div>

                {/* Tabs modernos */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    marginBottom: '2rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                }}>
                    {[
                        { key: 'resumen', label: 'Resumen', icon: <ChartIcon />, badge: null },
                        { key: 'pendientes', label: 'Pendientes', icon: <ClockIcon />, badge: donations.filter(d => d.status === 'pending_verification').length },
                        { key: 'donaciones', label: 'Donaciones', icon: <HeartIcon />, badge: null },
                        { key: 'usuarios', label: 'Usuarios', icon: <UsersIcon />, badge: null },
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
                                whiteSpace: 'nowrap',
                                position: 'relative'
                            }}
                        >
                            {t.icon}
                            {t.label}
                            {t.badge > 0 && (
                                <span style={{
                                    background: activeTab === t.key ? 'rgba(255,255,255,0.3)' : '#9E1B32',
                                    color: activeTab === t.key ? 'white' : 'white',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* TAB: Resumen */}
                {activeTab === 'resumen' && (
                    <div>
                        {/* Stats Cards */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                            gap: '1rem', 
                            marginBottom: '2rem' 
                        }}>
                            <StatCard 
                                icon={<DollarIcon />}
                                label="Total recaudado" 
                                value={`$${stats?.totalAmount || 0}`}
                                color="#9E1B32"
                            />
                            <StatCard 
                                icon={<FileTextIcon />}
                                label="Donaciones" 
                                value={stats?.totalDonations || 0}
                                color="#9E1B32"
                            />
                            <StatCard 
                                icon={<HeartIconStat />}
                                label="Padrinos" 
                                value={stats?.totalSponsors || 0}
                                color="#9E1B32"
                            />
                            <StatCard 
                                icon={<GiftIcon />}
                                label="Únicas" 
                                value={stats?.totalUnique || 0}
                                color="#9E1B32"
                            />
                            <StatCard 
                                icon={<UsersIconStat />}
                                label="Usuarios" 
                                value={users.length}
                                color="#9E1B32"
                            />
                            <StatCard 
                                icon={<ClockIconStat />}
                                label="Pendientes" 
                                value={donations.filter(d => d.status === 'pending_verification').length}
                                color="#d97706"
                            />
                        </div>

                        {/* Gráfica de recaudación */}
                        <div style={cardStyle}>
                            <h3 style={{ 
                                marginBottom: '1.5rem', 
                                color: '#1a1a1a',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <TrendingUpIcon />
                                Recaudación últimos 7 días
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={last7}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9E1B32" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#9E1B32" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        formatter={v => [`$${v}`, 'Total']}
                                        contentStyle={{
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="#9E1B32" 
                                        strokeWidth={3}
                                        fill="url(#colorTotal)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gráfica por método de pago */}
                        <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
                            <h3 style={{ 
                                marginBottom: '1.5rem', 
                                color: '#1a1a1a',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <CreditCardIconLarge />
                                Donaciones por método de pago
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartByMethod}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip 
                                        contentStyle={{
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="confirmadas" fill="#9E1B32" name="Confirmadas" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="pendientes" fill="#fbbf24" name="Pendientes" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* TAB: Pendientes */}
                {activeTab === 'pendientes' && (
                    <div>
                        {donations.filter(d => d.status === 'pending_verification').length === 0 ? (
                            <div style={{ 
                                background: 'white',
                                borderRadius: '16px',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: '#f0fdf4',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    <CheckCircleIcon size={50} />
                                </div>
                                <h3 style={{ 
                                    color: '#15803d',
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem'
                                }}>
                                    Todo al día
                                </h3>
                                <p style={{ color: '#6b7280' }}>
                                    No hay pagos pendientes por revisar
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {donations.filter(d => d.status === 'pending_verification').map(d => (
                                    <div 
                                        key={d.id} 
                                        style={{ 
                                            background: 'white',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            border: '2px solid #fbbf24'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: '#fffbeb',
                                                        borderRadius: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#d97706'
                                                    }}>
                                                        <AlertCircleIcon />
                                                    </div>
                                                    <div>
                                                        <p style={{ 
                                                            fontWeight: 'bold', 
                                                            color: '#111827',
                                                            fontSize: '1.05rem'
                                                        }}>
                                                            {d.email}
                                                        </p>
                                                        <p style={{ 
                                                            color: '#6b7280', 
                                                            fontSize: '0.9rem',
                                                            marginTop: '0.25rem'
                                                        }}>
                                                            {METHOD_LABEL[d.method] || d.method} · {d.currency === 'soles' ? 'S/' : '$'}{d.amount}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p style={{ 
                                                    color: '#9ca3af', 
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <CalendarIconSmall />
                                                    {d.createdAt?.toDate?.()?.toLocaleDateString('es-PE', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) || '—'}
                                                </p>
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: '0.75rem',
                                                minWidth: '200px'
                                            }}>
                                                <button 
                                                    onClick={() => handleConfirm(d.id)} 
                                                    disabled={confirming === d.id}
                                                    style={{ 
                                                        background: '#15803d',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '8px',
                                                        cursor: confirming === d.id ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.95rem',
                                                        opacity: confirming === d.id ? 0.6 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <CheckIcon />
                                                    {confirming === d.id ? 'Confirmando...' : 'Confirmar pago'}
                                                </button>
                                                {showRejectConfirm === d.id ? (
                                                    <div style={{ 
                                                        background: '#fef2f2', 
                                                        border: '1px solid #fecaca', 
                                                        borderRadius: '8px', 
                                                        padding: '1rem'
                                                    }}>
                                                        <p style={{ 
                                                            color: '#dc2626', 
                                                            fontSize: '0.85rem', 
                                                            marginBottom: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            ⚠️ ¿Seguro que quieres rechazar? Esta acción no se puede deshacer.
                                                        </p>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button 
                                                                onClick={() => setShowRejectConfirm('')} 
                                                                style={{
                                                                    flex: 1,
                                                                    background: 'white',
                                                                    border: '2px solid #d1d5db',
                                                                    padding: '0.5rem',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '500',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(d.id)} 
                                                                disabled={rejecting === d.id}
                                                                style={{ 
                                                                    flex: 1,
                                                                    background: '#dc2626',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '0.5rem',
                                                                    borderRadius: '6px',
                                                                    cursor: rejecting === d.id ? 'not-allowed' : 'pointer',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.85rem',
                                                                    opacity: rejecting === d.id ? 0.6 : 1
                                                                }}
                                                            >
                                                                {rejecting === d.id ? 'Rechazando...' : 'Sí, rechazar'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setShowRejectConfirm(d.id)}
                                                        style={{ 
                                                            background: 'white',
                                                            border: '2px solid #fca5a5',
                                                            color: '#dc2626',
                                                            padding: '0.6rem 1rem',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500',
                                                            fontSize: '0.9rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#fef2f2';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'white';
                                                        }}
                                                    >
                                                        <XIcon />
                                                        Rechazar pago
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Donaciones */}
                {activeTab === 'donaciones' && (
                    <div>
                        {/* Filtros */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <label style={labelStyle}>Buscar por email</label>
                                <input 
                                    placeholder="email@ejemplo.com" 
                                    value={searchUser}
                                    onChange={e => setSearchUser(e.target.value)} 
                                    style={inputStyle} 
                                />
                            </div>
                            <div style={{ minWidth: '200px' }}>
                                <label style={labelStyle}>Filtrar por estado</label>
                                <select 
                                    value={filterStatus} 
                                    onChange={e => setFilterStatus(e.target.value)} 
                                    style={inputStyle}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="completed">✅ Confirmados</option>
                                    <option value="pending_verification">🕐 Pendientes</option>
                                    <option value="rejected">❌ Rechazados</option>
                                </select>
                            </div>
                        </div>

                        {/* Lista de donaciones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredDonations.map(d => {
                                const s = STATUS_LABEL[d.status] || STATUS_LABEL.pending_verification;
                                return (
                                    <div 
                                        key={d.id} 
                                        style={{ 
                                            background: 'white', 
                                            borderRadius: '12px', 
                                            padding: '1.25rem', 
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '1rem',
                                            transition: 'transform 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ 
                                                fontWeight: 'bold', 
                                                fontSize: '1rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {d.email}
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{ 
                                                    color: '#6b7280', 
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    {METHOD_LABEL[d.method] || d.method}
                                                </span>
                                                <span style={{
                                                    color: '#9E1B32',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {d.currency === 'soles' ? 'S/' : '$'}{d.amount}
                                                </span>
                                                <span style={{
                                                    background: d.type === 'sponsorship' ? '#fce7f3' : '#f3f4f6',
                                                    color: d.type === 'sponsorship' ? '#9E1B32' : '#6b7280',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {d.type === 'sponsorship' ? 'Mensual' : 'Única'}
                                                </span>
                                                <span style={{ 
                                                    color: '#9ca3af', 
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {d.createdAt?.toDate?.()?.toLocaleDateString('es-PE') || '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.75rem'
                                        }}>
                                            <span style={{ 
                                                background: s.bg, 
                                                color: s.color, 
                                                padding: '0.5rem 1rem', 
                                                borderRadius: '20px', 
                                                fontSize: '0.85rem', 
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {s.label}
                                            </span>
                                            {d.status === 'pending_verification' && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button 
                                                        onClick={() => handleConfirm(d.id)} 
                                                        disabled={confirming === d.id}
                                                        style={{
                                                            background: '#15803d',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '6px',
                                                            cursor: confirming === d.id ? 'not-allowed' : 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem',
                                                            opacity: confirming === d.id ? 0.6 : 1
                                                        }}
                                                    >
                                                        {confirming === d.id ? '...' : '✅'}
                                                    </button>
                                                    {showRejectConfirm === d.id ? (
                                                        <div style={{ 
                                                            background: '#fef2f2', 
                                                            border: '1px solid #fecaca', 
                                                            borderRadius: '8px', 
                                                            padding: '0.5rem',
                                                            display: 'flex',
                                                            gap: '0.5rem',
                                                            alignItems: 'center'
                                                        }}>
                                                            <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                                                                ⚠️ ¿Rechazar?
                                                            </span>
                                                            <button 
                                                                onClick={() => handleReject(d.id)} 
                                                                disabled={rejecting === d.id}
                                                                style={{
                                                                    background: '#dc2626',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {rejecting === d.id ? '...' : 'Sí'}
                                                            </button>
                                                            <button 
                                                                onClick={() => setShowRejectConfirm('')}
                                                                style={{
                                                                    background: 'white',
                                                                    border: '1px solid #d1d5db',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setShowRejectConfirm(d.id)}
                                                            style={{
                                                                background: 'white',
                                                                border: '2px solid #fca5a5',
                                                                color: '#dc2626',
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB: Usuarios */}
                {activeTab === 'usuarios' && (
                    <div>
                        {/* Buscador */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                            <label style={labelStyle}>Buscar usuario</label>
                            <input 
                                placeholder="Buscar por nombre o email..." 
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                                style={inputStyle} 
                            />
                        </div>

                        {/* Lista de usuarios */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredUsers.map(u => (
                                <div 
                                    key={u.id} 
                                    style={{ 
                                        background: 'white', 
                                        borderRadius: '12px', 
                                        padding: '1.25rem', 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        flex: 1
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            background: '#fce7f3',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#9E1B32',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem'
                                        }}>
                                            {(u.displayName || u.email || 'U')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ 
                                                fontWeight: 'bold', 
                                                fontSize: '1rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {u.displayName || 'Sin nombre'}
                                            </p>
                                            <p style={{ 
                                                color: '#6b7280', 
                                                fontSize: '0.85rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {u.email}
                                            </p>
                                            <p style={{ 
                                                color: '#9E1B32', 
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold'
                                            }}>
                                                Total donado: ${u.totalDonated || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem' 
                                    }}>
                                        <span style={{
                                            background: u.isActive !== false ? '#f0fdf4' : '#fef2f2',
                                            color: u.isActive !== false ? '#15803d' : '#dc2626',
                                            padding: '0.5rem 1rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {u.isActive !== false ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {u.isActive !== false && u.email !== ADMIN_EMAIL && (
                                            <button 
                                                onClick={() => handleDeactivateUser(u.id)}
                                                style={{
                                                    background: 'white',
                                                    border: '2px solid #fca5a5',
                                                    color: '#dc2626',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#fef2f2';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                }}
                                            >
                                                Desactivar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* COMPONENTES SVG */
/* ════════════════════════════════════════════════════════════════════════ */

function ShieldIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );
}

function FileExcelIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="8" y1="13" x2="16" y2="17"/>
            <line x1="16" y1="13" x2="8" y2="17"/>
        </svg>
    );
}

function FilePdfIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M10 12h4"/>
            <path d="M10 16h4"/>
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    );
}

function DollarIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    );
}

function FileTextIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>
    );
}

function HeartIconStat() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    );
}

function GiftIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect width="20" height="5" x="2" y="7"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
    );
}

function UsersIconStat() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    );
}

function ClockIconStat() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );
}

function TrendingUpIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    );
}

function CreditCardIconLarge() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="14" x="2" y="5" rx="2"/>
            <line x1="2" x2="22" y1="10" y2="10"/>
        </svg>
    );
}

function CheckCircleIcon({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );
}

function AlertCircleIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );
}

function CalendarIconSmall() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );
}

function XIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
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

/* ════════════════════════════════════════════════════════════════════════ */
/* ESTILOS */
/* ════════════════════════════════════════════════════════════════════════ */

const cardStyle = { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
};

const inputStyle = { 
    padding: '0.75rem', 
    width: '100%',
    borderRadius: '8px', 
    border: '2px solid #e5e7eb', 
    fontSize: '0.95rem',
    fontFamily: "'Varela Round', sans-serif",
    transition: 'border-color 0.2s'
};

const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
};

const exportButton = {
    background: 'white',
    border: '2px solid #e5e7eb',
    color: '#4b5563',
    padding: '0.6rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    fontFamily: "'Varela Round', sans-serif"
};

export default AdminDashboard;