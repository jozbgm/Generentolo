import React, { useState, useEffect } from 'react';
import { ClapperboardIcon, XIcon, SparklesIcon } from './icons';

interface StoryboardThemeModalProps {
    onClose: () => void;
    onGenerate: (theme: string, shotCount: number) => void;
    language: 'en' | 'it';
    referenceImage?: File | null;
    initialTheme?: string;
    initialShotCount?: number;
}

const GENRE_CHIPS = [
    // Advertising & Communication
    'ADV', 'Fashion', 'Editorial', 'Beauty', 'Make-up',
    'Luxury', 'Lifestyle', 'Mockup', 'Food', 'Automotive',
    'Corporate', 'Sport', 'E-commerce', 'Street',
    // Cinematic
    'Drama', 'Documentary', 'Action', 'Thriller', 'Sci-Fi'
];

const SHOT_COUNTS = [3, 6, 9, 12];

const StoryboardThemeModal: React.FC<StoryboardThemeModalProps> = ({
    onClose, onGenerate, language, referenceImage, initialTheme = '', initialShotCount = 9
}) => {
    const [theme, setTheme] = useState(initialTheme);
    const [shotCount, setShotCount] = useState(initialShotCount);
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);

    const isIT = language === 'it';

    useEffect(() => {
        if (!referenceImage) return;
        const url = URL.createObjectURL(referenceImage);
        setThumbUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [referenceImage]);

    const handleChipClick = (chip: string) => {
        const lower = chip.toLowerCase();
        setTheme(prev => prev.trim() ? `${prev.trim()}, ${lower}` : lower);
    };

    const handleSubmit = () => {
        if (!theme.trim()) return;
        onGenerate(theme.trim(), shotCount);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slideUp">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-light-surface-accent dark:bg-dark-surface-accent border border-brand-yellow/30 flex items-center justify-center shadow-md">
                            <ClapperboardIcon className="w-5 h-5 text-brand-yellow" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
                                Cinematic Storyboard
                            </h2>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest font-medium">
                                {isIT ? 'Definisci il tema' : 'Set the theme'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent text-light-text-muted dark:text-dark-text-muted transition-all hover:rotate-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">

                    {/* Reference thumbnail */}
                    {thumbUrl && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-light-border dark:border-dark-border/50">
                            <img
                                src={thumbUrl}
                                alt="Reference"
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-light-border dark:border-dark-border"
                            />
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed">
                                {isIT
                                    ? 'La reference verrà analizzata per generare le inquadrature'
                                    : 'This reference will be analyzed to generate the shots'}
                            </p>
                        </div>
                    )}

                    {/* Theme input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            {isIT ? 'Tema / Mood della sequenza' : 'Sequence theme / mood'}
                        </label>
                        <textarea
                            value={theme}
                            onChange={e => setTheme(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            placeholder={isIT
                                ? 'Es: scena notturna noir, tensione crescente, pioggia, luce al neon...'
                                : 'E.g: night noir scene, slow-burn tension, heavy rain, neon lights...'}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm resize-none focus:outline-none focus:border-brand-yellow/60 transition-colors placeholder:text-light-text-muted/40 dark:placeholder:text-dark-text-muted/40"
                        />
                    </div>

                    {/* Genre chips */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            {isIT ? 'Suggerimenti rapidi' : 'Quick suggestions'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {GENRE_CHIPS.map(chip => (
                                <button
                                    key={chip}
                                    onClick={() => handleChipClick(chip)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted hover:border-brand-yellow hover:text-brand-yellow transition-all active:scale-95"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shot count */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2">
                            {isIT ? 'Numero di inquadrature' : 'Number of shots'}
                        </p>
                        <div className="flex gap-2">
                            {SHOT_COUNTS.map(count => (
                                <button
                                    key={count}
                                    onClick={() => setShotCount(count)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                                        shotCount === count
                                            ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-sm'
                                            : 'border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted hover:border-brand-yellow hover:text-brand-yellow'
                                    }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 space-y-2">
                    <button
                        onClick={handleSubmit}
                        disabled={!theme.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-yellow text-dark-bg rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {isIT ? `Genera ${shotCount} Inquadrature` : `Generate ${shotCount} Shots`}
                    </button>
                    <p className="text-center text-xs text-light-text-muted dark:text-dark-text-muted">
                        {isIT ? '⌘+Invio per generare' : '⌘+Enter to generate'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StoryboardThemeModal;
