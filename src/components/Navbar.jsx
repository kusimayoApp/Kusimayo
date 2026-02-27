import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';

function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [hiddenByModal, setHiddenByModal] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setHiddenByModal(document.body.classList.contains('modal-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Close menu on route change + scroll to top
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path) => location.pathname === path;

  // Always scroll to top on nav link click
  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    {
      to: '/',
      label: t('Inicio'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      to: '/apadrinamiento',
      label: t('Apadrinar'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    {
      to: '/transparencia',
      label: t('Impacto'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
        </svg>
      )
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        /* kill white flash — html bg shows instantly before React paints */
        html { background: #9E1B32; }
        body { background: #f9fafb; }

        :root {
          --red: #9E1B32;
          --red-deep: #7a1326;
          --red-soft: rgba(158,27,50,0.08);
          --nav-h: 84px;
          --nav-h-scrolled: 70px;
        }

        /* ── FIXED navbar — never pushes content ── */
        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 9000;
          font-family: 'DM Sans', sans-serif;
        }

        /* spacer div renders OUTSIDE nav-root to push page content down */

        /* ── MAIN BAR ── */
        .nav-bar {
          background: linear-gradient(135deg, #9E1B32 0%, #7a1326 60%, #5c0e1c 100%);
          height: var(--nav-h);
          display: flex;
          align-items: center;
          padding: 0 2rem;
          position: relative;
          overflow: visible;
          transition: box-shadow 0.4s ease, height 0.3s ease;
          animation: navFadeIn 0.5s ease both;
        }
        @keyframes navFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .nav-bar.scrolled {
          height: var(--nav-h-scrolled);
          box-shadow:
            0 4px 30px rgba(0,0,0,0.4),
            0 0 60px rgba(158,27,50,0.3),
            inset 0 -1px 0 rgba(255,255,255,0.08);
        }
        .nav-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(255,200,150,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .nav-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.5;
        }

        .nav-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(40px);
        }

        /* ── LOGO ── */
        .nav-logo {
          font-family: 'Varela Round', sans-serif;
          font-weight: 400;
          font-size: 1.65rem;
          color: white;
          -webkit-text-stroke: 0.5px white;
          text-shadow: 0 0 1px rgba(255,255,255,0.3);
          text-decoration: none;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          line-height: 1;
        }
        .nav-logo:hover { transform: scale(1.04); }

        .logo-mark {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(4px);
          transition: background 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
          flex-shrink: 0;
        }
        .nav-logo:hover .logo-mark {
          background: rgba(255,255,255,0.22);
          transform: rotate(-8deg) scale(1.1);
        }
        .logo-mark::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          border-radius: inherit;
          pointer-events: none;
        }
        .logo-mark svg { position: relative; z-index: 1; }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .logo-name {
          line-height: 1;
          display: block;
          white-space: nowrap;
        }
        .logo-sub {
          display: block;
          font-size: 0.46rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          opacity: 0.55;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
          white-space: nowrap;
          /* subtitle scales to never exceed the name width */
          max-width: 100%;
        }

        /* ── CENTER LINKS ── */
        .nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .nav-pill-wrap {
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.15);
          border-radius: 14px;
          padding: 5px;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          gap: 2px;
        }
        .nav-link {
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1.1rem;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          position: relative;
          transition: color 0.2s ease, background 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
        }
        .nav-link .link-icon {
          opacity: 0.6;
          transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
        .nav-link:hover .link-icon { opacity: 1; transform: scale(1.2) rotate(-5deg); }
        .nav-link.active {
          color: white;
          background: rgba(255,255,255,0.18);
          font-weight: 600;
        }
        .nav-link.active .link-icon { opacity: 1; }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 5px; left: 50%;
          transform: translateX(-50%);
          width: 3px; height: 3px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(255,255,255,0.8);
          animation: dotAppear 0.3s ease-out both;
        }
        @keyframes dotAppear {
          from { opacity: 0; transform: translateX(-50%) scale(0); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }

        /* ── RIGHT ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          z-index: 9100; /* high so dropdown renders above page */
          flex-shrink: 0;
        }

        /* ── LANG DROPDOWN ── */
        .lang-wrap { position: relative; }
        .lang-btn {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 9px;
          padding: 0.42rem 0.75rem;
          color: rgba(255,255,255,0.85);
          font-size: 0.82rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .lang-btn:hover { background: rgba(255,255,255,0.18); color: white; }
        .lang-btn svg { transition: transform 0.25s ease; }
        .lang-btn.open svg { transform: rotate(180deg); }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: white;
          border-radius: 14px;
          padding: 6px;
          /* high shadow + high z-index to float above hero image etc */
          box-shadow:
            0 24px 64px rgba(0,0,0,0.28),
            0 4px 16px rgba(0,0,0,0.14),
            0 0 0 1px rgba(0,0,0,0.06);
          min-width: 150px;
          transform-origin: top right;
          animation: dropIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
          z-index: 9999;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.8) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .lang-option {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.55rem 0.8rem;
          border-radius: 9px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          transition: background 0.15s ease, color 0.15s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .lang-option:hover { background: var(--red-soft); color: var(--red); }
        .lang-option.selected { background: var(--red-soft); color: var(--red); font-weight: 700; }

        /* ── AUTH ── */
        .btn-login {
          background: white;
          color: var(--red);
          padding: 0.52rem 1.3rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.875rem;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex; align-items: center; gap: 0.4rem;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          white-space: nowrap;
        }
        .btn-login:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          color: var(--red-deep);
        }
        .btn-login svg { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .btn-login:hover svg { transform: translateX(2px); }

        .btn-logout {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.8);
          padding: 0.45rem 1rem;
          border-radius: 9px;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-logout:hover { background: rgba(255,255,255,0.18); color: white; }

        .user-chip {
          display: flex; align-items: center; gap: 0.55rem;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 40px;
          padding: 0.3rem 1rem 0.3rem 0.35rem;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .user-chip:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .user-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: 1.5px solid rgba(255,255,255,0.5);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700;
          font-family: 'Varela Round', sans-serif;
        }
        .user-name { color: rgba(255,255,255,0.9); font-size: 0.875rem; font-weight: 500; }

        /* ── HAMBURGER (right edge, visible ≤1150px) ── */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          cursor: pointer;
          border-radius: 11px;
          transition: all 0.2s ease;
          position: relative;
          z-index: 9001;
          flex-shrink: 0;
          /* sits at far right due to margin-left: auto on the flex container or just flex ordering */
        }
        .hamburger:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.3); }
        .hamburger-line {
          display: block;
          width: 18px; height: 1.5px;
          background: white; border-radius: 2px;
          position: absolute;
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .hamburger-line:nth-child(1) { transform: translateY(-5px); }
        .hamburger-line:nth-child(2) { transform: translateY(0); }
        .hamburger-line:nth-child(3) { transform: translateY(5px); }
        .hamburger.open .hamburger-line:nth-child(1) { transform: translateY(0) rotate(45deg); }
        .hamburger.open .hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open .hamburger-line:nth-child(3) { transform: translateY(0) rotate(-45deg); }

        /* ── PROGRESS BAR ── */
        .nav-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,200,150,0.9), white);
          box-shadow: 0 0 12px rgba(255,255,255,0.5);
          pointer-events: none;
        }

        /* ── OVERLAY ── */
        .nav-overlay {
          position: fixed; inset: 0;
          z-index: 8998;
          background: rgba(60,8,18,0.55);
          backdrop-filter: blur(6px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .nav-overlay.open { opacity: 1; pointer-events: all; }

        /* ── MOBILE SIDE PANEL ── */
        .mobile-menu {
          position: fixed;
          top: 0; left: 0;
          width: min(340px, 86vw);
          height: 100dvh;
          background: linear-gradient(160deg, #9E1B32 0%, #6d1122 40%, #4a0d18 100%);
          z-index: 8999;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 12px 0 60px rgba(0,0,0,0.45);
          overflow: hidden;
        }
        .mobile-menu::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 0% 20%, rgba(255,255,255,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 100% 80%, rgba(255,200,150,0.05) 0%, transparent 50%);
          pointer-events: none;
        }
        .mobile-menu.open { transform: translateX(0); }

        .mobile-header {
          padding: 1.4rem 1.5rem 1.2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .mobile-close {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: white;
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .mobile-close:hover { background: rgba(255,255,255,0.2); }

        .mobile-links {
          flex: 1;
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.4rem;
          overflow-y: auto;
        }
        .mobile-link {
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          font-size: 1rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          display: flex; align-items: center; gap: 0.75rem;
          border: 1px solid transparent;
          opacity: 0; transform: translateX(-20px);
          transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.25s;
        }
        .mobile-menu.open .mobile-link {
          animation: slideIn 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards;
        }
        .mobile-menu.open .mobile-link:nth-child(1) { animation-delay: 0.08s; }
        .mobile-menu.open .mobile-link:nth-child(2) { animation-delay: 0.14s; }
        .mobile-menu.open .mobile-link:nth-child(3) { animation-delay: 0.20s; }
        @keyframes slideIn { to { opacity: 1; transform: translateX(0); } }
        .mobile-link:hover, .mobile-link.active {
          color: white;
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.15);
          transform: translateX(4px);
        }
        .m-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mobile-link:hover .m-icon, .mobile-link.active .m-icon {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1) rotate(-5deg);
        }

        .m-lang-wrap {
          padding: 0 1.25rem 1rem;
          opacity: 0; transform: translateY(10px);
          flex-shrink: 0;
        }
        .mobile-menu.open .m-lang-wrap { animation: fadeUp 0.4s 0.28s ease-out forwards; }
        .m-lang-label {
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 0.6rem;
          font-family: 'DM Sans', sans-serif;
        }
        .m-lang-pills { display: flex; gap: 0.5rem; }
        .m-lang-pill {
          flex: 1;
          padding: 0.6rem; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
          text-align: center;
          font-size: 0.85rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s ease;
        }
        .m-lang-pill:hover { background: rgba(255,255,255,0.14); color: white; }
        .m-lang-pill.active { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.35); color: white; font-weight: 700; }

        .m-actions {
          padding: 1.25rem 1.25rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex; flex-direction: column; gap: 0.7rem;
          opacity: 0; transform: translateY(10px);
          flex-shrink: 0;
        }
        .mobile-menu.open .m-actions { animation: fadeUp 0.4s 0.34s ease-out forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

        .btn-login-m {
          background: white; color: var(--red);
          padding: 0.9rem; border-radius: 12px;
          font-weight: 700; font-size: 0.95rem;
          text-decoration: none; text-align: center;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          font-family: 'DM Sans', sans-serif;
        }
        .btn-login-m:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }

        .btn-logout-m {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.14);
          padding: 0.85rem; border-radius: 12px;
          font-weight: 500; font-size: 0.9rem;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease; width: 100%;
        }
        .btn-logout-m:hover { background: rgba(255,255,255,0.14); color: white; }

        .user-chip-m {
          display: flex; align-items: center; gap: 0.75rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px; padding: 0.75rem 1rem;
          text-decoration: none; transition: all 0.2s ease;
        }
        .user-chip-m:hover { background: rgba(255,255,255,0.16); }
        .user-av-m {
          width: 36px; height: 36px; border-radius: 50%;
          background: white; color: var(--red);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 800;
          font-family: 'Syne', sans-serif; flex-shrink: 0;
        }
        .user-name-m { color: white; font-size: 0.9rem; font-weight: 600; }
        .user-email-m { color: rgba(255,255,255,0.5); font-size: 0.75rem; }

        /* ── BREAKPOINTS ── */
        @media (max-width: 1150px) {
          .nav-center { display: none; }
          .nav-right .btn-login,
          .nav-right .btn-logout,
          .nav-right .user-chip,
          .nav-right .lang-wrap { display: none; }
          .hamburger { display: flex; }
          /* logo on left, hamburger pushed all the way right */
          .nav-bar { padding: 0 1.25rem; }
          /* make logo + hamburger be space-between */
          .nav-bar > .nav-right { display: none; }
        }
        @media (min-width: 1151px) {
          .mobile-menu, .nav-overlay { display: none !important; }
        }
      `}</style>



      {/* ── OVERLAY ── */}
      <div className={`nav-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      <nav className="nav-root" style={{ display: hiddenByModal ? 'none' : undefined }}>
        <div className={`nav-bar${scrolled ? ' scrolled' : ''}`}>

          {/* decorative orbs */}
          <div className="nav-orb" style={{ width: 120, height: 120, background: 'rgba(255,160,100,0.12)', top: -40, right: 200 }} />
          <div className="nav-orb" style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.05)', bottom: -30, left: 300 }} />

          {/* ── LOGO ── */}
          <Link to="/" className="nav-logo" onClick={handleNavClick}>
            <div className="logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="logo-text">
              <span className="logo-name">Kusimayo</span>
            </span>
          </Link>

          {/* ── CENTER LINKS (desktop) ── */}
          <div className="nav-center">
            <div className="nav-pill-wrap">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link${isActive(link.to) ? ' active' : ''}`}
                  onClick={handleNavClick}
                >
                  <span className="link-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── RIGHT (desktop) ── */}
          <div className="nav-right">
            {/* Lang dropdown */}
            <div className="lang-wrap" ref={langRef}>
              <button
                className={`lang-btn${langOpen ? ' open' : ''}`}
                onClick={() => setLangOpen(v => !v)}
              >
                {i18n.language === 'es' ? '🇵🇪 ES' : '🇺🇸 EN'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {[
                    { code: 'es', flag: '🇵🇪', label: 'Español' },
                    { code: 'en', flag: '🇺🇸', label: 'English' }
                  ].map(l => (
                    <div
                      key={l.code}
                      className={`lang-option${i18n.language === l.code ? ' selected' : ''}`}
                      onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                    >
                      {l.flag} {l.label}
                      {i18n.language === l.code && (
                        <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link to="/mi-cuenta" className="user-chip" onClick={handleNavClick}>
                  <div className="user-avatar">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="btn-logout">{t('Salir')}</button>
              </>
            ) : (
              <Link to="/mi-cuenta?from=navbar" className="btn-login" onClick={handleNavClick}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {t('Iniciar sesión')}
              </Link>
            )}
          </div>

          {/* ── HAMBURGER — always rightmost, shown ≤1150px ── */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            style={{ marginLeft: 'auto' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menú"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          {/* scroll progress */}
          <ProgressBar />
        </div>

        {/* ── MOBILE SIDE MENU ── */}
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <div className="mobile-header">
            <Link to="/" className="nav-logo" style={{ fontSize: '1.5rem' }} onClick={handleNavClick}>
              <div className="logo-mark" style={{ width: 36, height: 36, borderRadius: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              Kusimayo
            </Link>
            <button className="mobile-close" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mobile-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-link${isActive(link.to) ? ' active' : ''}`}
                onClick={handleNavClick}
              >
                <span className="m-icon">{link.icon}</span>
                {link.label}
                <svg style={{ marginLeft: 'auto', opacity: 0.35 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>

          <div className="m-lang-wrap">
            <p className="m-lang-label">{t('Idioma')}</p>
            <div className="m-lang-pills">
              {[
                { code: 'es', flag: '🇵🇪', label: 'Español' },
                { code: 'en', flag: '🇺🇸', label: 'English' }
              ].map(l => (
                <button
                  key={l.code}
                  className={`m-lang-pill${i18n.language === l.code ? ' active' : ''}`}
                  onClick={() => i18n.changeLanguage(l.code)}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="m-actions">
            {user ? (
              <>
                <Link to="/mi-cuenta" className="user-chip-m" onClick={handleNavClick}>
                  <div className="user-av-m">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name-m">{user.displayName || 'Mi cuenta'}</div>
                    <div className="user-email-m">{user.email}</div>
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn-logout-m">{t('Cerrar sesión')}</button>
              </>
            ) : (
              <Link to="/mi-cuenta?from=navbar" className="btn-login-m" onClick={handleNavClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {t('Iniciar sesión')}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

function ProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const s = el.scrollTop || document.body.scrollTop;
      const total = (el.scrollHeight || document.body.scrollHeight) - el.clientHeight;
      setProgress(total > 0 ? (s / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div
      className="nav-progress"
      style={{ width: `${progress}%`, transition: progress === 0 ? 'none' : 'width 0.1s linear' }}
    />
  );
}

export default Navbar;