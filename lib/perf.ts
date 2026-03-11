'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DETECTION
// ─────────────────────────────────────────────────────────────────────────────
let _isMobile: boolean | null = null;

export function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    if (_isMobile !== null) return _isMobile;
    _isMobile =
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        );
    return _isMobile;
}

// ─────────────────────────────────────────────────────────────────────────────
// REDUCED MOTION — respects OS-level "prefers-reduced-motion"
// ─────────────────────────────────────────────────────────────────────────────
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return reduced;
}

// ─────────────────────────────────────────────────────────────────────────────
// DARK MODE — reacts to .dark class toggled by Hotbar
// Replaces duplicated useIsDark across 4+ files
// ─────────────────────────────────────────────────────────────────────────────
export function useIsDark(): boolean {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const check = () =>
            setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => obs.disconnect();
    }, []);
    return isDark;
}

// ─────────────────────────────────────────────────────────────────────────────
// GPU LAYER PROMOTION — object you spread onto style= for compositing hints
// ─────────────────────────────────────────────────────────────────────────────
export const GPU_STYLE: React.CSSProperties = {
    willChange: 'transform',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
};

// ─────────────────────────────────────────────────────────────────────────────
// THROTTLED RAF CALLBACK — runs a function at most once per animation frame
// ─────────────────────────────────────────────────────────────────────────────
export function useRafThrottle(callback: (e: MouseEvent) => void) {
    const raf = useRef(0);
    return useCallback(
        (e: MouseEvent) => {
            cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(() => callback(e));
        },
        [callback],
    );
}
