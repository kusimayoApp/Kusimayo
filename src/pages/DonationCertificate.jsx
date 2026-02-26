// src/pages/DonationCertificate.jsx
// npm install jspdf

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════ */
/* HELPERS                                                                  */
/* ═══════════════════════════════════════════════════════════════════════ */

const loadImageAsBase64 = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
    });

const METHOD_NAMES = {
    izipay: 'Izipay',
    'izipay-redirect': 'Izipay',
    paypal: 'PayPal',
    yape: 'Yape / Plin',
    transferencia: 'Transferencia Bancaria',
};

/* ═══════════════════════════════════════════════════════════════════════ */
/* PDF GENERATOR                                                            */
/* ═══════════════════════════════════════════════════════════════════════ */

const generateCertificatePDF = async (donation, userName, certId) => {
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297;
    const H = 210;
    const GOLD = [212, 175, 55];
    const RED = [166, 13, 53];
    const WHITE = [255, 255, 255];

    // ── Fondo blanco total ────────────────────────────────────────────────
    doc.setFillColor(...WHITE);
    doc.rect(0, 0, W, H, 'F');

    // ── Banda superior roja ───────────────────────────────────────────────
    doc.setFillColor(...RED);
    doc.rect(0, 0, W, 28, 'F');

    // ── Banda inferior roja delgada ───────────────────────────────────────
    doc.setFillColor(...RED);
    doc.rect(0, H - 14, W, 14, 'F');

    // ── Borde dorado exterior ─────────────────────────────────────────────
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(2);
    doc.rect(5, 5, W - 10, H - 10);

    // ── Borde dorado interior ─────────────────────────────────────────────
    doc.setLineWidth(0.5);
    doc.rect(8, 8, W - 16, H - 16);

    // ── Líneas doradas decorativas horizontales (separan bandas) ─────────
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(8, 28, W - 8, 28);
    doc.line(8, H - 14, W - 8, H - 14);

    // ── Ornamentos esquinas (dentro del borde) ────────────────────────────
    const corner = (x, y, dx, dy) => {
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.7);
        doc.line(x, y, x + dx * 14, y);
        doc.line(x, y, x, y + dy * 14);
        doc.setLineWidth(0.3);
        doc.line(x + dx * 4, y + dy * 2, x + dx * 12, y + dy * 2);
        doc.line(x + dx * 2, y + dy * 4, x + dx * 2, y + dy * 12);
    };
    corner(10, 10, 1, 1);
    corner(W - 10, 10, -1, 1);
    corner(10, H - 10, 1, -1);
    corner(W - 10, H - 10, -1, -1);

    // ── Logo ──────────────────────────────────────────────────────────────
    let logoLoaded = false;
    try {
        const logoBase64 = await loadImageAsBase64('/src/assets/images/logoKusimayo.png');
        doc.addImage(logoBase64, 'PNG', W / 2 - 12, 4, 24, 24);
        logoLoaded = true;
    } catch {
        // fallback círculo dorado
        doc.setFillColor(...GOLD);
        doc.circle(W / 2, 16, 10, 'F');
        doc.setTextColor(...RED);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('K', W / 2, 20, { align: 'center' });
    }

    // ── Texto cabecera (en banda roja) ────────────────────────────────────
    doc.setTextColor(...GOLD);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('KUSIMAYO PERÚ', W / 2, 20, { align: 'center' });

    // ── Título principal ──────────────────────────────────────────────────
    doc.setTextColor(...RED);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE DONACIÓN', W / 2, 44, { align: 'center' });

    // Líneas decorativas doradas flanqueando título
    const titleW = 130;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - titleW / 2, 47, W / 2 - 70, 47);
    doc.line(W / 2 + 70, 47, W / 2 + titleW / 2, 47);

    // Rombo central
    doc.setFillColor(...GOLD);
    const rx = W / 2, ry = 47;
    doc.lines([[0, -3], [3, 3], [0, 3], [-3, -3]], rx - 3, ry, [1, 1], 'F', true);

    // ── "Se certifica que" ────────────────────────────────────────────────
    doc.setTextColor(120, 120, 130);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Se certifica que', W / 2, 58, { align: 'center' });

    // ── Nombre del donante ────────────────────────────────────────────────
    doc.setTextColor(30, 30, 40);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(userName || 'Donante Anónimo', W / 2, 70, { align: 'center' });

    // Línea dorada bajo nombre
    const nw = Math.min(doc.getTextWidth(userName || 'Donante Anónimo') + 16, 130);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(W / 2 - nw / 2, 73, W / 2 + nw / 2, 73);

    // ── Texto descriptivo ─────────────────────────────────────────────────
    doc.setTextColor(100, 100, 115);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
        'ha realizado una donación que contribuye al bienestar y educación de la infancia en el Perú.',
        W / 2, 82, { align: 'center' }
    );

    // ── Caja del monto ────────────────────────────────────────────────────
    const boxW = 100, boxH = 30;
    const boxX = (W - boxW) / 2, boxY = 89;

    doc.setFillColor(252, 231, 243); // fondo rosado muy suave
    doc.roundedRect(boxX, boxY, boxW, boxH, 5, 5, 'F');
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1);
    doc.roundedRect(boxX, boxY, boxW, boxH, 5, 5, 'D');

    doc.setTextColor(...GOLD);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTO DONADO', W / 2, boxY + 9, { align: 'center' });

    const symbol = (donation.currency === 'soles') ? 'S/' : '$';
    doc.setTextColor(...RED);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${symbol} ${donation.amount}`, W / 2, boxY + 23, { align: 'center' });

    // ── Tres columnas de datos ────────────────────────────────────────────
    const colsY = 132;
    const colDefs = [
        {
            label: 'FECHA',
            value: donation.createdAt?.toDate?.()?.toLocaleDateString('es-PE', {
                year: 'numeric', month: 'long', day: 'numeric'
            }) || new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }),
        },
        {
            label: 'MÉTODO DE PAGO',
            value: METHOD_NAMES[donation.method] || donation.method || '—',
        },
        {
            label: 'ID DE PAGO',
            value: donation.paymentId || '—',
        },
        {
            label: 'N° DE CERTIFICADO',
            value: certId ? certId.slice(0, 14).toUpperCase() : 'KUS-' + Date.now().toString().slice(-8),
        },
    ];

    colDefs.forEach((col, i) => {
        const cx = 38 + i * 74;
        const cw = 60;

        // Fondo blanco con borde dorado
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cx - cw / 2, colsY - 5, cw, 26, 3, 3, 'F');
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.5);
        doc.roundedRect(cx - cw / 2, colsY - 5, cw, 26, 3, 3, 'D');

        // Línea roja superior de acento
        doc.setFillColor(...RED);
        doc.roundedRect(cx - cw / 2, colsY - 5, cw, 5, 3, 3, 'F');
        doc.rect(cx - cw / 2, colsY - 3, cw, 3, 'F'); // cierra esquinas inferiores del acento

        doc.setTextColor(...WHITE);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(col.label, cx, colsY - 0.5, { align: 'center' });

        doc.setTextColor(30, 30, 40);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(col.value, cx, colsY + 14, { align: 'center', maxWidth: cw - 6 });
    });

    // ── Sello circular ────────────────────────────────────────────────────
    const sealX = W - 36, sealY = H - 36;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1);
    doc.circle(sealX, sealY, 16, 'D');
    doc.setLineWidth(0.3);
    doc.circle(sealX, sealY, 13, 'D');

    doc.setFillColor(...RED);
    doc.circle(sealX, sealY, 10, 'F');

    doc.setTextColor(...WHITE);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('KUSIMAYO', sealX, sealY - 2, { align: 'center' });
    doc.text('OFICIAL', sealX, sealY + 4, { align: 'center' });

    // ── Pie de página (en banda roja inferior) ────────────────────────────
    doc.setTextColor(...GOLD);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
        'Kusimayo Perú · Organización sin fines de lucro · www.kusimayo.org',
        W / 2, H - 5.5, { align: 'center' }
    );

    return doc;
};

/* ═══════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                           */
/* ═══════════════════════════════════════════════════════════════════════ */

export default function DonationCertificate({ donation, userName, userId, onClose, saveCertificate, getCertificate }) {
    const [certId, setCertId] = useState(null);
    const [loadingCert, setLoadingCert] = useState(true);

    // Al abrir: genera o recupera el certId de Firestore
    useEffect(() => {
        const initCert = async () => {
            try {
                // Busca si ya existe
                const existing = await getCertificate(donation.id);
                if (existing?.certId) {
                    setCertId(existing.certId);
                } else {
                    // Genera un ID único legible
                    const newId = `KUS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
                    await saveCertificate(donation.id, userId, {
                        certId: newId,
                        donorName: userName,
                        amount: donation.amount,
                        currency: donation.currency,
                        method: donation.method,
                    });
                    setCertId(newId);
                }
            } catch (err) {
                console.error('Error cert:', err);
                setCertId('KUS-' + donation.id?.slice(0, 8).toUpperCase());
            } finally {
                setLoadingCert(false);
            }
        };
        initCert();
    }, [donation.id]);

    const handleDownload = async () => {
        try {
            const doc = await generateCertificatePDF(donation, userName, certId);
            doc.save(`Certificado_Kusimayo_${certId || donation.id}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Error al generar el certificado. Intenta de nuevo.');
        }
    };

    const handlePreview = async () => {
        try {
            const doc = await generateCertificatePDF(donation, userName, certId);
            const url = URL.createObjectURL(doc.output('blob'));
            window.open(url, '_blank');
        } catch (err) {
            console.error(err);
            alert('Error al generar el certificado. Intenta de nuevo.');
        }
    };

    const symbol = donation.currency === 'soles' ? 'S/' : '$';
    const dateStr = donation.createdAt?.toDate?.()?.toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric',
    }) || '—';

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                    animation: 'fadeIn 0.2s ease',
                }}
            >
                {/* Modal */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'white',
                        border: '2px solid rgba(212,175,55,0.6)',
                        borderRadius: '20px',
                        maxWidth: '480px',
                        width: '100%',
                        overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(212,175,55,0.2)',
                        fontFamily: "'Varela Round', sans-serif",
                        animation: 'slideUp 0.3s ease',
                    }}
                >
                    {/* Header rojo */}
                    <div style={{
                        background: '#A60D35',
                        padding: '1.75rem 2rem 1.5rem',
                        position: 'relative',
                        borderBottom: '3px solid rgba(212,175,55,0.6)',
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(255,255,255,0.15)', border: 'none',
                                color: 'white', width: '30px', height: '30px',
                                borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >✕</button>

                        {/* Ícono medallón */}
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.12)',
                            border: '2px solid rgba(212,175,55,0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.9)" strokeWidth="1.6">
                                <circle cx="12" cy="8" r="6" />
                                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                            </svg>
                        </div>

                        <h2 style={{ color: 'white', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.2rem' }}>
                            Certificado de Donación
                        </h2>
                        <p style={{ color: 'rgba(212,175,55,0.85)', textAlign: 'center', fontSize: '0.8rem', margin: 0 }}>
                            Kusimayo Perú · Documento oficial
                        </p>
                    </div>

                    {/* Cuerpo */}
                    <div style={{ padding: '1.5rem 2rem 2rem' }}>

                        {/* Datos */}
                        <div style={{
                            border: '1.5px solid rgba(212,175,55,0.4)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '1.25rem',
                        }}>
                            {/* Encabezado tabla */}
                            <div style={{ background: '#A60D35', padding: '0.5rem 1rem' }}>
                                <p style={{ color: 'rgba(212,175,55,0.9)', fontSize: '0.7rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Resumen del certificado
                                </p>
                            </div>

                            {[
                                { label: 'Donante', value: userName || 'Donante Anónimo' },
                                { label: 'Monto', value: `${symbol} ${donation.amount}`, highlight: true },
                                { label: 'Fecha', value: dateStr },
                                { label: 'Método', value: METHOD_NAMES[donation.method] || donation.method || '—' },
                                { label: 'N° Certificado', value: loadingCert ? 'Generando...' : certId, mono: true },
                                { label: 'ID de Pago', value: donation.paymentId || '—', mono: true },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.65rem 1rem',
                                    background: i % 2 === 0 ? 'white' : '#fafafa',
                                    borderTop: '1px solid #f0f0f0',
                                }}>
                                    <span style={{ color: '#888', fontSize: '0.82rem' }}>{row.label}</span>
                                    <span style={{
                                        color: row.highlight ? '#A60D35' : '#1a1a1a',
                                        fontSize: row.highlight ? '1.05rem' : '0.88rem',
                                        fontWeight: row.highlight ? 'bold' : '600',
                                        fontFamily: row.mono ? 'monospace' : 'inherit',
                                    }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Nota */}
                        <div style={{
                            background: '#fff8e1',
                            border: '1px solid rgba(212,175,55,0.4)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            marginBottom: '1.25rem',
                            display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        }}>
                            <span style={{ fontSize: '1rem', flexShrink: 0 }}>✨</span>
                            <p style={{ color: '#7a6000', fontSize: '0.78rem', margin: 0, lineHeight: '1.5' }}>
                                Tu certificado incluye logo, número oficial, fecha y todos los detalles de tu aporte.
                            </p>
                        </div>

                        {/* Botones */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button
                                onClick={handlePreview}
                                disabled={loadingCert}
                                style={{
                                    padding: '0.85rem',
                                    background: 'white',
                                    border: '2px solid #A60D35',
                                    color: '#A60D35',
                                    borderRadius: '10px',
                                    cursor: loadingCert ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                    opacity: loadingCert ? 0.5 : 1,
                                    fontFamily: "'Varela Round', sans-serif",
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!loadingCert) e.currentTarget.style.background = '#fce7f3'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                            >
                                <EyeIcon /> Visualizar
                            </button>

                            <button
                                onClick={handleDownload}
                                disabled={loadingCert}
                                style={{
                                    padding: '0.85rem',
                                    background: '#A60D35',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '10px',
                                    cursor: loadingCert ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                    opacity: loadingCert ? 0.5 : 1,
                                    boxShadow: '0 4px 14px rgba(166,13,53,0.35)',
                                    fontFamily: "'Varela Round', sans-serif",
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!loadingCert) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(166,13,53,0.45)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(166,13,53,0.35)'; }}
                            >
                                <DownloadIcon /> Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
        </>
    );
}

function EyeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}