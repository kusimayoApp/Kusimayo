// src/pages/DonationCertificate.jsx
// npm install jspdf

import { useEffect, useState } from 'react';

const loadImageAsBase64 = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve({ base64: canvas.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
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

const generateCertificatePDF = async (donation, userName, certId) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297;
    const H = 210;

    // ─── PALETA ────────────────────────────────────────────────────────
    const GOLD   = [212, 175, 55];
    const GOLD_L = [249, 226, 125];
    const WHITE  = [255, 255, 255];
    const CREAM  = [248, 235, 200];

    // ─── 1. FONDO exacto del HTML: linear-gradient(135deg, #5c0000, #8b0000 40%, #4a0000) ──
    for (let x = 0; x < W; x++) {
        const t = x / W; // 0→1 izq→der
        let r;
        if (t < 0.4) {
            // #5c0000 → #8b0000
            r = Math.round(92 + (139 - 92) * (t / 0.4));
        } else {
            // #8b0000 → #4a0000
            r = Math.round(139 + (74 - 139) * ((t - 0.4) / 0.6));
        }
        doc.setFillColor(r, 0, 0);
        doc.rect(x, 0, 1, H, 'F');
    }

    // ─── 2. FORMAS GEOMÉTRICAS — cuadrados rotados 45° (rombos) ──────
    // Escala HTML px → mm: A4 landscape=297mm, viewport≈1440px → ratio=297/1440=0.206
    // Pero el certificado visible es más estrecho, ajustamos a ojo para que queden en izquierda

    // shape1: 500×500, top:-250, left:-200 → cx=50px*0.15=7.5, cy=0, halfSize=53mm
    const drawDiamond = (cx, cy, half, r, g, b, r2, g2, b2) => {
        // Dibuja rombo (cuadrado rotado 45°) con dos triángulos para simular gradiente
        // triángulo izq (color 1)
        doc.setFillColor(r, g, b);
        doc.triangle(cx, cy - half, cx - half, cy, cx, cy + half, 'F');
        // triángulo der (color 2)
        doc.setFillColor(r2, g2, b2);
        doc.triangle(cx, cy - half, cx + half, cy, cx, cy + half, 'F');
    };

    // shape1: grande, superior izquierda — #a80000→#5c0000
    drawDiamond(0, -8, 68,   168,0,0,  92,0,0);

    // shape2: media — #c00000→#700000, centrada más abajo
    drawDiamond(-8, 62, 48,  192,0,0, 112,0,0);

    // shape3: grande inferior izquierda — #900000→#400000
    drawDiamond(-5, H + 5, 80,  144,0,0, 64,0,0);

    // ─── 3. LÍNEAS DORADAS diagonales ────────────────────────────────
    // gold1: bottom:140px≈29mm, left:60px≈12mm, width:400px≈82mm, rotate(-20deg)
    const ang = -20 * Math.PI / 180;
    const drawGold = (x0, y0, len, thick) => {
        const x1 = x0 + len * Math.cos(ang);
        const y1 = y0 + len * Math.sin(ang);
        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(thick);
        doc.line(x0, y0, x1, y1);
        doc.setDrawColor(GOLD_L[0], GOLD_L[1], GOLD_L[2]);
        doc.setLineWidth(thick * 0.28);
        doc.line(x0, y0, x1, y1);
    };
    drawGold(-5, H - 22, 70, 3.5);
    drawGold(5, H - 14, 55, 2.2);

    // ─── 4. CONTENIDO — TODO CENTRADO en CX fijo ─────────────────────
    // Zona derecha: de x=115 a x=289 (margen 8mm derecha)
    // CX = punto medio exacto = (115 + 289) / 2 = 202mm
    const ZONE_L = 40;   // límite izquierdo de la zona de texto
    const ZONE_R = 275;   // límite derecho
    const CX     = (ZONE_L + ZONE_R) / 2;   // 202mm — centro absoluto
    const ZONE_W = ZONE_R - ZONE_L;          // 174mm — ancho total disponible

    // Toda la banda y columnas usarán este mismo CX y ZONE_W
    const BW = ZONE_W * 0.88;   // ancho de banda dorada
    const BX = CX - BW / 2;     // inicio de banda = siempre centrado en CX

    let curY = 10; // cursor Y, iremos empujando hacia abajo

    // ── LOGO ──────────────────────────────────────────────────────────
    const LOGO_H = 22;
    try {
        const logo   = await loadImageAsBase64('/src/assets/images/logoKusimayo.png');
        const aspect = logo.w / logo.h;
        const lW     = LOGO_H * aspect;
        const pad    = 3;
        doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.roundedRect(CX - lW / 2 - pad, curY - pad, lW + pad * 2, LOGO_H + pad * 2, 4, 4, 'F');
        doc.addImage(logo.base64, 'PNG', CX - lW / 2, curY, lW, LOGO_H);
    } catch {
        const lW = 24, pad = 3;
        doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.roundedRect(CX - lW / 2 - pad, curY - pad, lW + pad * 2, LOGO_H + pad * 2, 4, 4, 'F');
        doc.setTextColor(92, 0, 0);
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text('K', CX, curY + LOGO_H * 0.72, { align: 'center' });
    }
    curY += LOGO_H + 9;

    // ── KUSIMAYO PERÚ ─────────────────────────────────────────────────
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('K U S I M A Y O   P E R Ú', CX, curY, { align: 'center' });
    curY += 14;

    // ── CERTIFICADO ───────────────────────────────────────────────────
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO', CX, curY, { align: 'center' });
    curY += 9;

    // ── DE DONACIÓN ───────────────────────────────────────────────────
    doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('D E   D O N A C I Ó N', CX, curY, { align: 'center' });
    curY += 8;

    // ── BANDA DORADA ──────────────────────────────────────────────────
    const BH = 11;
    for (let i = 0; i < BW; i++) {
        const t  = i / BW;
        const br = 0.46 + 0.54 * Math.sin(t * Math.PI);
        doc.setFillColor(
            Math.round(115 + (GOLD[0] - 115) * br),
            Math.round(90  + (GOLD[1] - 90)  * br),
            Math.round(14  + (GOLD[2] - 14)  * br),
        );
        doc.rect(BX + i, curY, 1.1, BH, 'F');
    }
    doc.setTextColor(20, 10, 2);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('E S T E   C E R T I F I C A D O   S E   O T O R G A   C O N   O R G U L L O   A', CX, curY + 7.5, { align: 'center' });
    curY += BH + 10;

    // ── NOMBRE ────────────────────────────────────────────────────────
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(28);
    doc.setFont('times', 'bolditalic');
    doc.text(userName || 'Donante Anónimo', CX, curY, { align: 'center', maxWidth: ZONE_W - 10 });
    // Línea dorada bajo nombre
    const nW = Math.min(doc.getTextWidth(userName || 'Donante Anónimo') + 16, BW * 0.7);
    curY += 4;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.55);
    doc.line(CX - nW / 2, curY, CX + nW / 2, curY);
    curY += 9;

    // ── MONTO DONADO ──────────────────────────────────────────────────
    const symbol = donation.currency === 'soles' ? 'S/' : '$';
    doc.setTextColor(GOLD_L[0], GOLD_L[1], GOLD_L[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('M O N T O   D O N A D O', CX, curY, { align: 'center' });
    curY += 9;

    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${symbol} ${donation.amount}`, CX, curY, { align: 'center' });
    curY += 10;

    // ── DESCRIPCIÓN ───────────────────────────────────────────────────
    doc.setTextColor(CREAM[0] - 10, CREAM[1] - 10, CREAM[2] - 15);
    doc.setFontSize(11.5);
    doc.setFont('times', 'italic');
    doc.text(
        'por su generosa contribución al bienestar y educación de la infancia en el Perú.',
        CX, curY, { align: 'center', maxWidth: ZONE_W - 12 },
    );
    curY += 16;

    // ── SEPARADOR FINO ────────────────────────────────────────────────
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.25);
    doc.line(BX, curY, BX + BW, curY);
    curY += 8;

    // ── 3 COLUMNAS DE DATOS ───────────────────────────────────────────
    // Cada columna centrada en su propio cx, calculado desde BX+BW
    const cols = [
        {
            label: 'FECHA',
            value: donation.createdAt?.toDate?.()?.toLocaleDateString('es-PE', {
                year: 'numeric', month: 'long', day: 'numeric',
            }) || new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }),
        },
        {
            label: 'MÉTODO DE PAGO',
            value: METHOD_NAMES[donation.method] || donation.method || '—',
        },
        {
            label: 'ID DE CERTIFICADO',
            value: certId ? certId.slice(0, 18).toUpperCase() : 'KUS-' + Date.now().toString().slice(-8),
        },
    ];

    const CW3     = BW / 3;
    const LINE_Y  = curY + 12;

    cols.forEach((col, i) => {
        // Centro exacto de esta columna
        const colCX = BX + CW3 * i + CW3 / 2;

        // Valor ENCIMA — align:center en colCX
        doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(col.value, colCX, curY + 9, { align: 'center', maxWidth: CW3 - 4 });

        // Línea dorada centrada en colCX
        const lHalf = CW3 * 0.38;
        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(0.75);
        doc.line(colCX - lHalf, LINE_Y, colCX + lHalf, LINE_Y);

        // Etiqueta DEBAJO — align:center en colCX
        doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(col.label, colCX, LINE_Y + 7, { align: 'center' });

        // Divisor vertical (excepto último)
        if (i < cols.length - 1) {
            doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
            doc.setLineWidth(0.18);
            doc.line(BX + CW3 * (i + 1), curY, BX + CW3 * (i + 1), LINE_Y + 9);
        }
    });

    // PIE con link clicable
    doc.setTextColor(GOLD[0] - 50, GOLD[1] - 50, GOLD[2] - 50);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const footerText = 'Kusimayo Perú  ·  Organización sin fines de lucro  ·  kusimayo-loxi.vercel.app  ·  www.kusimayo.org';
    doc.text(footerText, CX, H - 4, { align: 'center' });
    // Link clicable sobre "kusimayo-loxi.vercel.app"
    const fullW   = doc.getTextWidth(footerText);
    const preText = 'Kusimayo Perú  ·  Organización sin fines de lucro  ·  ';
    const linkText = 'kusimayo-loxi.vercel.app';
    const preW  = doc.getTextWidth(preText);
    const linkW = doc.getTextWidth(linkText);
    const startX = CX - fullW / 2 + preW;
    doc.setTextColor(GOLD_L[0], GOLD_L[1], GOLD_L[2]);
    doc.textWithLink(linkText, startX, H - 4, { url: 'https://kusimayo-loxi.vercel.app' });
    doc.setDrawColor(GOLD_L[0], GOLD_L[1], GOLD_L[2]);
    doc.setLineWidth(0.2);
    doc.line(startX, H - 3, startX + linkW, H - 3);

    return doc;
};

// ═══════════════════════════════════════════════════════════════════
// MODAL COMPONENT  (igual al anterior, sin cambios)
// ═══════════════════════════════════════════════════════════════════
export default function DonationCertificate({
    donation, userName, userId, onClose, saveCertificate, getCertificate,
}) {
    const [certId,      setCertId]      = useState(null);
    const [loadingCert, setLoadingCert] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const existing = await getCertificate(donation.id);
                if (existing?.certId) {
                    setCertId(existing.certId);
                } else {
                    const newId = `KUS-${Date.now().toString(36).toUpperCase()}-${Math.random()
                        .toString(36).slice(2, 6).toUpperCase()}`;
                    await saveCertificate(donation.id, userId, {
                        certId: newId, donorName: userName,
                        amount: donation.amount, currency: donation.currency, method: donation.method,
                    });
                    setCertId(newId);
                }
            } catch {
                setCertId('KUS-' + donation.id?.slice(0, 8).toUpperCase());
            } finally {
                setLoadingCert(false);
            }
        };
        init();
    }, [donation.id]);

    const run = async (save) => {
        try {
            const doc = await generateCertificatePDF(donation, userName, certId);
            if (save) doc.save(`Certificado_Kusimayo_${certId || donation.id}.pdf`);
            else window.open(URL.createObjectURL(doc.output('blob')), '_blank');
        } catch { alert('Error al generar el certificado. Intenta de nuevo.'); }
    };

    const symbol  = donation.currency === 'soles' ? 'S/' : '$';
    const dateStr = donation.createdAt?.toDate?.()?.toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric',
    }) || '—';

    const rows = [
        { label: 'Donante',           value: userName || 'Donante Anónimo' },
        { label: 'Monto',             value: `${symbol} ${donation.amount}`, highlight: true },
        { label: 'Fecha',             value: dateStr },
        { label: 'Método de pago',    value: METHOD_NAMES[donation.method] || donation.method || '—' },
        { label: 'ID de Certificado', value: loadingCert ? 'Generando…' : certId, mono: true },
    ];

    const GA = (o) => `rgba(212,175,55,${o})`;
    const WA = (o) => `rgba(255,255,255,${o})`;

    return (
        <>
            {/* OVERLAY */}
            <div onClick={onClose} style={{
                position:'fixed', inset:0, background:'rgba(0,0,0,0.8)',
                backdropFilter:'blur(8px)', zIndex:1000,
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:'1rem', animation:'kcFI 0.22s ease',
            }}>
                {/* MODAL */}
                <div onClick={e => e.stopPropagation()} style={{
                    position:'relative',
                    background:'linear-gradient(150deg,#220410 0%,#360814 45%,#110206 100%)',
                    border:`1px solid ${GA(0.3)}`, borderRadius:'20px',
                    maxWidth:'460px', width:'100%', overflow:'hidden',
                    boxShadow:`0 40px 100px rgba(0,0,0,0.78),0 0 0 1px ${GA(0.1)},inset 0 1px 0 ${WA(0.055)}`,
                    fontFamily:"'Times New Roman',Times,serif",
                    animation:'kcSU 0.3s cubic-bezier(0.34,1.46,0.64,1)',
                }}>

                    {/* HEADER */}
                    <div style={{
                        padding:'2.2rem 2.2rem 1.6rem',
                        borderBottom:`1px solid ${GA(0.14)}`,
                        textAlign:'center', position:'relative',
                    }}>
                        <button onClick={onClose} style={{
                            position:'absolute', top:'1.1rem', right:'1.1rem',
                            background:GA(0.07), border:`1px solid ${GA(0.22)}`,
                            color:GA(0.65), width:'30px', height:'30px',
                            borderRadius:'50%', cursor:'pointer', fontSize:'0.85rem',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all 0.18s', fontFamily:'sans-serif',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background=GA(0.15); e.currentTarget.style.color='#d4af37'; }}
                            onMouseLeave={e => { e.currentTarget.style.background=GA(0.07); e.currentTarget.style.color=GA(0.65); }}>
                            ✕
                        </button>

                        <div style={{
                            width:'66px', height:'66px', borderRadius:'50%',
                            background:'radial-gradient(circle at 38% 38%,rgba(158,27,50,0.65) 0%,rgba(50,4,14,0.95) 100%)',
                            border:`1.5px solid ${GA(0.5)}`,
                            boxShadow:`0 0 30px ${GA(0.15)},inset 0 1px 0 ${GA(0.22)}`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            margin:'0 auto 1.1rem',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(212,175,55,0.87)" strokeWidth="1.3">
                                <circle cx="12" cy="8" r="6"/>
                                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                            </svg>
                        </div>

                        <p style={{
                            color:GA(0.55), fontSize:'0.66rem', letterSpacing:'0.22em',
                            textTransform:'uppercase', margin:'0 0 0.4rem', fontFamily:'sans-serif',
                        }}>
                            Kusimayo Perú · Documento Oficial
                        </p>

                        <h2 style={{
                            color:'#ffffff', fontSize:'1.6rem', fontWeight:'700',
                            margin:0, letterSpacing:'0.04em',
                            textShadow:`0 0 50px ${GA(0.22)}`,
                        }}>
                            Certificado de Donación
                        </h2>

                        <div style={{
                            margin:'0.9rem auto 0', height:'1.5px', width:'190px',
                            background:`linear-gradient(90deg,transparent,${GA(0.6)},rgba(248,220,130,1),${GA(0.6)},transparent)`,
                        }}/>
                    </div>

                    {/* BODY */}
                    <div style={{ padding:'1.5rem 2.2rem 2.2rem' }}>
                        <div style={{
                            border:`1px solid ${GA(0.2)}`, borderRadius:'12px',
                            overflow:'hidden', marginBottom:'1.3rem',
                            background:'rgba(0,0,0,0.25)',
                        }}>
                            <div style={{
                                background:`linear-gradient(90deg,${GA(0.14)},${GA(0.07)})`,
                                borderBottom:`1px solid ${GA(0.16)}`, padding:'0.5rem 1.2rem',
                            }}>
                                <span style={{
                                    color:GA(0.72), fontSize:'0.66rem', letterSpacing:'0.18em',
                                    textTransform:'uppercase', fontFamily:'sans-serif',
                                }}>
                                    Resumen del certificado
                                </span>
                            </div>

                            {rows.map((row, i) => (
                                <div key={i} style={{
                                    display:'flex', justifyContent:'space-between',
                                    alignItems:'center', padding:'0.78rem 1.2rem',
                                    borderTop:i > 0 ? `1px solid ${GA(0.08)}` : 'none',
                                    background:i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.025)',
                                }}>
                                    <span style={{
                                        color:'rgba(222,192,96,0.9)', fontSize:'0.88rem',
                                        fontFamily:'sans-serif', fontWeight:'500',
                                        flexShrink:0, marginRight:'0.8rem',
                                    }}>
                                        {row.label}
                                    </span>
                                    <span style={{
                                        color:row.highlight ? '#f6d96a' : WA(0.95),
                                        fontSize:row.highlight ? '1.14rem' : '0.94rem',
                                        fontWeight:row.highlight ? '700' : '500',
                                        fontFamily:row.mono ? "'Courier New',monospace" : "'Times New Roman',Times,serif",
                                        textAlign:'right', maxWidth:'58%',
                                    }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem' }}>
                            <button onClick={() => run(false)} disabled={loadingCert} style={{
                                padding:'0.95rem', background:'transparent',
                                border:`1px solid ${GA(0.42)}`, color:GA(0.9),
                                borderRadius:'10px', cursor:loadingCert ? 'not-allowed' : 'pointer',
                                fontWeight:'600', fontSize:'0.94rem',
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.45rem',
                                opacity:loadingCert ? 0.4 : 1, fontFamily:'sans-serif',
                                letterSpacing:'0.04em', transition:'all 0.18s',
                            }}
                                onMouseEnter={e => { if(!loadingCert){ e.currentTarget.style.background=GA(0.1); e.currentTarget.style.borderColor=GA(0.68); e.currentTarget.style.color='#d4af37'; }}}
                                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=GA(0.42); e.currentTarget.style.color=GA(0.9); }}>
                                <EyeIcon/> Visualizar
                            </button>

                            <button onClick={() => run(true)} disabled={loadingCert} style={{
                                padding:'0.95rem',
                                background:'linear-gradient(135deg,#9E1B32 0%,#6e1024 55%,#4a0b1a 100%)',
                                border:`1px solid ${GA(0.32)}`, color:'#ffffff',
                                borderRadius:'10px', cursor:loadingCert ? 'not-allowed' : 'pointer',
                                fontWeight:'600', fontSize:'0.94rem',
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.45rem',
                                opacity:loadingCert ? 0.4 : 1,
                                boxShadow:'0 4px 24px rgba(158,27,50,0.48)',
                                fontFamily:'sans-serif', letterSpacing:'0.04em', transition:'all 0.18s',
                            }}
                                onMouseEnter={e => { if(!loadingCert){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(158,27,50,0.62)'; e.currentTarget.style.borderColor=GA(0.55); }}}
                                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(158,27,50,0.48)'; e.currentTarget.style.borderColor=GA(0.32); }}>
                                <DownloadIcon/> Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes kcFI { from{opacity:0} to{opacity:1} }
                @keyframes kcSU { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
            `}</style>
        </>
    );
}

function EyeIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );
}
function DownloadIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
    );
}