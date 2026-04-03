import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'generentolo-accent-color';
const DEFAULT_COLOR = '#f59e0b';

/** Convert #rrggbb → "r g b" string for CSS rgb() Level 4 */
function hexToRgbChannels(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
}

/**
 * Derive a dark readable variant of the accent color for light-mode text.
 * Reduces luminance to roughly 30% by scaling RGB channels down.
 */
function darkenForLightMode(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const factor = 0.45;
    const dr = Math.round(r * factor);
    const dg = Math.round(g * factor);
    const db = Math.round(b * factor);
    return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

function applyColorToDom(hex: string) {
    const root = document.documentElement;
    root.style.setProperty('--color-brand-yellow', hex);
    root.style.setProperty('--color-brand-yellow-rgb', hexToRgbChannels(hex));
    // Inject dynamic light-mode text override via a <style> tag
    const darkVariant = darkenForLightMode(hex);
    let styleEl = document.getElementById('accent-color-override') as HTMLStyleElement | null;
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'accent-color-override';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
        html:not(.dark) .text-brand-yellow,
        html:not(.dark) .text-brand-yellow\\/80 { color: ${darkVariant} !important; }
        html:not(.dark) .hover\\:text-brand-yellow:hover,
        html:not(.dark) .group:hover .group-hover\\:text-brand-yellow { color: ${darkVariant} !important; }
        html:not(.dark) .peer:checked ~ div .peer-checked\\:text-brand-yellow,
        html:not(.dark) .peer:checked ~ span .peer-checked\\:text-brand-yellow { color: ${darkVariant} !important; }
    `;
}

export function useAccentColor() {
    const [accentColor, setAccentColorState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_COLOR;
    });

    useEffect(() => {
        applyColorToDom(accentColor);
    }, []);

    const setAccentColor = useCallback((hex: string) => {
        setAccentColorState(hex);
        localStorage.setItem(STORAGE_KEY, hex);
        applyColorToDom(hex);
    }, []);

    const resetToDefault = useCallback(() => {
        setAccentColor(DEFAULT_COLOR);
    }, [setAccentColor]);

    return { accentColor, setAccentColor, resetToDefault, defaultColor: DEFAULT_COLOR };
}
