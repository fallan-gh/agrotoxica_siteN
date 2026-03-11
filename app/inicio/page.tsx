'use client';
import {
  useState, useEffect, useRef, Suspense, memo,
} from 'react';
import React from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
  useInView, useScroll,
} from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { products } from '../../data/products';
import Hotbar from '../../components/Hotbar';
import DiscountPopup from '../../components/DiscountPopup';
import IntroScreen from '../../components/IntroScreen';
import { CursorBlob, Marquee, Grid, Scanlines, Noise, Glitch } from '../../components/effects/SharedEffects';
import { useIsDark, isMobile, GPU_STYLE } from '../../lib/perf';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const E = [0.22, 1, 0.36, 1] as const;
const EB = [0.34, 1.56, 0.64, 1] as const;
const ES = [0.16, 1, 0.30, 1] as const;
const FEATURED = products[0];

// ─────────────────────────────────────────────────────────────────────────────
// MODEL VIEWER — React.createElement bypassa checagem de JSX.IntrinsicElements
// ─────────────────────────────────────────────────────────────────────────────
function ModelViewer(props: Record<string, unknown>) {
  return React.createElement('model-viewer', props);
}

// useIsDark is now imported from @/lib/perf

// ─────────────────────────────────────────────────────────────────────────────
// MOUSE PHYSICS
// ─────────────────────────────────────────────────────────────────────────────
function useMouse() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 42, damping: 22, mass: 1.4 });
  const y = useSpring(rawY, { stiffness: 42, damping: 22, mass: 1.4 });
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      rawX.set(e.clientX - window.innerWidth / 2);
      rawY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [rawX, rawY]);
  return { x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUSE TRAIL CANVAS — skipped on mobile (no hover cursor + perf)
// ─────────────────────────────────────────────────────────────────────────────
function MouseTrail({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isMobile()) return; // skip on mobile
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Dot = { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string };
    const pts: Dot[] = [];
    let lx = 0, ly = 0;

    const onMove = (e: MouseEvent) => {
      const spd = Math.sqrt((e.clientX - lx) ** 2 + (e.clientY - ly) ** 2);
      lx = e.clientX; ly = e.clientY;
      const n = Math.min(Math.floor(spd * .4), 3);
      for (let i = 0; i < n; i++) pts.push({
        x: e.clientX + (Math.random() - .5) * 8,
        y: e.clientY + (Math.random() - .5) * 8,
        vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
        r: 1.5 + Math.random() * 2.5, a: .5 + Math.random() * .3,
        c: i % 3 === 0 ? '176,142,104' : (isDark ? '255,255,255' : '0,91,236'),
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy; p.a -= .022; p.r *= .96;
        if (p.a <= 0) { pts.splice(i, 1); continue; }
        ctx.globalAlpha = p.a; ctx.fillStyle = `rgba(${p.c},1)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  if (typeof window !== 'undefined' && isMobile()) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLES — reduced pool on mobile, removed shadowBlur (major perf hit)
// ─────────────────────────────────────────────────────────────────────────────
function Particles({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const mobile = isMobile();
    if (mobile) return; // skip particles entirely on mobile
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = isDark
      ? ['176,142,104', '255,255,255', '0,91,236']
      : ['176,142,104', '0,91,236', '100,120,200'];

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string };
    const count = 50; // reduced from 100
    const pool: P[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .3, vy: -(Math.random() * .5 + .1),
      r: Math.random() * 2 + .4,
      a: Math.random() * (isDark ? .28 : .12) + .04,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pool) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.globalAlpha = p.a; ctx.fillStyle = `rgba(${p.c},1)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [isDark]);

  if (typeof window !== 'undefined' && isMobile()) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ opacity: .55 }} />;
}

// Grid and Marquee are now imported from SharedEffects

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT LETTER
// ─────────────────────────────────────────────────────────────────────────────
function SplitIn({ text, className = '', delay = 0, stagger = 0.045 }: {
  text: string; className?: string; delay?: number; stagger?: number;
}) {
  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {text.split('').map((c, i) => (
        <motion.span key={i} className="inline-block"
          initial={{ y: '120%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: .75, delay: delay + i * stagger, ease: ES }}
        >{c === ' ' ? '\u00A0' : c}</motion.span>
      ))}
    </span>
  );
}

// Glitch is already imported from SharedEffects

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT RINGS (mouse reactive)
// ─────────────────────────────────────────────────────────────────────────────
function OrbitRings({ mx, my, isDark }: { mx: any; my: any; isDark: boolean }) {
  const rings = [
    { s: 280, dur: 14, op: .18, dashed: false, f: .018 },
    { s: 480, dur: 24, op: .11, dashed: true, f: -.012 },
    { s: 680, dur: 38, op: .07, dashed: false, f: .008 },
    { s: 900, dur: 58, op: .04, dashed: true, f: -.005 },
  ];
  return (
    <>
      {rings.map((r, i) => {
        const rx = useTransform(mx, (v: number) => v * r.f);
        const ry = useTransform(my, (v: number) => v * r.f);
        return (
          <motion.div key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: r.s, height: r.s,
              top: '50%', left: '50%',
              marginTop: -r.s / 2, marginLeft: -r.s / 2,
              border: r.dashed
                ? `1px dashed rgba(176,142,104,${r.op})`
                : `1px solid ${isDark ? `rgba(255,255,255,${r.op})` : `rgba(0,91,236,${r.op})`}`,
              x: rx, y: ry,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.08, .96, 1], opacity: [0, 1, 1, 1], rotate: [0, 360] }}
            transition={{
              scale: { duration: 1.4, delay: .6 + i * .2, ease: EB },
              opacity: { duration: 1.4, delay: .6 + i * .2 },
              rotate: { duration: r.dur, repeat: Infinity, ease: 'linear', delay: i * .3 },
            }}
          />
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCAN SWEEP
// ─────────────────────────────────────────────────────────────────────────────
function ScanSweep() {
  return (
    <motion.div className="absolute left-0 w-full pointer-events-none z-20"
      style={{
        height: 140,
        background: 'linear-gradient(180deg,transparent,rgba(176,142,104,0.07) 40%,rgba(176,142,104,0.14) 50%,rgba(176,142,104,0.07) 60%,transparent)',
      }}
      initial={{ top: '-20%' }}
      animate={{ top: '110%' }}
      transition={{ duration: 2, delay: .3, ease: 'linear' }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT HERO — MODELO 3D DINÂMICO
// ─────────────────────────────────────────────────────────────────────────────
function ProductHero({ mx, my, isDark, currentProduct }: { mx: any; my: any; isDark: boolean; currentProduct: typeof products[0] }) {
  const px = useTransform(mx, (v: number) => v * .035);
  const py = useTransform(my, (v: number) => v * .035);
  const shadowFilter = useTransform(
    [mx, my] as any,
    ([vx, vy]: number[]) =>
      `drop-shadow(${-vx * .03}px ${-vy * .03}px 60px rgba(176,142,104,${isDark ? .45 : .25})) drop-shadow(0px 40px 80px rgba(0,0,0,${isDark ? .6 : .12}))`
  );

  const getFirstModel = (model3d: any) => {
    if (typeof model3d === 'string') return model3d;
    return Object.values(model3d)[0] as string;
  };

  const modelSrc = getFirstModel(currentProduct.model3d);

  return (
    <>
      {/* Carrega o model-viewer via CDN — sem npm, sem erro de tipo */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
      />

      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ x: px, y: py }}
      >
        <motion.div className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(176,142,104,0.22) 0%, rgba(0,91,236,0.1) 50%, transparent 72%)'
              : 'radial-gradient(circle, rgba(176,142,104,0.15) 0%, rgba(0,91,236,0.06) 50%, transparent 72%)',
            filter: 'blur(50px)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [.7, 1, .7] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          key={currentProduct.id}
          initial={{ scale: .5, opacity: 0, filter: 'blur(30px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: .5, opacity: 0, filter: 'blur(30px)' }}
          transition={{ duration: 1.4, ease: EB }}
          style={{ filter: shadowFilter, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          {/*
            ✅ ModelViewer usa React.createElement('model-viewer', props) internamente.
            NUNCA usar <model-viewer> direto no JSX — sempre <ModelViewer>.
          */}
          <ModelViewer
            src={modelSrc}
            alt={`Modelo 3D de ${currentProduct.nome}`}
            auto-rotate=""
            rotation-per-second="30deg"
            camera-controls="false"
            exposure="0.6"
            shadow-intensity="0"
            environment-image="neutral"
            style={{ width: '480px', height: '480px', pointerEvents: 'none' }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection({ isDark }: { isDark: boolean }) {
  const { x: mx, y: my } = useMouse();
  const bgX = useTransform(mx, (v: number) => v * .008);
  const bgY = useTransform(my, (v: number) => v * .008);
  const txtX = useTransform(mx, (v: number) => v * -.012);

  // ── produto rotativo
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  const currentProduct = products[currentIndex];

  // ── SCROLL-DRIVEN TRANSFORMS ──────────────────────────────────────────────
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Camada BG: zoom suave ao sair
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  // REMOVED BLUR EXTREMELY HEAVY ON SCROLL
  const bgBlurFilter = 'none';

  // Camada do texto esquerdo: sobe devagar (parallax lento)
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Camada do produto 3D: sobe rápido + rotaciona suavemente
  const productY = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const productRotX = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const productScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  // Camada dos orbit rings: escalam e somem
  const ringsScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const ringsOp = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Marquees: comprimem verticalmente
  const marqueeY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // Barra de progresso do scroll no fundo
  const progressW = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Top bar: sobe e some
  const topBarY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const topBarOp = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Bottom bar: desce e some
  const botBarY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const botBarOp = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // UI right panel
  const rightX = useTransform(scrollYProgress, [0, 0.4], [0, 80]);
  const rightOp = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={heroRef} className="relative w-full h-[200vh]">
      {/* Sticky inner container — stays pinned for the full 200vh scroll */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-agro-bg transition-colors duration-500">

        {/* ── Background layer (zooms on scroll) ── */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: bgScale, filter: bgBlurFilter }}>
          <Grid />
        </motion.div>

        <Scanlines />
        <MouseTrail isDark={isDark} />

        {/* Scanline texture */}
        <motion.div className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backgroundImage: isDark
              ? 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.008) 2px,rgba(255,255,255,0.008) 4px)'
              : 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.012) 2px,rgba(0,0,0,0.012) 4px)',
          }}
          animate={{ backgroundPositionY: ['0px', '4px'] }}
          transition={{ duration: .14, repeat: Infinity, ease: 'linear' }}
        />

        {/* Noise */}
        <div className="absolute inset-0 pointer-events-none z-[2] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
            opacity: .5,
          }}
        />

        {/* Typographic backdrop (parallax on scroll) */}
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[3]"
          style={{ x: bgX, y: bgY, opacity: .04, scale: bgScale }}
        >
          <Glitch text="AGROTÓXICA"
            className="font-space font-black text-[12vw] md:text-[18vw] uppercase tracking-[-0.03em] text-agro-blue leading-none"
          />
        </motion.div>

        {/* Rings (scale up + fade on scroll) */}
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[4]"
          style={{ scale: ringsScale, opacity: ringsOp }}
        >
          <OrbitRings mx={mx} my={my} isDark={isDark} />
        </motion.div>

        {/* Product (rises + tilts on scroll = 3D departure) */}
        <motion.div className="absolute inset-0 z-[5]"
          style={{
            y: productY,
            scale: productScale,
            rotateX: productRotX,
            perspective: 1000,
            transformOrigin: 'center bottom',
          }}
        >
          <ProductHero mx={mx} my={my} isDark={isDark} currentProduct={currentProduct} />
        </motion.div>

        {/* Marquees (slide up on scroll) */}
        <motion.div className="absolute top-[10%] w-full z-[6] flex flex-col gap-3 pointer-events-none"
          style={{ y: marqueeY }}
        >
          <Marquee isDark={isDark} text="AGROTÓXICA  ·  SAFRA 26  ·  TRAIA DE RESPEITO  ·  SISTEMA BRUTO  ·  O VENENO DA ROÇA" dir={1} speed={55} op={.08} />
          <Marquee isDark={isDark} text="LIDA BRUTA  ·  MARCHA NO MAQUINÁRIO  ·  BOTA SUJA DE TERRA  ·  LOTE RESTRITO  ·  SEM MASSAGEM" dir={-1} speed={42} op={.05} size="text-xs" />
        </motion.div>
        <motion.div className="absolute bottom-[12%] w-full z-[6] flex flex-col gap-3 pointer-events-none"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]) }}
        >
          <Marquee isDark={isDark} text="SÓ PRA QUEM GUENTA  ·  EDIÇÃO TÓXICA  ·  AGROTÓXICA  ·  LOTE 26  ·  CRIADO NO MATO" dir={-1} speed={48} op={.07} />
          <Marquee isDark={isDark} text="POEIRA E PINGA  ·  MARCHA NO TRATOR  ·  CULTURA CAIPIRA  ·  AGRO É MATO  ·  SEM MASSAGEM" dir={1} speed={60} op={.04} size="text-xs" />
        </motion.div>

        {/* ── UI ── */}
        <div className="relative z-[20] w-full h-full flex flex-col justify-between px-6 md:px-12 py-10 pointer-events-none select-none">

          {/* Top — slides up and fades on scroll */}
          <motion.div className="flex items-start justify-between"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: .8, ease: E }}
            style={{ y: topBarY, opacity: topBarOp }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: .7, delay: .9, ease: EB }}
                className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(176,142,104,0.15)', border: '1px solid rgba(176,142,104,0.3)' }}
              >
                <img src="/assets/logo/logoprincipal.png" alt="Logo" className="w-8 h-8 object-contain"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(176,142,104,0.6))' }} />
              </motion.div>
              <div>
                <motion.p className="font-space font-black text-xs uppercase tracking-[0.2em] text-agro-blue"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: .5 }}
                >Agrotóxica</motion.p>
                <motion.p className="font-poppins text-[9px] uppercase tracking-[0.3em] text-agro-gold"
                  style={{ opacity: .7 }}
                  initial={{ opacity: 0 }} animate={{ opacity: .7 }}
                  transition={{ delay: 1.1, duration: .5 }}
                >Águia voa com águia</motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: .6, delay: 1.2, ease: EB }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(176,142,104,0.1)', border: '1px solid rgba(176,142,104,0.25)' }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-agro-gold"
                animate={{ scale: [1, 1.6, 1], opacity: [1, .4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="font-space font-bold text-[10px] uppercase tracking-widest text-agro-gold">
                Pré-venda ativa
              </span>
            </motion.div>
          </motion.div>

          {/* Center left — parallax text */}
          <motion.div
            className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 max-w-xs md:max-w-md pointer-events-auto"
            style={{ y: textY, opacity: textOpacity }}
          >
            <motion.div className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: .7, delay: .7, ease: E }}
            >
              <motion.div className="h-[1px] w-8 bg-agro-gold"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: .6, delay: .9 }}
              />
              <span className="font-poppins font-bold text-xs uppercase tracking-[0.35em] text-agro-gold">Coleção 2026</span>
            </motion.div>

            <h1 className="font-space font-black leading-[0.9] mb-6" style={{ perspective: 800 }}>
              <div className="text-[4rem] md:text-[5.5rem] uppercase tracking-tighter text-agro-blue">
                <SplitIn text="AGRO" delay={.9} stagger={.06} />
              </div>
              <div className="text-[4rem] md:text-[5.5rem] uppercase tracking-tighter text-agro-gold">
                <SplitIn text="TÓXICA" delay={1.15} stagger={.06} />
              </div>
            </h1>

            <motion.p className="font-poppins text-sm text-agro-blue/60 leading-relaxed mb-8 max-w-xs"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: .8, ease: E }}
            >
              Vestuário de alta performance para quem domina o campo e dita o estilo.
            </motion.p>

            <motion.div className="flex gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: .7, ease: E }}
            >
              <Link href="/?skipIntro=true">
                <motion.button
                  className="relative px-7 py-3.5 rounded-2xl font-space font-bold text-sm uppercase tracking-widest overflow-hidden group bg-agro-gold"
                  style={{ color: 'var(--color-bg)' }}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 30px 8px rgba(176,142,104,0.3)' }}
                  whileTap={{ scale: .95 }}
                >
                  <motion.div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Explorar Coleção</span>
                </motion.button>
              </Link>
              <Link href={`/produto/${FEATURED.id}`}>
                <motion.button
                  className="px-7 py-3.5 rounded-2xl font-space font-bold text-sm uppercase tracking-widest text-agro-blue/60 hover:text-agro-blue transition-colors duration-300 border border-agro-blue/15 hover:border-agro-gold/40"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: .95 }}
                >
                  Ver Peça
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right vertical — slides out on scroll */}
          <motion.div
            className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-end gap-4"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8, delay: 1.5, ease: E }}
            style={{ x: rightX, opacity: rightOp }}
          >
            <div className="w-[1px] h-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(176,142,104,0.5), transparent)' }} />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentProduct.id + '-nome'}
                className="font-space font-black text-xs uppercase tracking-[0.4em] text-agro-blue/30 [writing-mode:vertical-rl] rotate-180"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: .5 }}
              >{currentProduct.nome}</motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentProduct.id + '-price'}
                className="font-poppins text-[9px] uppercase tracking-[0.3em] text-agro-gold/60 [writing-mode:vertical-rl] rotate-180"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: .5 }}
              >{(currentProduct as any).price}</motion.p>
            </AnimatePresence>
            <div className="w-[1px] h-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(176,142,104,0.5), transparent)' }} />
          </motion.div>

          {/* Bottom — slides down and fades on scroll */}
          <motion.div className="flex items-end justify-between"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: 2.0, ease: E }}
            style={{ y: botBarY, opacity: botBarOp }}
          >
            <div className="flex items-center gap-6">
              {[
                { label: 'Peças', value: products.length.toString() },
                { label: 'Coleção', value: '2026' },
                { label: 'Status', value: 'Pré-Venda' },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.1 + i * .1, duration: .5 }}
                >
                  <p className="font-space font-black text-xl text-agro-blue">{s.value}</p>
                  <p className="font-poppins text-[9px] uppercase tracking-[0.25em] text-agro-blue/30">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <motion.div className="flex flex-col items-center gap-2"
              animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="font-poppins text-[9px] uppercase tracking-[0.3em] text-agro-blue/25">Scroll</p>
              <div className="w-[1px] h-8" style={{ background: 'linear-gradient(to bottom, rgba(176,142,104,0.6), transparent)' }} />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Scroll progress bar ── */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-agro-gold z-[30]"
          style={{ width: progressW }}
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANIFESTO (CINEMATIC SCROLL)
// ─────────────────────────────────────────────────────────────────────────────
const WORDS = [
  { w: 'Lida.', gold: false },
  { w: 'Poeira.', gold: false },
  { w: 'Veneno.', gold: true },
  { w: 'Raiz.', gold: false },
  { w: 'Sistemático.', gold: false },
  { w: 'Agrotóxica.', gold: true },
];

function ManifestoWord({ word, gold, index }: { word: string; gold: boolean; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  // Each word slides in from a different X offset for a stagger wave
  const xDir = index % 2 === 0 ? -60 : 60;
  return (
    <span ref={ref} className="inline-block overflow-hidden mr-6 md:mr-10">
      <motion.span
        className={`inline-block font-space font-black text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-none ${gold ? 'text-agro-gold' : 'text-agro-blue'}`}
        initial={{ y: '120%', x: xDir, opacity: 0, scale: 0.8 }}
        animate={inView ? { y: '0%', x: 0, opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.1, delay: index * .12, ease: ES }}
      >{word}</motion.span>
    </span>
  );
}

function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-15%' });

  // Scroll-driven parallax for the background text
  const { scrollYProgress: mProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgTextX = useTransform(mProgress, [0, 1], ['10%', '-10%']);
  const bgTextScale = useTransform(mProgress, [0, 0.5, 1], [0.9, 1, 1.05]);
  const decorLineW = useTransform(mProgress, [0.1, 0.5], ['0%', '60%']);

  return (
    <section ref={sectionRef} className="relative w-full py-40 overflow-hidden bg-agro-bg transition-colors duration-500">

      {/* Scroll-driven background text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ x: bgTextX, scale: bgTextScale, opacity: 0 }}
        animate={inView ? { opacity: .04 } : {}}
        transition={{ duration: 2.5 }}
      >
        <span className="font-space font-black text-[20vw] uppercase text-agro-blue leading-none whitespace-nowrap">MANIFESTO</span>
      </motion.div>

      {/* Animated separator — top */}
      <motion.div className="w-full h-[1px] mb-16"
        style={{ background: 'linear-gradient(to right, transparent, rgba(176,142,104,0.4), transparent)' }}
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.8, ease: E }}
      />

      {/* Floating decorative crosses */}
      {[{ top: '15%', left: '8%' }, { top: '70%', right: '6%' }, { bottom: '20%', left: '85%' }].map((pos, i) => (
        <motion.svg key={i} width="20" height="20" viewBox="0 0 28 28"
          className="absolute text-agro-gold pointer-events-none"
          style={{ ...pos, opacity: 0 }}
          animate={inView ? { opacity: [0, 0.3, 0.15], rotate: [0, 90] } : {}}
          transition={{ duration: 6, delay: i * .5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <line x1="14" y1="0" x2="14" y2="28" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="1" />
        </motion.svg>
      ))}

      <div className="container mx-auto px-6 md:px-12">
        {/* Label with animated dash */}
        <motion.div className="flex items-center gap-4 mb-10"
          initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: .8, delay: .15, ease: E }}
        >
          <motion.div className="h-[1px] bg-agro-gold"
            initial={{ width: 0 }} animate={inView ? { width: 40 } : {}}
            transition={{ duration: .8, delay: .3 }}
          />
          <span className="font-poppins text-xs uppercase tracking-[0.4em] text-agro-gold/50">Manifesto da Marca</span>
        </motion.div>

        {/* Words with perspective */}
        <div className="flex flex-wrap" style={{ perspective: 1000 }}>
          {WORDS.map((w, i) => <ManifestoWord key={i} word={w.w} gold={w.gold} index={i} />)}
        </div>

        {/* Decorative scroll-driven line */}
        <motion.div
          className="h-[2px] bg-agro-gold/30 mt-10 rounded-full"
          style={{ width: decorLineW }}
        />

        {/* Paragraph — cinematic fade in from below with glow */}
        <motion.p className="mt-12 max-w-lg font-poppins text-base text-agro-blue/50 leading-relaxed"
          initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.2, delay: .9, ease: E }}
        >
          Nascida na fronteira entre a lavoura e a cultura urbana, a Agrotóxica é o brasão
          de quem produz o Brasil com a mesma intensidade com que vive e se veste.
        </motion.p>
      </div>

      {/* Animated separator — bottom */}
      <motion.div className="w-full h-[1px] mt-16"
        style={{ background: 'linear-gradient(to right, transparent, rgba(176,142,104,0.2), transparent)' }}
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.8, delay: .6 }}
      />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTION (CINEMATIC GRID)
// ─────────────────────────────────────────────────────────────────────────────
function CollectionCard({ produto, index, isDark }: { produto: typeof products[0]; index: number; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  // Alternate reveal direction: odd from left, even from right
  const fromX = index % 2 === 0 ? -40 : 40;
  const fromRotY = index % 2 === 0 ? -8 : 8;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 50, x: fromX, scale: .88, rotateY: fromRotY, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, x: 0, scale: 1, rotateY: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: .9, delay: index * .08, ease: E }}
      style={{ perspective: 800 }}
    >
      <Link href={`/produto/${produto.id}`}>
        <motion.div
          whileHover={{ y: -14, scale: 1.04, rotateX: 2 }} whileTap={{ scale: .96 }}
          transition={{ duration: .35, ease: E }}
          className="group relative cursor-pointer"
        >
          <div
            className="rounded-3xl p-5 aspect-[4/5] flex flex-col justify-between border-2 border-transparent group-hover:border-agro-gold/50 overflow-hidden relative transition-all duration-500"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              backdropFilter: 'blur(16px) saturate(140%)',
              WebkitBackdropFilter: 'blur(16px) saturate(140%)',
              boxShadow: isDark
                ? '0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.04) inset'
                : '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
            }}
          >
            {/* Shine sweep on hover */}
            <motion.div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(115deg,transparent 20%,rgba(176,142,104,0.08) 45%,rgba(176,142,104,0.12) 50%,rgba(176,142,104,0.08) 55%,transparent 80%)', backgroundSize: '250% 100%' }}
              animate={{ backgroundPositionX: ['250%', '-250%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Index badge */}
            <span className="absolute top-4 right-4 font-space font-bold text-[10px] tracking-widest text-agro-blue/15 group-hover:text-agro-gold/50 transition-all duration-300">
              {String(index + 1).padStart(2, '0')}
            </span>
            {/* Image container */}
            <div className="w-full h-[65%] rounded-2xl flex items-center justify-center overflow-hidden relative mt-4">
              <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 60%, rgba(176,142,104,0.18) 0%, transparent 65%)' }}
              />
              <motion.img src={produto.image} alt={produto.nome}
                className="w-full h-full object-contain p-3"
                whileHover={{ scale: 1.12 }}
                transition={{ duration: .6, ease: E }}
              />
            </div>
            {/* Info */}
            <div className="mt-3">
              <h4 className="font-space font-bold text-2xl uppercase leading-none text-agro-blue group-hover:text-agro-blue transition-colors">{produto.nome}</h4>
              <div className="flex items-center justify-between mt-2">
                <motion.p className="text-agro-gold font-bold text-sm font-poppins"
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                >{produto.price}</motion.p>
                <span className="text-[10px] font-poppins font-bold uppercase tracking-widest text-agro-blue/0 group-hover:text-agro-gold -translate-x-3 group-hover:translate-x-0 transition-all duration-400">Ver →</span>
              </div>
            </div>
            {/* Bottom gold line */}
            <motion.div className="absolute bottom-0 left-0 h-[2px] bg-agro-gold rounded-full"
              initial={{ width: '0%' }} whileHover={{ width: '100%' }}
              transition={{ duration: .4, ease: E }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function CollectionSection({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const { scrollYProgress: cProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgX = useTransform(cProgress, [0, 1], ['5%', '-5%']);

  return (
    <section ref={ref} className="relative w-full py-28 overflow-hidden bg-agro-bg transition-colors duration-500">
      {/* Scroll-driven background text */}
      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ x: bgX, opacity: 0 }}
        animate={inView ? { opacity: .03 } : {}}
        transition={{ duration: 2 }}
      >
        <span className="font-space font-black text-[16vw] uppercase text-agro-blue leading-none whitespace-nowrap">COLEÇÃO</span>
      </motion.div>

      <div className="container mx-auto px-6 md:px-12 mb-14">
        <div className="flex items-end justify-between">
          <div>
            <motion.div className="flex items-center gap-4 mb-3"
              initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: .6, delay: .1 }}
            >
              <motion.div className="h-[1px] bg-agro-gold"
                initial={{ width: 0 }} animate={inView ? { width: 32 } : {}}
                transition={{ duration: .6, delay: .2 }}
              />
              <span className="font-poppins text-xs uppercase tracking-[0.4em] text-agro-gold/50">A Coleção</span>
            </motion.div>
            <h2 className="font-space font-black text-5xl md:text-7xl uppercase tracking-tighter leading-none" style={{ perspective: 600 }}>
              <span className="overflow-hidden inline-block">
                <motion.span className="inline-block text-agro-blue"
                  initial={{ y: '110%', rotateX: -60, filter: 'blur(6px)' }}
                  animate={inView ? { y: '0%', rotateX: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: .9, delay: .2, ease: ES }}
                >TODAS AS</motion.span>
              </span>{' '}
              <span className="overflow-hidden inline-block">
                <motion.span className="inline-block text-agro-gold"
                  initial={{ y: '110%', rotateX: -60, filter: 'blur(6px)' }}
                  animate={inView ? { y: '0%', rotateX: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: .9, delay: .35, ease: ES }}
                >PEÇAS</motion.span>
              </span>
            </h2>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: .6, delay: .4 }}>
            <Link href="/?skipIntro=true">
              <motion.button
                className="px-6 py-3 rounded-2xl font-space font-bold text-xs uppercase tracking-widest text-agro-blue/50 hover:text-agro-blue border border-agro-blue/10 hover:border-agro-gold/40 transition-all"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
              >Ver Vitrine →</motion.button>
            </Link>
          </motion.div>
        </div>
        <motion.div className="h-[1px] mt-6 rounded-full"
          style={{ background: 'linear-gradient(to right, rgba(176,142,104,0.5), rgba(0,91,236,0.3), transparent)', width: '50%' }}
          initial={{ scaleX: 0, originX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: .5, ease: E }}
        />
      </div>
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p, i) => <CollectionCard key={p.id} produto={p} index={i} isDark={isDark} />)}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS BAR (CINEMATIC)
// ─────────────────────────────────────────────────────────────────────────────
function StatsBar({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const { scrollYProgress: sProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const marqueeShift = useTransform(sProgress, [0, 1], [30, -30]);

  const stats = [
    { v: `${products.length}`, l: 'Peças na Coleção', icon: '◆' },
    { v: '2026', l: 'Temporada', icon: '◈' },
    { v: '100%', l: 'Exclusivo', icon: '◇' },
    { v: 'PRÉ', l: 'Venda Ativa', icon: '●' },
  ];
  return (
    <section ref={ref} className="relative w-full py-24 overflow-hidden transition-colors duration-500"
      style={{
        background: isDark ? 'rgba(176,142,104,0.06)' : 'rgba(176,142,104,0.08)',
        borderTop: '1px solid rgba(176,142,104,0.12)',
        borderBottom: '1px solid rgba(176,142,104,0.12)',
      }}
    >
      {/* Decorative corner crosses */}
      {[{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }].map((pos, i) => (
        <motion.span key={i} className="absolute text-agro-gold/20 font-space text-lg pointer-events-none select-none"
          style={pos}
          animate={inView ? { opacity: [0, 0.3, 0.15] } : {}}
          transition={{ duration: 4, delay: i * .2, repeat: Infinity, repeatType: 'reverse' }}
        >+</motion.span>
      ))}

      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.l} className="flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 40, rotateX: -30, scale: .85, filter: 'blur(4px)' }}
              animate={inView ? { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' } : {}}
              transition={{ duration: .9, delay: i * .15, ease: EB }}
              style={{ perspective: 600 }}
            >
              <motion.span className="text-agro-gold/30 text-xs mb-1"
                animate={inView ? { opacity: [0.2, 0.5, 0.2] } : {}}
                transition={{ duration: 3, delay: i * .4, repeat: Infinity }}
              >{s.icon}</motion.span>
              <motion.p className="font-space font-black text-5xl md:text-6xl text-agro-gold leading-none"
                animate={{ textShadow: ['0 0 0px rgba(176,142,104,0)', '0 0 25px rgba(176,142,104,0.6)', '0 0 0px rgba(176,142,104,0)'] }}
                transition={{ duration: 3, delay: i * .3, repeat: Infinity }}
              >{s.v}</motion.p>
              <p className="font-poppins text-[10px] uppercase tracking-[0.3em] text-agro-blue/30">{s.l}</p>
              <motion.div className="h-[1px] w-8 bg-agro-gold/20 mt-1"
                initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: .6, delay: .5 + i * .1 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
      {/* Scroll-driven marquee */}
      <motion.div className="mt-14" style={{ x: marqueeShift }}>
        <Marquee isDark={isDark} text="AGROTÓXICA  ·  MOAGEM  ·  TRAIADO  ·  MODÃO  ·  CHIQUE NO ÚRTIMO  ·  TCHAU BRIGADO  ·  ESTILO CAIPIRA" dir={1} speed={50} op={.1} />
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER CTA (CINEMATIC)
// ─────────────────────────────────────────────────────────────────────────────
function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const { scrollYProgress: fProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgTextX = useTransform(fProgress, [0, 1], ['8%', '-8%']);
  const bgTextScale = useTransform(fProgress, [0, 0.5, 1], [0.9, 1, 1.08]);

  return (
    <section ref={ref} className="relative w-full py-40 overflow-hidden flex items-center justify-center bg-agro-bg transition-colors duration-500">

      {/* Scroll-driven background text */}
      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ x: bgTextX, scale: bgTextScale, opacity: 0 }}
        animate={inView ? { opacity: .04 } : {}}
        transition={{ duration: 2.5 }}
      >
        <span className="font-space font-black text-[18vw] uppercase text-agro-blue leading-none whitespace-nowrap">TERRITÓRIO</span>
      </motion.div>

      {/* Double rotating rings */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 500, height: 500, border: '1px solid rgba(176,142,104,0.08)' }}
        animate={{ rotate: [0, 360], scale: [.95, 1.05, .95] }}
        transition={{ rotate: { duration: 30, repeat: Infinity, ease: 'linear' }, scale: { duration: 8, repeat: Infinity } }}
      />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 350, height: 350, border: '1px dashed rgba(176,142,104,0.1)' }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-8">
        {/* Label */}
        <motion.div className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .8, delay: .2 }}
        >
          <motion.div className="h-[1px] bg-agro-gold"
            initial={{ width: 0 }} animate={inView ? { width: 32 } : {}}
            transition={{ duration: .6, delay: .3 }}
          />
          <span className="font-poppins text-xs uppercase tracking-[0.4em] text-agro-gold/50">Entre no Território</span>
          <motion.div className="h-[1px] bg-agro-gold"
            initial={{ width: 0 }} animate={inView ? { width: 32 } : {}}
            transition={{ duration: .6, delay: .4 }}
          />
        </motion.div>

        {/* Cinematic heading */}
        <div style={{ perspective: 1000 }}>
          <motion.h2 className="font-space font-black text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-none text-agro-blue"
            initial={{ y: '100%', opacity: 0, rotateX: -60, filter: 'blur(10px)' }}
            animate={inView ? { y: '0%', opacity: 1, rotateX: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.2, delay: .3, ease: ES }}
          >
            Vista o campo.<br />
            <span className="text-agro-gold">Domine o jogo.</span>
          </motion.h2>
        </div>

        <motion.div initial={{ opacity: 0, scale: .7, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, delay: .9, ease: EB }}
        >
          <Link href="/?skipIntro=true">
            <motion.button
              className="relative px-12 py-5 rounded-2xl font-space font-bold text-lg uppercase tracking-widest overflow-hidden group bg-agro-gold"
              style={{ color: 'var(--color-bg)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px 15px rgba(176,142,104,0.3)' }}
              whileTap={{ scale: .95 }}
              animate={{ boxShadow: ['0 0 0px rgba(176,142,104,0)', '0 0 30px 8px rgba(176,142,104,0.2)', '0 0 0px rgba(176,142,104,0)'] }}
              transition={{ boxShadow: { duration: 2.5, repeat: Infinity } }}
            >
              <motion.div className="absolute inset-0 bg-white/15 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 skew-x-12" />
              <span className="relative z-10">Explorar Coleção →</span>
            </motion.button>
          </Link>
        </motion.div>

        <motion.p className="font-poppins text-[10px] uppercase tracking-[0.35em] text-agro-blue/20"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 1 }}
        >Agrotóxica © 2026 · Todos os direitos reservados</motion.p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME CONTENT
// ─────────────────────────────────────────────────────────────────────────────
function HomeContent() {
  const searchParams = useSearchParams();
  const skipIntroParam = searchParams.get('skipIntro') === 'true';
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const isDark = useIsDark();

  useEffect(() => {
    const jaViu = localStorage.getItem('agro-intro-seen') === 'true';
    setShowIntro(!jaViu && !skipIntroParam);
  }, [skipIntroParam]);

  const handleIntroComplete = () => {
    localStorage.setItem('agro-intro-seen', 'true');
    setShowIntro(false);
  };

  if (showIntro === null) return <div className="min-h-screen bg-agro-bg" />;

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && <IntroScreen key="intro" onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {!showIntro && (
        <motion.main
          className="min-h-screen bg-agro-bg transition-colors duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: .8 }}
        >
          <HeroSection isDark={isDark} />
          <ManifestoSection />
          <CollectionSection isDark={isDark} />
          <StatsBar isDark={isDark} />
          <FooterCTA />
          <Hotbar />
          <DiscountPopup />
        </motion.main>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-agro-bg" />}>
      <HomeContent />
    </Suspense>
  );
}