import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'white',
      padding: '0 3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '72px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderBottom: '1px solid #f1f1f1',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo */}
      <Link to="/" style={{
        color: '#9E1B32',
        textDecoration: 'none',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        letterSpacing: '-0.5px',
        transition: 'color 0.3s ease'
      }}
        onMouseEnter={(e) => e.target.style.color = '#7a1526'}
        onMouseLeave={(e) => e.target.style.color = '#9E1B32'}>
        Kusimayo
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <NavLink to="/">{t('Inicio')}</NavLink>
        <NavLink to="/apadrinamiento">{t('Apadrinar')}</NavLink>
        <NavLink to="/transparencia">{t('Impacto')}</NavLink>

        <select
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
          style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'Varela Round', sans-serif" }}
        >
          <option value="es">🇵🇪 ES</option>
          <option value="en">🇺🇸 EN</option>
        </select>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/mi-cuenta" style={{
              color: '#4b5563',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => e.target.style.color = '#9E1B32'}
              onMouseLeave={(e) => e.target.style.color = '#4b5563'}>
              <span style={{ fontSize: '1.1rem' }}>👤</span>
              {user.displayName || user.email?.split('@')[0]}
            </Link>
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1.5px solid #e5e7eb',
              color: '#6b7280',
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#9E1B32';
                e.target.style.color = '#9E1B32';
                e.target.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#6b7280';
                e.target.style.background = 'transparent';
              }}>
              {t('Salir')}
            </button>
          </div>
        ) : (
          <Link to="/mi-cuenta?from=navbar" style={{
            background: '#9E1B32',
            color: 'white',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(158, 27, 50, 0.2)'
          }}
            onMouseEnter={(e) => {
              e.target.style.background = '#7a1526';
              e.target.style.boxShadow = '0 4px 12px rgba(158, 27, 50, 0.3)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#9E1B32';
              e.target.style.boxShadow = '0 2px 8px rgba(158, 27, 50, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}>
            {t('Iniciar sesión')}
          </Link>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '500',
      position: 'relative',
      transition: 'color 0.3s ease'
    }}
      onMouseEnter={(e) => {
        e.target.style.color = '#9E1B32';
        e.target.querySelector('.underline').style.width = '100%';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = '#4b5563';
        e.target.querySelector('.underline').style.width = '0%';
      }}>
      {children}
      <span className="underline" style={{
        position: 'absolute',
        bottom: '-4px',
        left: 0,
        width: '0%',
        height: '2px',
        background: '#9E1B32',
        transition: 'width 0.3s ease'
      }} />
    </Link>
  );
}

export default Navbar;