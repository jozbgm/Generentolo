import React from 'react';
import { StoryboardPrompt } from '../services/storyboardService';
import { SparklesIcon, CopyIcon, CheckIcon, XIcon } from './icons';

interface StoryboardGridProps {
    prompts: StoryboardPrompt[];
    onClose: () => void;
    onUsePrompt: (prompt: string) => void;
    onGenerateAll: () => void;
    onGenerateOne: (prompt: string) => void;
    isLoading?: boolean;
    language: 'en' | 'it';
}

const StoryboardGrid: React.FC<StoryboardGridProps> = ({
    prompts,
    onClose,
    onUsePrompt,
    onGenerateAll,
    onGenerateOne,
    isLoading,
    language
}) => {
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl max-h-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-light-border dark:border-dark-border bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center shadow-lg shadow-brand-purple/20">
                            <span className="text-xl">🎬</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
                                {language === 'it' ? 'Cinematic Storyboard' : 'Cinematic Storyboard'}
                            </h2>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted font-medium uppercase tracking-widest">
                                {language === 'it' ? '9 Inquadrature Sequenziali' : '9 Sequential Frames'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onGenerateAll}
                            disabled={isLoading}
                            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-brand-purple text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-purple/25 disabled:opacity-50"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {language === 'it' ? 'Genera Tutto (Coda)' : 'Generate All (Queue)'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent text-light-text-muted dark:text-dark-text-muted transition-all hover:rotate-90"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {isLoading && prompts.length === 0 ? (
                        /* Loading State */
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                            <div className="w-20 h-20 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 animate-pulse">
                                {language === 'it' ? 'Analisi in corso...' : 'Analyzing...'}
                            </h3>
                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
                                {language === 'it'
                                    ? 'Generentolo sta analizzando l\'immagine e creando 9 varianti cinematografiche...'
                                    : 'Generentolo is analyzing the image and creating 9 cinematic variations...'}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    ) : (
                        /* Prompts Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prompts.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col bg-light-surface-accent/20 dark:bg-dark-surface-accent/20 border border-light-border dark:border-dark-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-purple/50 hover:shadow-xl hover:shadow-purple-500/5"
                                >
                                    {/* Shot Number & Title */}
                                    <div className="px-5 py-4 flex items-center justify-between border-b border-light-border dark:border-dark-border/30 bg-light-surface/30 dark:bg-dark-surface/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-brand-purple/60 dark:text-brand-purple/80 italic">#{index + 1}</span>
                                            <span className="text-sm font-bold text-light-text dark:text-dark-text uppercase tracking-tight truncate max-w-[150px]">
                                                {item.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopy(item.id, item.prompt)}
                                                className="p-1.5 rounded-lg hover:bg-brand-purple/10 text-brand-purple transition-all"
                                                title="Copy Prompt"
                                            >
                                                {copiedId === item.id ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Prompt Box */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="relative bg-black/5 dark:bg-black/40 rounded-xl p-4 mb-4 border border-black/5 dark:border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted leading-relaxed font-mono">
                                                {item.prompt}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onUsePrompt(item.prompt)}
                                                className="flex-1 py-2 text-xs font-bold bg-light-surface dark:bg-dark-surface-accent border border-light-border dark:border-dark-border rounded-lg hover:bg-brand-purple/10 hover:border-brand-purple/50 transition-all active:scale-95"
                                            >
                                                {language === 'it' ? 'Usa' : 'Use'}
                                            </button>
                                            <button
                                                onClick={() => onGenerateOne(item.prompt)}
                                                className="flex-1 py-2 text-xs font-bold bg-brand-purple text-white rounded-lg hover:shadow-lg hover:shadow-brand-purple/20 transition-all active:scale-95"
                                            >
                                                {language === 'it' ? 'Genera' : 'Generate'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Generate All */}
                <div className="md:hidden p-4 border-t border-light-border dark:border-dark-border">
                    <button
                        onClick={onGenerateAll}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-brand-purple text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/25"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {language === 'it' ? 'Genera Tutto' : 'Generate All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryboardGrid;
