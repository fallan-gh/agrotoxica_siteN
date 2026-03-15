'use client';
import { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll,
    AnimatePresence,
} from 'framer-motion';
import { CursorBlob, Scanlines, Noise, Marquee, Grid } from '@/components/effects/SharedEffects';
import { isMobile, GPU_STYLE, useIsDark, useReducedMotion, useRafThrottle } from '@/lib/perf';

// ─────────────────────────────────────────────────────────────────────────────
// EASING CURVES
// ─────────────────────────────────────────────────────────────────────────────
const E = [0.22, 1, 0.36, 1] as const;
const EB = [0.34, 1.56, 0.64, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTES (dark=terminal / light=ivory)
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = {
    dark: {
        bg: '#0C0A08',
        bgAlt: '#141110',
        text: '#F7F2EB',
        accent: '#B08E68',
        accentDim: 'rgba(176,142,104,0.15)',
        blue: '#005BEC',
        green: '#25D366',  // WhatsApp brand green
        greenDim: 'rgba(37,211,102,0.12)',
        greenGlow: 'rgba(37,211,102,0.35)',
        red: '#EA4335',  // Email accent
        redDim: 'rgba(234,67,53,0.10)',
        redGlow: 'rgba(234,67,53,0.30)',
        cardBg: 'rgba(255,255,255,0.02)',
        cardBorder: 'rgba(176,142,104,0.12)',
        glow: 'rgba(176,142,104,0.06)',
        scanline: 'rgba(255,255,255,0.008)',
    },
    light: {
        bg: '#F7F2EB',
        bgAlt: '#EDE7DD',
        text: '#110D09',
        accent: '#8B6E4E',
        accentDim: 'rgba(139,110,78,0.12)',
        blue: '#003DA6',
        green: '#128C7E',
        greenDim: 'rgba(18,140,126,0.10)',
        greenGlow: 'rgba(18,140,126,0.25)',
        red: '#C5221F',
        redDim: 'rgba(197,34,31,0.08)',
        redGlow: 'rgba(197,34,31,0.20)',
        cardBg: 'rgba(0,0,0,0.02)',
        cardBorder: 'rgba(139,110,78,0.15)',
        glow: 'rgba(139,110,78,0.08)',
        scanline: 'rgba(0,0,0,0.012)',
    },
};

type Palette = typeof PALETTES.dark | typeof PALETTES.light;

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────
const WhatsAppIcon = memo(function WhatsAppIcon({ size = 48, color = '#25D366' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
});

const EmailIcon = memo(function EmailIcon({ size = 48, color = '#EA4335' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
        </svg>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// HUD CORNER BRACKETS — decorative reticle corners on cards
// ─────────────────────────────────────────────────────────────────────────────
const HUDCorners = memo(function HUDCorners({ color, visible }: { color: string; visible: boolean }) {
    const cornerStyle = (pos: React.CSSProperties): React.CSSProperties => ({
        position: 'absolute',
        width: 18,
        height: 18,
        borderColor: color,
        opacity: visible ? 0.8 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
        ...pos,
    });

    return (
        <>
            <span style={{ ...cornerStyle({ top: 8, left: 8 }), borderTop: '2px solid', borderLeft: '2px solid' }} />
            <span style={{ ...cornerStyle({ top: 8, right: 8 }), borderTop: '2px solid', borderRight: '2px solid' }} />
            <span style={{ ...cornerStyle({ bottom: 8, left: 8 }), borderBottom: '2px solid', borderLeft: '2px solid' }} />
            <span style={{ ...cornerStyle({ bottom: 8, right: 8 }), borderBottom: '2px solid', borderRight: '2px solid' }} />
        </>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// CROSSHAIR RETICLE — decorative element
// ─────────────────────────────────────────────────────────────────────────────
const Crosshair = memo(function Crosshair({ style, color }: { style: React.CSSProperties; color: string }) {
    return (
        <svg
            width="32" height="32" viewBox="0 0 32 32"
            className="absolute pointer-events-none"
            style={{ ...style, animation: 'hud-pulse 3s ease-in-out infinite', ...GPU_STYLE }}
        >
            <circle cx="16" cy="16" r="8" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" />
            <circle cx="16" cy="16" r="1.5" fill={color} opacity="0.6" />
            <line x1="16" y1="0" x2="16" y2="10" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="16" y1="22" x2="16" y2="32" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="16" x2="10" y2="16" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="22" y1="16" x2="32" y2="16" stroke={color} strokeWidth="0.5" opacity="0.3" />
        </svg>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// RADAR RING — rotating ring background decoration
// ─────────────────────────────────────────────────────────────────────────────
const RadarRing = memo(function RadarRing({ size, color, duration, dashed }: {
    size: number; color: string; duration: number; dashed?: boolean;
}) {
    return (
        <div
            className="absolute pointer-events-none"
            style={{
                width: size, height: size,
                top: '50%', left: '50%',
                marginTop: -size / 2, marginLeft: -size / 2,
                border: dashed ? `1px dashed ${color}` : `1px solid ${color}`,
                borderRadius: '50%',
                animation: `radar-sweep ${duration}s linear infinite`,
                ...GPU_STYLE,
            }}
        />
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// COORDINATE LABEL — small tactical HUD text
// ─────────────────────────────────────────────────────────────────────────────
const CoordLabel = memo(function CoordLabel({ text, style, color }: {
    text: string; style: React.CSSProperties; color: string;
}) {
    return (
        <span
            className="absolute font-space font-bold text-[9px] tracking-[0.3em] uppercase pointer-events-none select-none"
            style={{
                color,
                opacity: 0.25,
                animation: 'terminal-flicker 6s ease-in-out infinite',
                ...style,
            }}
        >
            {text}
        </span>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTION MODULE CARD — magnetic hover + glitch border + HUD corners
// ─────────────────────────────────────────────────────────────────────────────
function ActionModule({ C, type, index, mobile }: {
    C: Palette; type: 'whatsapp' | 'email'; index: number; mobile: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Magnetic tilt values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
    const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (mobile || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        rotateY.set(dx * 8);
        rotateX.set(-dy * 8);
    }, [mobile, rotateX, rotateY]);

    const handleMouseLeave = useCallback(() => {
        setHovered(false);
        rotateX.set(0);
        rotateY.set(0);
    }, [rotateX, rotateY]);

    const isWhatsApp = type === 'whatsapp';
    const brandColor = isWhatsApp ? C.green : C.red;
    const brandDim = isWhatsApp ? C.greenDim : C.redDim;
    const brandGlow = isWhatsApp ? C.greenGlow : C.redGlow;
    const href = isWhatsApp
        ? 'https://wa.me/5500000000000'
        : 'mailto:contato@agrotoxica.com';
    const label = isWhatsApp ? 'WhatsApp' : 'E-mail';
    const subtitle = isWhatsApp
        ? 'Fale direto pelo WhatsApp — resposta imediata'
        : 'Envie um e-mail — atendimento empresarial';
    const statusText = isWhatsApp ? 'ONLINE · 24/7' : 'ATIVO · RESPOSTA EM 24H';

    return (
        <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 1.2 + index * 0.2, ease: E }}
        >
            <a
                href={href}
                target={isWhatsApp ? '_blank' : undefined}
                rel={isWhatsApp ? 'noopener noreferrer' : undefined}
                className="block"
            >
                <motion.div
                    ref={cardRef}
                    className="relative overflow-hidden"
                    style={{
                        background: hovered ? brandDim : C.cardBg,
                        border: `1px solid ${hovered ? brandColor : C.cardBorder}`,
                        borderRadius: 16,
                        padding: mobile ? '32px 24px' : '48px 40px',
                        minHeight: mobile ? 220 : 320,
                        perspective: 600,
                        rotateX: mobile ? 0 : springX,
                        rotateY: mobile ? 0 : springY,
                        boxShadow: hovered ? `0 0 60px ${brandGlow}, inset 0 0 30px ${brandDim}` : `0 4px 30px rgba(0,0,0,0.2)`,
                        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.5s ease',
                        ...GPU_STYLE,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={handleMouseLeave}
                    whileTap={{ scale: 0.97 }}
                >
                    {/* HUD corner brackets */}
                    <HUDCorners color={brandColor} visible={hovered} />

                    {/* Top-left module code */}
                    <span
                        className="absolute top-4 left-5 font-space font-bold text-[10px] tracking-[0.4em] uppercase"
                        style={{ color: C.accent, opacity: 0.3 }}
                    >
                        MOD-{String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Status indicator */}
                    <div className="absolute top-4 right-5 flex items-center gap-2">
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                background: brandColor,
                                boxShadow: `0 0 8px ${brandColor}`,
                                animation: 'dot-pulse 1.5s ease-in-out infinite',
                            }}
                        />
                        <span
                            className="font-space font-bold text-[8px] tracking-[0.3em] uppercase"
                            style={{ color: brandColor, opacity: 0.7 }}
                        >
                            {statusText}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-start mt-8">
                        {/* Icon */}
                        <motion.div
                            className="mb-6 relative"
                            animate={hovered ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ duration: 0.4, ease: E }}
                        >
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: brandDim,
                                    filter: hovered ? `blur(20px)` : 'blur(10px)',
                                    transform: 'scale(2.5)',
                                    opacity: hovered ? 0.8 : 0.3,
                                    transition: 'all 0.5s ease',
                                }}
                            />
                            <div className="relative">
                                {isWhatsApp
                                    ? <WhatsAppIcon size={mobile ? 40 : 52} color={brandColor} />
                                    : <EmailIcon size={mobile ? 40 : 52} color={brandColor} />
                                }
                            </div>
                        </motion.div>

                        {/* Title */}
                        <h3
                            className="font-space font-bold text-3xl md:text-5xl uppercase tracking-tight leading-none mb-3"
                            style={{ color: C.text }}
                        >
                            {label}
                        </h3>

                        {/* Subtitle */}
                        <p
                            className="font-poppins text-sm md:text-base leading-relaxed mb-8 max-w-xs"
                            style={{ color: C.text, opacity: 0.5 }}
                        >
                            {subtitle}
                        </p>

                        {/* CTA Bar */}
                        <motion.div
                            className="flex items-center gap-3 px-5 py-3 rounded-lg"
                            style={{
                                background: hovered ? brandColor : 'transparent',
                                border: `1px solid ${hovered ? brandColor : C.cardBorder}`,
                                transition: 'all 0.4s ease',
                            }}
                            animate={hovered ? { x: 4 } : { x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span
                                className="font-space font-bold text-xs uppercase tracking-[0.2em]"
                                style={{
                                    color: hovered ? (isWhatsApp ? '#000' : '#FFF') : C.text,
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                {isWhatsApp ? 'Iniciar Conversa' : 'Enviar E-mail'}
                            </span>
                            <motion.span
                                className="text-lg"
                                animate={hovered ? { x: 4 } : { x: 0 }}
                                transition={{ duration: 0.3, ease: E }}
                                style={{ color: hovered ? (isWhatsApp ? '#000' : '#FFF') : C.accent }}
                            >
                                →
                            </motion.span>
                        </motion.div>
                    </div>

                    {/* Bottom decorative line */}
                    <div
                        className="absolute bottom-0 left-0 h-[2px] rounded-full"
                        style={{
                            width: hovered ? '100%' : '0%',
                            background: `linear-gradient(90deg, ${brandColor}, transparent)`,
                            transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                            ...GPU_STYLE,
                        }}
                    />

                    {/* Glitch border layer on hover */}
                    {hovered && !mobile && (
                        <div
                            className="absolute inset-0 pointer-events-none rounded-2xl glitch-layer-1"
                            style={{
                                border: `1px solid ${brandColor}`,
                                opacity: 0.4,
                            }}
                        />
                    )}
                </motion.div>
            </a>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TERMINAL BACKGROUND — multi-layered parallax
// ─────────────────────────────────────────────────────────────────────────────
function TerminalBackground({ C, mobile }: { C: Palette; mobile: boolean }) {
    const { scrollYProgress } = useScroll();
    // bg parallax uses raw scrollYProgress, moving slightly downwards while we scroll right
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-3%']);
    const midY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <CursorBlob isDark={C.bg === PALETTES.dark.bg} />
            <Scanlines isDark={C.bg === PALETTES.dark.bg} />

            {/* LAYER 1 — Background: large watermark text + grid (slowest parallax) */}
            <motion.div
                className="absolute inset-0"
                style={{ y: mobile ? 0 : bgY, ...GPU_STYLE }}
            >
                {!mobile && <Grid isDark={C.bg === PALETTES.dark.bg} />}

                {/* Large watermark */}
                <div className="absolute top-[10%] left-[-3%] select-none pointer-events-none" style={{ opacity: 0.03 }}>
                    <span className="font-space font-black text-[12rem] md:text-[18rem] uppercase leading-none" style={{ color: C.accent }}>
                        SUPORTE
                    </span>
                </div>

                {/* Secondary watermark */}
                {!mobile && (
                    <div className="absolute bottom-[15%] right-[-2%] select-none pointer-events-none" style={{ opacity: 0.02 }}>
                        <span className="font-space font-black text-[10rem] uppercase leading-none" style={{ color: C.text }}>
                            TERMINAL
                        </span>
                    </div>
                )}
            </motion.div>

            {/* LAYER 2 — Mid-ground: radar rings + coordinates (medium parallax) */}
            <motion.div
                className="absolute inset-0"
                style={{ y: mobile ? 0 : midY, ...GPU_STYLE }}
            >
                <RadarRing size={600} color={`${C.accent}22`} duration={45} />
                <RadarRing size={900} color={`${C.accent}11`} duration={65} dashed />
                {!mobile && <RadarRing size={1300} color={`${C.accent}08`} duration={90} />}

                {/* Coordinate labels */}
                <CoordLabel text="LAT -23.5505" style={{ top: '8%', left: '5%' }} color={C.accent} />
                <CoordLabel text="LNG -46.6333" style={{ top: '8%', right: '5%' }} color={C.accent} />
                {!mobile && <CoordLabel text="SYS::AGROTÓXICA" style={{ bottom: '12%', left: '5%' }} color={C.accent} />}
                {!mobile && <CoordLabel text="SEC::VIP-TERMINAL" style={{ bottom: '12%', right: '5%' }} color={C.accent} />}
            </motion.div>

            {/* LAYER 3 — Foreground: crosshairs + decorative elements (normal speed) */}
            <div className="absolute inset-0">
                <Crosshair style={{ top: '4%', left: '3%' }} color={C.accent} />
                <Crosshair style={{ top: '4%', right: '3%' }} color={C.accent} />
                {!mobile && <Crosshair style={{ bottom: '8%', left: '3%' }} color={C.accent} />}
                {!mobile && <Crosshair style={{ bottom: '8%', right: '3%' }} color={C.accent} />}
            </div>

            {/* Marquee tickers */}
            <div className="absolute top-[6%] w-full">
                <Marquee
                    text="AGROTÓXICA  ·  SUPORTE VIP  ·  TERMINAL DE ATENDIMENTO  ·  SISTEMA BRUTO"
                    dir={1} speed={55} op={0.04}
                    isDark={C.bg === PALETTES.dark.bg}
                />
            </div>
            <div className="absolute bottom-[6%] w-full">
                <Marquee
                    text="CANAL DIRETO  ·  RESPOSTA IMEDIATA  ·  AGROTÓXICA 2026  ·  SEM ANTÍDOTO"
                    dir={-1} speed={48} op={0.035} size="text-sm"
                    isDark={C.bg === PALETTES.dark.bg}
                />
            </div>

            <Noise />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2D SPATIAL SCROLL ZONES (desktop only)
// ─────────────────────────────────────────────────────────────────────────────
function SpatialScroll({ C, mobile, children }: {
    C: Palette; mobile: boolean; children: React.ReactNode;
}) {
    // Determine translation progress from total scroll height
    const { scrollYProgress } = useScroll();

    // We have 3 screens, so to view all 3, we need to translate by -66.666%
    const x = useTransform(scrollYProgress, [0, 1], ['0%', '-66.666%']);

    if (mobile) {
        // On mobile: standard vertical stack
        return <div className="relative z-10 w-full">{children}</div>;
    }

    // Desktop: tall wrapper enables native vertical scroll down the page
    return (
        <div className="relative z-10 w-full" style={{ height: '300vh' }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <motion.div
                    className="flex w-[300vw] h-full"
                    style={{ x, ...GPU_STYLE }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE PANELS — content sections within the 2D spatial layout
// ─────────────────────────────────────────────────────────────────────────────
function ZoneManifesto({ C, mobile }: { C: Palette; mobile: boolean }) {
    return (
        <div
            className={mobile ? 'w-full px-6 pt-32 pb-12' : 'w-[100vw] min-h-screen flex flex-col justify-center px-16'}
            style={{ scrollSnapAlign: 'start' }}
        >
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: E }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-[2px]" style={{ background: C.accent }} />
                    <span
                        className="font-space font-bold text-[10px] tracking-[0.5em] uppercase"
                        style={{ color: C.accent }}
                    >
                        Canal VIP
                    </span>
                </div>

                <h1
                    className="font-space font-bold text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.9] mb-8"
                    style={{ color: C.text }}
                >
                    Suporte<br />
                    <span style={{ color: C.accent }}>Terminal</span>
                </h1>

                <motion.div
                    className="h-[3px] rounded-full mb-8"
                    style={{
                        width: mobile ? '70%' : '40%',
                        background: `linear-gradient(90deg, ${C.accent}, ${C.blue}, transparent)`,
                    }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.4, delay: 0.8, ease: E }}
                />

                <p
                    className="font-poppins text-sm md:text-base leading-relaxed max-w-md"
                    style={{ color: C.text, opacity: 0.45 }}
                >
                    Você está acessando o terminal de atendimento da Agrotóxica.
                    Escolha seu canal — resposta garantida, sem enrolação.
                </p>
            </motion.div>
        </div>
    );
}

function ZoneModules({ C, mobile }: { C: Palette; mobile: boolean }) {
    return (
        <div
            className={
                mobile
                    ? 'w-full px-6 py-8'
                    : 'w-[100vw] min-h-screen flex flex-col justify-center px-16'
            }
            style={{ scrollSnapAlign: 'start' }}
        >
            <div className={mobile ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-10 max-w-5xl mx-auto'}>
                <ActionModule C={C} type="whatsapp" index={0} mobile={mobile} />
                <ActionModule C={C} type="email" index={1} mobile={mobile} />
            </div>
        </div>
    );
}

function ZoneFAQ({ C, mobile }: { C: Palette; mobile: boolean }) {
    const faqs = [
        { q: 'Qual o prazo de entrega?', a: 'Entregamos em todo o Brasil em até 15 dias úteis.' },
        { q: 'Posso trocar minha peça?', a: 'Sim, aceitamos trocas em até 30 dias após a compra.' },
        { q: 'Vocês enviam para fora do Brasil?', a: 'No momento atendemos apenas o território nacional.' },
        { q: 'Como acompanho meu pedido?', a: 'Você recebe o código de rastreio por e-mail e WhatsApp.' },
    ];

    return (
        <div
            className={
                mobile
                    ? 'w-full px-6 py-12 pb-32'
                    : 'w-[100vw] min-h-screen flex flex-col justify-center px-16'
            }
            style={{ scrollSnapAlign: 'start' }}
        >
            <motion.div
                className="max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8, ease: E }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-6 h-[2px]" style={{ background: C.accent }} />
                    <span
                        className="font-space font-bold text-[10px] tracking-[0.4em] uppercase"
                        style={{ color: C.accent }}
                    >
                        Perguntas Frequentes
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            className="p-5 rounded-xl"
                            style={{
                                background: C.cardBg,
                                border: `1px solid ${C.cardBorder}`,
                            }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 2.0 + i * 0.12, ease: E }}
                        >
                            <h4
                                className="font-space font-bold text-sm uppercase tracking-wide mb-2"
                                style={{ color: C.text }}
                            >
                                {faq.q}
                            </h4>
                            <p
                                className="font-poppins text-xs leading-relaxed"
                                style={{ color: C.text, opacity: 0.5 }}
                            >
                                {faq.a}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC INTRO OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function CinematicIntro({ C, onComplete }: { C: Palette; onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: C.bg }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Scanline layer */}
            <div
                className="absolute inset-0 pointer-events-none scanline-sweep"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 2px,${C.scanline} 2px,${C.scanline} 4px)`,
                    ...GPU_STYLE,
                }}
            />

            {/* Center content */}
            <div className="relative flex flex-col items-center">
                {/* Flashing TERMINAL ATIVO text */}
                <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 1, 0.7, 1], scale: 1 }}
                    transition={{ duration: 1.2, ease: E }}
                >
                    <span
                        className="font-space font-black text-3xl md:text-5xl uppercase tracking-[0.3em] block text-center"
                        style={{
                            color: C.accent,
                            textShadow: `0 0 30px ${C.glow}`,
                            animation: 'terminal-flicker 2s ease-in-out infinite',
                        }}
                    >
                        Terminal Ativo
                    </span>
                </motion.div>

                {/* Status line */}
                <motion.p
                    className="font-space text-[10px] tracking-[0.6em] uppercase mt-4"
                    style={{ color: C.text, opacity: 0.3 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.3, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    Inicializando módulos de suporte...
                </motion.p>

                {/* Loading bar */}
                <motion.div
                    className="mt-6 h-[2px] rounded-full"
                    style={{ background: C.accent, width: '120px' }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* Corner coordinates */}
            <span
                className="absolute top-6 left-6 font-space text-[9px] tracking-widest uppercase"
                style={{ color: C.accent, opacity: 0.2 }}
            >
                SYS://AGR.SUPPORT.V1
            </span>
            <span
                className="absolute bottom-6 right-6 font-space text-[9px] tracking-widest uppercase"
                style={{ color: C.accent, opacity: 0.2 }}
            >
                2026.SAFRA
            </span>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL HINT — arrow indicator for desktop horizontal scroll
// ─────────────────────────────────────────────────────────────────────────────
const ScrollHint = memo(function ScrollHint({ C, mobile }: { C: Palette; mobile: boolean }) {
    if (mobile) return null;
    return (
        <motion.div
            className="fixed bottom-8 left-1/2 z-20 flex flex-col items-center"
            style={{ transform: 'translateX(-50%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2.5, duration: 1 }}
        >
            <span
                className="font-space text-[9px] tracking-[0.4em] uppercase mb-2"
                style={{ color: C.accent }}
            >
                Role para navegar
            </span>
            <motion.span
                style={{ color: C.accent }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                ↓
            </motion.span>
        </motion.div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function SuportePage() {
    const isDark = useIsDark();
    const reduced = useReducedMotion();
    const [showIntro, setShowIntro] = useState(true);
    const mobile = typeof window !== 'undefined' ? isMobile() : false;

    const C = isDark ? PALETTES.dark : PALETTES.light;

    // Skip intro if reduced motion preferred
    useEffect(() => {
        if (reduced) setShowIntro(false);
    }, [reduced]);

    return (
        <main
            className="relative"
            style={{
                background: C.bg,
                color: C.text,
                transition: 'background 0.5s ease, color 0.5s ease',
            }}
        >
            {/* Cinematic intro overlay */}
            <AnimatePresence mode="wait">
                {showIntro && !reduced && (
                    <CinematicIntro
                        key="intro"
                        C={C}
                        onComplete={() => setShowIntro(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main content (only after intro completes) */}
            {!showIntro && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <TerminalBackground C={C} mobile={mobile} />

                    <SpatialScroll C={C} mobile={mobile}>
                        <ZoneManifesto C={C} mobile={mobile} />
                        <ZoneModules C={C} mobile={mobile} />
                        <ZoneFAQ C={C} mobile={mobile} />
                    </SpatialScroll>

                    <ScrollHint C={C} mobile={mobile} />
                </motion.div>
            )}
        </main>
    );
}
