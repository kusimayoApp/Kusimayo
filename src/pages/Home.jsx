import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../services/firestore';
import { useTranslation } from 'react-i18next';

import imgPortada from '../assets/images/imgPortada.jpeg';
import imgNiño from '../assets/images/niño.jpeg';
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
import Footer from '../components/Footer';

const galeriaFotos = [
  imgGaleria1, imgGaleria2, imgGaleria3,
  imgGaleria4, imgGaleria5, imgGaleria6,
  imgGaleria7, imgGaleria8, imgGaleria9,
  imgGaleria10, imgGaleria11, imgGaleria12,
];

/* ─── SCROLL REVEAL HOOK ─── */
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal();
  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/\D/g, ''));
    let start = 0;
    const duration = 1600;
    const step = 14;
    const inc = num / (duration / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [visible, target]);
  const prefix = target.startsWith('+') ? '+' : '';
  return <span ref={ref}>{prefix}{visible ? count.toLocaleString() : '0'}</span>;
}

/* ─── LIGHTBOX — fixed, scroll-proof ─── */
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    // Lock scroll without layout shift
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      // blurred semi-transparent backdrop
      background: 'rgba(10,3,6,0.75)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'lbIn 0.15s ease',
      cursor: 'zoom-out',
    }}>
      <style>{`
        @keyframes lbIn  { from{opacity:0} to{opacity:1} }
        @keyframes imgIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        .lb-nav {
          position:absolute; top:50%; transform:translateY(-50%);
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.16); color:white;
          width:52px; height:52px; border-radius:50%;
          cursor:pointer; font-size:1.7rem;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.18s ease; z-index:3;
        }
        .lb-nav:hover { background:rgba(255,255,255,0.16); transform:translateY(-50%) scale(1.08); }
      `}</style>

      {/* Close */}
      <button onClick={onClose} style={{
        position:'absolute', top:18, right:20,
        background:'rgba(255,255,255,0.1)',
        border:'1px solid rgba(255,255,255,0.2)', color:'white',
        width:40, height:40, borderRadius:'50%', cursor:'pointer',
        fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center',
        transition:'background 0.15s', zIndex:3,
      }}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.22)'}
        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
      >✕</button>

      {/* Counter */}
      <div style={{
        position:'absolute', top:22, left:'50%', transform:'translateX(-50%)',
        color:'rgba(255,255,255,0.5)', fontSize:'0.82rem',
        fontFamily:"'Varela Round',sans-serif", zIndex:3,
        background:'rgba(0,0,0,0.3)', padding:'2px 12px', borderRadius:20,
      }}>{index+1} / {photos.length}</div>

      <button className="lb-nav" style={{left:14}} onClick={e=>{e.stopPropagation();onPrev();}}>‹</button>
      <button className="lb-nav" style={{right:14}} onClick={e=>{e.stopPropagation();onNext();}}>›</button>

      {/* Image */}
      <img
        key={index}
        src={photos[index]}
        alt=""
        onClick={e=>e.stopPropagation()}
        style={{
          maxWidth:'88vw', maxHeight:'84vh',
          objectFit:'contain', borderRadius:12,
          boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
          animation:'imgIn 0.18s ease',
          cursor:'default', display:'block',
        }}
      />

      {/* Thumbnail strip */}
      <div style={{
        position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:5, maxWidth:'88vw', overflowX:'auto',
        padding:'4px 8px',
      }}>
        {photos.map((src,i) => (
          <img key={i} src={src} alt=""
            onClick={e=>{e.stopPropagation();}}
            style={{
              width:44, height:32, objectFit:'cover', borderRadius:5, flexShrink:0,
              border: i===index ? '2px solid #9E1B32' : '2px solid transparent',
              opacity: i===index ? 1 : 0.4,
              transition:'all 0.15s ease', cursor:'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── COLLAGE GALLERY — true 3-col masonry, no gaps, scroll-stable ─── */
function GaleriaCard({ src, i, onClick }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.05 });
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'zoom-in',
        position: 'relative',
        marginBottom: '0.7rem',
        boxShadow: hovered ? '0 14px 40px rgba(0,0,0,0.22)' : '0 2px 10px rgba(0,0,0,0.08)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(18px)',
        transition: `opacity 0.5s ease ${(i % 3) * 0.07}s, transform 0.5s cubic-bezier(0.34,1,0.64,1) ${(i % 3) * 0.07}s, box-shadow 0.25s ease`,
      }}
    >
      <img
        src={src}
        alt={`Galería ${i+1}`}
        style={{
          width: '100%', height: 'auto', display: 'block',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(to top, rgba(158,27,50,0.5) 0%, transparent 55%)',
        opacity: hovered ? 1 : 0,
        transition:'opacity 0.25s ease',
        display:'flex', alignItems:'flex-end', justifyContent:'flex-end',
        padding:'0.6rem',
      }}>
        <div style={{
          background:'rgba(255,255,255,0.15)', backdropFilter:'blur(6px)',
          border:'1px solid rgba(255,255,255,0.3)',
          borderRadius:'50%', width:30, height:30,
          display:'flex', alignItems:'center', justifyContent:'center', color:'white',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Galeria({ t }) {
  const INITIAL = 9;
  const BATCH = 3;
  const [visibleCount, setVisibleCount] = useState(INITIAL);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [headerRef, headerVisible] = useScrollReveal();
  const [numCols, setNumCols] = useState(window.innerWidth <= 600 ? 2 : 3);

  useEffect(() => {
    const handleResize = () => setNumCols(window.innerWidth <= 600 ? 2 : 3);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibles = galeriaFotos.slice(0, visibleCount);
  const hayMas = visibleCount < galeriaFotos.length;

  // Distribute photos across columns in reading order
  const cols = Array.from({ length: numCols }, () => []);
  visibles.forEach((src, i) => cols[i % numCols].push({ src, i }));

  const handleMostrarMas = () => {
    const scrollY = window.scrollY;
    setVisibleCount(c => Math.min(c + BATCH, galeriaFotos.length));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      });
    });
  };

  return (
    <section style={{
      padding: 'clamp(4rem,7vw,6.5rem) clamp(1rem,4vw,2rem)',
      background: 'linear-gradient(180deg, #fff8f5 0%, #f7f0ed 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{position:'absolute',top:-100,right:-80,width:450,height:450,borderRadius:'50%',background:'radial-gradient(circle,rgba(158,27,50,0.05) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,left:-60,width:350,height:350,borderRadius:'50%',background:'radial-gradient(circle,rgba(158,27,50,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <div ref={headerRef} style={{
          textAlign:'center', marginBottom:'clamp(2rem,4vw,3rem)',
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'none' : 'translateY(28px)',
          transition:'all 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <span style={{
            background:'linear-gradient(135deg,#9E1B32,#c0233e)',
            color:'white', padding:'0.45rem 1.3rem', borderRadius:30,
            fontSize:'0.78rem', fontWeight:'bold', letterSpacing:'0.07em',
            textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:'0.4rem',
            boxShadow:'0 4px 16px rgba(158,27,50,0.3)', marginBottom:'1.1rem',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {t('Nuestra comunidad en imágenes')}
          </span>
          <h2 style={{fontSize:'clamp(1.7rem,3.5vw,2.8rem)',fontWeight:'bold',color:'#1a1a1a',marginBottom:'0.7rem',lineHeight:1.15}}>
            {t('Momentos que transforman vidas')}
          </h2>
          <p style={{color:'#6b7280',fontSize:'1rem',maxWidth:520,margin:'0 auto',lineHeight:1.7}}>
            {t('Cada imagen es un testimonio del impacto que juntos logramos en las comunidades andinas.')}
          </p>
        </div>

        {/* TRUE MASONRY — 3 flex columns, photos in order left→right via modulo */}
        <div className="collage-grid" style={{ display:'flex', gap:'0.7rem', alignItems:'flex-start' }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {col.map(({ src, i }) => (
                <GaleriaCard key={i} src={src} i={i} onClick={() => setLightboxIdx(i)} />
              ))}
            </div>
          ))}
        </div>

        {/* Mostrar más — scroll stays put */}
        {hayMas && (
          <div style={{ textAlign:'center', marginTop:'2.2rem' }}>
            <button
              onClick={handleMostrarMas}
              style={{
                background:'white', color:'#9E1B32',
                border:'2px solid #9E1B32',
                padding:'0.8rem 2rem', borderRadius:10,
                fontWeight:'bold', fontSize:'0.9rem',
                cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.5rem',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                fontFamily:"'Varela Round',sans-serif",
                boxShadow:'0 2px 10px rgba(158,27,50,0.1)',
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.background='#9E1B32';
                e.currentTarget.style.color='white';
                e.currentTarget.style.transform='translateY(-3px)';
                e.currentTarget.style.boxShadow='0 8px 24px rgba(158,27,50,0.35)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background='white';
                e.currentTarget.style.color='#9E1B32';
                e.currentTarget.style.transform='translateY(0)';
                e.currentTarget.style.boxShadow='0 2px 10px rgba(158,27,50,0.1)';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              {t('Mostrar más fotos')} ({galeriaFotos.length - visibleCount} {t('más')})
            </button>
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          photos={galeriaFotos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => (i - 1 + galeriaFotos.length) % galeriaFotos.length)}
          onNext={() => setLightboxIdx(i => (i + 1) % galeriaFotos.length)}
        />
      )}
    </section>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ icon, value, label, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.11)',
        border:`1px solid ${hovered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)'}`,
        borderRadius:14, padding:'1.1rem 1.2rem',
        backdropFilter:'blur(12px)',
        transform: visible ? (hovered ? 'translateY(-4px)' : 'none') : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transition:`opacity 0.6s ease ${delay}s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${delay}s, background 0.25s, border-color 0.25s`,
      }}
    >
      <div style={{ color:'rgba(255,255,255,0.75)', marginBottom:'0.3rem' }}>{icon}</div>
      <div style={{ fontSize:'clamp(1.5rem,2.5vw,2rem)', fontWeight:'bold', color:'white', lineHeight:1 }}>
        <AnimatedCounter target={value} />
      </div>
      <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', marginTop:'0.25rem' }}>{label}</div>
    </div>
  );
}

/* ─── CHECK ITEM ─── */
function CheckItem({ text, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} style={{
      display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'0.9rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateX(-16px)',
      transition:`all 0.5s ease ${delay}s`,
    }}>
      <span style={{
        width:26, height:26, borderRadius:'50%',
        background:'linear-gradient(135deg,#9E1B32,#c0233e)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        boxShadow:'0 3px 10px rgba(158,27,50,0.3)',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
      <span style={{ color:'#4b5563', fontSize:'0.97rem', lineHeight:1.5 }}>{text}</span>
    </div>
  );
}

/* ─── CTA BUTTON ─── */
function CTAButton({ children, to, primary }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: primary
          ? (hovered ? '#7a1326' : '#9E1B32')
          : (hovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'),
        backdropFilter: primary ? 'none' : 'blur(10px)',
        color:'white', padding:'0.8rem 1.8rem', borderRadius:10,
        textDecoration:'none', fontWeight:'bold', fontSize:'0.95rem',
        display:'inline-flex', alignItems:'center', gap:'0.45rem',
        border: primary ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
        transition:'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: primary
          ? (hovered ? '0 10px 30px rgba(158,27,50,0.55)' : '0 4px 16px rgba(158,27,50,0.4)')
          : 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >{children}</Link>
  );
}

/* ─── HOME ─── */
function Home() {
  const { t } = useTranslation();
  const [parallaxY, setParallaxY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [aboutRef, aboutVisible] = useScrollReveal();
  const [aboutImgRef, aboutImgVisible] = useScrollReveal();
  const [sectionBadgeRef, sectionBadgeVisible] = useScrollReveal();

  useEffect(() => { getGlobalStats(); }, []);

  useEffect(() => {
    const handleScroll = () => setParallaxY(window.scrollY * 0.35);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subtle mouse parallax on hero
  useEffect(() => {
    const handle = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 12,
        y: (e.clientY / window.innerHeight - 0.5) * 8,
      });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes heroScale {
          from { transform:scale(1.06) translateY(var(--py,0px)) translate(var(--mx,0px),var(--my,0px)); }
          to   { transform:scale(1) translateY(var(--py,0px)) translate(var(--mx,0px),var(--my,0px)); }
        }
        @keyframes floatUp {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-5px); }
        }
        @keyframes pulseRing {
          0%  { transform:scale(1); opacity:0.7; }
          100%{ transform:scale(1.7); opacity:0; }
        }
        @keyframes shimmer {
          0%  { background-position: -200% center; }
          100%{ background-position:  200% center; }
        }
        @keyframes arrowBounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%     { transform:translateX(-50%) translateY(7px); }
        }
        @keyframes spinSlow {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }

        .home-root { font-family:'Varela Round',sans-serif; }

        /* HERO */
        .hero {
          position:relative; height:100dvh; min-height:560px;
          display:flex; flex-direction:column; justify-content:center;
          overflow:hidden; color:white;
        }
        .hero-bg {
          position:absolute; inset:-5%;
          background-size:cover; background-position:center;
          animation:heroScale 1.4s cubic-bezier(0.4,0,0.2,1) both;
          will-change:transform;
        }
        /* Dark overlay — no red tint */
        .hero-overlay {
          position:absolute; inset:0;
          background:linear-gradient(
            160deg,
            rgba(10,5,8,0.72) 0%,
            rgba(20,10,15,0.55) 50%,
            rgba(5,2,4,0.65) 100%
          );
        }
        .hero-grain {
          position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events:none; opacity:0.5;
        }
        .hero-content {
          position:relative; z-index:2;
          max-width:1200px; margin:0 auto;
          padding:0 clamp(1.25rem,5vw,2.5rem);
          width:100%;
        }
        .hero-badge {
          display:inline-flex; align-items:center; gap:0.5rem;
          background:rgba(158,27,50,0.88);
          border:1px solid rgba(255,255,255,0.18);
          padding:0.42rem 1.2rem; border-radius:30px;
          font-size:0.75rem; font-weight:bold; letter-spacing:0.07em;
          text-transform:uppercase; margin-bottom:1.2rem;
          animation:fadeInDown 0.8s ease both;
          backdrop-filter:blur(8px);
          box-shadow:0 4px 18px rgba(158,27,50,0.35);
        }
        .hero-h1 {
          font-size:clamp(2rem,4.5vw,3.8rem);
          font-weight:bold; line-height:1.06;
          max-width:720px; margin-bottom:1rem;
          animation:fadeInUp 0.8s ease 0.2s both;
        }
        .hero-h1-accent {
          display:block;
          background:linear-gradient(90deg, #ff4d6d, #9E1B32, #c0233e, #ff4d6d);
          background-size:200% auto;
          -webkit-background-clip:text; background-clip:text;
          color:transparent;
          animation:shimmer 3.5s linear 1s infinite;
        }
        .hero-p {
          font-size:clamp(0.88rem,1.8vw,1.05rem);
          max-width:560px; line-height:1.72; opacity:0.9;
          margin-bottom:1.8rem;
          animation:fadeInUp 0.8s ease 0.4s both;
        }
        .hero-btns {
          display:flex; gap:0.85rem; flex-wrap:wrap;
          margin-bottom:2.2rem;
          animation:fadeInUp 0.8s ease 0.6s both;
        }
        .hero-stats {
          display:grid;
          grid-template-columns:repeat(3,minmax(130px,200px));
          gap:0.75rem;
          animation:fadeInUp 0.8s ease 0.8s both;
        }
        .arrow-hint {
          position:absolute; bottom:22px; left:50%;
          transform:translateX(-50%);
          z-index:2; opacity:0.55;
          animation:arrowBounce 2.2s ease-in-out infinite;
        }

        /* ABOUT */
        .about-section {
          padding:clamp(4rem,7vw,6.5rem) clamp(1rem,4vw,2rem);
          background:white; position:relative; overflow:hidden;
        }
        .about-section::before {
          content:''; position:absolute; top:-140px; right:-100px;
          width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(158,27,50,0.04) 0%,transparent 70%);
          pointer-events:none;
        }
        /* spinning decorative ring */
        .about-section::after {
          content:''; position:absolute; bottom:-60px; left:-60px;
          width:220px; height:220px; border-radius:50%;
          border:1.5px dashed rgba(158,27,50,0.12);
          animation:spinSlow 20s linear infinite;
          pointer-events:none;
        }
        .about-grid {
          max-width:1200px; margin:0 auto;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:clamp(2rem,5vw,5rem);
          align-items:center;
        }
        .about-img-wrap {
          position:relative; border-radius:20px; overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,0.13);
        }
        .about-img-wrap::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(to top,rgba(158,27,50,0.1) 0%,transparent 45%);
          pointer-events:none;
        }
        .about-img-wrap img {
          width:100%; aspect-ratio:4/5; object-fit:cover; display:block;
          transition:transform 0.7s ease;
        }
        .about-img-wrap:hover img { transform:scale(1.04); }
        .about-float-badge {
          position:absolute; bottom:20px; left:20px; z-index:2;
          background:rgba(255,255,255,0.96); border-radius:14px;
          padding:0.9rem 1.1rem; backdrop-filter:blur(8px);
          box-shadow:0 8px 32px rgba(0,0,0,0.16);
          display:flex; align-items:center; gap:0.7rem;
          animation:floatUp 4s ease-in-out infinite;
        }
        .pulse-dot {
          width:9px; height:9px; border-radius:50%;
          background:#9E1B32; position:relative; flex-shrink:0;
        }
        .pulse-dot::after {
          content:''; position:absolute; inset:-4px; border-radius:50%;
          border:2px solid #9E1B32;
          animation:pulseRing 1.6s ease-out infinite;
        }

        /* section badge with shimmer */
        .section-badge-wrap {
          text-align:center; margin-bottom:1.75rem;
        }
        .section-badge {
          background:linear-gradient(135deg,#9E1B32,#c0233e);
          color:white; padding:0.45rem 1.3rem; border-radius:30px;
          font-size:0.78rem; font-weight:bold; letter-spacing:0.07em;
          text-transform:uppercase; display:inline-block;
          box-shadow:0 4px 16px rgba(158,27,50,0.28);
        }

        @media(max-width:900px) {
          .hero-stats { grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:700px) {
          .about-grid { grid-template-columns:1fr; }
          .hero-stats { grid-template-columns:repeat(3,1fr); gap:0.5rem; }
        }
        @media(max-width:480px) {
          .hero-h1 { font-size:1.75rem; }
          .hero-stats { grid-template-columns:1fr 1fr 1fr; }
        }
      `}</style>

      <div className="home-root">

        {/* ══════════ HERO ══════════ */}
        <section className="hero">
          <div
            className="hero-bg"
            style={{
              backgroundImage:`url(${imgPortada})`,
              transform:`scale(1) translateY(${parallaxY}px) translate(${mousePos.x}px, ${mousePos.y}px)`,
              transition:'transform 0.1s linear',
            }}
          />
          <div className="hero-overlay"/>
          <div className="hero-grain"/>

          <div className="hero-content">
            <div className="hero-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {t('Programa de Apadrinamiento Mensual')}
            </div>

            <h1 className="hero-h1">
              {t('Apadrina y transforma')}
              <span className="hero-h1-accent">{t('vidas')}</span>
            </h1>

            <p className="hero-p">
              {t('Tu compromiso mensual brinda desayunos nutritivos, educación y acompañamiento continuo a niños de comunidades andinas. Sé padrino o madrina y haz la diferencia cada día.')}
            </p>

            <div className="hero-btns">
              <CTAButton primary to="/apadrinamiento">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {t('Apadrinar ahora')}
              </CTAButton>
              <CTAButton to="/transparencia">
                {t('Ver nuestro impacto')}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </CTAButton>
            </div>

            <div className="hero-stats">
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                value="+500" label={t('Padrinos activos')} delay={0.9}
              />
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>}
                value="+12000" label={t('Desayunos/mes')} delay={1.0}
              />
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>}
                value="+2000" label={t('Niños beneficiados')} delay={1.1}
              />
            </div>
          </div>

          {/* Arrow hint only, no text */}
          <div className="arrow-hint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </section>

        {/* ══════════ APADRINAMIENTO SECTION ══════════ */}
        <section className="about-section">
          <div className="about-grid">

            {/* Imagen */}
            <div ref={aboutImgRef} className="about-img-wrap" style={{
              opacity: aboutImgVisible ? 1 : 0,
              transform: aboutImgVisible ? 'none' : 'translateX(-36px) scale(0.97)',
              transition:'all 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}>
              <img src={imgNiño} alt="Niña estudiante"/>
              <div className="about-float-badge">
                <div className="pulse-dot"/>
                <div>
                  <div style={{fontSize:'0.72rem',fontWeight:'bold',color:'#9E1B32',lineHeight:1}}>Programa activo</div>
                  <div style={{fontSize:'0.65rem',color:'#6b7280',marginTop:2}}>Comunidades andinas</div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div ref={aboutRef} style={{
              opacity: aboutVisible ? 1 : 0,
              transform: aboutVisible ? 'none' : 'translateX(36px)',
              transition:'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.15s',
            }}>
              <span style={{
                background:'linear-gradient(135deg,rgba(158,27,50,0.1),rgba(192,35,62,0.07))',
                color:'#9E1B32', padding:'0.38rem 1rem', borderRadius:20,
                fontSize:'0.78rem', fontWeight:'bold', display:'inline-block',
                marginBottom:'1.1rem', border:'1px solid rgba(158,27,50,0.15)',
                letterSpacing:'0.04em',
              }}>{t('Compromiso permanente')}</span>

              {/* Section header with restored content */}
              <div ref={sectionBadgeRef} style={{
                opacity: sectionBadgeVisible ? 1 : 0,
                transform: sectionBadgeVisible ? 'none' : 'translateY(20px)',
                transition:'all 0.6s ease',
              }}>
                <h2 style={{fontSize:'clamp(1.5rem,2.8vw,2.2rem)',fontWeight:'bold',color:'#1a1a1a',marginBottom:'0.6rem',lineHeight:1.2}}>
                  {t('Apadrina a un niño permanentemente')}
                </h2>
                <p style={{color:'#9b8ea0',fontSize:'0.95rem',marginBottom:'1.1rem',lineHeight:1.6}}>
                  {t('Tu apadrinamiento garantiza desayunos, útiles y seguimiento continuo. Un compromiso mensual que cambia vidas para siempre.')}
                </p>
              </div>

              <h3 style={{fontSize:'clamp(1.2rem,2.2vw,1.7rem)',fontWeight:'bold',color:'#1a1a1a',marginBottom:'0.9rem',lineHeight:1.2}}>
                {t('¿Qué es el apadrinamiento?')}
              </h3>

              <p style={{color:'#6b7280',fontSize:'0.97rem',lineHeight:1.78,marginBottom:'1.5rem'}}>
                {t('El apadrinamiento es un compromiso mensual permanente que permite brindar apoyo integral a un niño. A diferencia de una donación única, el apadrinamiento crea un vínculo sostenido que garantiza:')}
              </p>

              <div style={{marginBottom:'1.75rem'}}>
                <CheckItem text={t('Desayunos diarios garantizados')} delay={0.1}/>
                <CheckItem text={t('Materiales de aseo y educación')} delay={0.2}/>
                <CheckItem text={t('Monitoreo permanente')} delay={0.3}/>
              </div>

              <Link to="/apadrinamiento" style={{
                background:'#9E1B32', color:'white',
                padding:'0.85rem 1.9rem', borderRadius:10,
                textDecoration:'none', fontWeight:'bold', fontSize:'0.92rem',
                display:'inline-flex', alignItems:'center', gap:'0.5rem',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow:'0 4px 16px rgba(158,27,50,0.3)',
                fontFamily:"'Varela Round',sans-serif",
              }}
                onMouseEnter={e=>{
                  e.currentTarget.style.transform='translateY(-3px)';
                  e.currentTarget.style.boxShadow='0 10px 28px rgba(158,27,50,0.45)';
                  e.currentTarget.style.background='#7a1326';
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform='translateY(0)';
                  e.currentTarget.style.boxShadow='0 4px 16px rgba(158,27,50,0.3)';
                  e.currentTarget.style.background='#9E1B32';
                }}
              >
                {t('Conocer planes de apadrinamiento')}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════ GALERÍA COLLAGE ══════════ */}
        <Galeria t={t}/>

      </div>

      <Footer/>
    </>
  );
}

export default Home;