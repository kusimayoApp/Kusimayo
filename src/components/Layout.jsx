import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function Layout({ children, fullWidth = false }) {
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' }}>
      <Navbar />
      {/* paddingTop offsets the fixed navbar so content is never hidden beneath it */}
      <main style={{
        paddingTop: '84px',
        maxWidth: fullWidth || undefined,
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
      </footer>
    </div>
  );
}

export default Layout;