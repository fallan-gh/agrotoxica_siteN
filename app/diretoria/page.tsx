'use client';
import { useState, useEffect, useRef } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useInView, useScroll, useTransform,
} from 'framer-motion';
import Link from 'next/link';
import Hotbar from '../../components/Hotbar';

// ─────────────────────────────────────────────────────────────────────────────
// BRAND
// ─────────────────────────────────────────────────────────────────────────────
const B = {
  blue:  '#005BEC',
  gold:  '#B08E68',
  olive: '#866846',
  bg:    'var(--color-bg)',
  text:  'var(--color-text)',
};

const EASE      = [0.22, 1, 0.36, 1] as const;
const EASE_BACK = [0.34, 1.56, 0.64, 1] as const;
const EASE_SLOW = [0.16, 1, 0.30, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS DATA
// ─────────────────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  {
    id:    'lideranca',
    label: 'Liderança',
    color: '#005BEC',
    glyph: '★',
    members: [
      { name: 'Amanda',          role: 'Presidente'       },
      { name: 'Gabriel Henrique',role: 'Vice-Presidente'  },
      { name: 'Verônica',        role: 'Diretoria Geral'  },
    ],
  },
  {
    id:    'financeiro',
    label: 'Financeiro',
    color: '#2A7A3B',
    glyph: '◆',
    members: [
      { name: 'Waldivino', role: 'Diretor de Financeiro' },
    ],
  },
  {
    id:    'produtos',
    label: 'Produtos',
    color: '#B08E68',
    glyph: '▲',
    members: [
      { name: 'Lincoln',   role: 'Diretor de Produtos' },
      { name: 'Giovanna',  role: 'Diretora de Produtos' },
      { name: 'Delaporte', role: 'Diretor de Produtos' },
      { name: 'Gabriela',  role: 'Diretora de Produtos' },
    ],
  },
  {
    id:    'esportes',
    label: 'Esportes',
    color: '#C0392B',
    glyph: '⬟',
    members: [
      { name: 'Ferrarini', role: 'Diretor de Esportes' },
      { name: 'Henrique',  role: 'Diretor de Esportes' },
      { name: 'Erike',     role: 'Diretor de Esportes' },
      { name: 'Andrey',    role: 'Diretor de Esportes' },
    ],
  },
  {
    id:    'marketing',
    label: 'Marketing',
    color: '#8E44AD',
    glyph: '●',
    members: [
      { name: 'Nicoly',  role: 'Diretora de Marketing' },
      { name: 'Julia',   role: 'Diretora de Marketing' },
      { name: 'Isadora', role: 'Diretora de Marketing' },
      { name: 'Rossana', role: 'Diretora de Marketing' },
    ],
  },
  {
    id:    'eventos',
    label: 'Eventos',
    color: '#D35400',
    glyph: '✦',
    members: [
      { name: 'Jão Pedro',      role: 'Diretor de Evento'  },
      { name: 'Luiz Eduardo',   role: 'Diretor de Evento'  },
      { name: 'Emilly',         role: 'Diretora de Evento' },
      { name: 'Vinicíus Mozart',role: 'Diretor de Evento'  },
      { name: 'Victor Mendonça',role: 'Diretor de Evento'  },
      { name: 'Yan',            role: 'Diretor de Evento'  },
      { name: 'Pedro Paulo',    role: 'Diretor de Evento'  },
      { name: 'Yasmim de Paula',role: 'Diretora de Evento' },
    ],
  },
  {
    id:    'social',
    label: 'Ação Social',
    color: '#16A085',
    glyph: '♥',
    members: [
      { name: 'Jorge Bures', role: 'Diretor de Ação Social'  },
      { name: 'André Luiz',  role: 'Diretor de Ação Social'  },
      { name: 'Álvaro',      role: 'Diretor de Ação Social'  },
      { name: 'Ana Luiza',   role: 'Diretora de Ação Social' },
    ],
  },
  {
    id:    'tech',
    label: 'Tecnologia',
    color: '#2C3E50',
    glyph: '</> ',
    members: [
      { name: 'Rodrigo Ivan', role: 'Programador · Criador do Site' },
    ],
  },
];

// Total count
const TOTAL_MEMBERS = DEPARTMENTS.reduce((a, d) => a + d.members.length, 0);

// ─────────────────────────────────────────────────────────────────────────────
// DARK MODE HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
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
function CursorBlob({ isDark }: { isDark: boolean }) {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const sx = useSpring(x, { stiffness: 50, damping: 18 });
  const sy = useSpring(y, { stiffness: 50, damping: 18 });
  useEffect(() => {
    const fn = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [x, y]);
  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        left: sx, top: sy,
        width: 500, height: 500,
        marginLeft: -250, marginTop: -250,
        background: isDark
          ? 'radial-gradient(circle, rgba(176,142,104,0.06) 0%, rgba(0,91,236,0.03) 50%, transparent 70%)'
          : 'radial-gradient(circle, rgba(0,91,236,0.05) 0%, rgba(176,142,104,0.03) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOISE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function Noise() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] mix-blend-overlay opacity-25"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GRID BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
function GridBg({ isDark }: { isDark: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: isDark
          ? `repeating-linear-gradient(0deg,transparent,transparent 49px,rgba(255,255,255,0.025) 49px,rgba(255,255,255,0.025) 50px),
             repeating-linear-gradient(90deg,transparent,transparent 49px,rgba(255,255,255,0.025) 49px,rgba(255,255,255,0.025) 50px)`
          : `repeating-linear-gradient(0deg,transparent,transparent 49px,rgba(0,0,0,0.03) 49px,rgba(0,0,0,0.03) 50px),
             repeating-linear-gradient(90deg,transparent,transparent 49px,rgba(0,0,0,0.03) 49px,rgba(0,0,0,0.03) 50px)`,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER CARD
// ─────────────────────────────────────────────────────────────────────────────
function MemberCard({
  name, role, color, index, deptIndex, isDark,
}: {
  name: string; role: string; color: string;
  index: number; deptIndex: number; isDark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  const [hov, setHov] = useState(false);

  // Initials
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.65, delay: index * 0.07 + deptIndex * 0.04, ease: EASE }}
    >
      <motion.div
        className="relative rounded-2xl p-5 cursor-default overflow-hidden"
        style={{
          background: isDark
            ? `rgba(255,255,255,0.03)`
            : `rgba(0,0,0,0.02)`,
          border: `1px solid ${hov ? color + '55' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
          transition: 'border-color 0.35s ease',
          boxShadow: hov ? `0 8px 30px ${color}22` : 'none',
        }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.28, ease: EASE }}
        onHoverStart={() => setHov(true)}
        onHoverEnd={() => setHov(false)}
      >
        {/* Background glow on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${color}18 0%, transparent 65%)`,
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }} />

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: color,
          transform: hov ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: '0% 50%',
          transition: 'transform 0.4s ease',
          borderRadius: '2px 2px 0 0',
        }} />

        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          <motion.div
            className="flex-shrink-0 flex items-center justify-center rounded-xl font-space font-black text-sm"
            style={{
              width: 48, height: 48,
              background: `${color}22`,
              border: `1.5px solid ${color}44`,
              color: color,
              letterSpacing: '0.05em',
            }}
            animate={hov ? { scale: 1.08, rotate: [0, -4, 4, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.4 }}
          >
            {initials}
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-space font-black text-sm truncate mb-0.5"
              style={{ color: isDark ? '#f0f0f0' : '#111' }}>
              {name}
            </h3>
            <p className="font-poppins text-[11px] leading-relaxed"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
              {role}
            </p>
          </div>
        </div>

        {/* Corner dot */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          width: 6, height: 6, borderRadius: '50%',
          background: color,
          opacity: hov ? 1 : 0.25,
          transition: 'opacity 0.3s ease',
        }} />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT SECTION
// ─────────────────────────────────────────────────────────────────────────────
function DeptSection({
  dept, deptIndex, isDark,
}: {
  dept: typeof DEPARTMENTS[0];
  deptIndex: number;
  isDark: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12%' });
  const labelRef = useRef<HTMLDivElement>(null);
  const labelInView = useInView(labelRef, { once: true, margin: '-10%' });

  return (
    <div ref={ref} className="mb-20">
      {/* Dept header */}
      <div ref={labelRef} className="flex items-center gap-5 mb-8">
        {/* Glyph + color block */}
        <motion.div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 52, height: 52,
            background: `${dept.color}18`,
            border: `2px solid ${dept.color}44`,
            color: dept.color,
            fontSize: 18,
            fontFamily: 'monospace',
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={labelInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_BACK }}
        >
          {dept.glyph}
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={labelInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-space font-black text-xl uppercase tracking-widest"
                style={{ color: dept.color }}>
                {dept.label}
              </h2>
              <span className="font-space text-[10px] font-bold uppercase tracking-[0.4em]"
                style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
                · {dept.members.length} {dept.members.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>

            {/* Animated underline */}
            <motion.div
              style={{ height: 2, background: `linear-gradient(to right, ${dept.color}, transparent)`, borderRadius: 2 }}
              initial={{ scaleX: 0, originX: '0%' }}
              animate={labelInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            />
          </motion.div>
        </div>
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {dept.members.map((m, i) => (
          <MemberCard
            key={m.name}
            name={m.name}
            role={m.role}
            color={dept.color}
            index={i}
            deptIndex={deptIndex}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
function Hero({ isDark }: { isDark: boolean }) {
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 600], [0, -120]);
  const fade     = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Radial center glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: parallax }}
      >
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 700, height: 700,
          background: isDark
            ? 'radial-gradient(circle, rgba(0,91,236,0.12) 0%, rgba(176,142,104,0.07) 45%, transparent 72%)'
            : 'radial-gradient(circle, rgba(0,91,236,0.07) 0%, rgba(176,142,104,0.04) 45%, transparent 72%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />
      </motion.div>

      {/* Eagle logo + watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ y: parallax, opacity: fade }}
      >
        <motion.img
          src="/assets/logo/logoprincipal.png"
          alt=""
          className="w-[420px] h-[420px] object-contain"
          style={{ opacity: isDark ? 0.04 : 0.06 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Orbit rings */}
      {[320, 480, 620].map((size, i) => (
        <motion.div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size, height: size,
            border: `1px solid ${i === 0 ? B.blue : B.gold}`,
            opacity: 0.06 + i * 0.02,
          }}
          animate={{ rotate: i % 2 === 0 ? [0, 360] : [0, -360] }}
          transition={{ duration: 30 + i * 12, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ opacity: fade }}
      >
        {/* Eyebrow */}
        <motion.div className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        >
          <motion.div className="h-px w-12 bg-agro-gold"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
          <span className="font-poppins font-bold text-[11px] uppercase tracking-[0.5em] text-agro-gold">
            A.A.A.B.J. · Estd. 2026–27
          </span>
          <motion.div className="h-px w-12 bg-agro-gold"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>

        {/* Title */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            className="font-space font-black text-[clamp(3rem,12vw,9rem)] uppercase leading-none tracking-tighter text-agro-blue"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.6, duration: 1.1, ease: EASE_SLOW }}
          >
            A Diretoria
          </motion.h1>
        </div>

        <div className="overflow-hidden mb-10">
          <motion.p
            className="font-space font-black text-[clamp(1.4rem,5vw,3.5rem)] uppercase leading-none tracking-tight text-agro-gold"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.85, duration: 1.1, ease: EASE_SLOW }}
          >
            Agrotóxica
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          className="flex items-center gap-8 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7, ease: EASE }}
        >
          {[
            { v: `${TOTAL_MEMBERS}`, l: 'Membros' },
            { v: `${DEPARTMENTS.length}`, l: 'Diretorias' },
            { v: '2026', l: 'Gestão' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-space font-black text-3xl text-agro-blue leading-none">{s.v}</span>
              <span className="font-poppins text-[10px] uppercase tracking-[0.4em] opacity-40 mt-1"
                style={{ color: isDark ? '#fff' : '#000' }}>
                {s.l}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <span className="font-poppins text-[9px] uppercase tracking-[0.5em] opacity-30"
            style={{ color: isDark ? '#fff' : '#000' }}>
            Rolar
          </span>
          <motion.div
            className="w-px h-10 bg-agro-gold/40"
            animate={{ scaleY: [0, 1, 0], originY: '0%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO MANIFESTO STRIP
// ─────────────────────────────────────────────────────────────────────────────
function ManifestoStrip({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });
  const text = 'ÁGUIA VOA COM ÁGUIA  ·  ESTD. 2026–27  ·  AGROTÓXICA  ·';
  const rep  = Array(8).fill(text).join('  ');

  return (
    <div ref={ref} className="relative w-full overflow-hidden py-5 mb-16"
      style={{
        borderTop:    `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
        background:   isDark ? 'rgba(0,91,236,0.04)' : 'rgba(0,91,236,0.02)',
      }}
    >
      <motion.div
        className="whitespace-nowrap font-space font-black text-[11px] uppercase tracking-[0.35em] text-agro-blue"
        style={{ opacity: 0.5 }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {rep}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER CTA
// ─────────────────────────────────────────────────────────────────────────────
function FooterCTA({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative w-full py-40 overflow-hidden flex flex-col items-center justify-center">
      {/* Bg glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% 100%, rgba(0,91,236,0.08) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 50% 100%, rgba(0,91,236,0.05) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6">
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(0,91,236,0.08)', border: '1.5px solid rgba(0,91,236,0.18)' }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: EASE_BACK }}
        >
          <img src="/assets/logo/logoprincipal.png" alt="Logo" className="w-14 h-14 object-contain" />
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2
            className="font-space font-black text-4xl md:text-6xl uppercase tracking-tight text-agro-blue leading-none"
            initial={{ y: '100%' }}
            animate={inView ? { y: '0%' } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_SLOW }}
          >
            Feito com<br />
            <span className="text-agro-gold">orgulho.</span>
          </motion.h2>
        </div>

        <motion.p
          className="font-poppins text-sm max-w-sm leading-relaxed"
          style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          Cada membro desta diretoria carrega a Agrotóxica no peito.<br />
          Gestão 2026–27 — Aqui a águia voa com a águia.
        </motion.p>

        <motion.div className="flex gap-3 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <Link href="/inicio">
            <motion.button
              className="px-8 py-3.5 rounded-2xl font-space font-bold text-sm uppercase tracking-widest bg-agro-blue text-white"
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px 6px rgba(0,91,236,0.3)' }}
              whileTap={{ scale: 0.96 }}
            >
              Ir para Início
            </motion.button>
          </Link>
          <Link href="/?skipIntro=true">
            <motion.button
              className="px-8 py-3.5 rounded-2xl font-space font-bold text-sm uppercase tracking-widest"
              style={{
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Ver Produtos
            </motion.button>
          </Link>
        </motion.div>

        <motion.p
          className="font-space text-[9px] uppercase tracking-[0.4em] mt-8"
          style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
        >
          Agrotóxica © 2026 · Site por Rodrigo Ivan
        </motion.p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DiretoriaPage() {
  const isDark = useIsDark();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter
    ? DEPARTMENTS.filter(d => d.id === activeFilter)
    : DEPARTMENTS;

  return (
    <main className="min-h-screen bg-agro-bg transition-colors duration-500" style={{ overflowX: 'hidden' }}>
      <CursorBlob isDark={isDark} />
      <Noise />
      <GridBg isDark={isDark} />
      <Hotbar />

      {/* Hero */}
      <Hero isDark={isDark} />

      {/* Marquee */}
      <ManifestoStrip isDark={isDark} />

      {/* Filter chips */}
      <div className="container mx-auto px-6 md:px-16 mb-12">
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setActiveFilter(null)}
            className="px-4 py-2 rounded-full font-space font-bold text-[10px] uppercase tracking-widest transition-all"
            style={{
              background: !activeFilter ? B.blue : 'transparent',
              color:      !activeFilter ? '#fff' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
              border:     !activeFilter ? '1px solid transparent' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
          >
            Todos · {TOTAL_MEMBERS}
          </motion.button>
          {DEPARTMENTS.map(d => (
            <motion.button
              key={d.id}
              onClick={() => setActiveFilter(activeFilter === d.id ? null : d.id)}
              className="px-4 py-2 rounded-full font-space font-bold text-[10px] uppercase tracking-widest transition-all"
              style={{
                background: activeFilter === d.id ? d.color : 'transparent',
                color:      activeFilter === d.id ? '#fff' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
                border:     activeFilter === d.id ? '1px solid transparent' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
            >
              {d.label} · {d.members.length}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Department sections */}
      <div className="container mx-auto px-6 md:px-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter ?? 'all'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {filtered.map((dept, i) => (
              <DeptSection key={dept.id} dept={dept} deptIndex={i} isDark={isDark} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <FooterCTA isDark={isDark} />
    </main>
  );
}