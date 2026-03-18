'use client';
import {
  useState, useEffect, useRef,
} from 'react';
import {
  motion, AnimatePresence,
  useInView, useScroll, useTransform,
  useMotionValue, useSpring,
} from 'framer-motion';

// ─── THEME ────────────────────────────────────────────────────────────────────
const GOLD = '#B08E68';
const BLUE = '#005BEC';
const E = [0.22, 1, 0.36, 1] as const;
const EB = [0.34, 1.56, 0.64, 1] as const;
const ES = [0.16, 1, 0.30, 1] as const;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 'intriga', day: '-5', label: 'Fase 01', title: 'INTRIGA',
    subtitle: '5 dias antes', color: GOLD, colorHex: '176,142,104', icon: '◈',
    description: 'Ativar o gatilho da curiosidade antes de revelar qualquer coisa.',
    actions: [
      'Postar detalhes das peças: texturas, bordados, silhuetas',
      'Não mostrar o produto completo — só fragmentos',
      'Manter o mistério nos stories e feed',
      'Criar expectativa sem entregar informação',
    ],
    metric: 'Engajamento', metricValue: 'Máximo',
  },
  {
    id: 'revelacao', day: '-3', label: 'Fase 02', title: 'REVELAÇÃO',
    subtitle: '3 dias antes', color: BLUE, colorHex: '0,91,236', icon: '◆',
    description: 'Mostrar oficialmente a coleção com toda a força visual.',
    actions: [
      'Apresentar as peças com vídeos estilo lookbook',
      'Publicar fotos editoriais de alta qualidade',
      'Destacar materiais, acabamentos e exclusividade',
      'Comunicar data e horário exato do drop',
    ],
    metric: 'Alcance', metricValue: 'Orgânico',
  },
  {
    id: 'experiencia', day: '-1', label: 'Fase 03', title: 'EXPERIÊNCIA',
    subtitle: '1 dia antes', color: GOLD, colorHex: '176,142,104', icon: '◇',
    description: 'Preparar o terreno mostrando como a compra vai funcionar.',
    actions: [
      'Mostrar navegação e interface do site em vídeo',
      'Demonstrar visualização das peças e detalhes',
      'Explicar processo de compra e prazo de entrega',
      'Criar antecipação final — últimas horas de espera',
    ],
    metric: 'Conversão', metricValue: 'Preparada',
  },
  {
    id: 'lancamento', day: '0', label: 'Fase 04', title: 'DROP',
    subtitle: 'Dia zero', color: '#D94F4F', colorHex: '217,79,79', icon: '●',
    description: 'O site abre. 72 horas. Quem perde espera o próximo.',
    actions: [
      'Anúncio oficial com link na bio',
      'Chamada direta e urgente para compra',
      'Ativar contagem regressiva de 72 horas',
      'Monitorar e repostar stories de compradores',
    ],
    metric: 'Janela', metricValue: '72h',
  },
];

const EXTRAS = [
  {
    id: 'escassez', icon: '⧖', title: 'Mecânica de Escassez', color: GOLD, colorHex: '176,142,104',
    items: [
      'Site aberto por tempo limitado (ex: 72h)',
      'Prazo curto aumenta urgência de compra',
      'Decisões rápidas — sem tempo para adiar',
      'Fechamento total após período — próxima chance: próximo semestre',
    ],
  },
  {
    id: 'social', icon: '◎', title: 'Prova Social', color: BLUE, colorHex: '0,91,236',
    items: [
      'Repostar stories de compradores durante a venda',
      'Publicar prints de pedidos confirmados',
      'Mostrar fotos de alunos com as peças',
      'Divulgar números de vendas em tempo real',
    ],
  },
  {
    id: 'gamificacao', icon: '◉', title: 'Gamificação', color: GOLD, colorHex: '176,142,104',
    items: [
      'Brindes para os primeiros compradores',
      'Adesivos ou patches exclusivos da atlética',
      'Impulso inicial nas primeiras horas de venda',
      'Ranking dos cursos que mais compraram',
    ],
  },
  {
    id: 'campus', icon: '⊕', title: 'Experiência no Campus', color: BLUE, colorHex: '0,91,236',
    items: [
      'Banners e cartazes com QR Code na faculdade',
      'QR Code leva para página com contagem regressiva',
      'Presença física reforça o digital',
      'Alcança alunos fora das redes sociais',
    ],
  },
];

// ─── DECORATIVE ───────────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.022]"
      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />
  );
}

function GridBg() {
  return (
    <div className="absolute inset-0 opacity-[0.022]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
  );
}

// ─── MOUSE ────────────────────────────────────────────────────────────────────
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

// ─── SPLIT TEXT ───────────────────────────────────────────────────────────────
function SplitIn({ text, delay = 0, stagger = 0.045 }: { text: string; delay?: number; stagger?: number }) {
  return (
    <span className="inline-flex overflow-hidden">
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

// ─── TICKER ───────────────────────────────────────────────────────────────────
function Ticker({ text, dir = 1, speed = 50, op = 0.07 }: { text: string; dir?: number; speed?: number; op?: number }) {
  const full = Array(8).fill(text).join('  ·  ');
  const dur = full.length / speed * 3;
  return (
    <div className="overflow-hidden whitespace-nowrap" style={{ opacity: op }}>
      <motion.div
        className="inline-block font-space font-black text-[10px] uppercase tracking-[0.35em] text-white"
        animate={{ x: dir === 1 ? [0, '-50%'] : ['-50%', 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
        style={{ willChange: 'transform' }}
      >{full + '  ·  ' + full}</motion.div>
    </div>
  );
}

// ─── PHASE CARD ───────────────────────────────────────────────────────────────
function PhaseCard({ phase, index, isActive, onClick }: {
  phase: typeof PHASES[0]; index: number; isActive: boolean; onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 60, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 1, delay: index * 0.12, ease: E }}
    >
      <motion.div onClick={onClick}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: E }}
        className="relative cursor-pointer rounded-3xl overflow-hidden select-none"
        style={{
          background: isActive
            ? `linear-gradient(135deg, rgba(${phase.colorHex},0.14) 0%, rgba(0,0,0,0.5) 100%)`
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isActive ? phase.color + '55' : 'rgba(255,255,255,0.06)'}`,
          backdropFilter: 'blur(20px)',
          transition: 'border-color 0.4s, background 0.4s',
        }}
      >
        {isActive && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(${phase.colorHex},0.18) 0%, transparent 65%)` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          />
        )}

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="font-space font-black text-[10px] uppercase tracking-[0.4em] block mb-2"
                style={{ color: phase.color + '70' }}>{phase.label}</span>
              <div className="flex items-baseline gap-3">
                <span className="font-space font-black text-5xl md:text-6xl leading-none"
                  style={{ color: phase.color }}>{phase.day}</span>
                <span className="font-poppins text-xs uppercase tracking-[0.3em] text-white/25">dias</span>
              </div>
            </div>
            <motion.div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: `rgba(${phase.colorHex},0.12)`,
                border: `1px solid rgba(${phase.colorHex},0.28)`,
                color: phase.color,
              }}
              animate={isActive ? {
                boxShadow: [`0 0 0px ${phase.color}00`, `0 0 18px rgba(${phase.colorHex},0.35)`, `0 0 0px ${phase.color}00`],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >{phase.icon}</motion.div>
          </div>

          <h3 className="font-space font-black text-3xl md:text-4xl uppercase tracking-tighter text-white mb-1 leading-none">
            {phase.title}
          </h3>
          <p className="font-poppins text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: phase.color + '60' }}>
            {phase.subtitle}
          </p>
          <p className="font-poppins text-sm text-white/35 leading-relaxed mb-5">{phase.description}</p>

          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: E }}
              >
                <div className="space-y-2 mb-5">
                  {phase.actions.map((a, i) => (
                    <motion.div key={i} className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <span className="text-[7px] mt-[5px] flex-shrink-0" style={{ color: phase.color }}>◆</span>
                      <p className="font-poppins text-xs text-white/55 leading-relaxed">{a}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 mt-2">
            <div className="h-[1px] flex-1"
              style={{ background: `linear-gradient(to right, rgba(${phase.colorHex},0.35), transparent)` }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: `rgba(${phase.colorHex},0.08)`, border: `1px solid rgba(${phase.colorHex},0.2)` }}>
              <span className="font-poppins text-[9px] uppercase tracking-widest" style={{ color: phase.color + '70' }}>
                {phase.metric}
              </span>
              <span className="font-space font-black text-[10px] uppercase" style={{ color: phase.color }}>
                {phase.metricValue}
              </span>
            </div>
          </div>
        </div>

        <motion.div className="absolute bottom-0 left-0 h-[2px] rounded-full" style={{ background: phase.color }}
          initial={{ width: '0%' }} animate={isActive ? { width: '100%' } : { width: '0%' }}
          transition={{ duration: 0.5, ease: E }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── EXTRA CARD ───────────────────────────────────────────────────────────────
function ExtraCard({ item, index }: { item: typeof EXTRAS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const [open, setOpen] = useState(false);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: E }}
    >
      <motion.div onClick={() => setOpen(!open)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-2xl p-6 cursor-pointer select-none"
        style={{
          background: open ? `rgba(${item.colorHex},0.06)` : 'rgba(255,255,255,0.025)',
          border: `1px solid ${open ? `rgba(${item.colorHex},0.25)` : 'rgba(255,255,255,0.06)'}`,
          backdropFilter: 'blur(16px)',
          transition: 'background 0.3s, border-color 0.3s',
        }}
        transition={{ duration: 0.25, ease: E }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: `rgba(${item.colorHex},0.12)`, color: item.color, border: `1px solid rgba(${item.colorHex},0.25)` }}>
              {item.icon}
            </div>
            <h4 className="font-space font-black text-sm md:text-base uppercase tracking-tight text-white">{item.title}</h4>
          </div>
          <motion.span className="font-space font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ color: item.color, background: `rgba(${item.colorHex},0.1)` }}
            animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }}
          >+</motion.span>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: E }}
            >
              <div className="space-y-2 pt-3">
                {item.items.map((it, i) => (
                  <motion.div key={i} className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <span className="text-[7px] mt-[5px] flex-shrink-0" style={{ color: item.color }}>◆</span>
                    <p className="font-poppins text-xs text-white/50 leading-relaxed">{it}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { x: mx, y: my } = useMouse();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const bgX = useTransform(mx, (v: number) => v * 0.006);
  const bgY = useTransform(my, (v: number) => v * 0.006);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 pt-20 overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: bgX, y: bgY }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: `radial-gradient(circle, ${BLUE}07 0%, transparent 65%)` }} />
      </motion.div>

      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ x: bgX, y: bgY }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.018 }} transition={{ duration: 2, delay: 0.5 }}
      >
        <span className="font-space font-black text-[22vw] uppercase leading-none text-white tracking-tighter">DROP</span>
      </motion.div>

      <motion.div className="absolute pointer-events-none rounded-full"
        style={{ width: 540, height: 540, border: `1px solid ${GOLD}07` }}
        animate={{ rotate: [0, 360], scale: [0.95, 1.05, 0.95] }}
        transition={{ rotate: { duration: 35, repeat: Infinity, ease: 'linear' }, scale: { duration: 9, repeat: Infinity } }}
      />
      <motion.div className="absolute pointer-events-none rounded-full"
        style={{ width: 360, height: 360, border: `1px dashed ${GOLD}05` }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
      />

      {[{ top: '18%', left: '7%' }, { top: '65%', right: '6%' }, { bottom: '22%', left: '11%' }, { top: '38%', right: '14%' }].map((pos, i) => (
        <motion.svg key={i} width="14" height="14" viewBox="0 0 24 24"
          className="absolute pointer-events-none"
          style={{ ...pos as any, color: GOLD, opacity: 0 }}
          animate={inView ? { opacity: [0, 0.22, 0.08] } : {}}
          transition={{ duration: 5, delay: i * 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
        </motion.svg>
      ))}

      <div className="relative z-10 text-center max-w-4xl w-full">
        <motion.div className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: E }}
        >
          <motion.div className="h-[1px]" style={{ background: GOLD }}
            initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 0.8, delay: 0.5 }}
          />
          <span className="font-poppins text-[10px] uppercase tracking-[0.5em]" style={{ color: GOLD + '70' }}>
            Estratégia de Lançamento · 2026
          </span>
          <motion.div className="h-[1px]" style={{ background: GOLD }}
            initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 0.8, delay: 0.6 }}
          />
        </motion.div>

        <h1 className="font-space font-black uppercase leading-[0.88] mb-6 tracking-tighter">
          <div className="text-[3.6rem] md:text-[6.5rem] text-white">
            <SplitIn text="LANÇAMENTO" delay={0.7} stagger={0.04} />
          </div>
          <div className="text-[3.6rem] md:text-[6.5rem]" style={{ color: GOLD }}>
            <SplitIn text="DO SITE" delay={1.1} stagger={0.06} />
          </div>
        </h1>

        <motion.p className="font-poppins text-sm text-white/30 max-w-sm mx-auto leading-relaxed mb-12"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8, ease: E }}
        >
          Guia completo de marketing para a diretoria — fases, mecânicas e estratégias do drop.
        </motion.p>

        <motion.div className="flex items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8, ease: E }}
        >
          {[{ v: '4', l: 'Fases' }, { v: '72h', l: 'Janela de Venda' }, { v: '8', l: 'Estratégias' }].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-space font-black text-3xl md:text-4xl" style={{ color: GOLD }}>{s.v}</p>
              <p className="font-poppins text-[9px] uppercase tracking-[0.3em] text-white/25 mt-1">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <p className="font-poppins text-[8px] uppercase tracking-[0.4em] text-white/18">Scroll</p>
        <div className="w-[1px] h-8" style={{ background: `linear-gradient(to bottom, ${GOLD}50, transparent)` }} />
      </motion.div>
    </section>
  );
}

// ─── PHASES ───────────────────────────────────────────────────────────────────
function PhasesSection() {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative z-10 py-28 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <motion.div className="flex items-center gap-4 mb-4"
            initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div className="h-[1px]" style={{ background: GOLD }}
              initial={{ width: 0 }} animate={inView ? { width: 36 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <span className="font-poppins text-[10px] uppercase tracking-[0.5em]" style={{ color: GOLD + '60' }}>Cronograma</span>
          </motion.div>
          <div className="overflow-hidden">
            <motion.h2 className="font-space font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none text-white"
              initial={{ y: '100%', filter: 'blur(8px)', opacity: 0 }}
              animate={inView ? { y: '0%', filter: 'blur(0px)', opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: ES }}
            >FASES DO <span style={{ color: GOLD }}>DROP</span></motion.h2>
          </div>
          <motion.p className="font-poppins text-sm text-white/28 mt-4 max-w-lg"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
          >
            Clique em cada fase para ver as ações detalhadas. O lançamento funciona como um drop de moda — exclusivo, urgente e limitado.
          </motion.p>
        </div>

        {/* Subtitle pills */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mb-6">
          {PHASES.map((p) => (
            <div key={p.id} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: `rgba(${p.colorHex},0.08)`, border: `1px solid rgba(${p.colorHex},0.18)` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                <span className="font-poppins text-[9px] uppercase tracking-widest" style={{ color: p.color + '80' }}>
                  {p.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="hidden lg:block relative h-[2px] mb-8">
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <motion.div className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${GOLD}, ${BLUE})` }}
            initial={{ width: '0%' }} animate={inView ? { width: '100%' } : {}}
            transition={{ duration: 1.6, delay: 0.5, ease: E }}
          />
          {PHASES.map((p, i) => (
            <motion.div key={p.id}
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full cursor-pointer z-10"
              style={{ left: `${(i / (PHASES.length - 1)) * 100}%`, marginLeft: -7, background: p.color, border: '2px solid #080808' }}
              animate={activePhase === p.id ? { scale: [1, 1.5, 1.3] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => setActivePhase(activePhase === p.id ? null : p.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PHASES.map((phase, i) => (
            <PhaseCard key={phase.id} phase={phase} index={i}
              isActive={activePhase === phase.id}
              onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
            />
          ))}
        </div>

        <motion.p className="text-center font-poppins text-[9px] uppercase tracking-[0.4em] text-white/13 mt-8"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}
        >Clique para expandir cada fase</motion.p>
      </div>
    </section>
  );
}

// ─── POSITIONING ──────────────────────────────────────────────────────────────
const PILLARS = [
  { icon: '⧖', label: 'Urgência', desc: 'Prazo curto força decisão imediata', color: GOLD, colorHex: '176,142,104' },
  { icon: '◈', label: 'Exclusividade', desc: 'Coleção do semestre — sem reposição', color: BLUE, colorHex: '0,91,236' },
  { icon: '◎', label: 'Conversa', desc: 'Gera buzz orgânico dentro da faculdade', color: GOLD, colorHex: '176,142,104' },
  { icon: '●', label: 'Pertencimento', desc: 'Quem compra faz parte de algo', color: BLUE, colorHex: '0,91,236' },
];

function PositioningSection() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftIn = useInView(leftRef, { once: true });
  const rightIn = useInView(rightRef, { once: true });

  return (
    <section className="relative z-10 py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div ref={leftRef}>
            <motion.span className="font-poppins text-[10px] uppercase tracking-[0.5em] block mb-5"
              style={{ color: GOLD + '60' }}
              initial={{ opacity: 0 }} animate={leftIn ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >Posicionamento</motion.span>
            <motion.h3 className="font-space font-black text-4xl md:text-5xl uppercase tracking-tighter text-white leading-[0.9] mb-6"
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={leftIn ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.9, delay: 0.3, ease: ES }}
            >NÃO É LOJA.<br /><span style={{ color: GOLD }}>É DROP.</span></motion.h3>
            <motion.p className="font-poppins text-sm text-white/38 leading-relaxed max-w-md mb-8"
              initial={{ opacity: 0, y: 15 }} animate={leftIn ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              O site abre por um período curto para pedidos da coleção da atlética. Depois disso, fecha.
              Quem compra faz parte da coleção daquele semestre — quem perde precisa esperar o próximo lançamento.
            </motion.p>
            <motion.div className="flex items-center gap-4"
              initial={{ opacity: 0 }} animate={leftIn ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}
            >
              <div className="h-[1px] w-8" style={{ background: GOLD }} />
              <span className="font-poppins text-[10px] uppercase tracking-[0.4em]" style={{ color: GOLD + '65' }}>
                Urgência · Exclusividade · Conversa
              </span>
            </motion.div>
          </div>

          <div ref={rightRef} className="grid grid-cols-2 gap-3">
            {PILLARS.map((item, i) => (
              <motion.div key={i} className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={rightIn ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: EB }}
                whileHover={{ y: -4, borderColor: `rgba(${item.colorHex},0.35)` }}
              >
                <div className="text-xl mb-3" style={{ color: item.color }}>{item.icon}</div>
                <p className="font-space font-black text-sm uppercase tracking-tight text-white mb-1">{item.label}</p>
                <p className="font-poppins text-[11px] text-white/33 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── EXTRAS ───────────────────────────────────────────────────────────────────
function ExtrasSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative z-10 py-24 px-6 md:px-12 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.013)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <motion.div className="flex items-center gap-4 mb-4"
              initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <motion.div className="h-[1px]" style={{ background: GOLD }}
                initial={{ width: 0 }} animate={inView ? { width: 32 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <span className="font-poppins text-[10px] uppercase tracking-[0.5em]" style={{ color: GOLD + '60' }}>Mecânicas</span>
            </motion.div>
            <motion.h2 className="font-space font-black text-4xl md:text-5xl uppercase tracking-tighter text-white leading-none"
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: ES }}
            >AMPLIFICADORES<br /><span style={{ color: GOLD }}>DO LANÇAMENTO</span></motion.h2>
          </div>
          <motion.p className="font-poppins text-[9px] uppercase tracking-[0.3em] text-white/18"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          >Clique para expandir</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXTRAS.map((item, i) => <ExtraCard key={item.id} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── PÓS-LANÇAMENTO ───────────────────────────────────────────────────────────
function PostLaunchSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative z-10 py-36 px-6 md:px-12 overflow-hidden flex items-center justify-center">
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 600, height: 600, border: `1px solid ${GOLD}06` }}
        animate={{ rotate: [0, 360] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, border: `1px dashed ${GOLD}05` }}
        animate={{ rotate: [360, 0] }} transition={{ duration: 65, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 max-w-2xl text-center">
        <motion.div className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
        >
          <motion.div className="h-[1px]" style={{ background: GOLD }}
            initial={{ width: 0 }} animate={inView ? { width: 32 } : {}} transition={{ duration: 0.6, delay: 0.4 }}
          />
          <span className="font-poppins text-[10px] uppercase tracking-[0.5em]" style={{ color: GOLD + '60' }}>Pós-Lançamento</span>
          <motion.div className="h-[1px]" style={{ background: GOLD }}
            initial={{ width: 0 }} animate={inView ? { width: 32 } : {}} transition={{ duration: 0.6, delay: 0.5 }}
          />
        </motion.div>

        <motion.h2 className="font-space font-black text-4xl md:text-6xl uppercase tracking-tighter text-white leading-[0.9] mb-8"
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.1, delay: 0.4, ease: ES }}
        >PRODUÇÃO<br /><span style={{ color: GOLD }}>INICIADA.</span></motion.h2>

        <motion.p className="font-poppins text-sm text-white/33 leading-relaxed mb-10 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
        >
          Após fechar os pedidos, comunicar que a produção começou e agradecer a participação.
          Isso reforça a exclusividade e cria antecipação para o próximo drop.
        </motion.p>

        <motion.div className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
        >
          {[
            { icon: '◆', label: 'Comunicar', desc: 'Produção iniciada' },
            { icon: '◈', label: 'Agradecer', desc: 'Exclusividade reforçada' },
            { icon: '●', label: 'Próximo drop', desc: 'Próximo semestre' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center"
              style={{ background: GOLD + '07', border: `1px solid ${GOLD}14` }}>
              <div className="text-base mb-2" style={{ color: GOLD }}>{s.icon}</div>
              <p className="font-space font-black text-xs uppercase tracking-tight text-white mb-1">{s.label}</p>
              <p className="font-poppins text-[10px] text-white/28">{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function MarketingCalendar() {
  const { scrollYProgress } = useScroll();
  const progressW = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden"
      style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>

      <motion.div className="fixed top-0 left-0 h-[2px] z-[100]" style={{ width: progressW, background: GOLD }} />
      <Scanlines />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${BLUE}06 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px]"
          style={{ background: `radial-gradient(circle at 100% 100%, ${GOLD}05 0%, transparent 70%)` }} />
        <GridBg />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between"
        style={{ background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: GOLD + '18', border: `1px solid ${GOLD}35` }}>
            <span className="text-xs" style={{ color: GOLD }}>◆</span>
          </div>
          <div>
            <p className="font-space font-black text-xs uppercase tracking-[0.25em] text-white">Agrotóxica</p>
            <p className="font-poppins text-[8px] uppercase tracking-[0.3em]" style={{ color: GOLD + '70' }}>Marketing · Diretoria</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: GOLD + '0D', border: `1px solid ${GOLD}22` }}>
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-space font-bold text-[9px] uppercase tracking-widest" style={{ color: GOLD }}>
            Acesso Restrito
          </span>
        </div>
      </header>

      <HeroSection />

      {/* Tickers */}
      <div className="relative z-10 overflow-hidden py-3 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.012)' }}>
        <Ticker text="LANÇAMENTO  ·  DROP LIMITADO  ·  72 HORAS  ·  EXCLUSIVO  ·  SAFRA 26  ·  SÓ PRA QUEM GUENTA" dir={1} speed={50} op={0.08} />
        <Ticker text="ESCASSEZ  ·  PROVA SOCIAL  ·  GAMIFICAÇÃO  ·  CAMPUS  ·  INTRIGA  ·  REVELAÇÃO  ·  EXPERIÊNCIA" dir={-1} speed={40} op={0.05} />
      </div>

      <PhasesSection />

      <div className="px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${GOLD}25, transparent)` }} />
      </div>

      <PositioningSection />

      <div className="px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${GOLD}18, transparent)` }} />
      </div>

      <ExtrasSection />
      <PostLaunchSection />

      <footer className="relative z-10 px-6 md:px-12 py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.5)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-space font-black text-[10px] uppercase tracking-[0.3em] text-white/18">Agrotóxica © 2026</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD + '50' }} />
            <p className="font-poppins text-[9px] uppercase tracking-[0.3em] text-white/14">
              Documento Interno · Diretoria de Marketing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}