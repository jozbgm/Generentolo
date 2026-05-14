import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../App';
import { ModelType, ResolutionType, ThinkingLevel } from '../types';
import { GeneratedImage } from '../types';
import { XIcon, CopyIcon, PlusIcon, SparklesIcon, UserIcon, LanguageIcon, ImageIcon, SettingsIcon, ZapIcon, StarIcon, DiceIcon, CheckIcon, ReloadIcon, ClapperboardIcon, Layers2Icon, MonitorIcon, SmartphoneIcon, RatioSquareIcon, ShapeIcon } from './icons';

interface FloatingActionBarProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    promptTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
    onGenerate: () => void;
    onAbortGeneration: () => void;
    autoEnhance: boolean;
    onAutoEnhanceChange: (enabled: boolean) => void;
    isLoading: boolean;
    hasReferences: boolean;
    aspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
    numImages: number;
    onNumImagesChange: (num: number) => void;
    seed: string;
    onSeedChange: (seed: string) => void;
    onRandomizeSeed: () => void;
    negativePrompt: string;
    onNegativePromptChange: (value: string) => void;
    preciseReference: boolean;
    onPreciseReferenceChange: (enabled: boolean) => void;
    useGrounding: boolean;
    onGroundingChange: (enabled: boolean) => void;
    selectedModel: ModelType;
    onModelChange: (model: ModelType) => void;
    selectedResolution: ResolutionType;
    onResolutionChange: (resolution: ResolutionType) => void;
    thinkingLevel: ThinkingLevel;
    onThinkingLevelChange: (level: ThinkingLevel) => void;
    isEnhancing?: boolean;
    referenceCount: number;
    onOutpaintReference: (direction: 'up' | 'down' | 'left' | 'right' | 'all' | 'horizontal' | 'vertical', targetAspect?: string) => void;
    poseTransfer: boolean;
    onPoseTransferChange: (enabled: boolean) => void;
    hasGeneratedImages?: boolean;
    quickEditSourceImage?: GeneratedImage | null;
    onQuickEdit?: (instruction: string) => void;
    onClearQuickEditSource?: () => void;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
    prompt,
    onPromptChange,
    promptTextareaRef,
    onGenerate,
    onAbortGeneration,
    autoEnhance,
    onAutoEnhanceChange,
    isLoading,
    hasReferences,
    aspectRatio,
    onAspectRatioChange,
    numImages,
    onNumImagesChange,
    seed,
    onSeedChange,
    onRandomizeSeed,
    negativePrompt,
    onNegativePromptChange,
    preciseReference,
    onPreciseReferenceChange,
    useGrounding,
    onGroundingChange,
    selectedModel,
    onModelChange,
    selectedResolution,
    onResolutionChange,
    thinkingLevel,
    onThinkingLevelChange,
    isEnhancing,
    referenceCount,
    onOutpaintReference,
    poseTransfer,
    onPoseTransferChange,
    hasGeneratedImages,
    quickEditSourceImage,
    onQuickEdit,
    onClearQuickEditSource,
}) => {
    const { t, language } = useLocalization();

    // v2.3: Local prompt state + debounced parent update (prevents re-render storm on every keystroke)
    const [localPrompt, setLocalPrompt] = useState(prompt);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        // Only sync from parent when the textarea is NOT focused (external update, e.g. history selection)
        // Avoids overwriting mid-edit state and resetting cursor position to end
        if (document.activeElement !== promptTextareaRef.current) {
            setLocalPrompt(prompt);
        }
    }, [prompt]);
    useEffect(() => {
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, []);
    const handlePromptChange = (value: string) => {
        setLocalPrompt(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onPromptChange(value), 150);
    };

    const [showAspectMenu, setShowAspectMenu] = useState(false);
    const [showNumImagesMenu, setShowNumImagesMenu] = useState(false);
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [showResolutionMenu, setShowResolutionMenu] = useState(false);
    const [showThinkingMenu, setShowThinkingMenu] = useState(false);
    const [showOutpaintRefMenu, setShowOutpaintRefMenu] = useState(false);

    const closeAllMenus = () => {
        setShowAspectMenu(false);
        setShowNumImagesMenu(false);
        setShowAdvancedPanel(false);
        setShowModelMenu(false);
        setShowResolutionMenu(false);
        setShowThinkingMenu(false);
        setShowOutpaintRefMenu(false);
    };
    const [outpaintRefRatio, setOutpaintRefRatio] = useState('Auto');
    const [quickEditText, setQuickEditText] = useState('');
    const [justPasteFailed, setJustPasteFailed] = useState(false);

    const [isTextareaScrollable, setIsTextareaScrollable] = useState(false);
    useEffect(() => {
        const el = promptTextareaRef.current;
        if (el) setIsTextareaScrollable(el.scrollHeight > el.clientHeight + 2);
    }, [localPrompt]);
    const scrollTextarea = (dir: 'up' | 'down') => {
        promptTextareaRef.current?.scrollBy({ top: dir === 'down' ? 48 : -48, behavior: 'smooth' });
    };

    const scrollStripRef = useRef<HTMLDivElement>(null);
    const peekInnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // On mobile, briefly scroll right then back to hint the strip is scrollable
    useEffect(() => {
        const strip = scrollStripRef.current;
        if (!strip || window.innerWidth >= 1024) return;
        const timer = setTimeout(() => {
            strip.scrollTo({ left: 60, behavior: 'smooth' });
            peekInnerTimerRef.current = setTimeout(() => strip.scrollTo({ left: 0, behavior: 'smooth' }), 500);
        }, 800);
        return () => {
            clearTimeout(timer);
            if (peekInnerTimerRef.current) clearTimeout(peekInnerTimerRef.current);
        };
    }, []);

    // UI state for copy feedback
    const [justCopied, setJustCopied] = useState(false);

    const baseAspectRatios = ["Auto", "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "4:5", "5:4", "21:9"];
    const nb2ExtraRatios = ["1:4", "4:1", "1:8", "8:1"];
    const aspectRatios = selectedModel === 'gemini-3.1-flash-image-preview'
        ? [...baseAspectRatios, ...nb2ExtraRatios]
        : baseAspectRatios;
    const numImagesOptions = [1, 2];

    // Dynamic resolution options based on model
    const resolutionOptions = selectedModel === 'gemini-3.1-flash-image-preview'
        ? ['0.5k', '1k', '2k', '4k']
        : ['1k', '2k', '4k'];

    const getAspectRatioIcon = (ratio: string): React.ReactNode => {
        if (ratio === 'Auto') return <ReloadIcon className="w-4 h-4" />;
        if (ratio === '1:8' || ratio === '8:1') return <ClapperboardIcon className="w-4 h-4" />;
        if (ratio === '1:4' || ratio === '4:1') return <Layers2Icon className="w-4 h-4" />;
        const [w, h] = ratio.split(':').map(Number);
        if (w > h) return <MonitorIcon className="w-4 h-4" />;
        if (h > w) return <SmartphoneIcon className="w-4 h-4" />;
        return <RatioSquareIcon className="w-4 h-4" />;
    };

    // Inject custom styles for this component
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .floating-prompt-textarea::-webkit-scrollbar {
                width: 6px;
            }
            .floating-prompt-textarea::-webkit-scrollbar-track {
                background: transparent;
            }
            .floating-prompt-textarea::-webkit-scrollbar-thumb {
                background-color: rgba(156, 163, 175, 0.3); /* Gray-400 with opacity */
                border-radius: 10px;
            }
            .floating-prompt-textarea::-webkit-scrollbar-thumb:hover {
                background-color: rgba(156, 163, 175, 0.5);
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = promptTextareaRef.current;
        if (textarea) {
            // Save cursor position before DOM manipulation to prevent jump
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
            // Restore cursor after reflow
            textarea.setSelectionRange(start, end);
        }
    }, [localPrompt]); // depends on local state, not parent prop — fires immediately on keystroke

    // Handle paste
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            handlePromptChange(text);
            promptTextareaRef.current?.focus();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            setJustPasteFailed(true);
            setTimeout(() => setJustPasteFailed(false), 2000);
        }
    };

    // Handle copy
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <>
            {/* Backdrop for Popovers/Advanced Panel */}
            {(showAdvancedPanel || showAspectMenu || showNumImagesMenu || showModelMenu || showResolutionMenu || showThinkingMenu || showOutpaintRefMenu) && (
                <div
                    role="presentation"
                    className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[65] animate-fadeIn"
                    onClick={() => {
                        setShowAdvancedPanel(false);
                        setShowAspectMenu(false);
                        setShowNumImagesMenu(false);
                        setShowModelMenu(false);
                        setShowResolutionMenu(false);
                        setShowThinkingMenu(false);
                        setShowOutpaintRefMenu(false);
                    }}
                />
            )}

            {/* Advanced Settings Popover */}
            {showAdvancedPanel && (
                <div className="fixed left-1/2 -translate-x-1/2 lg:left-[calc(50%-20px)] lg:-translate-x-1/2 w-[90%] lg:w-[400px] z-[80]" style={{ bottom: `max(${hasGeneratedImages && onQuickEdit ? '168px' : '110px'}, calc(env(safe-area-inset-bottom) + 90px))` }}>
                    <div className="w-full bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-2xl border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-4 animate-slideUp max-h-[60vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3 border-b border-light-border/10 dark:border-white/10 pb-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted">{t.advancedSettings || 'Advanced Settings'}</h3>
                            <button onClick={() => setShowAdvancedPanel(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-50 hover:opacity-100"><XIcon className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted mb-1.5 block">{t.negativePrompt || 'Negative Prompt'}</label>
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => onNegativePromptChange(e.target.value)}
                                    placeholder="Avoid (e.g. text, watermark, low quality)..."
                                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-yellow/50 resize-none h-20 transition-all placeholder:opacity-50"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[9px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted mb-1.5 block">{t.seed || 'Seed'}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={seed}
                                            onChange={(e) => onSeedChange(e.target.value)}
                                            placeholder="Random"
                                            className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-yellow/50"
                                        />
                                        <button
                                            onClick={onRandomizeSeed}
                                            className="px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-black/5 dark:border-white/5 text-light-text-muted dark:text-dark-text-muted hover:text-brand-yellow"
                                            title="Randomize"
                                        >
                                            <DiceIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Floating Bar + Quick Edit wrapper */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+16px)] lg:-translate-x-1/2 w-[95%] lg:w-fit lg:max-w-[calc(100vw-276px-308px-4rem)] z-[70] transition-all duration-500 flex flex-col gap-2`} style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>

                {/* Quick Edit Bar — appears above FAB when images have been generated */}
                {hasGeneratedImages && onQuickEdit && (
                    <div className="w-full animate-in slide-in-from-bottom-2 fade-in duration-200">
                        <div className={`flex items-center gap-2.5 bg-light-surface/97 dark:bg-[#1a1a1a]/94 backdrop-blur-[32px] border rounded-[24px] px-3.5 py-2.5 shadow-floating-bar transition-all ${quickEditSourceImage ? 'border-brand-yellow/40' : 'border-light-border/60 dark:border-white/[0.10] focus-within:border-brand-yellow/50 dark:focus-within:border-brand-yellow/40'}`}>
                            {quickEditSourceImage ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    <img src={quickEditSourceImage.thumbnailDataUrl || quickEditSourceImage.imageDataUrl} alt="" className="w-5 h-5 rounded object-cover border border-brand-yellow/50 shrink-0" />
                                    <button onClick={onClearQuickEditSource} className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-50 hover:opacity-100">
                                        <XIcon className="w-3 h-3 text-brand-yellow" />
                                    </button>
                                </div>
                            ) : (
                                <svg className="w-3.5 h-3.5 text-brand-yellow/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            )}
                            <input
                                type="text"
                                value={quickEditText}
                                onChange={e => setQuickEditText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && quickEditText.trim()) {
                                        onQuickEdit(quickEditText);
                                        setQuickEditText('');
                                    }
                                }}
                                placeholder={quickEditSourceImage ? "Edit history image: describe the change…" : "Quick edit: make the sky orange, add fog…"}
                                className="flex-1 min-w-0 bg-transparent text-xs text-light-text dark:text-dark-text placeholder:text-light-text-muted/50 dark:placeholder:text-dark-text-muted/50 outline-none nested-inline-input"
                            />
                            <button
                                onClick={() => { if (quickEditText.trim()) { onQuickEdit(quickEditText); setQuickEditText(''); } }}
                                disabled={!quickEditText.trim()}
                                className="shrink-0 px-3 py-1.5 rounded-[12px] bg-brand-yellow/15 hover:bg-brand-yellow/30 text-brand-yellow text-[10px] font-bold disabled:opacity-30 transition-all whitespace-nowrap border border-brand-yellow/20"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* FAB inner wrapper — relative so absolute visual-body clamps to it */}
                <div className="relative">

                {/* Visual Body - Handles Background, Border, Shadow and CLIPPING of the loading bar */}
                <div className="absolute inset-0 bg-light-surface/97 dark:bg-[#1a1a1a]/94 backdrop-blur-[32px] border border-light-border/60 dark:border-white/[0.10] rounded-[28px] shadow-floating-bar overflow-hidden">
                    {isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden rounded-t-[32px]">
                        <div
                            className="animate-shimmer h-full w-full"
                            style={{
                                background: 'linear-gradient(90deg, var(--background) 0%, var(--background) 15%, color-mix(in srgb, var(--color-brand-yellow) 90%, transparent) 40%, var(--color-brand-yellow) 50%, color-mix(in srgb, var(--color-brand-yellow) 90%, transparent) 60%, var(--background) 85%, var(--background) 100%)',
                                backgroundSize: '200% 100%'
                            }}
                        />
                    </div>
                )}

                </div>

                {/* Interactive Content */}
                <div className="relative z-10 p-2 flex flex-col gap-2">
                    {/* Top Row: Prompt Only */}
                    <div className="flex items-center gap-2.5">
                        <div className={`flex-1 relative bg-light-bg/60 dark:bg-white/[0.04] rounded-[20px] border overflow-hidden transition-all duration-300 ${isEnhancing ? 'border-brand-yellow/40 ring-2 ring-brand-yellow/20 ring-offset-2 dark:ring-offset-[#1a1a1a] animate-pulse bg-brand-yellow/5' : 'border-light-border/50 dark:border-white/[0.08] hover:border-light-border dark:hover:border-white/[0.13] focus-within:border-brand-yellow/50 dark:focus-within:border-brand-yellow/40 focus-within:ring-2 focus-within:ring-brand-yellow/15 focus-within:ring-offset-0'}`}>
                            <textarea
                                ref={promptTextareaRef}
                                value={localPrompt}
                                onChange={(e) => handlePromptChange(e.target.value)}
                                rows={1}
                                placeholder={isEnhancing ? (language === 'it' ? 'L\'Art Director sta perfezionando...' : 'Art Director is perfecting...') : (t.promptPlaceholder || "Describe what you want to generate...")}
                                className="w-full px-5 py-3.5 pr-20 bg-transparent text-sm lg:text-[15px] text-light-text dark:text-dark-text outline-none resize-none max-h-[120px] hide-scrollbar placeholder:opacity-40 leading-relaxed font-medium floating-prompt-textarea"
                                disabled={isEnhancing}
                            />

                            {/* Top Right Actions inside Textarea */}
                            <div className="absolute top-3 right-3 flex gap-1 bg-light-surface/50 dark:bg-dark-surface/50 rounded-lg p-0.5 backdrop-blur-sm border border-black/5 dark:border-white/5">
                                {!prompt && (
                                    <button
                                        onClick={handlePaste}
                                        className={`p-1.5 rounded-md transition-all opacity-60 hover:opacity-100 ${justPasteFailed ? 'text-red-400' : 'text-light-text-muted dark:text-dark-text-muted hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        title={justPasteFailed ? "Clipboard access denied" : "Paste from clipboard"}
                                    >
                                        {justPasteFailed
                                            ? <XIcon className="w-3.5 h-3.5" />
                                            : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        }
                                    </button>
                                )}
                                {prompt && !isEnhancing && (
                                    <>
                                        <button
                                            onClick={handleCopy}
                                            className="p-1.5 rounded-lg text-light-text-muted dark:text-dark-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all opacity-60 hover:opacity-100"
                                            title="Copy prompt"
                                        >
                                            {justCopied ? (
                                                <CheckIcon className="w-3.5 h-3.5 text-brand-yellow" />
                                            ) : (
                                                <CopyIcon className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                        <div className="w-[1px] bg-black/10 dark:bg-white/10 my-1 mx-0.5"></div>
                                        <button
                                            onClick={() => onPromptChange('')}
                                            className="p-1.5 hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent rounded-md transition-all group opacity-60 hover:opacity-100"
                                            title="Clear Image"
                                        >
                                            <XIcon className="w-3.5 h-3.5 text-light-text dark:text-dark-text group-hover:text-brand-yellow transition-colors" />
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>

                        {/* Custom scroll arrows — outside the textarea container, no overlap */}
                        {isTextareaScrollable && (
                            <div className="flex flex-col gap-1 self-center flex-shrink-0">
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); scrollTextarea('up'); }}
                                    className="w-6 h-6 rounded-lg bg-brand-yellow/10 hover:bg-brand-yellow/25 border border-brand-yellow/20 hover:border-brand-yellow/50 flex items-center justify-center transition-all"
                                    title="Scroll up"
                                >
                                    <svg className="w-3.5 h-3.5 text-brand-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                                </button>
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); scrollTextarea('down'); }}
                                    className="w-6 h-6 rounded-lg bg-brand-yellow/10 hover:bg-brand-yellow/25 border border-brand-yellow/20 hover:border-brand-yellow/50 flex items-center justify-center transition-all"
                                    title="Scroll down"
                                >
                                    <svg className="w-3.5 h-3.5 text-brand-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bottom Row: Controls + Action Buttons */}
                    <div className="flex items-center pb-1 px-1.5 gap-2">

                        {/* Scrollable controls strip with fade hint */}
                        <div className="relative flex-1 min-w-0">
                        <div ref={scrollStripRef} className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                        {/* Fade gradient — hints that strip is scrollable on mobile */}
                        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-light-surface/80 dark:from-dark-surface/80 to-transparent z-10 lg:hidden" />

                        {/* 1. Pill Settings Group */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-0.5 gap-0.5 h-10 flex-shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); const next = !showAspectMenu; closeAllMenus(); setShowAspectMenu(next); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showAspectMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                            >
                                {getAspectRatioIcon(aspectRatio)}
                                {aspectRatio}
                            </button>
                        </div>

                        {/* 2. Model Group */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-0.5 gap-0.5 h-10 flex-shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); const next = !showModelMenu; closeAllMenus(); setShowModelMenu(next); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showModelMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                            >
                                <StarIcon className="w-3.5 h-3.5" />
                                {selectedModel === 'gemini-3-pro-image-preview' ? (t.modelPro || 'PRO') : selectedModel === 'gemini-3.1-flash-image-preview' ? 'NB2' : (t.modelFlash || 'FLASH')}
                            </button>
                            {(selectedModel === 'gemini-3-pro-image-preview' || selectedModel === 'gemini-3.1-flash-image-preview') && (
                                <>
                                    <div className="w-[1px] h-4 bg-brand-yellow/20 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); const next = !showResolutionMenu; closeAllMenus(); setShowResolutionMenu(next); }}
                                        className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${showResolutionMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                                    >
                                        {selectedResolution.toUpperCase()}
                                    </button>
                                    <div className="w-[1px] h-4 bg-brand-yellow/20 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); const next = !showThinkingMenu; closeAllMenus(); setShowThinkingMenu(next); }}
                                        className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${showThinkingMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                                        aria-label={`Thinking depth: ${thinkingLevel}`}
                                        title="Thinking level — controls internal reasoning depth"
                                    >
                                        {thinkingLevel === 'minimal'
                                            ? <ZapIcon className="w-3.5 h-3.5" />
                                            : thinkingLevel === 'medium'
                                                ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="9" y2="18"/></svg>
                                                : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                                        }
                                    </button>
                                </>
                            )}
                        </div>

                        {/* 3. Toggles */}
                        <div className="flex items-center gap-1.5 h-10 flex-shrink-0">
                            {/* Auto Enhance Switch */}
                            <div className={`flex items-center bg-black/5 dark:bg-white/5 border rounded-xl px-3 gap-2.5 h-10 transition-all hover:bg-black/10 dark:hover:bg-white/10 ${autoEnhance ? 'border-brand-yellow/30 ring-1 ring-brand-yellow/20' : 'border-black/5 dark:border-white/5 grayscale saturate-0'}`} title={t.autoEnhance}>
                                <SparklesIcon className={`w-4 h-4 transition-opacity ${autoEnhance ? 'opacity-100 text-brand-yellow' : 'opacity-50 text-dark-text-muted'}`} />
                                <div
                                    onClick={() => onAutoEnhanceChange(!autoEnhance)}
                                    className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors duration-300 ease-in-out border border-transparent ${autoEnhance ? 'bg-black/80 dark:bg-white/20' : 'bg-black/20 dark:bg-white/10'}`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${autoEnhance
                                            ? 'translate-x-[18px] bg-brand-yellow glow-accent-xl'
                                            : 'translate-x-0.5 bg-white/40 dark:bg-white/60'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Form Transfer Toggle — visible only when reference images are present */}
                            {referenceCount > 0 && (
                                <div
                                    className={`flex items-center bg-black/5 dark:bg-white/5 border rounded-xl px-3 gap-2.5 h-10 transition-all hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${poseTransfer ? 'border-brand-yellow/30 ring-1 ring-brand-yellow/20' : 'border-black/5 dark:border-white/5 grayscale saturate-0'}`}
                                    title={poseTransfer ? (language === 'it' ? 'Form Transfer attivo — replica forma/silhouette dalla reference' : 'Form Transfer active — replicating form/silhouette from reference') : (language === 'it' ? 'Form Transfer — replica forma e silhouette dalla prima reference' : 'Form Transfer — replicate form and silhouette from first reference')}
                                    onClick={() => onPoseTransferChange(!poseTransfer)}
                                >
                                    <ShapeIcon className={`w-4 h-4 transition-opacity ${poseTransfer ? 'opacity-100 text-brand-yellow' : 'opacity-50 text-dark-text-muted'}`} />
                                    <div
                                        className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors duration-300 ease-in-out border border-transparent ${poseTransfer ? 'bg-black/80 dark:bg-white/20' : 'bg-black/20 dark:bg-white/10'}`}
                                    >
                                        <div
                                            className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${poseTransfer ? 'translate-x-[18px] bg-brand-yellow glow-accent-xl' : 'translate-x-0.5 bg-white/40 dark:bg-white/60'}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Precise Profile Pill */}
                            <button
                                onClick={() => hasReferences && onPreciseReferenceChange(!preciseReference)}
                                className={`h-full group relative flex items-center justify-center w-10 rounded-xl transition-all border ${preciseReference ? 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow dark:text-brand-yellow' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text-muted dark:text-dark-text-muted hover:bg-white/5 grayscale saturate-0'} ${!hasReferences ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!hasReferences}
                                aria-label={t.preciseReference}
                                title={t.preciseReference}
                            >
                                <UserIcon className="w-4 h-4" />
                            </button>

                            {/* Google Grounding Pill */}
                            <button
                                onClick={() => onGroundingChange(!useGrounding)}
                                className={`h-full group relative flex items-center justify-center w-10 rounded-xl transition-all border ${useGrounding ? 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow dark:text-brand-yellow' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text-muted dark:text-dark-text-muted hover:bg-white/5 grayscale saturate-0'}`}
                                aria-label={selectedModel === 'gemini-3.1-flash-image-preview' ? 'Image Search Grounding (Text + Images)' : (t.groundingLabel || 'Google Grounding')}
                                title={selectedModel === 'gemini-3.1-flash-image-preview' ? 'Image Search Grounding (Text + Images)' : (t.groundingLabel || 'Google Grounding')}
                            >
                                <LanguageIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                {selectedModel === 'gemini-3.1-flash-image-preview' && useGrounding && (
                                    <span className="absolute -top-1 -right-1 bg-brand-yellow text-dark-bg rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm">
                                        <ImageIcon className="w-2.5 h-2.5" />
                                    </span>
                                )}
                            </button>

                            {/* Outpaint pill — visible when reference images are loaded OR when there are generated images */}
                            {(referenceCount > 0 || hasGeneratedImages) && (
                                <div className="h-full relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); const next = !showOutpaintRefMenu; closeAllMenus(); setShowOutpaintRefMenu(next); }}
                                        className={`h-full flex items-center gap-1.5 px-2.5 rounded-xl transition-all border text-[10px] font-bold ${showOutpaintRefMenu ? 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text-muted dark:text-dark-text-muted hover:bg-white/5'}`}
                                        title="Outpaint reference image"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="5" width="14" height="14" rx="1"/><path d="M5 12H2M22 12h-3M12 5V2M12 22v-3"/></svg>
                                        <span className="hidden sm:inline">Outpaint</span>
                                    </button>
                                    {/* Outpaint menu — anchored above this button */}
                                    {showOutpaintRefMenu && (
                                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-3 animate-slideUp z-[80] w-[220px]" onClick={e => e.stopPropagation()}>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-1.5">Target ratio</p>
                                            <select value={outpaintRefRatio} onChange={e => setOutpaintRefRatio(e.target.value)} className="w-full mb-3 bg-black/5 dark:bg-white/10 text-light-text dark:text-white text-[10px] rounded-lg px-2 py-1.5 border border-light-border dark:border-white/10 outline-none cursor-pointer">
                                                <option value="Auto">Auto (match source)</option>
                                                {['1:1','4:3','3:4','16:9','9:16','3:2','2:3','21:9','4:5','5:4'].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-1.5">Expand</p>
                                            <div className="flex gap-1 mb-1">
                                                <button onClick={() => { onOutpaintReference('horizontal', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 transition-colors text-[10px] font-bold" title="Expand left and right equally"><span>←→</span><span>Horiz</span></button>
                                                <button onClick={() => { onOutpaintReference('vertical', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 transition-colors text-[10px] font-bold" title="Expand top and bottom equally"><span>↑↓</span><span>Vert</span></button>
                                            </div>
                                            <button onClick={() => { onOutpaintReference('all', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="w-full flex items-center justify-center gap-1.5 py-2 mb-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 transition-colors text-[10px] font-bold">
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7l-4 -4m0 0h3m-3 0v3M17 7l4 -4m0 0h-3m3 0v3M7 17l-4 4m0 0h3m-3 0v-3M17 17l4 4m0 0h-3m3 0v-3"/></svg>
                                                <span>All sides</span>
                                            </button>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-1.5">Single side</p>
                                            <div className="grid grid-cols-3 gap-1">
                                                <div />
                                                <button onClick={() => { onOutpaintReference('up', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 flex items-center justify-center transition-colors text-sm">↑</button>
                                                <div />
                                                <button onClick={() => { onOutpaintReference('left', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 flex items-center justify-center transition-colors text-sm">←</button>
                                                <div className="aspect-square rounded-lg bg-light-border/30 dark:bg-white/5 flex items-center justify-center"><svg className="w-2.5 h-2.5 text-light-text-muted dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><rect x="8" y="8" width="8" height="8" rx="1"/></svg></div>
                                                <button onClick={() => { onOutpaintReference('right', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 flex items-center justify-center transition-colors text-sm">→</button>
                                                <div />
                                                <button onClick={() => { onOutpaintReference('down', outpaintRefRatio === 'Auto' ? undefined : outpaintRefRatio); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-light-text-muted dark:text-white/60 flex items-center justify-center transition-colors text-sm">↓</button>
                                                <div />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Advanced Settings Cog */}
                            <button
                                onClick={(e) => { e.stopPropagation(); const next = !showAdvancedPanel; closeAllMenus(); setShowAdvancedPanel(next); }}
                                className={`h-full w-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90 border border-transparent ${showAdvancedPanel ? 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/20 ring-2 ring-brand-yellow/10' : 'bg-black/5 dark:bg-white/5 text-light-text-muted dark:text-dark-text-muted hover:bg-white/10 hover:text-light-text/70 hover:rotate-90 grayscale saturate-0'}`}
                                title={t.advancedSettings}
                            >
                                <SettingsIcon className="w-4 h-4" />
                            </button>
                        </div>

                        </div>{/* end scroll inner */}
                        </div>{/* end scroll wrapper */}

                        {/* 4. Action Buttons (Generate, Stop, Queue) — always visible */}
                        <div className="flex items-center gap-2 h-10 flex-shrink-0">
                            {/* Generate / Stop Button */}
                            <button
                                onClick={() => (isLoading ? onAbortGeneration() : onGenerate())}
                                className={`h-full rounded-[14px] font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.03] active:scale-95 whitespace-nowrap ${isLoading
                                    ? 'px-3 min-w-[80px]'
                                    : 'px-5 bg-brand-yellow text-dark-bg min-w-[120px] font-bold hover:opacity-90 hover:scale-[1.02]'
                                }`}
                                style={isLoading ? {
                                    background: 'var(--color-dark-bg)',
                                    border: '1.5px solid color-mix(in srgb, var(--color-brand-yellow) 33%, transparent)',
                                } : {}}
                                aria-label={isLoading ? t.stopGeneration : t.generateButton}
                                title={isLoading ? t.stopGeneration : t.generateButton}
                            >
                                {isLoading ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" style={{ fill: 'var(--color-brand-yellow)', flexShrink: 0 }}>
                                            <path d="M6 6h12v12H6z"/>
                                        </svg>
                                        <span style={{ color: 'var(--color-brand-yellow)' }}>{t.stopGeneration || 'STOP'}</span>
                                    </>
                                ) : (
                                    <>
                                        <ZapIcon className="w-4 h-4" />
                                        <span>{t.generateButton || "GENERATE"}</span>
                                    </>
                                )}
                            </button>


                            {/* Queue Button (Only appearing when loading) */}
                            {isLoading && (
                                <button
                                    onClick={onGenerate}
                                    className="group h-full w-[40px] bg-dark-surface rounded-[14px] transition-all flex items-center justify-center shadow-md hover:scale-[1.03] active:scale-95 focus:outline-none hover:bg-brand-yellow"
                                    style={{ border: '1.5px solid color-mix(in srgb, var(--color-brand-yellow) 33%, transparent)' }}
                                    title={t.putInQueue || "Queue"}
                                >
                                    <PlusIcon className="w-5 h-5 text-brand-yellow group-hover:text-dark-bg transition-colors" />
                                </button>
                            )}


                        </div>
                    </div>
                </div>

                {/* --- Popover Menus --- */}
                {/* Aspect Ratio Menu */}
                {showAspectMenu && (
                    <div className="absolute bottom-full mb-4 left-0 right-0 lg:right-auto lg:left-6 lg:min-w-[320px] bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-2.5 grid grid-cols-3 sm:grid-cols-4 gap-1.5 animate-slideUp z-[80]">
                        <div className="col-span-3 sm:col-span-4 px-2 py-1 mb-1 border-b border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">Aspect Ratio</span>
                        </div>
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => { onAspectRatioChange(ratio); setShowAspectMenu(false); }}
                                className={`px-2 py-2.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1.5 border ${ratio === aspectRatio ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-lg shadow-brand-yellow/20' : 'hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent hover:border-light-border dark:hover:border-white/10'}`}
                            >
                                {getAspectRatioIcon(ratio)}
                                <span>{ratio}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Number of Images Menu */}
                {showNumImagesMenu && (
                    <div className="absolute bottom-full mb-4 left-0 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-2 flex gap-1.5 animate-slideUp z-[80]">
                        {numImagesOptions.map(num => (
                            <button
                                key={num}
                                onClick={() => { onNumImagesChange(num); setShowNumImagesMenu(false); }}
                                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-extrabold transition-all border ${num === numImages ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-lg shadow-brand-yellow/20' : 'hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                            >
                                {num} IMAGE{num > 1 ? 'S' : ''}
                            </button>
                        ))}
                    </div>
                )}

                {/* Model Selector Menu */}
                {showModelMenu && (
                    <div className="absolute bottom-full mb-4 left-0 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 animate-slideUp min-w-[210px] z-[80]">
                        <div className="px-3 py-1.5 mb-1 border-b border-light-border/10 dark:border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">Select Model</span>
                        </div>
                        <button
                            onClick={() => { onModelChange('gemini-3-pro-image-preview'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-3-pro-image-preview' ? 'bg-brand-yellow text-dark-bg border-brand-yellow' : 'hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className="flex items-center gap-2.5">
                                <StarIcon className={`w-3.5 h-3.5 ${selectedModel === 'gemini-3-pro-image-preview' ? 'text-dark-bg' : 'text-light-text dark:text-dark-text'}`} />
                                <span className={selectedModel === 'gemini-3-pro-image-preview' ? 'text-dark-bg' : ''}>Nano Banana PRO</span>
                            </span>
                            {selectedModel === 'gemini-3-pro-image-preview' && <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => { onModelChange('gemini-2.5-flash-image'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-2.5-flash-image' ? 'bg-brand-yellow text-dark-bg border-brand-yellow' : 'hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className={`flex items-center gap-2.5 ${selectedModel !== 'gemini-2.5-flash-image' && 'opacity-80'}`}>
                                <ZapIcon className={`w-3.5 h-3.5 ${selectedModel === 'gemini-2.5-flash-image' ? 'text-dark-bg' : 'text-light-text-muted dark:text-dark-text-muted'}`} />
                                <span className={selectedModel === 'gemini-2.5-flash-image' ? 'text-dark-bg' : ''}>Nano Banana FLASH</span>
                            </span>
                            {selectedModel === 'gemini-2.5-flash-image' && <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => { onModelChange('gemini-3.1-flash-image-preview'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-3.1-flash-image-preview' ? 'bg-brand-yellow text-dark-bg border-brand-yellow' : 'hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className="flex items-center gap-2.5">
                                <Layers2Icon className={`w-3.5 h-3.5 ${selectedModel === 'gemini-3.1-flash-image-preview' ? 'text-dark-bg' : 'text-light-text dark:text-dark-text'}`} />
                                <span className={selectedModel === 'gemini-3.1-flash-image-preview' ? 'text-dark-bg' : ''}>Nano Banana 2</span>
                            </span>
                            {selectedModel === 'gemini-3.1-flash-image-preview' && <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                )}

                {/* Resolution Menu */}
                {showResolutionMenu && (
                    <div className="absolute bottom-full mb-4 right-0 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-2 flex gap-1.5 animate-slideUp z-[80]">
                        {resolutionOptions.map(res => (
                            <button
                                key={res}
                                onClick={() => { onResolutionChange(res as ResolutionType); setShowResolutionMenu(false); }}
                                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-extrabold transition-all border ${selectedResolution === res ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-lg shadow-brand-yellow/20' : 'hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                            >
                                {res.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* Thinking Level Menu */}
                {showThinkingMenu && (
                    <div className="absolute bottom-full mb-4 right-0 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-3 animate-slideUp z-[80] min-w-[220px]">
                        <p className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-2 px-1">Thinking Depth</p>
                        {([
                            {
                                level: 'minimal' as ThinkingLevel,
                                icon: <ZapIcon className="w-4 h-4" />,
                                label: 'Fast',
                                desc: 'Minimal reasoning — fastest'
                            },
                            {
                                level: 'medium' as ThinkingLevel,
                                icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="9" y2="18"/></svg>,
                                label: 'Balanced',
                                desc: 'More creative, slightly slower'
                            },
                            {
                                level: 'high' as ThinkingLevel,
                                icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>,
                                label: 'Deep',
                                desc: 'Max reasoning — best quality'
                            },
                        ]).map(({ level, icon, label, desc }) => (
                            <button
                                key={level}
                                onClick={() => { onThinkingLevelChange(level); setShowThinkingMenu(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-left transition-all ${thinkingLevel === level ? 'bg-brand-yellow/15 border border-brand-yellow/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <span className={`shrink-0 ${thinkingLevel === level ? 'text-brand-yellow' : 'text-light-text-muted dark:text-dark-text-muted'}`}>{icon}</span>
                                <div>
                                    <p className={`text-[11px] font-extrabold ${thinkingLevel === level ? 'text-brand-yellow' : 'text-light-text dark:text-dark-text'}`}>{label}</p>
                                    <p className="text-[9px] text-light-text-muted dark:text-dark-text-muted">{desc}</p>
                                </div>
                                {thinkingLevel === level && <CheckIcon className="w-3.5 h-3.5 text-brand-yellow ml-auto" />}
                            </button>
                        ))}
                    </div>
                )}
                </div>{/* end FAB inner relative wrapper */}
            </div>
        </>
    );
};

export default FloatingActionBar;
