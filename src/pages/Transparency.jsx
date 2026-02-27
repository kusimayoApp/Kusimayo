import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../services/firestore';
import { useTranslation } from 'react-i18next';
import videoComunidad from "../assets/images/galeria/video/vid1.mp4";
import videoTransformacion from "../assets/images/galeria/video/vid2.mp4";

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

import Footer from '../components/Footer';

/* ─── SCROLL REVEAL HOOK ─── */
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal();
  const str = String(value);
  const prefix = str.replace(/[\d,. ]+.*/, ''); // e.g. "$" or "S/"
  const num = parseInt(str.replace(/\D/g, '')) || 0;

  useEffect(() => {
    if (!visible || num === 0) return;
    let start = 0;
    const step = 14;
    const inc = num / (1600 / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [visible, num]);

  return <span ref={ref}>{prefix}{visible ? count.toLocaleString() : '0'}</span>;
}

/* ════════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                            */
/* ════════════════════════════════════════════════════════════════════════ */

function Transparency() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.05 });
  const [videosRef, videosVisible] = useScrollReveal();
  const [galRef, galVisible] = useScrollReveal();
  const [statsRef, statsVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  useEffect(() => {
    getGlobalStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes tSpin         { to { transform: rotate(360deg); } }
        @keyframes tFadeInUp     { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tShimmer      { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes tFloatY       { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes tPulseRing    { 0%{transform:scale(1);opacity:0.7;} 100%{transform:scale(2);opacity:0;} }
        @keyframes tGradientShift{ 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }

        /* Stat card shimmer top bar */
        .t-stat-card { position:relative; overflow:hidden; }
        .t-stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#9E1B32,#c0233e,#ff8fa3,#9E1B32);
          background-size:200% auto; animation:tShimmer 2.5s linear infinite;
        }
        .t-stat-card:hover { transform:translateY(-8px) !important; box-shadow:0 16px 40px rgba(158,27,50,0.16) !important; }

        .t-carousel-card:hover { transform:translateY(-6px) !important; box-shadow:0 16px 36px rgba(0,0,0,0.14) !important; }

        .t-video-card:hover { transform:translateY(-6px) !important; box-shadow:0 20px 48px rgba(0,0,0,0.26) !important; }

        .t-cta-btn:hover { transform:translateY(-4px) scale(1.04) !important; box-shadow:0 12px 36px rgba(0,0,0,0.35) !important; }

        .t-play-ring {
          position:absolute; inset:-6px; border-radius:50%;
          border:2px solid rgba(158,27,50,0.45);
          animation:tPulseRing 1.3s ease-out infinite;
        }
      `}</style>

      <div style={{ fontFamily: "'Varela Round', sans-serif" }}>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', padding: '8rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

          {/* Subtle background blobs */}
          <div style={{ position: 'absolute', top: -80, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(158,27,50,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -50, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(158,27,50,0.05) 0%,transparent 70%)', pointerEvents: 'none' }} />

          <div ref={heroRef} style={{ maxWidth: '900px', margin: '0 auto' }}>

            <div style={{
              display: 'inline-block', background: '#9E1B32', color: 'white',
              padding: '0.5rem 1.5rem', borderRadius: '30px', marginBottom: '1.5rem',
              fontSize: '0.9rem', fontWeight: 'bold',
              boxShadow: '0 4px 16px rgba(158,27,50,0.3)',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(-16px)',
              transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              {t('Transparencia')}
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold',
              marginBottom: '1rem', color: '#1a1a1a',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(24px)',
              transition: 'all 0.7s ease 0.15s',
            }}>
              {t('Tu aporte en acción')}
            </h1>

            <p style={{
              fontSize: '1.1rem', color: '#6b7280', lineHeight: '1.6',
              maxWidth: '700px', margin: '0 auto',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.3s',
            }}>
              {t('Aquí puedes ver exactamente cómo tu apadrinamiento transforma vidas. Cada sol cuenta y tiene un destino claro.')}
            </p>

            {/* Animated underline */}
            <div style={{
              height: 3, background: 'linear-gradient(90deg,#9E1B32,#c0233e)',
              borderRadius: 2, margin: '1.5rem auto 0',
              width: heroVisible ? 60 : 0,
              transition: 'width 0.8s ease 0.5s',
            }} />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VIDEOS DE IMPACTO                                              */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '4rem 2rem', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            <div ref={videosRef}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold',
                textAlign: 'center', marginBottom: '3rem', color: '#1a1a1a',
                opacity: videosVisible ? 1 : 0,
                transform: videosVisible ? 'none' : 'translateY(24px)',
                transition: 'all 0.7s ease',
              }}>
                {t('Mira el impacto de tu apadrinamiento')}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {[
                { title: t('Un día en una comunidad'), src: videoComunidad, delay: '0s' },
                { title: t('Historias de transformación'), src: videoTransformacion, delay: '0.15s' },
              ].map((v, i) => (
                <div key={i} style={{
                  opacity: videosVisible ? 1 : 0,
                  transform: videosVisible ? 'none' : 'translateY(36px)',
                  transition: `all 0.7s cubic-bezier(0.34,1,0.64,1) ${v.delay}`,
                }}>
                  <VideoCard title={v.title} videoSrc={v.src} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* GALERÍA DE IMPACTO                                             */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '4rem 2rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            <div ref={galRef}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold',
                textAlign: 'center', marginBottom: '2.5rem', color: '#1a1a1a',
                opacity: galVisible ? 1 : 0,
                transform: galVisible ? 'none' : 'translateY(24px)',
                transition: 'all 0.7s ease',
              }}>
                {t('Galería de impacto')}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              {[
                { title: t('Desayunos nutritivos'), images: [des1, des2, des3], delay: '0s' },
                { title: t('Acompañamiento a madres'), images: [acp1, acp2, acp3], delay: '0.1s' },
                { title: t('Aseo e higiene'), images: [aseo1, aseo2], delay: '0.2s' },
                { title: t('Útiles escolares'), images: [utiles1, utiles2], delay: '0.3s' },
              ].map((card, i) => (
                <div key={i} style={{
                  opacity: galVisible ? 1 : 0,
                  transform: galVisible ? 'none' : 'translateY(36px)',
                  transition: `all 0.7s cubic-bezier(0.34,1,0.64,1) ${card.delay}`,
                }}>
                  <CarouselCard title={card.title} images={card.images} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* IMPACTO EN NÚMEROS                                             */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 
        <section style={{ padding: '5rem 2rem', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            <div ref={statsRef}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold',
                textAlign: 'center', marginBottom: '4rem', color: '#1a1a1a',
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? 'none' : 'translateY(24px)',
                transition: 'all 0.7s ease',
              }}>
                {t('Nuestro impacto en números')}
              </h2>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>{t('Cargando estadísticas...')}</p>
            ) : !stats ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>{t('No hay datos aún.')}</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                {[
                  { icon: <ChartIcon />, value: stats.totalDonations || 0, label: t('Donaciones totales'), delay: '0s' },
                  { icon: <DollarIcon />, value: `$${stats.totalAmountUSD || 0}`, label: t('Monto recaudado (USD)'), delay: '0.1s' },
                  { icon: <DollarIcon />, value: `S/${stats.totalAmountSoles || 0}`, label: t('Monto recaudado (Soles)'), delay: '0.2s' },
                  { icon: <UsersIcon />, value: stats.totalSponsors || 0, label: t('Padrinos activos'), delay: '0.3s' },
                ].map((s, i) => (
                  <div key={i} style={{
                    opacity: statsVisible ? 1 : 0,
                    transform: statsVisible ? 'none' : 'translateY(36px)',
                    transition: `all 0.7s cubic-bezier(0.34,1,0.64,1) ${s.delay}`,
                  }}>
                    <StatCard icon={s.icon} value={s.value} label={s.label} color="#9E1B32" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        */}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* CTA FINAL                                                      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          ref={ctaRef}
          style={{
            padding: '5rem 2rem', color: 'white', textAlign: 'center',
            background: 'linear-gradient(135deg, #9E1B32 0%, #7a1326 40%, #c0233e 100%)',
            backgroundSize: '200% 200%',
            animation: 'tGradientShift 5s ease infinite',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Floating hearts background */}
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${8 + i * 20}%`,
              top: `${15 + (i % 2) * 55}%`,
              opacity: 0.08,
              animation: `tFloatY ${4 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
              pointerEvents: 'none',
            }}>
              <HeartIcon size={24 + i * 10} />
            </div>
          ))}

          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1.5rem',
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'none' : 'translateY(24px)',
              transition: 'all 0.7s ease',
            }}>
              {t('¿Listo para apadrinar?')}
            </h2>

            <p style={{
              fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6', opacity: ctaVisible ? 0.95 : 0,
              transform: ctaVisible ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.15s',
            }}>
              {t('Tu apadrinamiento mensual brinda un impacto real y medible. Únete a nuestra comunidad de padrinos y madrinas.')}
            </p>

            <div style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.3s',
            }}>
              <Link
                to="/apadrinamiento"
                className="t-cta-btn"
                style={{
                  background: 'white', color: '#9E1B32', padding: '1rem 3rem', borderRadius: '10px',
                  textDecoration: 'none', fontWeight: 'bold', fontSize: '1.05rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}
              >
                <HeartIcon size={20} /> {t('Apadrinar ahora')}
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* CAROUSEL CARD — original + fade suave entre imágenes + dots pill        */
/* ════════════════════════════════════════════════════════════════════════ */

function CarouselCard({ title, images }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const go = (dir, e) => {
    e.stopPropagation();
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setCurrent((c) => (c + dir + images.length) % images.length);
      setFading(false);
    }, 180);
  };

  return (
    <div
      className="t-carousel-card"
      style={{
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        background: 'white', position: 'relative',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
      }}
    >
      {/* Contenedor de imagen */}
      <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
        <img
          src={images[current]}
          alt={`${title} ${current + 1}`}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        />

        {/* Botón anterior */}
        <button
          onClick={(e) => go(-1, e)}
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
        >‹</button>

        {/* Botón siguiente */}
        <button
          onClick={(e) => go(1, e)}
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
        >›</button>

        {/* Indicadores de puntos — ahora son píldoras */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '6px', alignItems: 'center',
        }}>
          {images.map((_, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: i === current ? '18px' : '8px',
                height: '8px', borderRadius: '99px', cursor: 'pointer',
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
/* VIDEO CARD — original + hover overlay + pulse ring al hover             */
/* ════════════════════════════════════════════════════════════════════════ */

function VideoCard({ title, videoSrc }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

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
      className="t-video-card"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
        position: 'relative', background: '#000',
      }}
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
          background: hovered ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.25s ease',
        }}>
          <div style={{
            width: '70px', height: '70px',
            background: 'rgba(158, 27, 50, 0.92)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            boxShadow: '0 6px 24px rgba(158,27,50,0.5)',
            transform: hovered ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative',
          }}>
            {hovered && <div className="t-play-ring" />}
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
        pointerEvents: 'none',
        transform: hovered ? 'translateY(0)' : 'translateY(3px)',
        transition: 'transform 0.25s ease',
      }}>
        {title}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* SVG ICONS — idénticos al original                                        */
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
/* STAT CARD — mismo layout original + shimmer bar + contador animado      */
/* ════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon, value, label, color }) {
  return (
    <div
      className="t-stat-card"
      style={{
        textAlign: 'center', padding: '2rem 1rem', background: '#fafafa',
        borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
        cursor: 'default',
      }}
    >
      <div style={{ color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>
        <AnimatedCounter value={value} />
      </div>
      <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500' }}>{label}</div>
    </div>
  );
}

export default Transparency;