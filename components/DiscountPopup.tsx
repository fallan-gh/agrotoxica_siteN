'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// ─── Shape dos dados retornados pela API ─────────────────────────────────────
interface PopupConfig {
  active: boolean;
  title: string;
  discount: string;
  description: string;
  couponCode: string;
}

// ─── Cruzeta decorativa ───────────────────────────────────────────────────────
function CornerCross({ style }: { style: React.CSSProperties }) {
  return (
    <motion.svg
      width="20" height="20" viewBox="0 0 28 28"
      className="absolute text-agro-gold pointer-events-none"
      style={{ opacity: 0.6, ...style }}
    >
      <line x1="14" y1="0" x2="14" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
    </motion.svg>
  );
}

// ─── Glitch em palavras ───────────────────────────────────────────────────────
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        className="absolute inset-0 text-agro-gold"
        style={{ clipPath: 'inset(20% 0 60% 0)', filter: 'blur(0.5px)' }}
        animate={{ x: [0, -4, 2, -1, 0], opacity: [0, 0.8, 0, 0.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
      >{text}</motion.span>
      <motion.span
        className="absolute inset-0 text-agro-blue"
        style={{ clipPath: 'inset(60% 0 10% 0)' }}
        animate={{ x: [0, 5, -2, 3, 0], opacity: [0, 0.6, 0, 0.4, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, delay: 0.1 }}
      >{text}</motion.span>
      {text}
    </span>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [config, setConfig] = useState<PopupConfig | null>(null);

  useEffect(() => {
    // Não mostra se o usuário já pediu para não ver novamente
    const isHidden = localStorage.getItem('hideAgroDiscount');
    if (isHidden) return;

    // Busca configuração na API
    fetch('/api/popup')
      .then((res) => res.json())
      .then((data: PopupConfig) => {
        setConfig(data);
        if (data.active) {
          // Só agenda a abertura se o popup estiver ativo na API
          const timer = setTimeout(() => setIsOpen(true), 1500);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {
        // Se a API falhar, não abre o popup
        console.warn('[DiscountPopup] Falha ao buscar configuração da API.');
      });
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideAgroDiscount', 'true');
    }
    setIsOpen(false);
  };

  // Não renderiza nada enquanto a config não estiver carregada / inativa
  if (!config || !config.active) return null;

  // Separa a última palavra do título para aplicar o efeito glitch
  const titleWords = config.title.trim().split(' ');
  const lastWord = titleWords.pop() ?? '';
  const restTitle = titleWords.join(' ');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 pointer-events-none">

          {/* Overlay Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ backdropFilter: 'blur(8px) contrast(1.1)' }}
            className="absolute inset-0 bg-[#070502]/80 pointer-events-auto"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30, rotateX: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20, rotateX: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-agro-black border border-agro-gold/40 p-10 pointer-events-auto overflow-hidden"
            style={{ boxShadow: '0 0 60px -15px rgba(176,142,104,0.3)', perspective: '1000px' }}
          >
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(176,142,104,0.15) 2px, rgba(176,142,104,0.15) 3px)',
              }}
            />

            <CornerCross style={{ top: '10px', left: '10px' }} />
            <CornerCross style={{ top: '10px', right: '10px' }} />
            <CornerCross style={{ bottom: '10px', left: '10px' }} />
            <CornerCross style={{ bottom: '10px', right: '10px' }} />

            {/* Linhas pulsantes */}
            <motion.div
              className="absolute top-0 left-0 w-full h-[1px] bg-agro-gold"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-full h-[1px] bg-agro-gold"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-white/40 hover:text-red-500 transition-colors text-xl font-space font-bold cursor-pointer z-10"
              title="Close System"
            >
              [X]
            </button>

            <div className="relative z-10 text-center flex flex-col items-center">

              {/* Badge técnico */}
              <div className="mb-6 inline-flex items-center gap-2 border border-agro-gold/30 bg-agro-gold/10 px-3 py-1 text-[10px] tracking-[0.3em] font-space text-agro-gold uppercase">
                <span className="w-1.5 h-1.5 bg-agro-gold animate-pulse rounded-full" />
                LOTE RESTRITO
              </div>

              {/* Título Dinâmico + Glitch na última palavra */}
              <h2 className="font-space font-black text-6xl md:text-7xl text-white uppercase leading-[0.8] mb-4 tracking-tighter">
                {restTitle && <>{restTitle} <br /></>}
                <GlitchText text={lastWord} className="text-agro-gold" />
              </h2>

              {/* Desconto dinâmico */}
              <p className="font-space font-bold text-2xl text-white uppercase tracking-widest mb-6">
                {config.discount}
              </p>

              {/* Descrição dinâmica */}
              <p className="font-poppins text-white/60 mb-8 text-sm md:text-base leading-relaxed max-w-[85%]">
                {config.description}
              </p>

              {/* Box de Cupom Dinâmico */}
              <div className="w-full bg-[#0a0703] border border-agro-gold/20 p-4 mb-6 relative">
                <span className="absolute -top-2 left-4 bg-agro-black px-2 text-[10px] font-space text-agro-gold tracking-widest uppercase">
                  Código Autorizado
                </span>
                <p className="font-space font-black text-2xl text-agro-gold tracking-[0.2em] uppercase select-all">
                  {config.couponCode}
                </p>
              </div>

              {/* Botão com preenchimento dourado */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleClose}
                className="relative group w-full py-5 border border-agro-gold overflow-hidden cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 bg-agro-gold"
                  initial={{ x: '-101%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="relative z-10 font-space font-bold text-agro-gold group-hover:text-agro-black text-lg md:text-xl uppercase tracking-[0.2em] transition-colors duration-300">
                  AUTORIZAR DESCONTO
                </span>
              </motion.button>

              {/* Checkbox brutalista */}
              <div
                className="mt-6 flex items-center justify-center gap-3 cursor-pointer group"
                onClick={() => setDontShowAgain(!dontShowAgain)}
              >
                <div className={`w-4 h-4 border transition-all flex items-center justify-center
                  ${dontShowAgain ? 'bg-agro-gold border-agro-gold' : 'border-white/30 group-hover:border-agro-gold/50'}`}
                >
                  {dontShowAgain && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-agro-black" />}
                </div>
                <span className="font-space text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                  SUSPENDER ALERTA
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
