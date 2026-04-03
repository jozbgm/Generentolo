import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../App';
import { ModelType, ResolutionType, ThinkingLevel } from '../types';
import { XIcon, CopyIcon, PlusIcon, SparklesIcon, UserIcon, LanguageIcon, ImageIcon, SettingsIcon, ZapIcon, StarIcon, DiceIcon, CheckIcon, ReloadIcon, ClapperboardIcon, Layers2Icon, MonitorIcon, SmartphoneIcon, RatioSquareIcon } from './icons';

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
    onOutpaintReference: (direction: 'up' | 'down' | 'left' | 'right') => void;
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
}) => {
    const { t, language } = useLocalization();

    // v2.3: Local prompt state + debounced parent update (prevents re-render storm on every keystroke)
    const [localPrompt, setLocalPrompt] = useState(prompt);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => { setLocalPrompt(prompt); }, [prompt]);
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
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set height to scrollHeight, but cap at max-height (120px as defined in className)
            const newHeight = Math.min(textarea.scrollHeight, 120);
            textarea.style.height = `${newHeight}px`;
        }
    }, [prompt, promptTextareaRef]);

    // Handle paste
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onPromptChange(text);
            // Focus textarea after paste
            promptTextareaRef.current?.focus();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
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
            {(showAdvancedPanel || showAspectMenu || showNumImagesMenu || showModelMenu || showResolutionMenu || showThinkingMenu) && (
                <div
                    className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[65] animate-fadeIn"
                    onClick={() => {
                        setShowAdvancedPanel(false);
                        setShowAspectMenu(false);
                        setShowNumImagesMenu(false);
                        setShowModelMenu(false);
                        setShowResolutionMenu(false);
                        setShowThinkingMenu(false);
                    }}
                />
            )}

            {/* Advanced Settings Popover */}
            {showAdvancedPanel && (
                <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 lg:left-[calc(50%-20px)] lg:-translate-x-1/2 w-[90%] lg:w-[400px] z-[80]">
                    <div className="w-full bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-4 animate-slideUp">
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

            {/* Main Floating Bar */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%-20px)] lg:-translate-x-1/2 w-[95%] lg:w-fit lg:min-w-[720px] max-w-5xl z-[70] transition-all duration-500`}>

                {/* Visual Body - Handles Background, Border, Shadow and CLIPPING of the loading bar */}
                <div className="absolute inset-0 bg-light-surface/85 dark:bg-dark-surface/65 backdrop-blur-[40px] border border-white/20 dark:border-white/10 rounded-[32px] shadow-floating-bar overflow-hidden">
                    {isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden rounded-t-[32px]">
                        <div
                            className="animate-shimmer h-full w-full"
                            style={{
                                background: 'linear-gradient(90deg, #1c0e00 0%, #1c0e00 15%, color-mix(in srgb, var(--color-brand-yellow) 90%, transparent) 40%, var(--color-brand-yellow) 50%, color-mix(in srgb, var(--color-brand-yellow) 90%, transparent) 60%, #1c0e00 85%, #1c0e00 100%)',
                                backgroundSize: '200% 100%'
                            }}
                        />
                    </div>
                )}

                </div>

                {/* Interactive Content */}
                <div className="relative z-10 p-2.5 flex flex-col gap-2.5">
                    {/* Top Row: Prompt Only */}
                    <div className="flex items-center gap-3">
                        <div className={`flex-1 relative bg-black/5 dark:bg-white/5 rounded-[22px] border border-black/5 dark:border-white/5 transition-all duration-300 ${isEnhancing ? 'ring-2 ring-brand-yellow/50 ring-offset-4 dark:ring-offset-black animate-pulse bg-brand-yellow/5' : 'hover:bg-black/[0.07] dark:hover:bg-white/[0.07]'}`}>
                            <textarea
                                ref={promptTextareaRef}
                                value={localPrompt}
                                onChange={(e) => handlePromptChange(e.target.value)}
                                rows={1}
                                placeholder={isEnhancing ? (language === 'it' ? 'L\'Art Director sta perfezionando...' : 'Art Director is perfecting...') : (t.promptPlaceholder || "Describe what you want to generate...")}
                                className="w-full px-5 py-3.5 pr-20 bg-transparent text-sm lg:text-[15px] text-light-text dark:text-dark-text outline-none resize-none max-h-[120px] custom-scrollbar placeholder:opacity-40 leading-relaxed font-medium floating-prompt-textarea"
                                disabled={isEnhancing}
                            />

                            {/* Top Right Actions inside Textarea */}
                            <div className="absolute top-3 right-3 flex gap-1 bg-light-surface/50 dark:bg-dark-surface/50 rounded-lg p-0.5 backdrop-blur-sm border border-black/5 dark:border-white/5">
                                {!prompt && (
                                    <button
                                        onClick={handlePaste}
                                        className="p-1.5 rounded-md text-light-text-muted dark:text-dark-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all opacity-60 hover:opacity-100"
                                        title="Paste from clipboard"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
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
                    </div>

                    {/* Bottom Row: Controls + Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap pb-1 px-1.5">

                        {/* 1. Pill Settings Group */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-0.5 gap-0.5 h-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAspectMenu(!showAspectMenu); setShowNumImagesMenu(false); setShowModelMenu(false); setShowResolutionMenu(false); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showAspectMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                            >
                                {getAspectRatioIcon(aspectRatio)}
                                {aspectRatio}
                            </button>
                            <div className="w-[1px] h-4 bg-brand-yellow/20 mx-0.5" />
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowNumImagesMenu(!showNumImagesMenu); setShowAspectMenu(false); setShowModelMenu(false); setShowResolutionMenu(false); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${showNumImagesMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                            >
                                {numImages}x
                            </button>
                        </div>

                        {/* 2. Model Group */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-0.5 gap-0.5 h-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowModelMenu(!showModelMenu); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowResolutionMenu(false); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showModelMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                            >
                                <StarIcon className="w-3.5 h-3.5" />
                                {selectedModel === 'gemini-3-pro-image-preview' ? (t.modelPro || 'PRO') : selectedModel === 'gemini-3.1-flash-image-preview' ? 'NB2' : (t.modelFlash || 'FLASH')}
                            </button>
                            {(selectedModel === 'gemini-3-pro-image-preview' || selectedModel === 'gemini-3.1-flash-image-preview') && (
                                <>
                                    <div className="w-[1px] h-4 bg-brand-yellow/20 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowResolutionMenu(!showResolutionMenu); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowModelMenu(false); setShowThinkingMenu(false); }}
                                        className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${showResolutionMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
                                    >
                                        {selectedResolution.toUpperCase()}
                                    </button>
                                    <div className="w-[1px] h-4 bg-brand-yellow/20 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowThinkingMenu(!showThinkingMenu); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowModelMenu(false); setShowResolutionMenu(false); }}
                                        className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${showThinkingMenu ? 'bg-brand-yellow text-dark-bg shadow-sm' : 'bg-brand-yellow/10 text-brand-yellow/80 hover:bg-brand-yellow/15'}`}
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
                        <div className="flex items-center gap-1.5 h-10">
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

                            {/* Precise Profile Pill */}
                            <button
                                onClick={() => hasReferences && onPreciseReferenceChange(!preciseReference)}
                                className={`h-full group relative flex items-center justify-center w-10 rounded-xl transition-all border ${preciseReference ? 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow dark:text-brand-yellow' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text-muted dark:text-dark-text-muted hover:bg-white/5 grayscale saturate-0'} ${!hasReferences ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!hasReferences}
                                title={t.preciseReference}
                            >
                                <UserIcon className="w-4 h-4" />
                            </button>

                            {/* Google Grounding Pill */}
                            <button
                                onClick={() => onGroundingChange(!useGrounding)}
                                className={`h-full group relative flex items-center justify-center w-10 rounded-xl transition-all border ${useGrounding ? 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow dark:text-brand-yellow' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text-muted dark:text-dark-text-muted hover:bg-white/5 grayscale saturate-0'}`}
                                title={selectedModel === 'gemini-3.1-flash-image-preview' ? 'Image Search Grounding (Text + Images)' : (t.groundingLabel || 'Google Grounding')}
                            >
                                <LanguageIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                {selectedModel === 'gemini-3.1-flash-image-preview' && useGrounding && (
                                    <span className="absolute -top-1 -right-1 bg-brand-yellow text-dark-bg rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm">
                                        <ImageIcon className="w-2.5 h-2.5" />
                                    </span>
                                )}
                            </button>

                            {/* Outpaint Reference pill — visible only when reference images are loaded */}
                            {referenceCount > 0 && (
                                <div className="relative h-full">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowOutpaintRefMenu(v => !v); setShowAdvancedPanel(false); setShowModelMenu(false); setShowResolutionMenu(false); setShowThinkingMenu(false); }}
                                        className={`h-full flex items-center gap-1.5 px-2.5 rounded-xl transition-all border text-[10px] font-bold ${showOutpaintRefMenu ? 'bg-brand-yellow/15 border-brand-yellow/30 text-brand-yellow' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text-muted dark:text-dark-text-muted hover:bg-white/5'}`}
                                        title="Outpaint reference image"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="5" width="14" height="14" rx="1"/><path d="M5 12H2M22 12h-3M12 5V2M12 22v-3"/></svg>
                                        <span className="hidden sm:inline">Outpaint</span>
                                    </button>
                                    {showOutpaintRefMenu && (
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-surface/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-3 z-50 min-w-[130px]" onClick={e => e.stopPropagation()}>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-dark-text-muted mb-2 text-center">REF.1 direction</p>
                                            <div className="grid grid-cols-3 gap-1">
                                                <div />
                                                <button onClick={() => { onOutpaintReference('up'); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-white/60 flex items-center justify-center transition-colors text-sm">↑</button>
                                                <div />
                                                <button onClick={() => { onOutpaintReference('left'); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-white/60 flex items-center justify-center transition-colors text-sm">←</button>
                                                <div className="aspect-square rounded-lg bg-white/10 flex items-center justify-center"><svg className="w-3 h-3 text-white/30" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg></div>
                                                <button onClick={() => { onOutpaintReference('right'); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-white/60 flex items-center justify-center transition-colors text-sm">→</button>
                                                <div />
                                                <button onClick={() => { onOutpaintReference('down'); setShowOutpaintRefMenu(false); }} className="aspect-square rounded-lg bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-white/60 flex items-center justify-center transition-colors text-sm">↓</button>
                                                <div />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Advanced Settings Cog */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAdvancedPanel(!showAdvancedPanel); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowModelMenu(false); setShowResolutionMenu(false); setShowThinkingMenu(false); }}
                                className={`h-full w-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90 border border-transparent ${showAdvancedPanel ? 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/20 ring-2 ring-brand-yellow/10' : 'bg-black/5 dark:bg-white/5 text-light-text-muted dark:text-dark-text-muted hover:bg-white/10 hover:text-light-text/70 hover:rotate-90 grayscale saturate-0'}`}
                                title={t.advancedSettings}
                            >
                                <SettingsIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Spacer to push generate buttons to right */}
                        <div className="flex-1 min-w-[20px]" />

                        {/* 4. Action Buttons (Generate, Stop, Queue) */}
                        <div className="flex items-center gap-2 h-10">
                            {/* Generate / Stop Button */}
                            <button
                                onClick={() => (isLoading ? onAbortGeneration() : onGenerate())}
                                className={`h-full rounded-[14px] font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.03] active:scale-95 whitespace-nowrap focus:outline-none ${isLoading
                                    ? 'min-w-[40px] w-[40px] px-0'
                                    : 'px-5 bg-brand-yellow text-dark-bg min-w-[120px] font-bold hover:opacity-90 hover:scale-[1.02]'
                                }`}
                                style={isLoading ? {
                                    background: '#1e1e1e',
                                    border: '1.5px solid color-mix(in srgb, var(--color-brand-yellow) 33%, transparent)',
                                } : {}}
                                title={isLoading ? t.stopGeneration : t.generateButton}
                            >
                                {isLoading ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: 'var(--color-brand-yellow)', display: 'block' }}>
                                        <path d="M6 6h12v12H6z"/>
                                    </svg>
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
                    <div className="absolute bottom-full mb-4 left-6 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 grid grid-cols-4 gap-1.5 animate-slideUp min-w-[320px] z-[80]">
                        <div className="col-span-4 px-2 py-1 mb-1 border-b border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">Aspect Ratio</span>
                        </div>
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => { onAspectRatioChange(ratio); setShowAspectMenu(false); }}
                                className={`px-2 py-2.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1.5 border ${ratio === aspectRatio ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-lg shadow-brand-yellow/20' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent hover:border-white/10'}`}
                            >
                                {getAspectRatioIcon(ratio)}
                                <span>{ratio}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Number of Images Menu */}
                {showNumImagesMenu && (
                    <div className="absolute bottom-full mb-4 left-24 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex gap-1.5 animate-slideUp z-[80]">
                        {numImagesOptions.map(num => (
                            <button
                                key={num}
                                onClick={() => { onNumImagesChange(num); setShowNumImagesMenu(false); }}
                                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-extrabold transition-all border ${num === numImages ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-lg shadow-brand-yellow/20' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                            >
                                {num} IMAGE{num > 1 ? 'S' : ''}
                            </button>
                        ))}
                    </div>
                )}

                {/* Model Selector Menu */}
                {showModelMenu && (
                    <div className="absolute bottom-full mb-4 left-44 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 anime-slideUp min-w-[210px] z-[80]">
                        <div className="px-3 py-1.5 mb-1 border-b border-light-border/10 dark:border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">Select Model</span>
                        </div>
                        <button
                            onClick={() => { onModelChange('gemini-3-pro-image-preview'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-3-pro-image-preview' ? 'bg-brand-yellow text-dark-bg border-brand-yellow' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className="flex items-center gap-2.5">
                                <StarIcon className={`w-3.5 h-3.5 ${selectedModel === 'gemini-3-pro-image-preview' ? 'text-dark-bg' : 'text-light-text dark:text-dark-text'}`} />
                                <span className={selectedModel === 'gemini-3-pro-image-preview' ? 'text-dark-bg' : ''}>Nano Banana PRO</span>
                            </span>
                            {selectedModel === 'gemini-3-pro-image-preview' && <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => { onModelChange('gemini-2.5-flash-image'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-2.5-flash-image' ? 'bg-brand-yellow text-dark-bg border-brand-yellow' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className={`flex items-center gap-2.5 ${selectedModel !== 'gemini-2.5-flash-image' && 'opacity-80'}`}>
                                <ZapIcon className={`w-3.5 h-3.5 ${selectedModel === 'gemini-2.5-flash-image' ? 'text-dark-bg' : 'text-light-text-muted dark:text-dark-text-muted'}`} />
                                <span className={selectedModel === 'gemini-2.5-flash-image' ? 'text-dark-bg' : ''}>Nano Banana FLASH</span>
                            </span>
                            {selectedModel === 'gemini-2.5-flash-image' && <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => { onModelChange('gemini-3.1-flash-image-preview'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-3.1-flash-image-preview' ? 'bg-brand-yellow text-dark-bg border-brand-yellow' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
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
                    <div className="absolute bottom-full mb-4 left-64 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex gap-1.5 animate-slideUp z-[80]">
                        {resolutionOptions.map(res => (
                            <button
                                key={res}
                                onClick={() => { onResolutionChange(res as ResolutionType); setShowResolutionMenu(false); }}
                                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-extrabold transition-all border ${selectedResolution === res ? 'bg-brand-yellow text-dark-bg border-brand-yellow shadow-lg shadow-brand-yellow/20' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                            >
                                {res.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* Thinking Level Menu */}
                {showThinkingMenu && (
                    <div className="absolute bottom-full mb-4 left-64 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-3 animate-slideUp z-[80] min-w-[220px]">
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
            </div>
        </>
    );
};

export default FloatingActionBar;
