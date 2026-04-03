import React, { useState, useRef, useEffect } from 'react';

interface ThemePickerProps {
    accentColor: string;
    onColorChange: (hex: string) => void;
    onReset: () => void;
    defaultColor: string;
}

const PRESETS = [
    { name: 'Amber',   hex: '#f59e0b' },
    { name: 'Lime',    hex: '#c8f23a' },
    { name: 'Violet',  hex: '#8b5cf6' },
    { name: 'Rose',    hex: '#f43f5e' },
    { name: 'Sky',     hex: '#0ea5e9' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Orange',  hex: '#f97316' },
    { name: 'Slate',   hex: '#94a3b8' },
];

const SwatchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
        <path d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9.5" />
        <path d="M11 8H7" />
        <path d="M11 12H7" />
        <circle cx="16" cy="9" r="3" />
    </svg>
);

const ThemePicker: React.FC<ThemePickerProps> = ({ accentColor, onColorChange, onReset, defaultColor }) => {
    const [open, setOpen] = useState(false);
    const [customHex, setCustomHex] = useState(accentColor);
    const panelRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCustomHex(accentColor);
    }, [accentColor]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleHexInput = (val: string) => {
        setCustomHex(val);
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            onColorChange(val);
        }
    };

    const isDefault = accentColor.toLowerCase() === defaultColor.toLowerCase();

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(v => !v)}
                title="Accent Color"
                aria-label="Open accent color picker"
                className={`p-2 rounded-full transition-colors hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent ${open ? 'text-brand-yellow' : 'text-light-text-muted dark:text-brand-yellow'}`}
            >
                <SwatchIcon className="w-5 h-5" />
            </button>

            {/* Panel */}
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-dark-border bg-dark-surface/95 backdrop-blur-xl shadow-2xl z-[200] animate-slideDown p-4 flex flex-col gap-3"
                    style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
                >
                    {/* Presets */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-dark-text-muted mb-2.5">Accent Color</p>
                        <div className="grid grid-cols-4 gap-2">
                            {PRESETS.map(preset => {
                                const isActive = accentColor.toLowerCase() === preset.hex.toLowerCase();
                                return (
                                    <button
                                        key={preset.hex}
                                        onClick={() => onColorChange(preset.hex)}
                                        title={preset.name}
                                        aria-label={`Set accent to ${preset.name}`}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-full transition-all duration-200 border-2 ${isActive ? 'scale-110 border-white shadow-lg' : 'border-transparent group-hover:scale-105 group-hover:border-white/30'}`}
                                            style={{ backgroundColor: preset.hex }}
                                        />
                                        <span className={`text-[9px] font-medium transition-colors ${isActive ? 'text-dark-text' : 'text-dark-text-muted group-hover:text-dark-text'}`}>
                                            {preset.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-dark-border" />

                    {/* Custom */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-dark-text-muted mb-2">Custom</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => colorInputRef.current?.click()}
                                title="Pick custom color"
                                className="relative w-9 h-9 rounded-full border-2 border-dark-border hover:border-white/40 transition-colors flex-shrink-0 overflow-hidden"
                                style={{ backgroundColor: accentColor }}
                            >
                                <input
                                    ref={colorInputRef}
                                    type="color"
                                    value={accentColor}
                                    onChange={e => { onColorChange(e.target.value); setCustomHex(e.target.value); }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    aria-label="Custom color picker"
                                />
                            </button>
                            <input
                                type="text"
                                value={customHex}
                                onChange={e => handleHexInput(e.target.value)}
                                maxLength={7}
                                placeholder="#f59e0b"
                                className="w-24 bg-dark-surface-accent border border-dark-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-brand-yellow/60 transition-colors"
                                aria-label="Hex color value"
                            />
                        </div>
                    </div>

                    {/* Reset */}
                    {!isDefault && (
                        <>
                            <div className="h-px bg-dark-border" />
                            <button
                                onClick={onReset}
                                className="text-[11px] text-dark-text-muted hover:text-dark-text transition-colors text-center py-0.5"
                            >
                                Reset to default
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ThemePicker;
