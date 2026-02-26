import Navbar from './Navbar';

function Layout({ children, fullWidth = false }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' }}>
      <Navbar />
      <main style={{ 
        maxWidth: fullWidth, 
        margin: '0 auto', 
        padding: fullWidth,
        width: '100%'
      }}>
        {children}
      </main>
      <footer style={{
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.85rem',
      }}>
      </footer>
    </div>
  );
}

export default Layout;