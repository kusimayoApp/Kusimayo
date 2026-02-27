import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    getAllUsers, confirmDonation,
    deactivateUser, rejectDonation,
    updateStatsOnConfirm, subscribeToStats, subscribeToDonations
} from '../services/firestore';
import * as XLSX from 'xlsx-js-style';


const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kusimayo.org';

const STATUS_LABEL = {
    completed: { label: 'Confirmado', color: '#15803d', bg: '#f0fdf4' },
    pending_verification: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7' },
    rejected: { label: 'Rechazado', color: '#dc2626', bg: '#fef2f2' },
};

const METHOD_LABEL = {
    izipay: 'IziPay',
    paypal: 'PayPal',
};

/* ══════════════════════════════════════════════════════════════ */
/* HELPERS */
/* ══════════════════════════════════════════════════════════════ */

function normalize(str) {
    if (str == null) return '';
    return String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fuzzyMatch(haystack, needle = '') {
    if (!needle) return true;
    const h = normalize(haystack);
    const n = normalize(needle);
    return h.includes(n);
}

/* ══════════════════════════════════════════════════════════════ */
/* COMPONENT */
/* ══════════════════════════════════════════════════════════════ */

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
    const [searchDon, setSearchDon] = useState('');
    const [searchUser, setSearchUser] = useState('');

    useEffect(() => {
        if (!user) { navigate('/mi-cuenta'); return; }
        if (user.email !== ADMIN_EMAIL) { navigate('/'); return; }

        getAllUsers().then(setUsers).finally(() => setLoading(false));

        const unsubDonations = subscribeToDonations(setDonations);
        const unsubStats = subscribeToStats((data) => setStats(data));

        return () => { unsubDonations(); unsubStats(); };
    }, [user, navigate]);

    /* ── Totals ── */
    const totalDonadoSoles = useMemo(() =>
        donations
            .filter(d => d.status === 'completed' && d.currency === 'soles')
            .reduce((a, d) => a + (d.amount || 0), 0),
        [donations]
    );

    const totalDonadoDolares = useMemo(() =>
        donations
            .filter(d => d.status === 'completed' && d.currency !== 'soles')
            .reduce((a, d) => a + (d.amount || 0), 0),
        [donations]
    );

    const desayunosEntregados = Math.floor(totalDonadoSoles / 2.08) + Math.floor((totalDonadoDolares * 3.75) / 2.08);

    /* ── Actions ── */
    const handleConfirm = async (donationId) => {
        setConfirming(donationId);
        try {
            const donation = donations.find(d => d.id === donationId);
            await confirmDonation(donationId);
            await updateStatsOnConfirm(donation);
        } finally { setConfirming(''); }
    };

    const handleReject = async (donationId) => {
        setRejecting(donationId);
        try {
            await rejectDonation(donationId);
            setShowRejectConfirm('');
        } finally { setRejecting(''); }
    };

    const handleDeactivateUser = async (userId) => {
        await deactivateUser(userId);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u));
    };

    /* ── Exports ── */
    const exportExcel = () => {
        const rows = donations.map(d => ({
            'ID': d.id,
            'Payment ID': d.paymentId || '—',
            'Email': d.email,
            'Monto': d.amount,
            'Moneda': d.currency === 'soles' ? 'Soles' : 'USD',
            'Método': METHOD_LABEL[d.method] || d.method,
            'Tipo': d.type === 'sponsorship' ? 'Mensual' : 'Única',
            'Estado': STATUS_LABEL[d.status]?.label || d.status,
            'Fecha': d.createdAt?.toDate?.()?.toLocaleDateString('es-PE') || '—',
        }));

        const usersRows = users.map(u => ({
            'Nombre': u.displayName || 'Sin nombre',
            'Email': u.email,
            'Total donado': u.totalDonated || 0,
            'Estado': u.isActive !== false ? 'Activo' : 'Inactivo',
        }));

        const wb = XLSX.utils.book_new();

        const applyStyles = (ws, headers, colWidths) => {
            ws['!cols'] = colWidths;

            const headerStyle = {
                font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
                fill: { fgColor: { rgb: '9E1B32' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFFFFF' } },
                    bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
                    left: { style: 'thin', color: { rgb: 'FFFFFF' } },
                    right: { style: 'thin', color: { rgb: 'FFFFFF' } },
                },
            };

            const evenRowStyle = {
                fill: { fgColor: { rgb: 'FCE7F3' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'F3D0DE' } },
                    bottom: { style: 'thin', color: { rgb: 'F3D0DE' } },
                    left: { style: 'thin', color: { rgb: 'F3D0DE' } },
                    right: { style: 'thin', color: { rgb: 'F3D0DE' } },
                },
            };

            const oddRowStyle = {
                fill: { fgColor: { rgb: 'FFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'F3D0DE' } },
                    bottom: { style: 'thin', color: { rgb: 'F3D0DE' } },
                    left: { style: 'thin', color: { rgb: 'F3D0DE' } },
                    right: { style: 'thin', color: { rgb: 'F3D0DE' } },
                },
            };

            const range = XLSX.utils.decode_range(ws['!ref']);

            for (let R = range.s.r; R <= range.e.r; R++) {
                for (let C = range.s.c; C <= range.e.c; C++) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
                    if (R === 0) {
                        ws[cellRef].s = headerStyle;
                    } else {
                        ws[cellRef].s = R % 2 === 0 ? evenRowStyle : oddRowStyle;
                    }
                }
            }

            ws['!rows'] = [{ hpt: 22 }]; // header row height
        };

        const ws = XLSX.utils.json_to_sheet(rows);
        applyStyles(ws, Object.keys(rows[0] || {}), [
            { wch: 28 }, { wch: 16 }, { wch: 32 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'Donaciones');

        const ws2 = XLSX.utils.json_to_sheet(usersRows);
        applyStyles(ws2, Object.keys(usersRows[0] || {}), [
            { wch: 28 }, { wch: 32 }, { wch: 16 }, { wch: 12 },
        ]);
        XLSX.utils.book_append_sheet(wb, ws2, 'Usuarios');

        XLSX.writeFile(wb, 'kusimayo_reporte.xlsx');
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(158, 27, 50);
        doc.text('Kusimayo Peru — Reporte de Donaciones', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28);
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Resumen General', 14, 40);
        autoTable(doc, {
            startY: 44,
            head: [['Recaudado S/', 'Recaudado USD', 'Donaciones', 'Pendientes', 'Desayunos']],
            body: [[
                `S/ ${totalDonadoSoles.toFixed(2)}`,
                `$ ${totalDonadoDolares.toFixed(2)}`,
                stats?.totalDonations || 0,
                donations.filter(d => d.status === 'pending_verification').length,
                desayunosEntregados,
            ]],
            headStyles: { fillColor: [158, 27, 50] },
        });
        doc.text('Detalle de Donaciones', 14, doc.lastAutoTable.finalY + 12);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 16,
            head: [['Email', 'Payment ID', 'Monto', 'Moneda', 'Método', 'Tipo', 'Estado', 'Fecha']],
            body: donations.map(d => [
                d.email,
                d.paymentId || '—',
                d.amount,
                d.currency === 'soles' ? 'S/' : '$',
                METHOD_LABEL[d.method] || d.method,
                d.type === 'sponsorship' ? 'Mensual' : 'Única',
                STATUS_LABEL[d.status]?.label || d.status,
                d.createdAt?.toDate?.()?.toLocaleDateString('es-PE') || '—',
            ]),
            headStyles: { fillColor: [158, 27, 50] },
            styles: { fontSize: 7 },
        });
        doc.save('kusimayo_reporte.pdf');
    };

    /* ── Chart data ── */
    const chartByMethod = [
        {
            name: 'Confirmadas',
            izipay: donations.filter(d => d.method === 'izipay' && d.status === 'completed').length,
            paypal: donations.filter(d => d.method === 'paypal' && d.status === 'completed').length,
        },
    ];

    const last7 = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
        const soles = donations
            .filter(don => { const dd = don.createdAt?.toDate?.(); return dd && dd.toDateString() === d.toDateString() && don.status === 'completed' && don.currency === 'soles'; })
            .reduce((acc, don) => acc + don.amount, 0);
        const usd = donations
            .filter(don => { const dd = don.createdAt?.toDate?.(); return dd && dd.toDateString() === d.toDateString() && don.status === 'completed' && don.currency !== 'soles'; })
            .reduce((acc, don) => acc + don.amount, 0);
        return { name: label, Soles: soles, USD: usd };
    });

    /* ── Filtered lists ── */
    const filteredDonations = useMemo(() => donations
        .filter(d => filterStatus === 'all' || d.status === filterStatus)
        .filter(d => {
            if (!searchDon) return true;
            return (
                fuzzyMatch(d.email, searchDon) ||
                fuzzyMatch(d.paymentId, searchDon) ||
                fuzzyMatch(d.anonymousName, searchDon)
            );
        }),
        [donations, filterStatus, searchDon]
    );

    const filteredUsers = useMemo(() => users.filter(u =>
        !searchUser ||
        fuzzyMatch(u.email, searchUser) ||
        fuzzyMatch(u.displayName, searchUser)
    ), [users, searchUser]);

    if (!user || user.email !== ADMIN_EMAIL) return null;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            <p style={{ color: '#6b7280' }}>Cargando panel admin...</p>
        </div>
    );

    const pendingCount = donations.filter(d => d.status === 'pending_verification').length;

    /* ════════════════════════════════════════════════════════════════ */
    /* RENDER */
    /* ════════════════════════════════════════════════════════════════ */
    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; }
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            @keyframes pulse-dot {
                0%, 100% { transform: scale(1); opacity: 1; }
                50%       { transform: scale(1.4); opacity: 0.6; }
            }
            .kusi-card {
                animation: fadeUp 0.35s ease both;
            }
            .kusi-tab-btn:hover {
                background: #f3f4f6 !important;
                color: #111 !important;
            }
            .kusi-tab-btn.active:hover {
                background: #8a1628 !important;
                color: white !important;
            }
            .kusi-topbtn:hover {
                background: #f9fafb !important;
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(0,0,0,0.08) !important;
            }
            .kusi-topbtn.danger:hover {
                background: #fff1f2 !important;
            }
            .kusi-row:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important;
            }
            .kusi-stat:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(158,27,50,0.14) !important;
            }
            .kusi-confirm-btn:hover { filter: brightness(1.08); }
            .kusi-reject-btn:hover  { background: #fff1f2 !important; }
            .tab-bar {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            @media (max-width: 540px) {
                .tab-bar {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            .stat-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            @media (max-width: 700px) {
                .stat-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 420px) {
                .stat-grid { grid-template-columns: 1fr 1fr; }
            }
            .topbar-actions {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            @media (max-width: 600px) {
                .topbar-actions .btn-label { display: none; }
            }
            .filter-row {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .filter-row > div:first-child { flex: 2 1 220px; }
            .filter-row > div:last-child  { flex: 1 1 160px; }
        `}</style>
            <div style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(145deg, #f7f8fa 0%, #eef0f4 100%)', minHeight: '100vh', padding: '1.5rem 1rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* ── Top bar ── */}
                    <div className="kusi-card" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1rem 1.5rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                        animationDelay: '0ms',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{
                                width: 42, height: 42, flexShrink: 0,
                                background: 'linear-gradient(135deg, #9E1B32 0%, #c0293f 100%)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(158,27,50,0.35)'
                            }}>
                                <ShieldIcon />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', color: '#0f0f10', fontSize: '1rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                                    Kusimayo Admin
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '1px' }}>{user.email}</div>
                            </div>
                        </div>
                        <div className="topbar-actions">
                            <TopBtn icon={<FileExcelIcon />} label="Excel" onClick={exportExcel} />
                            <TopBtn icon={<FilePdfIcon />} label="PDF" onClick={exportPDF} />
                            <TopBtn icon={<UserIcon />} label="Mi cuenta" onClick={() => navigate('/mi-cuenta')} />
                            <TopBtn icon={<LogoutIcon />} label="Salir" onClick={() => { logout(); navigate('/'); }} danger />
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="tab-bar kusi-card" style={{ animationDelay: '60ms' }}>
                        {[
                            { key: 'resumen', label: 'Resumen', icon: <ChartIcon /> },
                            { key: 'pendientes', label: 'Pendientes', icon: <ClockIcon />, badge: pendingCount },
                            { key: 'donaciones', label: 'Donaciones', icon: <HeartIcon /> },
                            { key: 'usuarios', label: 'Usuarios', icon: <UsersIcon /> },
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`kusi-tab-btn${activeTab === t.key ? ' active' : ''}`}
                                style={{
                                    padding: '0.7rem 0.5rem',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === t.key ? '700' : '500',
                                    background: activeTab === t.key
                                        ? 'linear-gradient(135deg, #9E1B32 0%, #c0293f 100%)'
                                        : '#f3f4f6',
                                    color: activeTab === t.key ? 'white' : '#6b7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap',
                                    boxShadow: activeTab === t.key ? '0 4px 14px rgba(158,27,50,0.3)' : 'none',
                                    transition: 'all 0.2s',
                                    fontFamily: "'DM Sans', sans-serif",
                                    width: '100%',
                                }}
                            >
                                {t.icon}
                                <span>{t.label}</span>
                                {t.badge > 0 && (
                                    <span style={{
                                        background: activeTab === t.key ? 'rgba(255,255,255,0.28)' : '#9E1B32',
                                        color: 'white', padding: '0.1rem 0.42rem',
                                        borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800',
                                        animation: 'pulse-dot 2s infinite',
                                        display: 'inline-block',
                                    }}>{t.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ════════════════════ TAB: RESUMEN ════════════════════ */}
                    {activeTab === 'resumen' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            {/* Stat cards */}
                            <div className="stat-grid">
                                <StatCard icon={<SolesIcon />} label="Recaudado S/" value={`S/ ${totalDonadoSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="#9E1B32" delay="0ms" />
                                <StatCard icon={<DollarIcon />} label="Recaudado USD" value={`$ ${totalDonadoDolares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="#9E1B32" delay="50ms" />
                                <StatCard icon={<FileTextIcon />} label="Donaciones" value={stats?.totalDonations || 0} color="#9E1B32" delay="100ms" />
                                <StatCard icon={<UsersIconStat />} label="Usuarios" value={users.length} color="#9E1B32" delay="150ms" />
                                <StatCard icon={<ClockIconStat />} label="Pendientes" value={pendingCount} color="#b45309" delay="200ms" accent="#b45309" />
                                <StatCard icon={<CoffeeIcon />} label="Desayunos" value={desayunosEntregados.toLocaleString()} color="#9E1B32" delay="250ms" />
                            </div>

                            {/* Chart: últimos 7 días */}
                            <div className="kusi-card" style={{ ...cardStyle, animationDelay: '300ms' }}>
                                <SectionTitle icon={<TrendingUpIcon />} title="Recaudación últimos 7 días" />
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={last7}>
                                        <defs>
                                            <linearGradient id="gSoles" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#9E1B32" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#9E1B32" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gUSD" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend iconType="circle" iconSize={8} />
                                        <Area type="monotone" dataKey="Soles" stroke="#9E1B32" strokeWidth={2.5} fill="url(#gSoles)" dot={false} activeDot={{ r: 5, fill: '#9E1B32' }} />
                                        <Area type="monotone" dataKey="USD" stroke="#2563eb" strokeWidth={2.5} fill="url(#gUSD)" dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Chart: por método */}
                            <div className="kusi-card" style={{ ...cardStyle, marginTop: '1.25rem', animationDelay: '360ms' }}>
                                <SectionTitle icon={<CreditCardIconLarge />} title="Donaciones por método de pago" />
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={chartByMethod} barSize={60}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                        <Bar dataKey="izipay" name="IziPay" fill="#9E1B32" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="paypal" name="PayPal" fill="#0070e0" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
                                    Rojo = IziPay · Azul = PayPal ·
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════ TAB: PENDIENTES ════════════════════ */}
                    {activeTab === 'pendientes' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            {pendingCount === 0 ? (
                                <EmptyState
                                    icon={<CheckCircleIcon size={48} />}
                                    title="Todo al día"
                                    subtitle="No hay pagos pendientes por revisar"
                                    color="#15803d"
                                    bg="#f0fdf4"
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {donations.filter(d => d.status === 'pending_verification').map(d => (
                                        <PendingCard
                                            key={d.id}
                                            d={d}
                                            confirming={confirming}
                                            rejecting={rejecting}
                                            showRejectConfirm={showRejectConfirm}
                                            onConfirm={handleConfirm}
                                            onReject={handleReject}
                                            onAskReject={() => setShowRejectConfirm(d.id)}
                                            onCancelReject={() => setShowRejectConfirm('')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════ TAB: DONACIONES ════════════════════ */}
                    {activeTab === 'donaciones' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                                <div className="filter-row">
                                    <div>
                                        <FieldLabel>Buscar por nombre, correo o ID de certificado</FieldLabel>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                                                <SearchIcon />
                                            </span>
                                            <input
                                                placeholder="ej. juan@email.com · KUS-A1B2..."
                                                value={searchDon}
                                                onChange={e => setSearchDon(e.target.value)}
                                                style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Estado</FieldLabel>
                                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
                                            <option value="all">Todos</option>
                                            <option value="completed">Confirmados</option>
                                            <option value="pending_verification">Pendientes</option>
                                            <option value="rejected">Rechazados</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {filteredDonations.length === 0 && (
                                    <EmptyState icon={<SearchIcon size={40} />} title="Sin resultados" subtitle="Intenta con otro término de búsqueda" color="#6b7280" bg="#f9fafb" />
                                )}
                                {filteredDonations.map(d => {
                                    const s = STATUS_LABEL[d.status] || STATUS_LABEL.pending_verification;
                                    return (
                                        <div key={d.id} className="kusi-row" style={{
                                            background: 'white', borderRadius: '12px', padding: '1rem 1.25rem',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            flexWrap: 'wrap', gap: '0.75rem',
                                            transition: 'all 0.18s',
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {d.email || d.anonymousName || 'Anónimo'}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                                    {d.paymentId && (
                                                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', fontFamily: 'monospace' }}>
                                                            {d.paymentId}
                                                        </span>
                                                    )}
                                                    <span style={{ color: '#9E1B32', fontWeight: '700', fontSize: '0.9rem' }}>
                                                        {d.currency === 'soles' ? 'S/' : '$'}{d.amount}
                                                    </span>
                                                    <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                                                        {METHOD_LABEL[d.method] || d.method}
                                                    </span>
                                                    <span style={{ background: d.type === 'sponsorship' ? '#fce7f3' : '#f3f4f6', color: d.type === 'sponsorship' ? '#9E1B32' : '#6b7280', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' }}>
                                                        {d.type === 'sponsorship' ? 'Mensual' : 'Única'}
                                                    </span>
                                                    <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                                                        {d.createdAt?.toDate?.()?.toLocaleDateString('es-PE') || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                                                <span style={{ background: s.bg, color: s.color, padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                                    {s.label}
                                                </span>
                                                {d.status === 'pending_verification' && (
                                                    <InlineActions
                                                        id={d.id}
                                                        confirming={confirming}
                                                        rejecting={rejecting}
                                                        showRejectConfirm={showRejectConfirm}
                                                        onConfirm={handleConfirm}
                                                        onReject={handleReject}
                                                        onAskReject={() => setShowRejectConfirm(d.id)}
                                                        onCancelReject={() => setShowRejectConfirm('')}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ════════════════════ TAB: USUARIOS ════════════════════ */}
                    {activeTab === 'usuarios' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                                <FieldLabel>Buscar usuario</FieldLabel>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                                        <SearchIcon />
                                    </span>
                                    <input
                                        placeholder="Nombre o correo..."
                                        value={searchUser}
                                        onChange={e => setSearchUser(e.target.value)}
                                        style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {filteredUsers.length === 0 && (
                                    <EmptyState icon={<SearchIcon size={40} />} title="Sin resultados" subtitle="Intenta con otro término" color="#6b7280" bg="#f9fafb" />
                                )}
                                {filteredUsers.map(u => (
                                    <div key={u.id} className="kusi-row" style={{
                                        background: 'white', borderRadius: '12px', padding: '1rem 1.25rem',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        flexWrap: 'wrap', gap: '0.75rem',
                                        transition: 'all 0.18s',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: 44, height: 44, flexShrink: 0,
                                                background: '#fce7f3', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#9E1B32', fontWeight: '700', fontSize: '1.1rem'
                                            }}>
                                                {(u.displayName || u.email || 'U')[0].toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {u.displayName || 'Sin nombre'}
                                                </div>
                                                <div style={{ color: '#6b7280', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                                <div style={{ color: '#9E1B32', fontSize: '0.82rem', fontWeight: '700', marginTop: '0.15rem' }}>
                                                    Total donado: ${u.totalDonated || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                                            <span style={{
                                                background: u.isActive !== false ? '#f0fdf4' : '#fef2f2',
                                                color: u.isActive !== false ? '#15803d' : '#dc2626',
                                                padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700'
                                            }}>
                                                {u.isActive !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                            {u.isActive !== false && u.email !== ADMIN_EMAIL && (
                                                <button onClick={() => handleDeactivateUser(u.id)} style={dangerBtnStyle}>
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
        </>
    );
}

/* ══════════════════════════════════════════════════════════════ */
/* SUB-COMPONENTS */
/* ══════════════════════════════════════════════════════════════ */

function PendingCard({ d, confirming, rejecting, showRejectConfirm, onConfirm, onReject, onAskReject, onCancelReject }) {
    return (
        <div style={{
            background: 'white', borderRadius: '12px', padding: '1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '2px solid #fde68a',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.email || 'Sin email'}
                    </div>
                    {d.paymentId && (
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#374151', background: '#f3f4f6', display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '5px', marginBottom: '0.4rem' }}>
                            {d.paymentId}
                        </div>
                    )}
                    <div style={{ color: '#6b7280', fontSize: '0.88rem' }}>
                        {METHOD_LABEL[d.method] || d.method} · {d.currency === 'soles' ? 'S/' : '$'}{d.amount}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        {d.createdAt?.toDate?.()?.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) || '—'}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '180px' }}>
                    <button
                        onClick={() => onConfirm(d.id)}
                        disabled={confirming === d.id}
                        style={{ background: '#15803d', color: 'white', border: 'none', padding: '0.65rem 1rem', borderRadius: '8px', cursor: confirming === d.id ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.9rem', opacity: confirming === d.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'DM Sans', sans-serif" }}
                    >
                        <CheckIcon /> {confirming === d.id ? 'Confirmando...' : 'Confirmar pago'}
                    </button>
                    {showRejectConfirm === d.id ? (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem' }}>
                            <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.6rem', fontWeight: '600' }}>
                                Esta acción no se puede deshacer. ¿Rechazar?
                            </p>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={onCancelReject} style={{ flex: 1, background: 'white', border: '1.5px solid #d1d5db', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
                                <button onClick={() => onReject(d.id)} disabled={rejecting === d.id} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: rejecting === d.id ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.82rem', opacity: rejecting === d.id ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                                    {rejecting === d.id ? '...' : 'Sí, rechazar'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={onAskReject} style={{ background: 'white', border: '2px solid #fca5a5', color: '#dc2626', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'DM Sans', sans-serif" }}>
                            <XIcon /> Rechazar pago
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InlineActions({ id, confirming, rejecting, showRejectConfirm, onConfirm, onReject, onAskReject, onCancelReject }) {
    return (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
                onClick={() => onConfirm(id)}
                disabled={confirming === id}
                title="Confirmar"
                style={{ background: '#15803d', color: 'white', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '6px', cursor: confirming === id ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.82rem', opacity: confirming === id ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}
            >
                {confirming === id ? '...' : <CheckIcon />}
            </button>
            {showRejectConfirm === id ? (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', background: '#fef2f2', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    <span style={{ color: '#dc2626', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>¿Rechazar?</span>
                    <button onClick={() => onReject(id)} disabled={rejecting === id} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" }}>
                        {rejecting === id ? '...' : 'Sí'}
                    </button>
                    <button onClick={onCancelReject} style={{ background: 'white', border: '1px solid #d1d5db', padding: '0.25rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>No</button>
                </div>
            ) : (
                <button onClick={onAskReject} title="Rechazar" style={{ background: 'white', border: '2px solid #fca5a5', color: '#dc2626', padding: '0.4rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" }}>
                    <XIcon />
                </button>
            )}
        </div>
    );
}

function TopBtn({ icon, label, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={`kusi-topbtn${danger ? ' danger' : ''}`}
            style={{
                background: 'white',
                border: `1.5px solid ${danger ? '#fca5a5' : '#e5e7eb'}`,
                color: danger ? '#dc2626' : '#374151',
                padding: '0.45rem 0.9rem', borderRadius: '9px', cursor: 'pointer',
                fontWeight: '500', fontSize: '0.83rem', display: 'flex', alignItems: 'center',
                gap: '0.35rem', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            {icon}<span className="btn-label">{label}</span>
        </button>
    );
}

function StatCard({ icon, label, value, color, delay = '0ms', accent }) {
    return (
        <div
            className="kusi-stat kusi-card"
            style={{
                background: 'white', borderRadius: '14px', padding: '1.25rem',
                textAlign: 'center', cursor: 'default',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.22s',
                borderTop: `3px solid ${accent || color}`,
                animationDelay: delay,
            }}
        >
            <div style={{ color: accent || color, display: 'flex', justifyContent: 'center', marginBottom: '0.65rem' }}>{icon}</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: accent || color, marginBottom: '0.3rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ color: '#9ca3af', fontSize: '0.78rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        </div>
    );
}

function EmptyState({ icon, title, subtitle, color, bg }) {
    return (
        <div style={{ background: 'white', borderRadius: '14px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 80, height: 80, background: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color }}>
                {icon}
            </div>
            <h3 style={{ color, fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.4rem' }}>{title}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{subtitle}</p>
        </div>
    );
}

function SectionTitle({ icon, title }) {
    return (
        <h3 style={{ marginBottom: '1.25rem', color: '#111', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#9E1B32' }}>{icon}</span>
            {title}
        </h3>
    );
}

function FieldLabel({ children }) {
    return <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', fontSize: '0.85rem' }}>{children}</label>;
}

/* ══════════════════════════════════════════════════════════════ */
/* STYLES */
/* ══════════════════════════════════════════════════════════════ */

const cardStyle = { background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

const inputStyle = {
    padding: '0.65rem 0.85rem', width: '100%', boxSizing: 'border-box',
    borderRadius: '8px', border: '1.5px solid #e5e7eb',
    fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.15s',
    background: '#fafafa',
};

const dangerBtnStyle = {
    background: 'white', border: '1.5px solid #fca5a5', color: '#dc2626',
    padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '500', fontSize: '0.82rem', transition: 'background 0.15s',
    fontFamily: "'DM Sans', sans-serif",
};

const tooltipStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.82rem' };

/* ══════════════════════════════════════════════════════════════ */
/* SVG ICONS */
/* ══════════════════════════════════════════════════════════════ */

function ShieldIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }
function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
function FileExcelIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="17" /><line x1="16" y1="13" x2="8" y2="17" /></svg>; }
function FilePdfIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M10 12h4" /><path d="M10 16h4" /></svg>; }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function ChartIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>; }
function ClockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function HeartIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function SolesIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9 8.5c0-1 .8-2 2.5-2s2.5 1 2.5 2-1 1.8-2.5 2.5S9 12.5 9 13.5 9.8 16 12 16s3-1 3-2.5" /><line x1="12" y1="6" x2="12" y2="4" /><line x1="12" y1="18" x2="12" y2="20" /></svg>; }
function DollarIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function FileTextIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>; }
function UsersIconStat() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function ClockIconStat() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function CoffeeIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>; }
function TrendingUpIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>; }
function CreditCardIconLarge() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>; }
function CheckCircleIcon({ size = 24 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>; }
function CheckIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>; }
function XIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function SearchIcon({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }

export default AdminDashboard;