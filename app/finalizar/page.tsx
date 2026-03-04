'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { products } from '../../data/products';

const EASE      = [0.22, 1, 0.36, 1] as const;
const EASE_BACK = [0.34, 1.56, 0.64, 1] as const;
const EASE_SHARP= [0.16, 1, 0.3, 1] as const;

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
// CURSOR BLOB & BACKGROUND ELEMENTS (Do seu layout base)
// ─────────────────────────────────────────────────────────────────────────────
function CursorBlob() {
  const x  = useMotionValue(0);
  const y  = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 45, damping: 20 });
  const sy = useSpring(y, { stiffness: 45, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        x: sx, y: sy, translateX: '-50%', translateY: '-50%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(176,142,104,0.07) 0%, rgba(0,91,236,0.04) 45%, transparent 70%)',
        filter: 'blur(50px)',
      }}
    />
  );
}

function Grid({ isDark }: { isDark: boolean }) {
  const color = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,91,236,0.04)';
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gridTemplateRows: 'repeat(8,1fr)' }}
    >
      {Array.from({ length: 96 }).map((_, i) => (
        <motion.div key={i} style={{ border: `0.5px solid ${color}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
          transition={{ duration: 6 + (i % 5), delay: (i * 0.05) % 4, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function Marquee({ text, dir = 1, speed = 55, opacity = 0.05, isDark }: {
  text: string; dir?: number; speed?: number; opacity?: number; isDark: boolean;
}) {
  const rep = Array(12).fill(text).join('  ·  ');
  return (
    <div className="overflow-hidden w-full">
      <motion.p
        className="font-space font-bold uppercase whitespace-nowrap text-xs tracking-[0.22em]"
        style={{ opacity, color: isDark ? '#fff' : '#000' }}
        animate={{ x: dir > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {rep}
      </motion.p>
    </div>
  );
}

function SplitIn({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {text.split('').map((c, i) => (
        <motion.span key={i} className="inline-block"
          initial={{ y: '110%', opacity: 0, rotateX: -80 }}
          animate={{ y: '0%', opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.65, delay: delay + i * 0.04, ease: EASE_SHARP }}
        >
          {c === ' ' ? '\u00A0' : c}
        </motion.span>
      ))}
    </span>
  );
}

function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span className="absolute inset-0 text-agro-gold select-none"
        style={{ clipPath: 'inset(30% 0 50% 0)' }}
        animate={{ x: [0, -5, 4, -2, 0], opacity: [0, 0.7, 0, 0.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 7 }}
      >{text}</motion.span>
      <motion.span className="absolute inset-0 text-red-500 select-none"
        style={{ clipPath: 'inset(60% 0 8% 0)', filter: 'blur(0.5px)' }}
        animate={{ x: [0, 6, -3, 3, 0], opacity: [0, 0.5, 0, 0.4, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 7, delay: 0.07 }}
      >{text}</motion.span>
      {text}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS DE SEGURANÇA
// ─────────────────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function FinalizarCheckout() {
  const isDark = useIsDark();
  const { items } = useCart();
  const [itensAdicionados, setItensAdicionados] = useState<string[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const todosAdicionados = items && items.length > 0 && itensAdicionados.length === items.length;

  const handleAdicionarAoCheers = (cartItemId: string, linkCheers?: string) => {
    const urlFinal = linkCheers || 'https://cheers.com.br/shop/6';
    window.open(urlFinal, '_blank');
    if (!itensAdicionados.includes(cartItemId)) {
      setItensAdicionados(prev => [...prev, cartItemId]);
    }
  };

  if (!montado) return null;

  return (
    <div className="min-h-screen relative overflow-hidden pb-40 transition-colors duration-500 bg-agro-bg">
      <CursorBlob />

      {/* ── Background Elements (Iguais da sua base) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Grid isDark={isDark} />
        <motion.div className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.007) 2px,rgba(255,255,255,0.007) 4px)'
              : 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.01) 2px,rgba(0,0,0,0.01) 4px)',
          }}
          animate={{ backgroundPositionY: ['0px','4px'] }}
          transition={{ duration: .14, repeat: Infinity, ease: 'linear' }}
        />

        {/* Big typographic backdrop */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: isDark ? 0.03 : 0.04, x: 0 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="absolute top-4 left-[-3%] leading-none select-none"
        >
          <GlitchText text="SAFE" className="font-space font-black text-[14rem] md:text-[20rem] uppercase text-agro-blue" />
        </motion.div>

        {/* Marquees */}
        <div className="absolute top-[7%] w-full flex flex-col gap-4">
          <Marquee isDark={isDark} text="AGROTÓXICA  ·  CHECKOUT SEGURO  ·  AMBIENTE CRIPTOGRAFADO  ·  SISTEMA BRUTO" dir={1} speed={58} opacity={0.05} />
        </div>
        <div className="absolute bottom-[6%] w-full flex flex-col gap-4">
          <Marquee isDark={isDark} text="DIRETO NO CHEERS  ·  AGROTÓXICA 2026  ·  COMPRA OFICIAL  ·  GARANTA O LOTE" dir={-1} speed={52} opacity={0.045} />
        </div>
        
        <div className="absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-6 pt-20 pb-10 relative z-10 max-w-4xl">

        <header className="mb-12">
          {/* 🚀 AQUI ESTÁ O BOTÃO ESTILO CÓDIGO (TERMINAL) */}
          <motion.div
            className="flex items-center mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              href="/carrinho"
              className="inline-flex items-center gap-2 font-mono text-xs md:text-sm px-4 py-2 rounded-md transition-colors group"
              style={{ 
                background: isDark ? '#1e1e1e' : '#f0f0f0', 
                border: isDark ? '1px solid #333' : '1px solid #ddd',
                color: isDark ? '#d4d4d4' : '#333'
              }}
            >
              <span className="text-agro-blue/70">cd</span> 
              <span className="text-agro-gold">"../carrinho"</span>
              <motion.span 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }} 
                className="w-2 h-4 inline-block ml-1" 
                style={{ background: isDark ? '#d4d4d4' : '#333' }}
              />
            </Link>
          </motion.div>

          <h1 className="font-space font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none text-agro-blue flex items-center gap-4">
            <LockIcon />
            <SplitIn text="Checkout " delay={0.2} />
            <SplitIn text="Seguro" className="text-agro-gold" delay={0.45} />
          </h1>

          <p className="font-poppins text-sm md:text-base text-agro-blue/60 mt-4 max-w-2xl leading-relaxed">
            Para garantir a segurança bancária e a emissão oficial dos seus produtos, a finalização é feita na plataforma <strong className="text-agro-blue">Cheers</strong>. Adicione os itens selecionados para prosseguir.
          </p>

          <div className="flex items-center gap-4 mt-6">
            <motion.div
              className="h-[2px] bg-gradient-to-r from-agro-gold via-agro-blue to-transparent rounded-full flex-1 max-w-md"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
            />
          </div>
        </header>

        {/* ── Checkout List ── */}
        <div className="flex flex-col gap-6">
          {!items || items.length === 0 ? (
            <div className="text-center p-10 rounded-3xl" style={{ border: '1px dashed rgba(176,142,104,0.3)' }}>
              <p className="font-space text-agro-blue/40 uppercase tracking-widest text-lg">Seu carrinho está vazio.</p>
              <Link href="/?skipIntro=true" className="text-agro-gold font-bold uppercase text-xs tracking-widest mt-4 inline-block hover:underline">
                Voltar à Loja
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-2">
                <span className="font-poppins text-xs uppercase tracking-[0.2em] text-agro-blue/40">Itens ({items.length})</span>
                <span className="font-poppins text-xs uppercase tracking-[0.2em] text-agro-blue/40">Ação Necessária</span>
              </div>

              {items.map((item, index) => {
                const uniqueCartId = `${item.id}-${item.size || 'unico'}-${index}`;
                const jaAdicionado = itensAdicionados.includes(uniqueCartId);
                const produtoOriginal = products.find((p: any) => p.id === item.id);
                const linkCheers = produtoOriginal?.linkCheers;

                return (
                  <motion.div 
                    key={uniqueCartId}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}
                    className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 rounded-3xl relative overflow-hidden group transition-all duration-500"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${jaAdicionado ? 'rgba(34,197,94,0.3)' : 'rgba(176,142,104,0.15)'}`,
                    }}
                  >
                    {/* Fundo dinâmico quando adicionado */}
                    {jaAdicionado && (
                      <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                    )}

                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center p-2 relative"
                        style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', border: '1px solid rgba(176,142,104,0.1)' }}
                      >
                        <img src={item.image} alt={item.nome} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-space font-black text-xl md:text-2xl text-agro-blue uppercase tracking-tighter">{item.nome}</span>
                        <div className="flex gap-3 text-xs text-agro-blue/50 font-poppins mt-1">
                          <span>QTD: {item.qty}</span>
                          {item.size && <span>| TAM: {item.size}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 w-full md:w-auto flex justify-end">
                      <button
                        onClick={() => handleAdicionarAoCheers(uniqueCartId, linkCheers)}
                        className={`flex items-center justify-center gap-2 px-6 py-4 w-full md:w-auto rounded-xl font-space text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                          jaAdicionado 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                          : 'bg-agro-gold text-[#110D09] hover:bg-[#c49d3a] shadow-[0_5px_20px_rgba(176,142,104,0.3)] hover:-translate-y-1'
                        }`}
                      >
                        {jaAdicionado ? (
                          <>✓ Adicionado</>
                        ) : (
                          <>Add Cheers <ExternalLinkIcon /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Botão Final */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <AnimatePresence mode="wait">
                  {todosAdicionados ? (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                      <button 
                        onClick={() => window.open('https://cheers.com.br/shop/6', '_blank')}
                        className="w-full md:w-2/3 py-5 rounded-2xl bg-agro-blue text-white font-space font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,91,236,0.3)] hover:shadow-[0_10px_50px_rgba(0,91,236,0.5)] transition-all hover:-translate-y-1 flex justify-center items-center gap-3 text-sm"
                      >
                        <LockIcon /> Ir para Pagamento
                      </button>
                      <p className="text-center text-xs text-green-500 mt-4 font-poppins tracking-widest uppercase">
                        ✓ Itens sincronizados. Você já pode finalizar.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                      <button disabled className="w-full md:w-2/3 py-5 rounded-2xl bg-agro-blue/10 border border-agro-blue/20 text-agro-blue/40 font-space font-bold uppercase tracking-[0.1em] cursor-not-allowed flex justify-center items-center gap-3 text-xs md:text-sm">
                        Adicione todos os itens para prosseguir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}