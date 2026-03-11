'use client';
import { useState, Suspense, useEffect, useRef, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '../data/products';
import IntroScreen from '../components/IntroScreen';
import Hotbar from '../components/Hotbar';
import DiscountPopup from '../components/DiscountPopup';
import { CursorBlob, Marquee, Grid, Scanlines, Noise, Glitch } from '../components/effects/SharedEffects';
import { isMobile, GPU_STYLE } from '../lib/perf';

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useTypewriter(phrases: string[], speed = 70, pause = 2200) {
  const [display, setDisplay] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx < current.length) {
      t = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => setCharIdx((c) => c - 1), speed / 2.5);
    } else {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return display;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTWEIGHT BACKGROUND COMPONENTS (CSS-driven)
// ─────────────────────────────────────────────────────────────────────────────

/** Floating glyphs — reduced count on mobile, pure CSS animation */
const FloatingGlyph = memo(function FloatingGlyph({ char, x, y, delay, size }: {
  char: string; x: number; y: number; delay: number; size: number;
}) {
  return (
    <span
      className="absolute font-space font-black text-agro-blue select-none pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`, fontSize: size,
        animation: `grid-pulse ${14 + delay}s ease-in-out ${delay}s infinite`,
        opacity: 0.06,
        ...GPU_STYLE,
      }}
    >
      {char}
    </span>
  );
});

/** Orbit rings — pure CSS rotation instead of Framer Motion */
const OrbitRing = memo(function OrbitRing({ size, delay, duration, dashed = false }: {
  size: number; delay: number; duration: number; dashed?: boolean;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        top: '50%', left: '50%',
        marginTop: -size / 2, marginLeft: -size / 2,
        border: dashed ? '1px dashed rgba(176,142,104,0.15)' : '1px solid rgba(0,91,236,0.08)',
        animation: `orbit-spin ${duration}s linear ${delay}s infinite`,
        ...GPU_STYLE,
      }}
    />
  );
});

/** Corner crosses — pure CSS animation */
const CornerCross = memo(function CornerCross({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="28" height="28" viewBox="0 0 28 28"
      className="absolute text-agro-gold pointer-events-none"
      style={{ opacity: 0.25, animation: 'orbit-spin 22s linear infinite', ...style, ...GPU_STYLE }}
    >
      <line x1="14" y1="0" x2="14" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
    </svg>
  );
});

/** Counter strip — pure CSS pulse */
const CounterStrip = memo(function CounterStrip() {
  return (
    <div className="absolute top-28 right-8 flex flex-col gap-2 items-end z-0 pointer-events-none">
      {['01', '02', '03', '04'].map((n, i) => (
        <span
          key={n}
          className="font-space font-bold text-[10px] tracking-widest text-agro-gold"
          style={{ animation: `counter-pulse 3.5s ease-in-out ${i * 0.7}s infinite` }}
        >
          {n}
        </span>
      ))}
    </div>
  );
});

/** Split title — one-shot CSS animation, no per-char motion.span */
const SplitTitle = memo(function SplitTitle({ text, className = '', delay = 0 }: {
  text: string; className?: string; delay?: number;
}) {
  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {text.split('').map((c, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.7, delay: delay + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
        >
          {c === ' ' ? '\u00A0' : c}
        </motion.span>
      ))}
    </span>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// VITRINE BACKGROUND — heavily optimized
// ─────────────────────────────────────────────────────────────────────────────

function VitrineBackground() {
  const typewriter = useTypewriter([
    'O VENENO DA ROÇA.',
    'SISTEMA BRUTO.',
    'SAFRA 26.',
    'AGROTÓXICA.',
    'TRAIA DE RESPEITO.',
    'SEM ANTÍDOTO.',
  ]);

  const mobile = typeof window !== 'undefined' && isMobile();

  // Reduce glyph count on mobile
  const glyphs = (mobile ? 'AGRO26' : 'AGROTÓXICA2026').split('').map((char, i) => ({
    char,
    x: (i * 23 + 7) % 92,
    y: (i * 17 + 5) % 88,
    delay: i * 0.6 + 0.5,
    size: 24 + (i * 17) % 56,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <CursorBlob />
      <Scanlines />
      {!mobile && <Grid />}

      <OrbitRing size={500} delay={0} duration={22} />
      <OrbitRing size={850} delay={2} duration={35} dashed />
      {!mobile && <OrbitRing size={1200} delay={4} duration={55} />}
      {!mobile && <OrbitRing size={1600} delay={1} duration={75} dashed />}

      <CornerCross style={{ top: '3%', left: '1.5%' }} />
      <CornerCross style={{ top: '3%', right: '1.5%' }} />
      {!mobile && <CornerCross style={{ bottom: '3%', left: '1.5%' }} />}
      {!mobile && <CornerCross style={{ bottom: '3%', right: '1.5%' }} />}

      {glyphs.map((g, i) => <FloatingGlyph key={i} {...g} />)}

      {/* Large background text */}
      <div
        className="absolute top-0 left-[-4%] leading-none select-none"
        style={{ opacity: 0.045 }}
      >
        <Glitch
          text="AGRONOMIA"
          className="font-space font-black text-[14rem] md:text-[20rem] uppercase text-agro-blue"
        />
      </div>

      {!mobile && (
        <div
          className="absolute top-[45%] whitespace-nowrap select-none"
          style={{ opacity: 0.028, transform: 'rotate(-8deg) translateX(8%)' }}
        >
          <span className="font-space font-black text-[7rem] uppercase text-agro-gold leading-none">
            AGROTÓXICA · AGROTÓXICA · AGROTÓXICA
          </span>
        </div>
      )}

      <div className="absolute top-[8%] w-full flex flex-col gap-5">
        <Marquee text="AGROTÓXICA  ·  NÓIS É O TREM  ·  TRAIA DE PATRÃO  ·  SISTEMA BRUTO E SISTEMÁTICO" dir={1} speed={60} op={0.055} />
        <Marquee text="NU! QUE TREM TÓXICO  ·  CHIQUE NO ÚRTIMO  ·  LIDA BRUTA  ·  O VENENO DA ROÇA  ·  SAFRA 26" dir={-1} speed={45} op={0.038} size="text-sm" />
      </div>

      <div className="absolute bottom-[8%] w-full flex flex-col gap-5">
        <Marquee text="MARCHA NO MAQUINÁRIO  ·  ARREDA QUE O VENENO CHEGOU  ·  SEM MASSAGEM  ·  REINANDO NO MATO  ·  POEIRA" dir={-1} speed={52} op={0.05} />
        <Marquee text="AGROTÓXICA  ·  2026  ·  AGUENTA O TRANCO  ·  TRAIADO E ALCOOLIZADO  ·  TCHAU BRIGADO!" dir={1} speed={68} op={0.033} size="text-sm" />
      </div>

      <CounterStrip />

      {/* Typewriter */}
      <div className="absolute bottom-6 left-8 z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full bg-agro-gold"
            style={{ animation: 'dot-pulse 1.1s ease-in-out infinite' }}
          />
          <span className="font-poppins text-xs uppercase tracking-[0.28em] opacity-35 text-agro-blue">
            {typewriter}
            <span
              className="inline-block ml-0.5 border-r-2 border-agro-gold h-[0.9em] align-middle"
              style={{ animation: 'cursor-blink 0.55s step-end infinite' }}
            />
          </span>
        </div>
      </div>

      {/* Horizontal rules */}
      {[25, 50, 75].map((pct) => (
        <div
          key={pct}
          className="absolute w-full h-[1px] bg-agro-blue pointer-events-none"
          style={{ top: `${pct}%`, opacity: 0.04 }}
        />
      ))}

      <Noise />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD — optimized: uses CSS hover effects, no infinite Framer loops
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ produto, index }: { produto: (typeof products)[0]; index: number }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('agro-favorites') || '[]');
      setIsFav(stored.includes(produto.id));
    } catch {
      setIsFav(false);
    }
  }, [produto.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = JSON.parse(localStorage.getItem('agro-favorites') || '[]');
      let updated;
      if (stored.includes(produto.id)) {
        updated = stored.filter((id: string) => id !== produto.id);
        setIsFav(false);
      } else {
        updated = [...stored, produto.id];
        setIsFav(true);
      }
      localStorage.setItem('agro-favorites', JSON.stringify(updated));
    } catch {
      console.error("Erro ao acessar favoritos.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.6 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/produto/${produto.id}`}>
        <motion.div
          whileHover={{ y: -12, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative"
        >
          <div className="bg-agro-card rounded-3xl p-6 shadow-2xl aspect-[4/5] flex flex-col justify-between border-2 border-transparent group-hover:border-agro-gold transition-all duration-500 overflow-hidden relative">

            {/* Shine sweep — pure CSS instead of Framer backgroundPositionX loop */}
            <div
              className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(115deg, transparent 30%, rgba(176,142,104,0.08) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
                animation: 'shine-sweep 1.5s linear infinite',
                ...GPU_STYLE,
              }}
            />

            {/* FAVORITE BUTTON */}
            <button
              onClick={toggleFav}
              className="absolute top-4 left-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-agro-bg/60 border border-agro-blue/10 transition-all duration-300 shadow-sm overflow-hidden active:scale-90 hover:scale-110"
              style={{
                color: isFav ? '#ef4444' : 'var(--color-blue)',
                borderColor: isFav ? 'rgba(239,68,68,0.3)' : '',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Card number */}
            <span className="absolute top-4 right-5 font-space font-bold text-xs tracking-widest text-agro-blue opacity-20 group-hover:opacity-60 transition-opacity duration-500">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Image */}
            <div className="w-full h-[70%] bg-agro-blue/10 rounded-2xl flex items-center justify-center overflow-hidden relative mt-2">
              <Image
                src={produto.image}
                alt={produto.nome}
                width={400}
                height={400}
                priority={index < 4}
                className="w-full h-full object-contain p-4 group-hover:scale-[1.15] transition-transform duration-700"
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 60%, rgba(176,142,104,0.15) 0%, transparent 70%)' }}
              />
            </div>

            {/* Info */}
            <div className="mt-4 overflow-hidden">
              <h4 className="font-space font-bold text-4xl uppercase leading-none overflow-hidden">
                <span className="block">{produto.nome}</span>
              </h4>
              <div className="flex items-center justify-between mt-2">
                <p className="text-agro-gold font-bold text-lg">{produto.price}</p>
                <span className="text-xs font-poppins font-bold uppercase tracking-widest text-agro-blue opacity-0 group-hover:opacity-50 transition-all duration-500 -translate-x-3 group-hover:translate-x-0">
                  Ver →
                </span>
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 h-1 bg-agro-gold rounded-full w-0 group-hover:w-full transition-all duration-400"
              style={{ ...GPU_STYLE }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// HOME CONTENT
// ─────────────────────────────────────────────────────────────────────────────
function HomeContent() {
  const searchParams = useSearchParams();
  const skipIntroParam = searchParams.get('skipIntro') === 'true';
  const [showIntro, setShowIntro] = useState(!skipIntroParam);

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroScreen key="intro" onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <motion.div
          initial={{ opacity: skipIntroParam ? 1 : 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10"
        >
          <VitrineBackground />

          <div className="container mx-auto px-6 pt-32 relative z-10">

            <header className="mb-20">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl font-bold text-agro-gold tracking-widest uppercase mb-3 font-poppins flex items-center gap-3"
              >
                <motion.span
                  className="inline-block w-8 h-[2px] bg-agro-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
                Coleção 2026
                <motion.span
                  className="inline-block w-8 h-[2px] bg-agro-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />
              </motion.h2>

              <h3 className="font-space font-bold text-7xl md:text-9xl uppercase tracking-tighter leading-none">
                <SplitTitle text="Agrotóxica" delay={0.35} />
              </h3>

              <motion.div
                className="h-[3px] bg-gradient-to-r from-agro-gold via-agro-blue to-transparent mt-4 rounded-full"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '60%' }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="font-poppins text-xs uppercase tracking-[0.3em] mt-4 text-agro-blue"
              >
                {products.length} peças disponíveis
              </motion.p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((produto, i) => (
                <ProductCard key={produto.id} produto={produto} index={i} />
              ))}
            </div>
          </div>

          <Hotbar />
          <DiscountPopup />
        </motion.div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="min-h-screen relative pb-32">
      <Suspense fallback={<div className="bg-agro-black min-h-screen" />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}