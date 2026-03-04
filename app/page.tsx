'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// AMBIENTE DARK / MISTÉRIO (Partículas e Grid)
// ─────────────────────────────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#030508] z-0">
      {/* Grid Pulsante */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 91, 236, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 91, 236, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Scanline Overlay */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        }}
        animate={{ backgroundPositionY: ['0px', '100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Luz de Fundo Misteriosa */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(176,142,104,0.4) 0%, rgba(0,91,236,0.1) 60%, transparent 100%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL (Cofre / Login)
// ─────────────────────────────────────────────────────────────────────────────
export default function SecretVaultPage() {
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔒 A SENHA ULTRA SECRETA FICA AQUI (Mude para o que quiser)
  const SENHA_MESTRA = 'SISTEMABRUTO';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha.toUpperCase() === SENHA_MESTRA) {
      setStatus('success');
      // Espera 1.5s para a animação de sucesso rodar antes de jogar para a vitrine
      setTimeout(() => {
        router.push('/inicio');
      }, 1500);
    } else {
      setStatus('error');
      setSenha('');
      // Volta para o estado normal após o erro
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <main className="relative w-full h-screen flex items-center justify-center bg-[#030508] overflow-hidden font-poppins text-white">
      <AmbientBackground />

      <motion.div 
        className="relative z-10 flex flex-col items-center w-full max-w-md px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo Pulsante */}
        <motion.div 
          className="w-24 h-24 mb-10 relative flex items-center justify-center"
          animate={status === 'error' ? { x: [-10, 10, -10, 10, 0], filter: 'hue-rotate(90deg)' } : {}}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-2xl border border-agro-gold/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="absolute inset-2 rounded-xl border border-agro-blue/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <img 
            src="/assets/logo/logoprincipal.png" 
            alt="Agrotóxica" 
            className="w-12 h-12 object-contain"
            style={{ filter: status === 'success' ? 'drop-shadow(0 0 20px rgba(176,142,104,1))' : 'drop-shadow(0 0 10px rgba(176,142,104,0.3))' }}
          />
        </motion.div>

        {/* Títulos */}
        <div className="text-center mb-12 w-full">
          <motion.h1 
            className="font-space font-black text-2xl tracking-[0.4em] uppercase text-agro-gold mb-2"
          >
            Acesso Restrito
          </motion.h1>
          <p className="text-[10px] tracking-[0.3em] text-agro-blue/60 uppercase">
            Protocolo de segurança ativo
          </p>
        </div>

        {/* Formulário de Senha */}
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center relative">
          <div className="relative w-full mb-6 group">
            <input
              ref={inputRef}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={status === 'success'}
              placeholder="INSIRA A CHAVE DE ACESSO"
              className={`w-full bg-transparent border-b-2 text-center text-lg font-space tracking-[0.3em] py-4 outline-none transition-all duration-300 ${
                status === 'error' 
                  ? 'border-red-500/50 text-red-400 placeholder:text-red-500/30' 
                  : status === 'success'
                  ? 'border-green-500/50 text-green-400 placeholder:text-transparent'
                  : 'border-agro-blue/30 focus:border-agro-gold text-agro-gold placeholder:text-agro-blue/20'
              }`}
            />
            
            {/* Efeito de Scan na Borda do Input */}
            {status === 'idle' && (
              <motion.div 
                className="absolute bottom-[-2px] left-0 h-[2px] bg-agro-gold"
                initial={{ width: '0%', left: '0%' }}
                animate={{ width: ['0%', '30%', '0%'], left: ['0%', '70%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>

          {/* Feedback Visual */}
          <div className="h-8">
            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.p 
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs tracking-widest text-red-500 uppercase font-bold"
                >
                  [ ACESSO NEGADO ]
                </motion.p>
              )}
              {status === 'success' && (
                <motion.p 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs tracking-widest text-green-400 uppercase font-bold"
                >
                  [ ACESSO CONCEDIDO — INICIANDO SISTEMA ]
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button type="submit" className="hidden">Entrar</button>
        </form>

        {/* Rodapé / Meta Info */}
        <div className="absolute bottom-[-15vh] flex flex-col items-center opacity-30">
          <p className="text-[8px] font-space tracking-widest text-agro-blue uppercase">
            Agrotóxica © 2026 // Ambiente de Homologação
          </p>
        </div>
      </motion.div>

      {/* Marquee de Fundo Bem Discreto */}
      <div className="absolute bottom-10 w-full pointer-events-none opacity-[0.02] overflow-hidden">
        <motion.p 
          className="font-space font-black text-6xl whitespace-nowrap text-white"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          AGROTÓXICA · LOTE RESTRITO · AGUARDE O DESPERTAR · SISTEMA BRUTO · AGROTÓXICA · LOTE RESTRITO · AGUARDE O DESPERTAR · SISTEMA BRUTO · 
        </motion.p>
      </div>
    </main>
  );
}