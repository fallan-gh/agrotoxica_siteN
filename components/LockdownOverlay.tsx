'use client';
import { motion } from 'framer-motion';

export default function LockdownOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] bg-agro-black flex flex-col items-center justify-center overflow-hidden font-space">

            {/* Grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(176,142,104,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(176,142,104,.05) 1px,transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            {/* Scanlines — usa sua classe globals.css */}
            <div className="scanline-sweep absolute inset-0 pointer-events-none"
                style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.2) 3px,rgba(0,0,0,.2) 4px)' }}
            />

            {/* Scanning beam */}
            <div
                className="absolute left-0 right-0 h-[2px] pointer-events-none"
                style={{ background: 'rgba(176,142,104,.1)', animation: 'agro-scan 5s linear infinite' }}
            />

            {/* Top stripe */}
            <div className="absolute top-0 left-0 right-0 h-7 overflow-hidden">
                <div className="absolute inset-0 opacity-[.08]" style={{
                    background: 'repeating-linear-gradient(90deg,#B08E68 0,#B08E68 18px,transparent 18px,transparent 36px)',
                    animation: 'stripe-fwd 1.5s linear infinite',
                }} />
                <div className="absolute inset-0 flex items-center px-4">
                    <span className="text-agro-gold/25 text-[8px] tracking-[.4em] uppercase">
                        ⚠ ACESSO RESTRITO — AGROTÓXICA OPERATIONS ⚠
                    </span>
                </div>
            </div>

            {/* Bottom stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-7 overflow-hidden">
                <div className="absolute inset-0 opacity-[.08]" style={{
                    background: 'repeating-linear-gradient(90deg,#B08E68 0,#B08E68 18px,transparent 18px,transparent 36px)',
                    animation: 'stripe-rev 1.5s linear infinite',
                }} />
            </div>

            {/* HUD Corners — usa sua animação hud-pulse */}
            <div className="absolute top-11 left-[18px] w-[30px] h-[30px] border-t border-l border-agro-gold/30"
                style={{ animation: 'hud-pulse 3s ease-in-out infinite' }} />
            <div className="absolute top-11 right-[18px] w-[30px] h-[30px] border-t border-r border-agro-gold/30"
                style={{ animation: 'hud-pulse 3s ease-in-out infinite .5s' }} />
            <div className="absolute bottom-11 left-[18px] w-[30px] h-[30px] border-b border-l border-agro-gold/30"
                style={{ animation: 'hud-pulse 3s ease-in-out infinite 1s' }} />
            <div className="absolute bottom-11 right-[18px] w-[30px] h-[30px] border-b border-r border-agro-gold/30"
                style={{ animation: 'hud-pulse 3s ease-in-out infinite 1.5s' }} />

            {/* Hex side codes — usa terminal-flicker */}
            <div className="absolute left-[9px] top-1/2 -translate-y-1/2 flex flex-col gap-[7px]"
                style={{ animation: 'terminal-flicker 6s ease-in-out infinite' }}>
                {['00','26','03','15','BR'].map(v => (
                    <span key={v} className="text-agro-gold/[.18] text-[8px] tracking-[.12em] select-none">{v}</span>
                ))}
            </div>
            <div className="absolute right-[9px] top-1/2 -translate-y-1/2 flex flex-col gap-[7px] items-end"
                style={{ animation: 'terminal-flicker 6s ease-in-out infinite 1s' }}>
                {['FF','A3','7C','01','AG'].map(v => (
                    <span key={v} className="text-agro-gold/[.18] text-[8px] tracking-[.12em] select-none">{v}</span>
                ))}
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg w-full"
            >
                {/* Lock icon — usa dot-pulse */}
                <div className="mb-5 text-red-500/60" style={{ animation: 'dot-pulse 2.8s ease-in-out infinite' }}>
                    <svg width="40" height="40" viewBox="0 0 42 42" fill="none">
                        <rect x="7" y="18" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M13 18V13C13 8.03 17.03 4 22 4C26.97 4 31 8.03 31 13V18" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="22" cy="28" r="2.5" fill="currentColor" />
                        <line x1="22" y1="30.5" x2="22" y2="34" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </div>

                {/* Title — glitch via glitch-layer-1/2 do globals.css */}
                <div className="relative leading-[.88] mb-1">
                    <h1 className="font-poppins font-black text-agro-gold uppercase leading-[.88] tracking-[.06em]"
                        style={{ fontSize: 'clamp(58px, 11vw, 90px)' }}>
                        SISTEMA
                    </h1>
                    {/* Glitch layers — suas classes do globals.css */}
                    <span aria-hidden className="glitch-layer-1 font-poppins font-black text-agro-blue uppercase tracking-[.06em] absolute inset-0 opacity-0"
                        style={{ fontSize: 'clamp(58px, 11vw, 90px)', clipPath: 'polygon(0 0,100% 0,100% 40%,0 40%)' }}>
                        SISTEMA
                    </span>
                    <span aria-hidden className="glitch-layer-2 font-poppins font-black text-agro-gold uppercase tracking-[.06em] absolute inset-0 opacity-0"
                        style={{ fontSize: 'clamp(58px, 11vw, 90px)', clipPath: 'polygon(0 60%,100% 60%,100% 100%,0 100%)' }}>
                        SISTEMA
                    </span>
                </div>
                <h1 className="font-poppins font-black text-agro-bg/92 uppercase leading-[1] tracking-[.06em] mb-7"
                    style={{ fontSize: 'clamp(58px, 11vw, 90px)' }}>
                    BLOQUEADO
                </h1>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full mb-5">
                    <div className="flex-1 h-px bg-agro-gold/15" />
                    <div className="w-[5px] h-[5px] bg-agro-gold/35 rotate-45 shrink-0" />
                    <div className="flex-1 h-px bg-agro-gold/15" />
                </div>

                {/* Body */}
                <p className="text-agro-bg/28 text-[13px] leading-relaxed mb-6">
                    O terminal de acesso da{' '}
                    <span className="text-agro-gold font-bold">Agrotóxica</span>{' '}
                    encontra-se em manutenção programada ou com a janela de pedidos encerrada.
                </p>

                {/* Status block — usa terminal-flicker */}
                <div
                    className="w-full p-4 relative border border-red-500/[.14] bg-red-500/[.04]"
                    style={{ animation: 'terminal-flicker 8s ease-in-out infinite' }}
                >
                    <div className="absolute -top-px left-6 right-6 h-px bg-red-500/25" />
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-[7px] h-[7px] rounded-full bg-red-500 shrink-0"
                                style={{ animation: 'dot-pulse 1.4s ease-in-out infinite' }}
                            />
                            <span className="text-red-400/60 text-[9px] tracking-[.3em] uppercase font-semibold">
                                Terminal em Standby
                            </span>
                        </div>
                        <span className="text-agro-bg/15 text-[9px] tracking-widest">ERR:0x4F3A</span>
                    </div>
                    <div className="text-agro-bg/[.18] text-[9px] tracking-[.18em]">
                        SYS_LOCK — Aguardando autorização{' '}
                        {/* usa cursor-blink do globals.css */}
                        <span style={{ animation: 'cursor-blink 1s step-end infinite' }}>_</span>
                    </div>
                </div>
            </motion.div>

            {/* Footer — usa terminal-flicker */}
            <div
                className="absolute bottom-9 flex items-center gap-4 select-none"
                style={{ animation: 'terminal-flicker 10s ease-in-out infinite 2s' }}
            >
                <span className="text-agro-blue/20 text-[8px] tracking-[.5em] uppercase">AGT-OPS</span>
                <div className="w-px h-3 bg-agro-blue/20" />
                <span className="text-agro-blue/20 text-[8px] tracking-[.5em] uppercase">© 2026</span>
                <div className="w-px h-3 bg-agro-blue/20" />
                <span className="text-agro-blue/20 text-[8px] tracking-[.5em] uppercase">v2.4.1</span>
            </div>
        </div>
    );
}