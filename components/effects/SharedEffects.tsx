'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, memo } from 'react';
import { isMobile, GPU_STYLE } from '@/lib/perf';

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR BLOB — Skip entirely on mobile (no hover cursor)
// Replaces duplicated CursorBlob across page.tsx, carrinho, diretoria, etc.
// ─────────────────────────────────────────────────────────────────────────────
function CursorBlobInner({ isDark = false }: { isDark?: boolean }) {
    const x = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
    const y = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
    const sx = useSpring(x, { stiffness: 45, damping: 18 });
    const sy = useSpring(y, { stiffness: 45, damping: 18 });

    useEffect(() => {
        if (isMobile()) return;
        const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
        window.addEventListener('mousemove', move, { passive: true });
        return () => window.removeEventListener('mousemove', move);
    }, [x, y]);

    // On mobile, render nothing
    if (typeof window !== 'undefined' && isMobile()) return null;

    return (
        <motion.div
            className="fixed pointer-events-none z-0"
            style={{
                x: sx, y: sy,
                translateX: '-50%', translateY: '-50%',
                width: 500, height: 500,   // ← reduced from 800 for perf
                borderRadius: '50%',
                background: isDark
                    ? 'radial-gradient(circle, rgba(176,142,104,0.09) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(176,142,104,0.09) 0%, rgba(0,91,236,0.05) 45%, transparent 70%)',
                opacity: 0.8,
                ...GPU_STYLE,
            }}
        />
    );
}

export const CursorBlob = memo(CursorBlobInner);

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE — Pure CSS translateX loop (was Framer Motion, ~10x cheaper)
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeInner({ text, dir = 1, speed = 55, op = 0.06, size = 'text-base', isDark = false }: {
    text: string; dir?: number; speed?: number; op?: number; size?: string; isDark?: boolean;
}) {
    const repeated = Array(10).fill(text).join('  ·  '); // reduced from 14 to 10
    const animName = dir > 0 ? 'marquee-ltr' : 'marquee-rtl';
    return (
        <div className="overflow-hidden w-full">
            <p
                className={`font-space font-bold uppercase whitespace-nowrap ${size} tracking-[0.22em]`}
                style={{
                    opacity: op,
                    color: isDark ? '#fff' : 'var(--color-blue)',
                    animation: `${animName} ${speed}s linear infinite`,
                    ...GPU_STYLE,
                }}
            >{repeated}</p>
        </div>
    );
}

export const Marquee = memo(MarqueeInner);

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED GRID — Single CSS-animated grid instead of 140 motion.divs
// ─────────────────────────────────────────────────────────────────────────────
function GridInner({ isDark = false }: { isDark?: boolean }) {
    const color = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,91,236,0.05)';
    return (
        <div
            className="absolute inset-0 pointer-events-none z-0 grid-animated-bg"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(14, 1fr)',
                gridTemplateRows: 'repeat(10, 1fr)',
                ...GPU_STYLE,
            }}
        >
            {/* Only render 28 cells (every 5th) instead of 140 unique motion.divs */}
            {Array.from({ length: 28 }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        border: `0.5px solid ${color}`,
                        gridColumn: `${(i * 5) % 14 + 1}`,
                        gridRow: `${Math.floor((i * 5) / 14) % 10 + 1}`,
                        animation: `grid-pulse ${6 + (i % 5)}s ease-in-out ${(i * 0.2) % 4}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

export const Grid = memo(GridInner);

// ─────────────────────────────────────────────────────────────────────────────
// SCANLINES — Pure CSS instead of Framer Motion's 0.14s repaint loop
// ─────────────────────────────────────────────────────────────────────────────
function ScanlinesInner({ isDark = false }: { isDark?: boolean }) {
    return (
        <div
            className="absolute inset-0 pointer-events-none z-[2] scanline-sweep"
            style={{
                backgroundImage: isDark
                    ? 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.008) 2px,rgba(255,255,255,0.008) 4px)'
                    : 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.012) 2px,rgba(0,0,0,0.012) 4px)',
                ...GPU_STYLE,
            }}
        />
    );
}

export const Scanlines = memo(ScanlinesInner);

// ─────────────────────────────────────────────────────────────────────────────
// NOISE OVERLAY — Static, no JS animation needed
// ─────────────────────────────────────────────────────────────────────────────
function NoiseInner() {
    return (
        <div
            className="absolute inset-0 pointer-events-none z-[2] mix-blend-overlay"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
                opacity: 0.5,
            }}
        />
    );
}

export const Noise = memo(NoiseInner);

// ─────────────────────────────────────────────────────────────────────────────
// GLITCH TEXT — Unchanged visually, but memoized
// ─────────────────────────────────────────────────────────────────────────────
function GlitchInner({ text, className = '' }: { text: string; className?: string }) {
    return (
        <span className={`relative inline-block ${className}`}>
            <span
                className="absolute inset-0 text-agro-gold select-none pointer-events-none glitch-layer-1"
                style={{ clipPath: 'inset(25% 0 55% 0)' }}
            >{text}</span>
            <span
                className="absolute inset-0 text-agro-blue select-none pointer-events-none glitch-layer-2"
                style={{ clipPath: 'inset(58% 0 8% 0)' }}
            >{text}</span>
            {text}
        </span>
    );
}

export const Glitch = memo(GlitchInner);
