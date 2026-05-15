import React from 'react';
import { ShotsStoryboardPrompt } from '../services/shotsStoryboardService';
import { SparklesIcon, CopyIcon, CheckIcon, XIcon, ClapperboardIcon, ReloadIcon, LockIcon, ChevronDownIcon } from './icons';

interface ShotsStoryboardGridProps {
    framePrompts: ShotsStoryboardPrompt[];
    videoPrompt: string;
    onClose: () => void;
    onUsePrompt: (prompt: string) => void;
    onGenerateAll: () => void;
    onGenerateOne: (prompt: string) => void;
    onRegenerate: () => void;
    onRegenerateOne: (id: string, shotTitle: string) => void;
    onToggleLock: (id: string) => void;
    lockedIds: string[];
    regeneratingId: string | null;
    isLoading?: boolean;
    language: 'en' | 'it';
    duration: number;
    aspectRatio: string;
}

const ShotsStoryboardGrid: React.FC<ShotsStoryboardGridProps> = ({
    framePrompts, videoPrompt, onClose, onUsePrompt, onGenerateAll, onGenerateOne,
    onRegenerate, onRegenerateOne, onToggleLock, lockedIds,
    regeneratingId, isLoading, language, duration, aspectRatio
}) => {
    const [copiedId, setCopiedId] = React.useState<string | null>(null);
    const [showVideoPrompt, setShowVideoPrompt] = React.useState(false);
    const [copiedVideoPrompt, setCopiedVideoPrompt] = React.useState(false);
    const [editedPrompts, setEditedPrompts] = React.useState<Map<string, string>>(() => {
        const map = new Map<string, string>();
        framePrompts.forEach(fp => map.set(fp.id, fp.imagePrompt));
        return map;
    });

    const isIT = language === 'it';

    React.useEffect(() => {
        setEditedPrompts(prev => {
            const next = new Map(prev);
            framePrompts.forEach(fp => {
                if (!next.has(fp.id)) next.set(fp.id, fp.imagePrompt);
            });
            return next;
        });
    }, [framePrompts]);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const subtitle = framePrompts.length > 0
        ? `${framePrompts.length} shots · ${duration}s · ${aspectRatio}`
        : isIT
            ? `Generazione in corso · ${duration}s · ${aspectRatio}`
            : `Generating · ${duration}s · ${aspectRatio}`;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl max-h-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slideUp">

                {/* Header */}
                <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-light-border dark:border-dark-border bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-md flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-light-surface-accent dark:bg-dark-surface-accent border border-brand-yellow/30 flex items-center justify-center shadow-md flex-shrink-0">
                            <ClapperboardIcon className="w-5 h-5 text-brand-yellow" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
                                Shots Storyboard
                            </h2>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted font-medium uppercase tracking-widest truncate max-w-xs">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-brand-yellow text-dark-bg rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                            title={isIT ? 'Modifica impostazioni e rigenera' : 'Edit settings and regenerate'}
                        >
                            <ReloadIcon className="w-4 h-4" />
                            {isIT ? 'Rigenera' : 'Regenerate'}
                        </button>
                        <button
                            onClick={onGenerateAll}
                            disabled={isLoading}
                            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-xl font-bold hover:border-brand-yellow hover:text-brand-yellow hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {isIT ? 'Genera Tutto (Coda)' : 'Generate All (Queue)'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent text-light-text-muted dark:text-dark-text-muted transition-all hover:rotate-90"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    {isLoading && framePrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                            <div className="w-20 h-20 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 animate-pulse">
                                {isIT ? 'Generazione prompt video in corso...' : 'Generating video prompts...'}
                            </h3>
                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
                                {isIT
                                    ? 'Analisi reference e creazione dei prompt shot...'
                                    : 'Analyzing references and creating shot prompts...'}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <div className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {framePrompts.map((item) => {
                                    const isLocked = lockedIds.includes(item.id);
                                    const isRegenerating = regeneratingId === item.id;
                                    const currentPrompt = editedPrompts.get(item.id) ?? item.imagePrompt;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`group relative flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 ${
                                                isLocked
                                                    ? 'bg-brand-yellow/5 border-brand-yellow/30 shadow-sm shadow-brand-yellow/10'
                                                    : 'bg-light-surface-accent/20 dark:bg-dark-surface-accent/20 border-light-border dark:border-dark-border/50 hover:border-brand-yellow/50 hover:shadow-lg hover:shadow-brand-yellow/5'
                                            }`}
                                        >
                                            {/* Card header */}
                                            <div className="px-5 py-4 flex items-center justify-between border-b border-light-border dark:border-dark-border/30 bg-light-surface/30 dark:bg-dark-surface/10">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-xs font-black text-light-text-muted dark:text-dark-text-muted italic flex-shrink-0">
                                                        #{item.shotIndex}
                                                    </span>
                                                    <span className="text-sm font-bold text-light-text dark:text-dark-text uppercase tracking-tight truncate">
                                                        {item.title}
                                                    </span>
                                                </div>

                                                {/* Action icons */}
                                                <div className="flex items-center gap-1">
                                                    {/* Lock */}
                                                    <button
                                                        onClick={() => onToggleLock(item.id)}
                                                        className={`p-1.5 rounded-lg transition-all ${
                                                            isLocked
                                                                ? 'text-brand-yellow hover:bg-brand-yellow/10'
                                                                : 'opacity-0 group-hover:opacity-100 hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent text-light-text-muted dark:text-dark-text-muted hover:text-brand-yellow'
                                                        }`}
                                                        title={isLocked
                                                            ? (isIT ? 'Sblocca questo shot' : 'Unlock this shot')
                                                            : (isIT ? 'Blocca questo shot' : 'Lock this shot')}
                                                    >
                                                        <LockIcon className="w-3.5 h-3.5" locked={isLocked} />
                                                    </button>

                                                    {/* Regen single */}
                                                    <button
                                                        onClick={() => !isLocked && !isRegenerating && onRegenerateOne(item.id, item.title)}
                                                        disabled={isLocked || isRegenerating || !!regeneratingId}
                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent text-light-text-muted dark:text-dark-text-muted hover:text-brand-yellow transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={isLocked
                                                            ? (isIT ? 'Sblocca per rigenerare' : 'Unlock to regenerate')
                                                            : (isIT ? 'Rigenera solo questo shot' : 'Regenerate this shot only')}
                                                    >
                                                        {isRegenerating
                                                            ? <div className="w-3.5 h-3.5 border-2 border-brand-yellow/40 border-t-brand-yellow rounded-full animate-spin" />
                                                            : <ReloadIcon className="w-3.5 h-3.5" />
                                                        }
                                                    </button>

                                                    {/* Copy */}
                                                    <button
                                                        onClick={() => handleCopy(item.id, currentPrompt)}
                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-brand-yellow hover:text-dark-bg text-light-text-muted dark:text-dark-text-muted transition-all"
                                                        title={isIT ? 'Copia prompt' : 'Copy prompt'}
                                                    >
                                                        {copiedId === item.id
                                                            ? <CheckIcon className="w-3.5 h-3.5" />
                                                            : <CopyIcon className="w-3.5 h-3.5" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card body */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                {/* Shot description — read-only */}
                                                {item.shotDescription && (
                                                    <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted leading-relaxed mb-3 line-clamp-2 italic">
                                                        {item.shotDescription}
                                                    </p>
                                                )}

                                                {/* Image prompt — editable textarea */}
                                                <textarea
                                                    value={currentPrompt}
                                                    onChange={e => setEditedPrompts(prev => new Map(prev).set(item.id, e.target.value))}
                                                    rows={4}
                                                    placeholder={isIT ? 'Prompt immagine...' : 'Image prompt...'}
                                                    className={`w-full text-sm text-light-text-muted dark:text-dark-text-muted leading-relaxed font-mono bg-black/5 dark:bg-black/40 border rounded-xl p-4 mb-4 resize-none focus:outline-none focus:border-brand-yellow/40 transition-colors custom-scrollbar ${
                                                        isRegenerating
                                                            ? 'border-brand-yellow/20 animate-pulse'
                                                            : 'border-black/5 dark:border-white/5'
                                                    }`}
                                                />

                                                {/* Action buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onUsePrompt(currentPrompt)}
                                                        className="flex-1 py-2 text-xs font-bold bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:border-brand-yellow transition-all active:scale-95 text-light-text dark:text-dark-text"
                                                    >
                                                        {isIT ? 'Usa' : 'Use'}
                                                    </button>
                                                    <button
                                                        onClick={() => onGenerateOne(currentPrompt)}
                                                        disabled={isRegenerating}
                                                        className="flex-1 py-2 text-xs font-bold bg-brand-yellow text-dark-bg rounded-lg hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isIT ? 'Genera' : 'Generate'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Seedance Video Prompt — collapsible */}
                            {framePrompts.length > 0 && (
                                <div className="mt-8 border border-light-border dark:border-dark-border/50 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setShowVideoPrompt(prev => !prev)}
                                        className="w-full flex items-center justify-between px-5 py-4 bg-light-surface-accent/30 dark:bg-dark-surface-accent/20 hover:bg-light-surface-accent/50 dark:hover:bg-dark-surface-accent/40 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                                            🎬 {isIT ? 'Prompt Seedance completo' : 'Full Seedance Prompt'}
                                        </span>
                                        <ChevronDownIcon className={`w-4 h-4 text-light-text-muted dark:text-dark-text-muted transition-transform duration-200 ${showVideoPrompt ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showVideoPrompt && (
                                        <div className="relative p-4 bg-black/5 dark:bg-black/40">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(videoPrompt);
                                                    setCopiedVideoPrompt(true);
                                                    setTimeout(() => setCopiedVideoPrompt(false), 2000);
                                                }}
                                                className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-brand-yellow hover:text-dark-bg text-light-text-muted dark:text-dark-text-muted transition-all"
                                                title={isIT ? 'Copia prompt' : 'Copy prompt'}
                                            >
                                                {copiedVideoPrompt
                                                    ? <CheckIcon className="w-3.5 h-3.5" />
                                                    : <CopyIcon className="w-3.5 h-3.5" />
                                                }
                                            </button>
                                            <pre className="text-xs text-light-text-muted dark:text-dark-text-muted font-mono leading-relaxed whitespace-pre-wrap pr-10 max-h-64 overflow-y-auto custom-scrollbar">
                                                {videoPrompt}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile footer */}
                <div className="md:hidden p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
                    <button
                        onClick={onGenerateAll}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-2xl font-bold shadow-md hover:border-brand-yellow hover:text-brand-yellow"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {isIT ? 'Genera Tutto' : 'Generate All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShotsStoryboardGrid;
