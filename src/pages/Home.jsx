import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../services/firestore';

// Importa tus imágenes
import imgPortada from '../assets/images/imgPortada.jpeg';
import imgNiño from '../assets/images/niño.jpeg';
import { useTranslation } from 'react-i18next';

// Importa imágenes de galería
import imgGaleria1 from '../assets/images/galeria/img/imggaleria1.jpeg';
import imgGaleria2 from '../assets/images/galeria/img/imggaleria2.jpeg';
import imgGaleria3 from '../assets/images/galeria/img/imggaleria3.jpeg';
import imgGaleria4 from '../assets/images/galeria/img/imggaleria4.jpeg';
import imgGaleria5 from '../assets/images/galeria/img/imggaleria5.jpeg';
import imgGaleria6 from '../assets/images/galeria/img/imggaleria6.jpeg';
import imgGaleria7 from '../assets/images/galeria/img/imggaleria7.jpeg';
import imgGaleria8 from '../assets/images/galeria/img/imggaleria8.jpeg';
import imgGaleria9 from '../assets/images/galeria/img/imggaleria9.jpeg';
import imgGaleria10 from '../assets/images/galeria/img/imggaleria10.jpeg';
import imgGaleria11 from '../assets/images/galeria/img/imggaleria11.jpeg';
import imgGaleria12 from '../assets/images/galeria/img/imggaleria12.jpeg';

/* ════════════════════════════════════════════════════════════════════════ */
/* SVG ICONS */
/* ════════════════════════════════════════════════════════════════════════ */

const HeartIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const UsersIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UtensilsIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const ChildIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
  </svg>
);

const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronDownIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ImagesIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════════════ */
/* GALERÍA DE FOTOS */
/* ════════════════════════════════════════════════════════════════════════ */

const galeriaFotos = [
  imgGaleria1, imgGaleria2, imgGaleria3,
  imgGaleria4, imgGaleria5, imgGaleria6,
  imgGaleria7, imgGaleria8, imgGaleria9,
  imgGaleria10, imgGaleria11, imgGaleria12,
];

function Galeria() {
  const { t } = useTranslation();
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const visibles = mostrarTodas ? galeriaFotos : galeriaFotos.slice(0, 6);

  return (
    <section style={{ padding: '6rem 2rem', background: '#fafafa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{
            background: '#9E1B32',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ImagesIcon size={16} />
            {t('Nuestra comunidad en imágenes')}
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
          color: '#1a1a1a'
        }}>
          {t('Momentos que transforman vidas')}
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto 3rem',
          lineHeight: '1.6'
        }}>
          {t('Cada imagen es un testimonio del impacto que juntos logramos en las comunidades andinas.')}
        </p>

        {/* Grid de fotos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {visibles.map((src, i) => (
            <div
              key={i}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '4/3',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                animation: `fadeInUp 0.5s ease-out ${i * 0.07}s backwards`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <img
                src={src}
                alt={`Galería ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            </div>
          ))}
        </div>

        {/* Botón mostrar más */}
        {!mostrarTodas && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => setMostrarTodas(true)}
              style={{
                background: 'white',
                color: '#9E1B32',
                border: '2px solid #9E1B32',
                padding: '0.85rem 2.2rem',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                fontFamily: "'Varela Round', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#9E1B32';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(158,27,50,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#9E1B32';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ChevronDownIcon size={18} />
              {t('Mostrar más fotos')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* HOME COMPONENT */
/* ════════════════════════════════════════════════════════════════════════ */

function Home() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getGlobalStats().then(setStats);
  }, []);

  return (
    <div style={{ fontFamily: "'Varela Round', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${imgPortada})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '8rem 2rem 5rem',
        color: 'white',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(158, 27, 50, 0.95)',
            padding: '0.6rem 1.8rem',
            borderRadius: '30px',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            animation: 'fadeInDown 0.8s ease-out'
          }}>
            <HeartIcon size={16} color="white" />
            {t('Programa de Apadrinamiento Mensual')}
          </div>

          {/* Título */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            maxWidth: '800px',
            animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
          }}>
            {t('Apadrina y transforma')}{' '}
            <span style={{ color: '#9E1B32', display: 'block', marginTop: '0.5rem' }}>{t('una vida')}</span>
          </h1>

          {/* Descripción */}
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
            maxWidth: '700px',
            marginBottom: '2.5rem',
            lineHeight: '1.7',
            opacity: 0.95,
            animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
          }}>
            {t('Tu compromiso mensual brinda desayunos nutritivos, educación y acompañamiento continuo a niños de comunidades andinas. Sé padrino o madrina y haz la diferencia cada día.')}
          </p>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '1.2rem',
            flexWrap: 'wrap',
            marginBottom: '4rem',
            animation: 'fadeInUp 0.8s ease-out 0.6s backwards'
          }}>
            <CTAButton primary to="/apadrinamiento">
              <HeartIcon size={18} color="white" />
              {t('Apadrinar ahora')}
            </CTAButton>
            <CTAButton to="/transparencia">
              {t('Ver nuestro impacto')}
              <ArrowRightIcon size={18} />
            </CTAButton>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '3rem',
            maxWidth: '800px',
            animation: 'fadeInUp 0.8s ease-out 0.8s backwards'
          }}>
            <HeroStat icon={<UsersIcon size={28} />} value="+500" label={t('Padrinos activos')} />
            <HeroStat icon={<UtensilsIcon size={28} />} value="+12,000" label={t('Desayunos/mes')} />
            <HeroStat icon={<ChildIcon size={28} />} value="+2,000" label={t('Niños beneficiados')} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN: PROGRAMA DE APADRINAMIENTO */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '6rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Badge superior */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <span style={{
              background: '#9E1B32',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '30px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              {t('Programa de Apadrinamiento')}
            </span>
          </div>

          {/* Título */}
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#1a1a1a'
          }}>
            {t('Apadrina a un niño permanentemente')}
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '1.1rem',
            maxWidth: '700px',
            margin: '0 auto 4rem',
            lineHeight: '1.6'
          }}>
            {t('Tu apadrinamiento garantiza desayunos, útiles y seguimiento continuo. Un compromiso mensual que cambia vidas para siempre.')}
          </p>

          {/* Grid con imagen y contenido */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>

            {/* Imagen */}
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              animation: 'scaleIn 0.8s ease-out'
            }}>
              <img
                src={imgNiño}
                alt="Niña estudiante"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Contenido */}
            <div style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
            }}>

              {/* Badge */}
              <span style={{
                background: '#fce7f3',
                color: '#9E1B32',
                padding: '0.4rem 1.2rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                display: 'inline-block',
                marginBottom: '1.5rem'
              }}>
                {t('Compromiso permanente')}
              </span>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#1a1a1a'
              }}>
                {t('¿Qué es el apadrinamiento?')}
              </h3>

              <p style={{
                color: '#6b7280',
                fontSize: '1.05rem',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                {t('El apadrinamiento es un compromiso mensual permanente que permite brindar apoyo integral a un niño. A diferencia de una donación única, el apadrinamiento crea un vínculo sostenido que garantiza:')}
              </p>

              {/* Checklist */}
              <div style={{ marginBottom: '2.5rem' }}>
                <CheckItem text={t('Desayunos diarios garantizados')} />
                <CheckItem text={t('Materiales de aseo y educación')} />
                <CheckItem text={t('Monitoreo permanente')} />
              </div>

              {/* Botón */}
              <Link to="/apadrinamiento" style={{
                background: '#9E1B32',
                color: 'white',
                padding: '0.9rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(158, 27, 50, 0.3)'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(158, 27, 50, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(158, 27, 50, 0.3)';
                }}>
                {t('Conocer planes de apadrinamiento')}
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* GALERÍA DE FOTOS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Galeria />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* COMPONENTES AUXILIARES */
/* ════════════════════════════════════════════════════════════════════════ */

function HeroStat({ icon, value, label }) {
  return (
    <div>
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'white'
      }}>
        <span style={{ opacity: 0.9 }}>{icon}</span>
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      </div>
      <div style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.95rem',
        fontWeight: '500'
      }}>
        {label}
      </div>
    </div>
  );
}

function CTAButton({ children, to, primary }) {
  return (
    <Link to={to} style={{
      background: primary ? '#9E1B32' : 'rgba(255, 255, 255, 0.15)',
      backdropFilter: primary ? 'none' : 'blur(10px)',
      color: 'white',
      padding: '1rem 2.5rem',
      borderRadius: '10px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '1.05rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: primary ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s ease',
      boxShadow: primary ? '0 4px 15px rgba(158, 27, 50, 0.4)' : 'none'
    }}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(158, 27, 50, 0.5)';
        } else {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (primary) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(158, 27, 50, 0.4)';
        } else {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }
      }}>
      {children}
    </Link>
  );
}

function CheckItem({ text }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    }}>
      <span style={{
        color: '#9E1B32',
        flexShrink: 0
      }}>
        <CheckIcon size={20} />
      </span>
      <span style={{ color: '#4b5563', fontSize: '1.05rem' }}>{text}</span>
    </div>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{
      background: '#1a1a1a',
      color: 'white',
      padding: '4rem 2rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>

        {/* Columna 1: Marca */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Kusimayo</h3>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            {t('Transformamos vidas a través del Ayni, brindando oportunidades de nutrición y educación a niños en comunidades andinas del Perú.')}
          </p>
          <Link to="/apadrinamiento" style={{
            color: '#9E1B32',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <HeartIcon size={16} color="#9E1B32" />
            {t('Únete como padrino o madrina')}
          </Link>
        </div>

        {/* Columna 2: Enlaces */}
        <div>
          <h4 style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>{t('Enlaces')}</h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <FooterLink to="/">{t('Inicio')}</FooterLink>
            <FooterLink to="/apadrinamiento">{t('Apadrinar')}</FooterLink>
            <FooterLink to="/transparencia">{t('Transparencia')}</FooterLink>
            <FooterLink to="https://kusimayo.org" external>{t('Sitio Web Oficial')}</FooterLink>
          </div>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h4 style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>{t('Contacto')}</h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: '#9ca3af',
            fontSize: '0.95rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MailIcon size={16} />
              <span>contacto@kusimayo.org</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneIcon size={16} />
              <span>+51 999 888 777</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPinIcon size={16} />
              <span>Lima, Perú</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid #374151',
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        color: '#9ca3af',
        fontSize: '0.9rem'
      }}>
        <p>{t('© 2025 Kusimayo. Todos los derechos reservados.')}</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/privacidad" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            {t('Política de Privacidad')}
          </Link>
          <Link to="/terminos" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            {t('Términos de Uso')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children, external }) {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" style={{
        color: '#9ca3af',
        textDecoration: 'none',
        transition: 'color 0.3s ease'
      }}
        onMouseEnter={(e) => e.target.style.color = 'white'}
        onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} style={{
      color: '#9ca3af',
      textDecoration: 'none',
      transition: 'color 0.3s ease'
    }}
      onMouseEnter={(e) => e.target.style.color = 'white'}
      onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
      {children}
    </Link>
  );
}

export default Home;