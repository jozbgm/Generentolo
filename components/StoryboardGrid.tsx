import React from 'react';
import { StoryboardPrompt } from '../services/storyboardService';
import { SparklesIcon, CopyIcon, CheckIcon, XIcon, ClapperboardIcon, ReloadIcon } from './icons';

interface StoryboardGridProps {
    prompts: StoryboardPrompt[];
    onClose: () => void;
    onUsePrompt: (prompt: string) => void;
    onGenerateAll: () => void;
    onGenerateOne: (prompt: string) => void;
    onRegenerate: () => void;
    isLoading?: boolean;
    language: 'en' | 'it';
}

const StoryboardGrid: React.FC<StoryboardGridProps> = ({
    prompts,
    onClose,
    onUsePrompt,
    onGenerateAll,
    onGenerateOne,
    onRegenerate,
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
                        <div className="w-10 h-10 rounded-xl bg-light-surface-accent dark:bg-dark-surface-accent border border-brand-yellow/30 flex items-center justify-center shadow-md">
                            <ClapperboardIcon className="w-5 h-5 text-brand-yellow" />
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

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-brand-yellow text-dark-bg rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                            title={language === 'it' ? 'Rigenera 9 nuovi prompt per questa immagine' : 'Regenerate 9 new prompts for this image'}
                        >
                            <ReloadIcon className="w-4 h-4" />
                            {language === 'it' ? 'Rigenera' : 'Regenerate'}
                        </button>
                        <button
                            onClick={onGenerateAll}
                            disabled={isLoading}
                            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-xl font-bold hover:border-brand-yellow hover:text-brand-yellow hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
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
                            <div className="w-20 h-20 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 animate-pulse">
                                {language === 'it' ? 'Analisi in corso...' : 'Analyzing...'}
                            </h3>
                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
                                {language === 'it'
                                    ? 'Generentolo sta analizzando l\'immagine e creando 9 varianti cinematografiche...'
                                    : 'Generentolo is analyzing the image and creating 9 cinematic variations...'}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    ) : (
                        /* Prompts Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prompts.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col bg-light-surface-accent/20 dark:bg-dark-surface-accent/20 border border-light-border dark:border-dark-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-yellow/50 hover:shadow-lg hover:shadow-brand-yellow/5"
                                >
                                    {/* Shot Number & Title */}
                                    <div className="px-5 py-4 flex items-center justify-between border-b border-light-border dark:border-dark-border/30 bg-light-surface/30 dark:bg-dark-surface/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-light-text-muted dark:text-dark-text-muted italic">#{index + 1}</span>
                                            <span className="text-sm font-bold text-light-text dark:text-dark-text uppercase tracking-tight truncate max-w-[150px]">
                                                {item.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopy(item.id, item.prompt)}
                                                className="p-1.5 rounded-lg hover:bg-brand-yellow hover:text-dark-bg text-light-text dark:text-dark-text transition-all"
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
                                                className="flex-1 py-2 text-xs font-bold bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:border-brand-yellow transition-all active:scale-95 text-light-text dark:text-dark-text"
                                            >
                                                {language === 'it' ? 'Usa' : 'Use'}
                                            </button>
                                            <button
                                                onClick={() => onGenerateOne(item.prompt)}
                                                className="flex-1 py-2 text-xs font-bold bg-brand-yellow text-dark-bg rounded-lg hover:scale-105 transition-all shadow-md active:scale-95"
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
                        className="w-full flex items-center justify-center gap-2 py-4 bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-2xl font-bold shadow-md hover:border-brand-yellow hover:text-brand-yellow"
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
