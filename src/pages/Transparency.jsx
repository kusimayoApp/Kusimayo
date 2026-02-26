import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../services/firestore';
import videoComunidad from "../assets/images/galeria/video/vid1.mp4";
import videoTransformacion from "../assets/images/galeria/video/vid2.mp4";

// ── Importaciones de imágenes de galería ──────────────────────────────────────
import des1 from '../assets/images/galeria/img/GaleriaImpacto/desayunos/desayuno1.jpeg';
import des2 from '../assets/images/galeria/img/GaleriaImpacto/desayunos/desayuno2.jpeg';
import des3 from '../assets/images/galeria/img/GaleriaImpacto/desayunos/desayuno3.jpeg';

import acp1 from '../assets/images/galeria/img/GaleriaImpacto/acompañamiento/acp1.jpeg';
import acp2 from '../assets/images/galeria/img/GaleriaImpacto/acompañamiento/acp2.jpeg';
import acp3 from '../assets/images/galeria/img/GaleriaImpacto/acompañamiento/acp3.jpeg';

import aseo1 from '../assets/images/galeria/img/GaleriaImpacto/aseo/aseo1.jpeg';
import aseo2 from '../assets/images/galeria/img/GaleriaImpacto/aseo/aseo2.jpeg';

import utiles1 from '../assets/images/galeria/img/GaleriaImpacto/utiles/utiles1.jpeg';
import utiles2 from '../assets/images/galeria/img/GaleriaImpacto/utiles/utiles2.jpeg';

function Transparency() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Varela Round', sans-serif" }}>
        <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Varela Round', sans-serif" }}>
        <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>No hay datos aún.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Varela Round', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#9E1B32', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '30px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Transparencia
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', marginBottom: '1rem', color: '#1a1a1a' }}>
            Tu aporte en acción
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
            Aquí puedes ver exactamente cómo tu apadrinamiento transforma vidas.
            Cada sol cuenta y tiene un destino claro.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* VIDEOS DE IMPACTO */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem', color: '#1a1a1a' }}>
            Mira el impacto de tu apadrinamiento
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <VideoCard title="Un día en una comunidad" videoSrc={videoComunidad} />
            <VideoCard title="Historias de transformación" videoSrc={videoTransformacion} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* GALERÍA DE IMPACTO */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', background: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem', color: '#1a1a1a' }}>
            Galería de impacto
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <CarouselCard
              title="Desayunos nutritivos"
              images={[des1, des2, des3]}
            />
            <CarouselCard
              title="Acompañamiento a madres"
              images={[acp1, acp2, acp3]}
            />
            <CarouselCard
              title="Aseo e higiene"
              images={[aseo1, aseo2]}
            />
            <CarouselCard
              title="Útiles escolares"
              images={[utiles1, utiles2]}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* IMPACTO EN NÚMEROS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold', textAlign: 'center', marginBottom: '4rem', color: '#1a1a1a' }}>
            Nuestro impacto en números
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
            <StatCard icon={<ChartIcon />} value={stats.totalDonations || 0} label="Donaciones totales" color="#9E1B32" />
            <StatCard icon={<DollarIcon />} value={`$${stats.totalAmountUSD || 0}`} label="Monto recaudado (USD)" color="#9E1B32" />
            <StatCard icon={<DollarIcon />} value={`S/${stats.totalAmountSoles || 0}`} label="Monto recaudado (Soles)" color="#9E1B32" />
            <StatCard icon={<UsersIcon />} value={stats.totalSponsors || 0} label="Padrinos activos" color="#9E1B32" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CTA FINAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 2rem', background: '#9E1B32', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            ¿Listo para apadrinar?
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6', opacity: 0.95 }}>
            Tu apadrinamiento mensual brinda un impacto real y medible.
            Únete a nuestra comunidad de padrinos y madrinas.
          </p>
          <Link to="/apadrinamiento" style={{
            background: 'white', color: '#9E1B32', padding: '1rem 3rem', borderRadius: '10px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '1.05rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; }}>
            <HeartIcon size={20} /> Apadrinar ahora
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* CAROUSEL CARD — carrusel con flechas y puntos indicadores                */
/* ════════════════════════════════════════════════════════════════════════ */

function CarouselCard({ title, images }) {
  const [current, setCurrent] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        background: 'white',
        transition: 'transform 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Contenedor de imagen */}
      <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
        <img
          src={images[current]}
          alt={`${title} ${current + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 0.35s ease',
          }}
        />

        {/* Botón anterior */}
        <button
          onClick={prev}
          style={{
            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', lineHeight: 1, padding: 0,
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(158,27,50,0.85)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
        >
          ‹
        </button>

        {/* Botón siguiente */}
        <button
          onClick={next}
          style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', lineHeight: 1, padding: 0,
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(158,27,50,0.85)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
        >
          ›
        </button>

        {/* Indicadores de puntos */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '6px', alignItems: 'center',
        }}>
          {images.map((_, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: i === current ? '10px' : '8px',
                height: i === current ? '10px' : '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                background: i === current ? '#9E1B32' : 'rgba(255,255,255,0.75)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Título */}
      <div style={{ padding: '1.2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
          {title}
        </h3>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
          {current + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* VIDEO CARD — reproduce al hacer click                                     */
/* ════════════════════════════════════════════════════════════════════════ */

function VideoCard({ title, videoSrc }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer',
        transition: 'transform 0.3s ease', position: 'relative', background: '#000'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'cover' }}
        onEnded={() => setPlaying(false)}
      />

      {/* Overlay con botón play — solo visible cuando está pausado */}
      {!playing && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '70px', height: '70px',
            background: 'rgba(158, 27, 50, 0.9)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <PlayIcon />
          </div>
        </div>
      )}

      {/* Título siempre visible abajo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: '2rem 1.5rem 1rem',
        color: 'white', fontWeight: 'bold', fontSize: '1.05rem',
        pointerEvents: 'none'
      }}>
        {title}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* SVG ICONS */
/* ════════════════════════════════════════════════════════════════════════ */

function ChartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* COMPONENTES AUXILIARES */
/* ════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon, value, label, color }) {
  return (
    <div
      style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fafafa', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.3s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>{value}</div>
      <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500' }}>{label}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#1a1a1a', color: 'white', padding: '4rem 2rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Kusimayo</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Transformamos vidas a través del Ayni, brindando oportunidades de nutrición y educación a niños en comunidades andinas del Perú.
          </p>
          <Link to="/apadrinamiento" style={{ color: '#9E1B32', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <HeartIcon size={18} /> Únete como padrino o madrina
          </Link>
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>Enlaces</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <FooterLink to="/">Inicio</FooterLink>
            <FooterLink to="/apadrinamiento">Apadrinar</FooterLink>
            <FooterLink to="/transparencia">Transparencia</FooterLink>
            <FooterLink to="https://kusimayo.org" external>Sitio Web Oficial</FooterLink>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>Contacto</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#9ca3af', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MailIcon /> contacto@kusimayo.org
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneIcon /> +51 999 888 777
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPinIcon /> Lima, Perú
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: '#9ca3af', fontSize: '0.9rem' }}>
        <p>© 2025 Kusimayo. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/privacidad" style={{ color: '#9ca3af', textDecoration: 'none' }}>Política de Privacidad</Link>
          <Link to="/terminos" style={{ color: '#9ca3af', textDecoration: 'none' }}>Términos de Uso</Link>
        </div>
      </div>
    </footer>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FooterLink({ to, children, external }) {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
        onMouseEnter={(e) => { e.target.style.color = 'white'; }}
        onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; }}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
      onMouseEnter={(e) => { e.target.style.color = 'white'; }}
      onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; }}>
      {children}
    </Link>
  );
}

export default Transparency;