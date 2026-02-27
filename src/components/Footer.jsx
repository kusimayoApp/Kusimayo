// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeartIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const MailIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

function FooterLink({ to, children, external }) {
  const style = {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
    display: 'inline-block',
  };
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" style={style}
        onMouseEnter={e => e.target.style.color = 'white'}
        onMouseLeave={e => e.target.style.color = '#9ca3af'}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} style={style}
      onMouseEnter={e => e.target.style.color = 'white'}
      onMouseLeave={e => e.target.style.color = '#9ca3af'}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ background: '#1a1a1a', color: 'white', padding: '4rem 2rem 2rem', fontFamily: "'Varela Round', sans-serif" }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

        {/* Columna 1 */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Kusimayo</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {t('Transformamos vidas a través del Ayni, brindando oportunidades de nutrición y educación a niños en comunidades andinas del Perú.')}
          </p>
          <a
            href="https://www.instagram.com/kusimayoperu/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', transition: 'all 0.2s ease', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#9E1B32'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#9E1B32'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <InstagramIcon size={18} />
          </a>
          <div style={{ marginTop: '1.2rem' }}>
            <Link to="/apadrinamiento" style={{ color: '#9E1B32', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <HeartIcon size={16} color="#9E1B32" />
              {t('Únete como padrino o madrina')}
            </Link>
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>{t('Enlaces')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <FooterLink to="/">{t('Inicio')}</FooterLink>
            <FooterLink to="/apadrinamiento">{t('Apadrinar')}</FooterLink>
            <FooterLink to="/transparencia">{t('Transparencia')}</FooterLink>
            <FooterLink to="https://kusimayo.org" external>{t('Sitio Web Oficial')}</FooterLink>
          </div>
        </div>

        {/* Columna 3 */}
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>{t('Contacto')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#9ca3af', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MailIcon size={16} />
              <a href="mailto:contacto@kusimayo.org" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#9ca3af'}>
                contacto@kusimayo.org
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneIcon size={16} />
              <a href="tel:+51999888777" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#9ca3af'}>
                +51 999 888 777
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPinIcon size={16} />
              <span>Lima, Perú</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: '#9ca3af', fontSize: '0.9rem' }}>
        <p style={{ margin: 0 }}>{t('© 2026 Kusimayo.')}</p>
      </div>

    </footer>
  );
}