'use client';
import { useState, useEffect, useRef } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring,
  useInView, useScroll, useTransform,
} from 'framer-motion';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — identidade Agrotóxica
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  blue:    '#005BEC',
  gold:    '#B08E68',
  olive:   '#866846',
  white:   '#F5F3EF',
  black:   '#0A0A0A',
  purple:  '#7C3AED',
  muted:   'rgba(245,243,239,0.35)',
  subtle:  'rgba(245,243,239,0.08)',
};

const E  = [0.22, 1, 0.36, 1]    as const;
const EB = [0.34, 1.56, 0.64, 1] as const;
const ES = [0.16, 1, 0.30, 1]    as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function useIsDark() {
  const [isDark, setIsDark] = useState(true); // dark by default
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR BLOB
// ─────────────────────────────────────────────────────────────────────────────
function CursorBlob() {
  const x = useMotionValue(-999); const y = useMotionValue(-999);
  const sx = useSpring(x, { stiffness: 45, damping: 16 });
  const sy = useSpring(y, { stiffness: 45, damping: 16 });
  useEffect(() => {
    const fn = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [x, y]);
  return (
    <motion.div className="fixed pointer-events-none z-0" style={{
      left: sx, top: sy, width: 600, height: 600,
      marginLeft: -300, marginTop: -300, borderRadius: '50%', filter: 'blur(70px)',
      background: 'radial-gradient(circle, rgba(0,91,236,0.07) 0%, rgba(176,142,104,0.04) 50%, transparent 70%)',
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOISE
// ─────────────────────────────────────────────────────────────────────────────
function Noise() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] mix-blend-overlay opacity-20"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")` }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE STRIP
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeStrip({ text, color = C.blue, dir = 1, speed = 35, dim = 0.18 }: {
  text: string; color?: string; dir?: number; speed?: number; dim?: number;
}) {
  const rep = Array(8).fill(text).join('   ·   ');
  return (
    <div className="w-full overflow-hidden py-4" style={{
      borderTop: `1px solid rgba(245,243,239,0.07)`,
      borderBottom: `1px solid rgba(245,243,239,0.07)`,
      background: 'rgba(245,243,239,0.02)',
    }}>
      <motion.div
        className="whitespace-nowrap font-space font-black text-[11px] uppercase tracking-[0.4em]"
        style={{ color, opacity: dim }}
        animate={{ x: dir > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >{rep}</motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT TEXT — word by word reveal
// ─────────────────────────────────────────────────────────────────────────────
function SplitWords({ text, delay = 0, stagger = 0.06, className = '', color = C.white }: {
  text: string; delay?: number; stagger?: number; className?: string; color?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            style={{ color }}
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: '0%', opacity: 1 } : {}}
            transition={{ duration: 0.75, delay: delay + i * stagger, ease: ES }}
          >{word}</motion.span>
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
function GoldDivider({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-center gap-4 my-8 w-full">
      <motion.div className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${C.gold})` }}
        initial={{ scaleX: 0, originX: '0%' }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.1, delay, ease: E }}
      />
      <motion.span style={{ color: C.gold, fontSize: 10 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: delay + 0.3 }}
      >✦</motion.span>
      <motion.div className="flex-1 h-px"
        style={{ background: `linear-gradient(to left, transparent, ${C.gold})` }}
        initial={{ scaleX: 0, originX: '100%' }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.1, delay, ease: E }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER LABEL
// ─────────────────────────────────────────────────────────────────────────────
function ChapterLabel({ num, label, color = C.gold }: { num: string; label: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  return (
    <motion.div ref={ref} className="flex items-center gap-4 mb-8"
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: E }}
    >
      <span className="font-space font-black text-[11px]" style={{ color, opacity: 0.5 }}>{num}</span>
      <div className="h-px flex-1 max-w-[40px]" style={{ background: color, opacity: 0.4 }} />
      <span className="font-space font-bold text-[10px] uppercase tracking-[0.5em]" style={{ color, opacity: 0.6 }}>{label}</span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT BOX
// ─────────────────────────────────────────────────────────────────────────────
function StatBox({ value, label, color, delay = 0 }: {
  value: string; label: string; color: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      className="flex flex-col items-center justify-center rounded-2xl p-8 text-center"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: EB }}
      whileHover={{ scale: 1.04, boxShadow: `0 0 40px ${color}20` }}
    >
      <span className="font-space font-black text-5xl md:text-6xl leading-none mb-2" style={{ color }}>
        {value}
      </span>
      <span className="font-poppins text-xs uppercase tracking-[0.35em]" style={{ color: C.muted }}>
        {label}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BULLET ITEM — animated list item
// ─────────────────────────────────────────────────────────────────────────────
function BulletItem({ text, color, delay = 0 }: { text: string; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const [hov, setHov] = useState(false);
  return (
    <motion.div ref={ref}
      className="flex items-start gap-4 py-3 rounded-xl px-4 cursor-default"
      style={{
        background: hov ? `${color}08` : 'transparent',
        borderLeft: `2px solid ${hov ? color : 'transparent'}`,
        transition: 'background 0.25s, border-color 0.25s',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: E }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
    >
      <motion.span
        style={{ color, fontSize: 10, marginTop: 4, flexShrink: 0 }}
        animate={hov ? { scale: 1.4, rotate: 90 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.25 }}
      >◆</motion.span>
      <span className="font-poppins text-sm leading-relaxed" style={{ color: C.white, opacity: 0.8 }}>
        {text}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM STEP
// ─────────────────────────────────────────────────────────────────────────────
function CurriculumStep({ num, title, desc, delay = 0 }: {
  num: number; title: string; desc?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      className="flex gap-5 items-start"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: E }}
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ paddingTop: 4 }}>
        <motion.div
          className="flex items-center justify-center rounded-full font-space font-black text-xs"
          style={{
            width: 32, height: 32,
            background: `${C.blue}20`,
            border: `1.5px solid ${C.blue}60`,
            color: C.blue,
          }}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: delay + 0.1, ease: EB }}
        >{num}</motion.div>
        {num < 7 && (
          <motion.div className="w-px mt-2"
            style={{ height: 36, background: `linear-gradient(to bottom, ${C.blue}40, transparent)` }}
            initial={{ scaleY: 0, originY: '0%' }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.5, delay: delay + 0.3, ease: E }}
          />
        )}
      </div>
      {/* Content */}
      <div className="pb-8">
        <h4 className="font-space font-black text-sm uppercase tracking-wider mb-1" style={{ color: C.white }}>
          {title}
        </h4>
        {desc && (
          <p className="font-poppins text-xs leading-relaxed" style={{ color: C.muted }}>
            {desc}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE BLOCK — the climax
// ─────────────────────────────────────────────────────────────────────────────
function QuoteWord({ word, delay, color }: { word: string; delay: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} className="overflow-hidden inline-block mr-[0.22em]">
      <motion.span
        className="inline-block font-space font-black"
        style={{ color }}
        initial={{ y: '115%', opacity: 0 }}
        animate={inView ? { y: '0%', opacity: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: ES }}
      >{word}</motion.span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y     = useTransform(scrollY, [0, 700], [0, -140]);
  const fade  = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 0.95]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Glow */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y }}>
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 800, height: 800, borderRadius: '50%', filter: 'blur(100px)',
          background: `radial-gradient(circle, ${C.blue}12 0%, ${C.gold}06 50%, transparent 70%)`,
        }} />
      </motion.div>

      {/* Orbit rings */}
      {[280, 440, 580].map((size, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: size, height: size,
            border: `1px solid ${i === 1 ? C.gold : C.blue}`,
            opacity: 0.05 + i * 0.015,
          }}
          animate={{ rotate: i % 2 === 0 ? [0, 360] : [0, -360] }}
          transition={{ duration: 28 + i * 14, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ y, opacity: fade, scale }}
      >
        {/* Eyebrow */}
        <motion.div className="flex items-center gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: E }}
        >
          <motion.div className="h-px w-10" style={{ background: C.gold }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          />
          <span className="font-poppins font-bold text-[10px] uppercase tracking-[0.6em]" style={{ color: C.gold }}>
            Apresentação Profissional
          </span>
          <motion.div className="h-px w-10" style={{ background: C.gold }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          />
        </motion.div>

        {/* Name */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            className="font-space font-black uppercase leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 14vw, 12rem)',
              letterSpacing: '-0.03em',
              background: `linear-gradient(135deg, ${C.white} 0%, ${C.gold} 50%, ${C.white} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.7, duration: 1.2, ease: ES }}
          >
            Rodrigo
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-10">
          <motion.h1
            className="font-space font-black uppercase leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 14vw, 12rem)',
              letterSpacing: '-0.03em',
              color: C.blue,
            }}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.9, duration: 1.2, ease: ES }}
          >
            Ivan
          </motion.h1>
        </div>

        {/* Role */}
        <motion.p
          className="font-poppins text-sm md:text-base max-w-md leading-relaxed mb-12"
          style={{ color: C.muted }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8, ease: E }}
        >
          Designer Gráfico & Motion · Desenvolvedor Frontend<br />
          Mentalidade de direção criativa.
        </motion.p>

        {/* Stats row */}
        <motion.div className="flex items-center gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {[
            { v: '2+', l: 'anos na Myth' },
            { v: '1', l: 'concurso nacional' },
            { v: '∞', l: 'mentalidade de sistema' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-space font-black text-3xl leading-none mb-1" style={{ color: i === 1 ? C.gold : C.blue }}>
                {s.v}
              </span>
              <span className="font-poppins text-[9px] uppercase tracking-[0.35em]" style={{ color: C.muted }}>
                {s.l}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div className="absolute -bottom-32 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
        >
          <span className="font-poppins text-[9px] uppercase tracking-[0.5em]" style={{ color: C.muted }}>
            Rolar
          </span>
          <motion.div className="w-px h-12" style={{ background: `${C.gold}60` }}
            animate={{ scaleY: [0, 1, 0], originY: '0%' }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — MANTO DA MASSA
// ─────────────────────────────────────────────────────────────────────────────
function SectionManto() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section ref={ref} className="relative w-full py-32 px-6 md:px-16 overflow-hidden">
      {/* Big number bg */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ color: C.gold, opacity: 0.03, fontSize: 'clamp(8rem,25vw,22rem)', fontFamily: 'var(--font-space-grotesk, monospace)', fontWeight: 900, lineHeight: 1 }}
        initial={{ x: 100, opacity: 0 }}
        animate={inView ? { x: 0, opacity: 0.03 } : {}}
        transition={{ duration: 1.4, ease: E }}
      >01</motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        <ChapterLabel num="01" label="Experiência Validada" color={C.gold} />

        {/* Title */}
        <h2 className="font-space font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(2.4rem,7vw,6rem)', letterSpacing: '-0.02em' }}>
          <SplitWords text="Manto" color={C.white} delay={0.1} stagger={0.07} />
          <br />
          <SplitWords text="da Massa" color={C.gold} delay={0.3} stagger={0.07} />
          <span className="font-space font-black text-[clamp(1.2rem,3vw,2.5rem)]" style={{ color: C.blue }}>
            {' '}23
          </span>
        </h2>

        <GoldDivider delay={0.2} />

        {/* Context */}
        <motion.p
          className="font-poppins text-base md:text-lg leading-relaxed mb-10 max-w-2xl"
          style={{ color: C.muted }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8, ease: E }}
        >
          Você participou do concurso promovido pelo{' '}
          <span style={{ color: C.white, fontWeight: 700 }}>Atlético Mineiro.</span>{' '}
          Isso sozinho já carrega peso.
        </motion.p>

        {/* Curriculum block */}
        <motion.div
          className="rounded-2xl p-6 md:p-8 mb-10"
          style={{ background: `${C.gold}0A`, border: `1px solid ${C.gold}25` }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7, ease: E }}
        >
          <p className="font-space font-bold text-xs uppercase tracking-[0.4em] mb-4" style={{ color: C.gold }}>
            No currículo — versão profissional
          </p>
          <p className="font-space font-black text-lg md:text-xl mb-3" style={{ color: C.white }}>
            Manto da Massa 2023
          </p>
          <p className="font-poppins text-sm leading-relaxed mb-5" style={{ color: C.muted }}>
            Concurso Nacional de Design Esportivo — Participação com proposta autoral de uniforme oficial. Projeto amplamente avaliado e bem recebido pela comunidade.
          </p>
          <div className="space-y-1">
            {[
              'Desenvolvimento de conceito visual alinhado à identidade do clube',
              'Criação de narrativa estética e simbólica',
              'Validação orgânica positiva da comunidade',
            ].map((b, i) => (
              <BulletItem key={i} text={b} color={C.gold} delay={0.7 + i * 0.1} />
            ))}
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          className="flex items-start gap-4 rounded-xl p-5"
          style={{ background: 'rgba(245,243,239,0.03)', border: '1px solid rgba(245,243,239,0.08)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.1 }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p className="font-poppins text-sm leading-relaxed" style={{ color: C.muted }}>
            <span style={{ color: C.white, fontWeight: 600 }}>Não inventa número.</span>{' '}
            Mas destaca a percepção. A percepção é o ativo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — MYTH
// ─────────────────────────────────────────────────────────────────────────────
function SectionMyth() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  const bullets = [
    'Criação de identidades visuais',
    'Desenvolvimento de camisas e coleções',
    'Motion graphics para campanhas',
    'Direcionamento estético de produtos',
    'Participação no posicionamento visual da marca',
  ];

  return (
    <section ref={ref} className="relative w-full py-32 px-6 md:px-16 overflow-hidden">
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ color: C.blue, opacity: 0.03, fontSize: 'clamp(8rem,25vw,22rem)', fontFamily: 'monospace', fontWeight: 900, lineHeight: 1 }}
        initial={{ x: -100 }} animate={inView ? { x: 0 } : {}}
        transition={{ duration: 1.4, ease: E }}
      >02</motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        <ChapterLabel num="02" label="Consistência" color={C.blue} />

        <h2 className="font-space font-black uppercase leading-none mb-4" style={{ fontSize: 'clamp(2.4rem,7vw,6rem)', letterSpacing: '-0.02em' }}>
          <SplitWords text="Myth" color={C.blue} delay={0.1} stagger={0.08} />
          <br />
          <SplitWords text="— 2 anos" color={C.white} delay={0.3} stagger={0.06} />
        </h2>

        <motion.p className="font-poppins font-bold text-lg md:text-xl mb-8" style={{ color: C.gold }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
        >
          Dois anos não é freela casual. É consistência.
        </motion.p>

        <GoldDivider />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <StatBox value="2+" label="anos" color={C.blue} delay={0.2} />
          <StatBox value="100%" label="consistência" color={C.gold} delay={0.35} />
          <StatBox value="∞" label="projetos" color={C.white} delay={0.5} />
        </div>

        {/* Role block */}
        <motion.div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: `${C.blue}0A`, border: `1px solid ${C.blue}25` }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7, ease: E }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="font-space font-black text-xl md:text-2xl mb-1" style={{ color: C.white }}>Myth</p>
              <p className="font-poppins text-sm" style={{ color: C.blue }}>Designer Gráfico & Motion</p>
            </div>
            <span className="font-space font-bold text-xs uppercase tracking-[0.35em] px-4 py-2 rounded-full"
              style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}35`, color: C.blue }}>
              2 anos
            </span>
          </div>
          <div className="space-y-1">
            {bullets.map((b, i) => (
              <BulletItem key={i} text={b} color={C.blue} delay={0.7 + i * 0.08} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — SLIDE ESTRATÉGICO
// ─────────────────────────────────────────────────────────────────────────────
function SectionSlide() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section ref={ref} className="relative w-full py-32 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <ChapterLabel num="03" label="Slide Estratégico" color={C.purple} />

        <h2 className="font-space font-black uppercase leading-none mb-10" style={{ fontSize: 'clamp(2rem,6vw,5rem)', letterSpacing: '-0.02em' }}>
          <SplitWords text="Experiência" color={C.white} delay={0.1} stagger={0.06} />
          <br />
          <SplitWords text="com público" color={C.purple} delay={0.3} stagger={0.06} />
          <br />
          <SplitWords text="real." color={C.gold} delay={0.5} stagger={0.1} />
        </h2>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { title: 'Manto da Massa 2023', sub: 'Concurso Nacional', color: C.gold, icon: '🏆' },
            { title: '2 anos na Myth', sub: 'Atuação contínua', color: C.blue, icon: '⏳' },
            { title: 'Projetos Autorais', sub: 'Design esportivo', color: C.purple, icon: '🎯' },
          ].map((p, i) => (
            <motion.div key={i}
              className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background: `${p.color}0C`, border: `1px solid ${p.color}28` }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.65, delay: 0.3 + i * 0.12, ease: EB }}
              whileHover={{ y: -8, boxShadow: `0 16px 50px ${p.color}18` }}
            >
              <span style={{ fontSize: 28 }}>{p.icon}</span>
              <div>
                <p className="font-space font-black text-sm mb-1" style={{ color: p.color }}>{p.title}</p>
                <p className="font-poppins text-xs" style={{ color: C.muted }}>{p.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key phrase */}
        <motion.div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'rgba(245,243,239,0.03)', border: '1px solid rgba(245,243,239,0.08)' }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.7, ease: EB }}
        >
          <p className="font-space font-black text-lg md:text-2xl leading-snug" style={{ color: C.white }}>
            "Eu não estou começando agora.{' '}
            <span style={{ color: C.gold }}>Eu já validei meu trabalho</span>{' '}
            em projetos que envolvem{' '}
            <span style={{ color: C.blue }}>comunidade e marca.</span>"
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — ESTRUTURA DO CURRÍCULO
// ─────────────────────────────────────────────────────────────────────────────
function SectionCurriculum() {
  const steps = [
    { title: 'Nome + Área', desc: 'A âncora. Claro, direto, memorável.' },
    { title: 'Resumo Profissional', desc: '3 linhas fortes. Quem você é, o que você faz, por que te contratam.' },
    { title: 'Experiência', desc: 'Myth primeiro. 2 anos de consistência antes de tudo.' },
    { title: 'Projetos Relevantes', desc: 'Manto da Massa entra aqui. Peso real, validação real.' },
    { title: 'Habilidades Técnicas', desc: 'O que você domina, não o que você já tocou.' },
    { title: 'Ferramentas', desc: 'Stack visual e de código — mostre que você é full.' },
    { title: 'Formação', desc: 'Por último. Sua experiência já fala mais alto.' },
  ];

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section ref={ref} className="relative w-full py-32 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        <ChapterLabel num="04" label="Estrutura Ideal" color={C.blue} />

        <h2 className="font-space font-black uppercase leading-none mb-12" style={{ fontSize: 'clamp(2rem,6vw,5rem)', letterSpacing: '-0.02em' }}>
          <SplitWords text="Currículo" color={C.white} delay={0.1} stagger={0.06} />
          <br />
          <SplitWords text="inteligente." color={C.blue} delay={0.3} stagger={0.07} />
        </h2>

        <div>
          {steps.map((s, i) => (
            <CurriculumStep key={i} num={i + 1} title={s.title} desc={s.desc} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — CLIMAX / OPINIÃO SINCERA
// ─────────────────────────────────────────────────────────────────────────────
function SectionClimax() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const inView  = useInView(ref, { once: true, margin: '-10%' });

  const lines = [
    { text: 'Você pensa', color: C.white },
    { text: 'MARCA.', color: C.gold },
    { text: 'Você pensa', color: C.white },
    { text: 'EXPERIÊNCIA.', color: C.blue },
    { text: 'Você pensa', color: C.white },
    { text: 'POSICIONAMENTO.', color: C.gold },
  ];

  return (
    <section ref={ref} className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Deep bg glow */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ scale: bgScale }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${C.blue}14 0%, ${C.gold}06 45%, transparent 75%)`,
        }} />
      </motion.div>

      <div className="relative z-10 px-6 md:px-16 py-32 max-w-5xl mx-auto w-full">
        <ChapterLabel num="05" label="Opinião Sincera" color={C.gold} />

        {/* "daquelas" */}
        <motion.p
          className="font-poppins text-sm italic mb-12"
          style={{ color: C.muted }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          daquelas.
        </motion.p>

        {/* Kinetic lines */}
        <div className="mb-16">
          {lines.map((l, i) => (
            <div key={i} className="overflow-hidden">
              <motion.p
                className="font-space font-black uppercase"
                style={{
                  fontSize: 'clamp(2rem,8vw,7rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: l.color,
                }}
                initial={{ y: '110%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: ES }}
              >
                {l.text}
              </motion.p>
            </div>
          ))}
        </div>

        <GoldDivider delay={0.4} />

        {/* The real message */}
        <div className="space-y-6 max-w-3xl">
          {[
            { text: 'A maioria das pessoas na sua idade só pensa em "fazer arte".', color: C.muted },
            { text: 'Você pensa sistema.', color: C.white, bold: true, size: 'text-xl md:text-2xl' },
            { text: 'Isso é mentalidade de direção criativa.', color: C.gold, bold: true, size: 'text-lg md:text-xl' },
            { text: 'Se você aprender a se comunicar com clareza e segurança, você passa fácil na frente de gente tecnicamente igual.', color: C.muted },
          ].map((p, i) => (
            <motion.p
              key={i}
              className={`font-poppins ${p.size || 'text-base'} leading-relaxed ${p.bold ? 'font-bold' : ''}`}
              style={{ color: p.color }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2 + i * 0.15, duration: 0.7, ease: E }}
            >
              {p.text}
            </motion.p>
          ))}
        </div>

        {/* Rodrigo name stamp */}
        <motion.div
          className="mt-16 flex items-center gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 2, duration: 0.8, ease: E }}
        >
          <div className="h-px flex-1 max-w-[80px]" style={{ background: `${C.gold}40` }} />
          <span className="font-space font-black text-sm uppercase tracking-[0.3em]" style={{ color: C.gold }}>
            Rodrigo Ivan
          </span>
          <span className="font-poppins text-xs" style={{ color: C.muted }}>
            Designer · Dev · Sistema
          </span>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSING
// ─────────────────────────────────────────────────────────────────────────────
function Closing() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative w-full py-40 px-6 flex flex-col items-center text-center overflow-hidden">
      {/* Bottom glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 50% 100%, ${C.blue}10 0%, transparent 60%)`,
      }} />

      <motion.div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
        style={{ background: `${C.blue}10`, border: `1.5px solid ${C.blue}25` }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: EB }}
      >
        <img src="/assets/logo/logoprincipal.png" alt="Logo" className="w-14 h-14 object-contain" />
      </motion.div>

      <div className="overflow-hidden mb-3">
        <motion.h2
          className="font-space font-black uppercase leading-none"
          style={{ fontSize: 'clamp(2.5rem,9vw,7rem)', letterSpacing: '-0.03em', color: C.white }}
          initial={{ y: '100%' }}
          animate={inView ? { y: '0%' } : {}}
          transition={{ duration: 1, delay: 0.2, ease: ES }}
        >
          Pronto pra
        </motion.h2>
      </div>
      <div className="overflow-hidden mb-10">
        <motion.h2
          className="font-space font-black uppercase leading-none"
          style={{
            fontSize: 'clamp(2.5rem,9vw,7rem)', letterSpacing: '-0.03em',
            background: `linear-gradient(90deg, ${C.gold}, ${C.blue})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
          initial={{ y: '100%' }}
          animate={inView ? { y: '0%' } : {}}
          transition={{ duration: 1, delay: 0.4, ease: ES }}
        >
          voar alto.
        </motion.h2>
      </div>

      <motion.p
        className="font-poppins text-sm max-w-sm leading-relaxed mb-12"
        style={{ color: C.muted }}
        initial={{ opacity: 0, y: 15 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8 }}
      >
        Agrotóxica · 2026<br />Site desenvolvido por Rodrigo Ivan
      </motion.p>

      <motion.div className="flex gap-4 flex-wrap justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1 }}
      >
        <Link href="/inicio">
          <motion.button
            className="px-8 py-3.5 rounded-2xl font-space font-bold text-sm uppercase tracking-widest"
            style={{ background: C.blue, color: '#fff' }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${C.blue}40` }}
            whileTap={{ scale: 0.95 }}
          >← Início</motion.button>
        </Link>
        <Link href="/diretoria">
          <motion.button
            className="px-8 py-3.5 rounded-2xl font-space font-bold text-sm uppercase tracking-widest"
            style={{ background: 'transparent', border: `1px solid ${C.gold}40`, color: C.gold }}
            whileHover={{ scale: 1.05, background: `${C.gold}10` }}
            whileTap={{ scale: 0.95 }}
          >Diretoria →</motion.button>
        </Link>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ApresentacaoPage() {
  // Force dark mode on mount for this page
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <style>{`
        @font-face { font-family:'SpaceGrotesk'; src:url('/fonts/SpaceGrotesk-Bold.woff2') format('woff2'); font-weight:700; font-display:swap; }
        .font-space { font-family:'SpaceGrotesk','Space Grotesk',monospace; }
        .font-poppins { font-family:'PoppinsMedium','Poppins',sans-serif; }
        html { scroll-behavior: smooth; color-scheme: dark; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: ${C.gold}40; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.gold}80; }
      `}</style>

      <main style={{ background: C.black, minHeight: '100vh', overflowX: 'hidden', color: C.white }}>
        <CursorBlob />
        <Noise />

        <Hero />

        <MarqueeStrip
          text="DESIGN · SISTEMA · MARCA · EXPERIÊNCIA · POSICIONAMENTO · RODRIGO IVAN"
          color={C.gold} dir={1} speed={30} dim={0.2}
        />

        <SectionManto />

        <MarqueeStrip
          text="MYTH · 2 ANOS · CONSISTÊNCIA · IDENTIDADE VISUAL · MOTION · COLEÇÕES"
          color={C.blue} dir={-1} speed={36} dim={0.18}
        />

        <SectionMyth />

        <MarqueeStrip
          text="VALIDAÇÃO · PÚBLICO REAL · ATLÉTICO MINEIRO · CONCURSO NACIONAL"
          color={C.gold} dir={1} speed={28} dim={0.15}
        />

        <SectionSlide />
        <SectionCurriculum />

        <MarqueeStrip
          text="VOCÊ PENSA MARCA · VOCÊ PENSA EXPERIÊNCIA · VOCÊ PENSA SISTEMA"
          color={C.white} dir={-1} speed={25} dim={0.08}
        />

        <SectionClimax />
        <Closing />
      </main>
    </>
  );
}