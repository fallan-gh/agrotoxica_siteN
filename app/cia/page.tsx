'use client';
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  motion,
  useMotionValue, useSpring,
  useInView,
} from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '../../data/products';

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 MOTOR DE CORES CORRIGIDO
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = {
  dark: {
    bg: '#14100B',
    bgMid: '#1C1610',
    text: '#FFF8D6',
    accent: '#D4AF37',
    accentDark: '#996515',
    black: '#0A0908',
    fireGlow: '#D87A21',
    blue: '#002E79',
    green: '#5CBA47',
    greenHover: '#469634',
    greenShadow: 'rgba(92, 186, 71, 0.4)',
    greenBorder: '#75D45C',
    btnText: '#FFF',

    glow1: 'rgba(216, 122, 33, 0.08)',
    glow2: 'rgba(212, 175, 55, 0.03)',
    vhGrad1: 'rgba(216, 122, 33, 0.15)',
    vhGrad2: 'rgba(20, 16, 11, 0.6)',
    vhGrad3: 'rgba(20, 16, 11, 1)',
    vhRadial: 'rgba(10,9,8,0.9)',
    cardBg: 'rgba(212, 175, 55, 0.03)',
    cardBgHover: 'rgba(212, 175, 55, 0.08)',
    cardBorder: 'rgba(212, 175, 55, 0.2)',
    cardBorderHover: 'rgba(212, 175, 55, 0.6)',
    cardShadow: 'rgba(212, 175, 55, 0.15)',
    cardInfoBg: 'rgba(0,0,0,0.4)',
    vidFilter: 'brightness(0.3) saturate(0.8)',
  },
  light: {
    bg: '#F3EFE6',
    bgMid: '#E8E1D5',
    text: '#0F141E',
    accent: '#B88A44',
    accentDark: '#8B6530',
    black: '#FFFFFF',
    fireGlow: '#FFFFFF',
    blue: '#001A4D',
    green: '#1A4010',
    greenHover: '#122E0B',
    greenShadow: 'rgba(26, 64, 16, 0.3)',
    greenBorder: '#235716',
    btnText: '#FFF',

    glow1: 'rgba(255, 255, 255, 0.5)',
    glow2: 'rgba(184, 138, 68, 0.1)',
    vhGrad1: 'rgba(255, 255, 255, 0.5)',
    vhGrad2: 'rgba(243, 239, 230, 0.8)',
    vhGrad3: 'rgba(243, 239, 230, 1)',
    vhRadial: 'rgba(243, 239, 230, 0.85)',
    cardBg: 'rgba(255, 255, 255, 0.6)',
    cardBgHover: 'rgba(255, 255, 255, 1)',
    cardBorder: 'rgba(184, 138, 68, 0.3)',
    cardBorderHover: 'rgba(184, 138, 68, 0.8)',
    cardShadow: 'rgba(184, 138, 68, 0.15)',
    cardInfoBg: 'rgba(255,255,255,0.8)',
    vidFilter: 'brightness(0.9) saturate(1.1) sepia(0.2)',
  }
};

const ThemeContext = createContext(PALETTES.dark);
const useTheme = () => useContext(ThemeContext);

const E = [0.22, 1, 0.36, 1] as const;
const EB = [0.34, 1.56, 0.64, 1] as const;
const ES = [0.16, 1, 0.30, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// FIRE EMBERS
// ─────────────────────────────────────────────────────────────────────────────
function FireEmbers() {
  const C = useTheme();
  const [embers, setEmbers] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return; // skip on mobile for perf
    const newEmbers = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setEmbers(newEmbers);
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden mix-blend-screen">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: ember.left,
            width: ember.size,
            height: ember.size,
            background: `radial-gradient(circle, #FFF 0%, ${C.fireGlow} 40%, transparent 100%)`,
            boxShadow: `0 0 ${ember.size * 2}px ${C.fireGlow}`,
            opacity: ember.opacity,
            willChange: 'transform, opacity',
          }}
          initial={{ y: '100vh', x: 0 }}
          animate={{
            y: '-10vh',
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            opacity: [0, ember.opacity, ember.opacity, 0]
          }}
          transition={{
            y: { duration: ember.duration, repeat: Infinity, ease: 'linear', delay: ember.delay },
            x: { duration: ember.duration, repeat: Infinity, ease: 'easeInOut', delay: ember.delay },
            opacity: { duration: ember.duration, repeat: Infinity, ease: 'easeInOut', delay: ember.delay }
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────
function CursorGlow() {
  const C = useTheme();
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const fn = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, [mx, my]);

  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

  return (
    <motion.div className="fixed pointer-events-none z-[1]" style={{
      left: sx, top: sy,
      width: 500, height: 500,
      marginLeft: -250, marginTop: -250,
      background: `radial-gradient(circle, ${C.glow1} 0%, ${C.glow2} 45%, transparent 70%)`,
      borderRadius: '50%',
      // REMOVED VERY EXPENSIVE BLUR: filter: 'blur(60px)',
      transition: 'background 0.5s ease',
      willChange: 'transform',
      transform: 'translateZ(0)',
    }} />
  );
}

import { Noise } from '@/components/effects/SharedEffects';

function Marquee({ text, dir = 1, speed = 50, op = 0.15, small = false }: { text: string; dir?: number; speed?: number; op?: number; small?: boolean; }) {
  const C = useTheme();
  const rep = Array(10).fill(text).join('  ✦  ');
  return (
    <div className="overflow-hidden w-full">
      <div
        className={`whitespace-nowrap font-cinzel uppercase tracking-[0.28em] ${small ? 'text-[9px]' : 'text-[11px]'}`}
        style={{ opacity: op, color: C.accent, display: 'inline-block', animation: `marquee-${dir > 0 ? 'ltr' : 'rtl'} ${speed}s linear infinite`, transition: 'color 0.5s ease' }}
      >
        {rep}
      </div>
    </div>
  );
}

function Divider({ delay = 0 }: { delay?: number }) {
  const C = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  return (
    <div ref={ref} className="flex items-center gap-4 w-full my-3">
      <motion.div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.accent})` }} initial={{ scaleX: 0, originX: '0%' }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 1.2, delay, ease: E }} />
      <span className="font-cinzel text-[10px]" style={{ color: C.accent, transition: 'color 0.5s ease' }}>✦</span>
      <motion.div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C.accent})` }} initial={{ scaleX: 0, originX: '100%' }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 1.2, delay, ease: E }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTOES
// ─────────────────────────────────────────────────────────────────────────────
function CiaGreenButton({ children, href, onClick }: { children: React.ReactNode; href?: string; onClick?: () => void; }) {
  const C = useTheme();
  const [hover, setHover] = useState(false);
  const inner = (
    <motion.div
      role="button"
      className="relative inline-block px-12 py-4 font-cinzel font-black text-xs md:text-sm uppercase tracking-[0.2em] overflow-hidden text-center cursor-pointer rounded-xl"
      style={{
        background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenHover} 100%)`,
        color: C.btnText,
        boxShadow: `0 0 30px ${C.greenShadow}, inset 0 2px 0 rgba(255,255,255,0.3)`,
        border: `1px solid ${C.greenBorder}`,
        transition: 'all 0.5s ease'
      }}
      whileHover={{ scale: 1.05, boxShadow: `0 0 50px ${C.green}, inset 0 2px 0 rgba(255,255,255,0.4)` }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={onClick}
    >
      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', transform: hover ? 'translateX(100%) skewX(-15deg)' : 'translateX(-150%) skewX(-15deg)', transition: 'transform 0.5s ease', pointerEvents: 'none' }} />
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
  if (href) return <Link href={href} className="inline-block">{inner}</Link>;
  return inner;
}

function GoldButton({ children, href, onClick }: { children: React.ReactNode; href?: string; onClick?: () => void; }) {
  const C = useTheme();
  const [hover, setHover] = useState(false);
  const inner = (
    <motion.div
      role="button"
      className="relative inline-block px-10 py-4 font-cinzel text-xs uppercase tracking-[0.4em] overflow-hidden text-center cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`, color: '#FFF', boxShadow: `0 4px 20px ${C.cardShadow}`, transition: 'all 0.5s ease' }}
      whileHover={{ scale: 1.04, boxShadow: `0 0 40px 12px ${C.cardShadow}` }}
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={onClick}
    >
      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: hover ? 'translateX(100%) skewX(-15deg)' : 'translateX(-150%) skewX(-15deg)', transition: 'transform 0.6s ease', pointerEvents: 'none' }} />
      <span className="relative z-10 font-bold">{children}</span>
    </motion.div>
  );
  if (href) return <Link href={href} className="inline-block">{inner}</Link>;
  return inner;
}

function ManifestoWordCIA({ word, accent, index }: { word: string; accent: boolean; index: number }) {
  const C = useTheme();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  return (
    <span ref={ref} className="inline-block overflow-hidden mr-8 md:mr-14 mb-3">
      {/* 🚀 BUG CORRIGIDO: Removido o WebkitBackgroundClip daqui também */}
      <motion.span
        className="inline-block font-cinzel font-black text-4xl md:text-6xl lg:text-[5rem] uppercase leading-tight"
        style={{
          color: accent ? C.accent : C.text,
          textShadow: accent ? `0 0 20px ${C.cardShadow}` : '0 0 20px rgba(0,0,0,0.1)',
          transition: 'color 0.5s ease'
        }}
        initial={{ y: '115%', opacity: 0, filter: 'blur(8px)' }}
        animate={inView ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.9, delay: index * 0.13, ease: ES }}
      >
        {word}
      </motion.span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSÕES PRINCIPAIS
// ─────────────────────────────────────────────────────────────────────────────
function VideoHero() {
  const C = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => { });
    const onReady = () => setLoaded(true);
    v.addEventListener('canplay', onReady);
    return () => v.removeEventListener('canplay', onReady);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg, transition: 'background 0.5s ease' }}>
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: 2.5 }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" src="/assets/videos/APRESENTACAO_GERAL.mp4" muted loop playsInline style={{ filter: C.vidFilter, transition: 'filter 0.5s ease' }} />
      </motion.div>

      <div className="absolute inset-0 z-[1]" style={{ background: `linear-gradient(180deg, ${C.vhGrad1} 0%, ${C.vhGrad2} 50%, ${C.vhGrad3} 100%)`, transition: 'background 0.5s ease' }} />
      <div className="absolute inset-0 z-[1]" style={{ background: `radial-gradient(ellipse at center, transparent 20%, ${C.vhRadial} 100%)`, transition: 'background 0.5s ease' }} />

      <div className="absolute top-8 w-full z-[5]">
        <Marquee text="AGROTÓXICA  ·  CIA  ·  EDIÇÃO EXCLUSIVA  ·  EVENTO OFICIAL  ·  ATLÉTICA" dir={1} speed={38} op={0.2} />
      </div>

      <div className="relative z-[10] flex flex-col items-center text-center px-6 mt-10">
        <motion.div className="w-32 h-32 md:w-44 md:h-44 mb-6 relative flex items-center justify-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: EB }}>
          <motion.div className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: C.accent, opacity: 0.3 }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
          <img src="/assets/logo/logoprincipal.png" alt="Agrotóxica" className="w-20 md:w-28 object-contain" />
        </motion.div>

        <motion.p className="font-cinzel text-[10px] md:text-xs uppercase tracking-[0.8em] mb-4 font-bold" style={{ color: C.text, transition: 'color 0.5s ease' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}>
          Coleção Oficial 2026
        </motion.p>

        {/* 🚀 BUG DO TIJOLÃO RESOLVIDO AQUI: Usando color pura em vez de degradê recortado */}
        <div className="overflow-hidden mb-6">
          <motion.h1
            className="font-cinzel font-black uppercase leading-tight"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              letterSpacing: '0.04em',
              color: C.accent,
              textShadow: `0 4px 20px ${C.cardShadow}`,
              transition: 'color 0.5s ease'
            }}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.3, delay: 0.7, ease: ES }}
          >
            O Campo<br />Que Te Pertence
          </motion.h1>
        </div>

        <Divider delay={1.6} />

        <motion.div className="mt-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.0, duration: 0.7, ease: EB }}>
          <CiaGreenButton href="#catalogo">Ver Coleção CIA</CiaGreenButton>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 z-[5]" style={{ background: `linear-gradient(to bottom, transparent, ${C.bg})`, transition: 'background 0.5s ease' }} />
    </section>
  );
}

function EventInfoBar() {
  const C = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const infos = [
    { label: 'Evento', value: 'CIA' },
    { label: 'Edição', value: '2026' },
    { label: 'Peças', value: `${products.length}` },
    { label: 'Status', value: 'Limitado' },
  ];

  return (
    <section ref={ref} className="relative w-full py-16 overflow-hidden"
      style={{
        background: `linear-gradient(90deg, ${C.accentDark} 0%, ${C.accent} 50%, ${C.accentDark} 100%)`,
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        borderBottom: `1px solid rgba(0,0,0,0.3)`,
        boxShadow: `0 0 40px ${C.cardShadow} inset`,
        transition: 'all 0.5s ease'
      }}
    >
      <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${C.bg} 0px, transparent 1px, transparent 18px, ${C.bg} 19px)` }} />
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {infos.map((info, i) => (
            <motion.div key={info.label} className="flex flex-col items-center text-center" initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: i * 0.1, ease: EB }}>
              <p className="font-cinzel font-black text-4xl md:text-5xl mb-1 leading-none" style={{ color: '#FFF', transition: 'color 0.5s ease' }}>{info.value}</p>
              <p className="font-poppins-thin text-[9px] uppercase tracking-[0.45em]" style={{ color: '#FFF', opacity: 0.8, fontWeight: 'bold', transition: 'color 0.5s ease' }}>{info.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManifestoCIA() {
  const C = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const words = [{ w: 'Imperial.', accent: false }, { w: 'Bruto.', accent: true }, { w: 'Exclusivo.', accent: false }, { w: 'Agrotóxica.', accent: true }];

  return (
    <section ref={ref} className="relative w-full py-40 overflow-hidden" style={{ background: C.bgMid, transition: 'background 0.5s ease' }}>
      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" initial={{ opacity: 0 }} animate={inView ? { opacity: 0.04 } : {}} transition={{ duration: 2 }}>
        <span className="font-cinzel font-black text-[22vw] uppercase leading-none whitespace-nowrap" style={{ color: C.accent, transition: 'color 0.5s ease' }}>CIA</span>
      </motion.div>
      <motion.div className="w-full h-px mb-0" style={{ background: `linear-gradient(to right, transparent, ${C.accent}, transparent)`, transition: 'background 0.5s ease' }} initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 1.5, ease: E }} />
      <Marquee text="AGROTÓXICA  ·  CIA  ·  EDIÇÃO EXCLUSIVA  ·  ATLÉTICA  ·  LOTE 26" dir={1} speed={42} op={0.2} />

      <div className="relative z-10 container mx-auto px-6 md:px-12 py-16">
        <motion.div className="flex items-center gap-4 mb-10" initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="h-px w-12" style={{ background: C.accent }} />
          <span className="font-cinzel text-[10px] uppercase tracking-[0.5em] font-bold" style={{ color: C.accent, transition: 'color 0.5s ease' }}>Manifesto</span>
        </motion.div>

        <div className="flex flex-wrap" style={{ perspective: 800 }}>
          {words.map((item, i) => (
            <ManifestoWordCIA key={i} word={item.w} accent={item.accent} index={i} />
          ))}
        </div>

        <motion.p className="mt-16 max-w-lg font-poppins-thin text-base leading-relaxed" style={{ color: C.text, opacity: 0.7, transition: 'color 0.5s ease' }} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 0.7, y: 0 } : {}} transition={{ duration: 1, delay: 0.8 }}>
          Uma coleção forjada para quem carrega o campo no sangue e leva o estilo
          como bandeira. O CIA é o campo de prova. A Agrotóxica é o uniforme.
        </motion.p>
      </div>

      <Marquee text="PODER  ·  RAIZ  ·  IDENTIDADE  ·  SISTEMA BRUTO  ·  SÓ PRA QUEM GUENTA" dir={-1} speed={55} op={0.15} small />
      <motion.div className="w-full h-px mt-0" style={{ background: `linear-gradient(to right, transparent, ${C.accent}, transparent)`, transition: 'background 0.5s ease' }} initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 1.5, delay: 0.5, ease: E }} />
    </section>
  );
}

function ProductCardCIA({ produto, index }: { produto: typeof products[0]; index: number }) {
  const C = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.75, delay: (index % 4) * 0.1, ease: E }}>
      <Link href={`/produto/${produto.id}`}>
        <motion.div
          className="relative cursor-pointer rounded-lg overflow-hidden"
          style={{
            background: hovered ? C.cardBgHover : C.cardBg,
            border: `1px solid ${hovered ? C.cardBorderHover : C.cardBorder}`,
            transition: 'border-color 0.35s ease, background 0.35s ease',
          }}
          whileHover={{ y: -10 }}
          transition={{ duration: 0.32, ease: E }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <div className="absolute top-3 left-4 z-10">
            <span className="font-cinzel text-[9px] tracking-widest font-bold" style={{ color: C.accent, opacity: 0.8, transition: 'color 0.5s ease' }}>{String(index + 1).padStart(2, '0')}</span>
          </div>

          <div className="aspect-[3/4] flex items-center justify-center overflow-hidden p-6 relative">
            <Image src={produto.image} alt={produto.nome} width={400} height={400} className="w-full h-full object-contain" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))', transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
          </div>

          <div className="p-5" style={{ background: C.cardInfoBg, borderTop: `1px solid ${C.cardBorder}`, transition: 'background 0.5s ease, border-color 0.5s ease' }}>
            <h4 className="font-cinzel font-black text-[13px] uppercase tracking-wide mb-1.5 leading-snug" style={{ color: C.text, transition: 'color 0.5s ease' }}>{produto.nome}</h4>
            <div className="flex items-center justify-between">
              <p className="font-cinzel text-xs font-black" style={{ color: C.accent, transition: 'color 0.5s ease' }}>{(produto as any).price}</p>
              <span className="px-3 py-1 text-[8px] uppercase tracking-widest rounded" style={{ background: 'rgba(255,255,255,0.05)', color: hovered ? C.green : C.text, border: `1px solid ${hovered ? C.green : C.cardBorder}`, transition: 'all 0.3s ease' }}>
                Ver Peça
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function CatalogSection() {
  const C = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section id="catalogo" ref={ref} className="relative w-full py-32 overflow-hidden" style={{ background: C.bg, transition: 'background 0.5s ease' }}>
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${C.fireGlow} 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${C.accent} 0%, transparent 40%)` }} />

      <div className="container mx-auto px-6 md:px-12 mb-20 relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="overflow-hidden">
              <motion.span className="block font-cinzel font-black text-4xl md:text-6xl uppercase leading-none" style={{ color: C.text, transition: 'color 0.5s ease' }} initial={{ y: '110%' }} animate={inView ? { y: '0%' } : {}} transition={{ duration: 0.8, delay: 0.2, ease: ES }}>Coleção</motion.span>
            </div>

            {/* 🚀 BUG DO TIJOLÃO RESOLVIDO: Título CIA 2026 */}
            <div className="overflow-hidden">
              <motion.span className="block font-cinzel font-black text-5xl md:text-7xl uppercase leading-none"
                style={{ color: C.accent, textShadow: `0 4px 20px ${C.cardShadow}`, transition: 'color 0.5s ease' }}
                initial={{ y: '110%' }} animate={inView ? { y: '0%' } : {}} transition={{ duration: 0.8, delay: 0.35, ease: ES }}
              >CIA 2026</motion.span>
            </div>
          </div>
        </div>
        <Divider delay={0.5} />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p, i) => (
            <ProductCardCIA key={p.id} produto={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CIASeal() {
  const C = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative w-full py-44 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${C.bgMid} 0%, ${C.bg} 100%)`, transition: 'background 0.5s ease' }}
    >
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(0deg,${C.accent} 0px,transparent 1px,transparent 50px,${C.accent} 51px), repeating-linear-gradient(90deg,${C.accent} 0px,transparent 1px,transparent 50px,${C.accent} 51px)` }} />
      <motion.div className="absolute rounded-full" style={{ width: 520, height: 520, border: `1px solid ${C.cardBorder}` }} animate={{ rotate: [0, 360] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute rounded-full" style={{ width: 350, height: 350, border: `1px dashed ${C.cardBorder}` }} animate={{ rotate: [0, -360] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} />

      <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6">
        <motion.p className="font-cinzel text-xs uppercase tracking-[0.6em] font-bold" style={{ color: C.accent, transition: 'color 0.5s ease' }} initial={{ opacity: 0, y: 15 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          — Agrotóxica × CIA
        </motion.p>

        {/* 🚀 BUG DO TIJOLÃO RESOLVIDO: Texto Final */}
        <div className="overflow-hidden">
          <motion.h2 className="font-cinzel font-black text-5xl md:text-7xl uppercase leading-none pb-2"
            style={{ color: C.accent, textShadow: `0 4px 20px ${C.cardShadow}`, transition: 'color 0.5s ease' }}
            initial={{ y: '100%' }} animate={inView ? { y: '0%' } : {}} transition={{ duration: 1.1, delay: 0.4, ease: ES }}
          >Vista<br />o Território.</motion.h2>
        </div>
        <Divider delay={0.8} />
        <motion.p className="font-poppins-thin text-sm max-w-sm leading-relaxed" style={{ color: C.text, opacity: 0.6, transition: 'color 0.5s ease' }} initial={{ opacity: 0 }} animate={inView ? { opacity: 0.6 } : {}} transition={{ delay: 1.1 }}>
          Peças exclusivas que marcam presença.<br />Agrotóxica no CIA — sem concessões.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.3, duration: 0.7 }}>
          <GoldButton href="/?skipIntro=true">Explorar Loja →</GoldButton>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE EXPORT (PÁGINA PRINCIPAL)
// ─────────────────────────────────────────────────────────────────────────────
export default function CIAPage() {
  const [isAltMode, setIsAltMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      // Quando a Hotbar tira a classe .dark, ativamos o Fundo Marfim Imperial (Modo Claro)
      setIsAltMode(!document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Escolhe a paleta com base no clique
  const currentTheme = isAltMode ? PALETTES.light : PALETTES.dark;

  return (
    <ThemeContext.Provider value={currentTheme}>
      <style>{`
        @font-face {
          font-family: 'CinzelDecorative';
          src: url('/fonts/CinzelDecorative-Black.ttf') format('truetype');
          font-weight: 900; font-display: swap;
        }
        @font-face {
          font-family: 'PoppinsMedium';
          src: url('/fonts/Poppins-Medium.ttf') format('truetype');
          font-weight: 500; font-display: swap;
        }
        @font-face {
          font-family: 'PoppinsThin';
          src: url('/fonts/Poppins-Thin.ttf') format('truetype');
          font-weight: 100; font-display: swap;
        }
        .font-cinzel       { font-family: 'CinzelDecorative', 'Palatino Linotype', serif; }
        .font-poppins      { font-family: 'PoppinsMedium', sans-serif; }
        .font-poppins-thin { font-family: 'PoppinsThin', sans-serif; }

        @keyframes marquee-ltr { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-rtl { from { transform: translateX(-50%); } to { transform: translateX(0); } }

        html { scroll-behavior: smooth; color-scheme: dark; }
      `}</style>

      <main style={{ background: currentTheme.bg, minHeight: '100vh', overflowX: 'hidden', transition: 'background 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
        <FireEmbers />
        <CursorGlow />
        <Noise />
        <VideoHero />
        <EventInfoBar />
        <CatalogSection />
        <CIASeal />
      </main>
    </ThemeContext.Provider>
  );
}