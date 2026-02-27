// src/components/AnonDonorModal.jsx
// Úsalo en Sponsorship.jsx — muéstralo antes de handleConfirm cuando !user

import { useState } from 'react';

export default function AnonDonorModal({ onConfirm, onClose }) {
    const [name,      setName]      = useState('');
    const [isAnon,    setIsAnon]    = useState(false);
    const [error,     setError]     = useState('');

    const handleSubmit = () => {
        if (!isAnon && !name.trim()) {
            setError('Ingresa tu nombre o marca "Donar como anónimo"');
            return;
        }
        // Si es anónimo mandamos null, si no, el nombre ingresado
        onConfirm(isAnon ? null : name.trim());
    };

    const GA = (o) => `rgba(212,175,55,${o})`;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                    animation: 'anonFI 0.2s ease',
                }}
            >
                {/* Modal */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'white',
                        borderRadius: '18px',
                        maxWidth: '420px',
                        width: '100%',
                        overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                        fontFamily: "'Varela Round', sans-serif",
                        animation: 'anonSU 0.28s cubic-bezier(0.34,1.46,0.64,1)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #9E1B32 0%, #6e1024 100%)',
                        padding: '1.6rem 2rem',
                        position: 'relative',
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none', color: 'white',
                                width: '28px', height: '28px', borderRadius: '50%',
                                cursor: 'pointer', fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >✕</button>

                        {/* Ícono */}
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1.5px solid rgba(255,255,255,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 0.9rem',
                        }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.9)" strokeWidth="1.6">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>

                        <h2 style={{
                            color: 'white', textAlign: 'center',
                            fontSize: '1.2rem', fontWeight: '700', margin: 0,
                        }}>
                            ¿Con qué nombre quieres donar?
                        </h2>
                        <p style={{
                            color: 'rgba(255,255,255,0.75)',
                            textAlign: 'center', fontSize: '0.8rem',
                            margin: '0.4rem 0 0',
                        }}>
                            Tu donación se registrará sin cuenta ni correo
                        </p>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '1.8rem 2rem 2rem' }}>

                        {/* Input nombre */}
                        <label style={{
                            display: 'block', fontWeight: '600',
                            color: '#374151', fontSize: '0.88rem', marginBottom: '0.5rem',
                        }}>
                            Tu nombre
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={name}
                            disabled={isAnon}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            style={{
                                width: '100%', padding: '0.7rem 0.95rem',
                                borderRadius: '10px',
                                border: `1.5px solid ${error ? '#ef4444' : '#d1d5db'}`,
                                fontSize: '0.95rem', outline: 'none',
                                fontFamily: "'Varela Round', sans-serif",
                                boxSizing: 'border-box',
                                background: isAnon ? '#f3f4f6' : 'white',
                                color: isAnon ? '#9ca3af' : '#111827',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => { if (!isAnon) e.target.style.borderColor = '#9E1B32'; }}
                            onBlur={e => { if (!error) e.target.style.borderColor = '#d1d5db'; }}
                        />
                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
                                {error}
                            </p>
                        )}

                        {/* Separador */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: '0.75rem', margin: '1.1rem 0',
                        }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>o</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        {/* Checkbox anónimo */}
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            cursor: 'pointer', padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            border: `1.5px solid ${isAnon ? '#9E1B32' : '#e5e7eb'}`,
                            background: isAnon ? '#fce7f3' : 'white',
                            transition: 'all 0.2s',
                        }}>
                            {/* Custom checkbox */}
                            <div
                                onClick={() => { setIsAnon(v => !v); setError(''); }}
                                style={{
                                    width: '22px', height: '22px', borderRadius: '6px',
                                    border: `2px solid ${isAnon ? '#9E1B32' : '#d1d5db'}`,
                                    background: isAnon ? '#9E1B32' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'all 0.18s', cursor: 'pointer',
                                }}
                            >
                                {isAnon && (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="white" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                )}
                            </div>
                            <div onClick={() => { setIsAnon(v => !v); setError(''); }}>
                                <p style={{
                                    fontWeight: '600', color: '#111827',
                                    fontSize: '0.9rem', margin: 0,
                                }}>
                                    Donar como anónimo
                                </p>
                                <p style={{
                                    color: '#6b7280', fontSize: '0.78rem',
                                    margin: '0.15rem 0 0',
                                }}>
                                    Tu nombre no aparecerá en ningún lado
                                </p>
                            </div>
                        </label>

                        {/* Info */}
                        <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.7rem 1rem',
                            marginTop: '1rem',
                            display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: 0, lineHeight: '1.5' }}>
                                No necesitas cuenta. Solo guardaremos {isAnon ? 'la donación sin nombre' : 'tu nombre'} para el registro interno.
                            </p>
                        </div>

                        {/* Botones */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.4rem' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.85rem',
                                    background: 'white',
                                    border: '1.5px solid #e5e7eb',
                                    color: '#4b5563',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: '600', fontSize: '0.92rem',
                                    fontFamily: "'Varela Round', sans-serif",
                                    transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#9ca3af'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                style={{
                                    padding: '0.85rem',
                                    background: 'linear-gradient(135deg, #9E1B32 0%, #6e1024 100%)',
                                    border: 'none', color: 'white',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: '600', fontSize: '0.92rem',
                                    fontFamily: "'Varela Round', sans-serif",
                                    boxShadow: '0 4px 14px rgba(158,27,50,0.35)',
                                    transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(158,27,50,0.45)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(158,27,50,0.35)'; }}
                            >
                                Confirmar donación
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes anonFI { from { opacity: 0 } to { opacity: 1 } }
                @keyframes anonSU {
                    from { opacity: 0; transform: translateY(20px) scale(0.97) }
                    to   { opacity: 1; transform: translateY(0)    scale(1)    }
                }
            `}</style>
        </>
    );
}