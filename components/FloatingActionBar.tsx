import React, { useState, useEffect } from 'react';
import { useLocalization } from '../App';
import { ModelType, ResolutionType } from '../types';
import { XIcon, CopyIcon } from './icons';

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
    dynamicTools: any[];
    onGenerateTools: () => void;
    isToolsLoading: boolean;
    selectedModel: ModelType;
    onModelChange: (model: ModelType) => void;
    selectedResolution: ResolutionType;
    onResolutionChange: (resolution: ResolutionType) => void;
    isEnhancing?: boolean;
    referenceCount: number;
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
    isEnhancing,
}) => {
    const { t, language } = useLocalization();
    const [showAspectMenu, setShowAspectMenu] = useState(false);
    const [showNumImagesMenu, setShowNumImagesMenu] = useState(false);
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [showResolutionMenu, setShowResolutionMenu] = useState(false);

    // UI state for copy feedback
    const [justCopied, setJustCopied] = useState(false);

    const aspectRatios = ["Auto", "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "4:5", "5:4", "21:9"];
    const numImagesOptions = [1, 2];

    const getAspectRatioIcon = (ratio: string) => {
        if (ratio === 'Auto') return '🔄';
        const [w, h] = ratio.split(':').map(Number);
        if (w > h) return '🌅';
        if (h > w) return '📱';
        return '⬜';
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
            {(showAdvancedPanel || showAspectMenu || showNumImagesMenu || showModelMenu || showResolutionMenu) && (
                <div
                    className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[65] animate-fadeIn"
                    onClick={() => {
                        setShowAdvancedPanel(false);
                        setShowAspectMenu(false);
                        setShowNumImagesMenu(false);
                        setShowModelMenu(false);
                        setShowResolutionMenu(false);
                    }}
                />
            )}

            {/* Advanced Settings Popover */}
            {showAdvancedPanel && (
                <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 lg:left-[calc(50%-20px)] lg:-translate-x-1/2 w-[90%] lg:w-[400px] bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-[80] p-4 animate-slideUp">
                    <div className="flex items-center justify-between mb-3 border-b border-light-border/10 dark:border-white/10 pb-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-purple">{t.advancedSettings || 'Advanced Settings'}</h3>
                        <button onClick={() => setShowAdvancedPanel(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-xs opacity-50 hover:opacity-100">✕</button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted mb-1.5 block">{t.negativePrompt || 'Negative Prompt'}</label>
                            <textarea
                                value={negativePrompt}
                                onChange={(e) => onNegativePromptChange(e.target.value)}
                                placeholder="Avoid (e.g. text, watermark, low quality)..."
                                className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-purple/50 resize-none h-20 transition-all placeholder:opacity-30"
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
                                        className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-purple/50"
                                    />
                                    <button
                                        onClick={onRandomizeSeed}
                                        className="px-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-black/5 dark:border-white/5"
                                        title="Randomize"
                                    >
                                        🎲
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Floating Bar */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%-20px)] lg:-translate-x-1/2 w-[95%] lg:w-fit lg:min-w-[720px] max-w-5xl z-[70] transition-all duration-500`}>

                {/* Visual Body - Handles Background, Border, Shadow and CLIPPING of the loading bar */}
                <div className="absolute inset-0 bg-light-surface/85 dark:bg-dark-surface/65 backdrop-blur-[40px] border border-white/20 dark:border-white/10 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
                    {isLoading && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-purple/5">
                            <div className="h-full bg-gradient-to-r from-brand-purple via-brand-magenta to-brand-yellow bg-[length:200%_100%] animate-shimmer" />
                        </div>
                    )}
                </div>

                {/* Interactive Content */}
                <div className="relative z-10 p-2.5 flex flex-col gap-2.5">
                    {/* Top Row: Prompt Only */}
                    <div className="flex items-center gap-3">
                        <div className={`flex-1 relative bg-black/5 dark:bg-white/5 rounded-[22px] border border-black/5 dark:border-white/5 transition-all duration-300 ${isEnhancing ? 'ring-2 ring-brand-purple/50 ring-offset-4 dark:ring-offset-black animate-pulse bg-brand-purple/5' : 'hover:bg-black/[0.07] dark:hover:bg-white/[0.07]'}`}>
                            <textarea
                                ref={promptTextareaRef}
                                value={prompt}
                                onChange={(e) => onPromptChange(e.target.value)}
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
                                            className="p-1.5 rounded-md text-light-text-muted dark:text-dark-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all opacity-60 hover:opacity-100"
                                            title="Copy prompt"
                                        >
                                            {justCopied ? (
                                                <span className="text-green-500 font-bold text-xs">✓</span>
                                            ) : (
                                                <CopyIcon className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                        <div className="w-[1px] bg-black/10 dark:bg-white/10 my-1 mx-0.5"></div>
                                        <button
                                            onClick={() => onPromptChange('')}
                                            className="p-1.5 hover:bg-red-500/10 rounded-md transition-all group opacity-60 hover:opacity-100"
                                            title="Clear"
                                        >
                                            <XIcon className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-500 transition-colors" />
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
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showAspectMenu ? 'bg-light-surface dark:bg-dark-surface text-brand-purple shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
                            >
                                <span className="text-sm">{getAspectRatioIcon(aspectRatio)}</span>
                                {aspectRatio}
                            </button>
                            <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5" />
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowNumImagesMenu(!showNumImagesMenu); setShowAspectMenu(false); setShowModelMenu(false); setShowResolutionMenu(false); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${showNumImagesMenu ? 'bg-light-surface dark:bg-dark-surface text-brand-purple shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
                            >
                                {numImages}x
                            </button>
                        </div>

                        {/* 2. Model Group */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-0.5 gap-0.5 h-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowModelMenu(!showModelMenu); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowResolutionMenu(false); }}
                                className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showModelMenu ? 'bg-light-surface dark:bg-dark-surface text-brand-purple shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
                            >
                                <span className={`text-[10px] ${selectedModel === 'gemini-3-pro-image-preview' ? 'text-yellow-500' : 'text-blue-400 opacity-70'}`}>★</span>
                                {selectedModel === 'gemini-3-pro-image-preview' ? (t.modelPro || 'PRO') : (t.modelFlash || 'FLASH')}
                            </button>
                            {selectedModel === 'gemini-3-pro-image-preview' && (
                                <>
                                    <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowResolutionMenu(!showResolutionMenu); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowModelMenu(false); }}
                                        className={`h-full px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${showResolutionMenu ? 'bg-light-surface dark:bg-dark-surface text-brand-purple shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
                                    >
                                        {selectedResolution.toUpperCase()}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* 3. Toggles */}
                        <div className="flex items-center gap-1.5 h-10">
                            {/* Auto Enhance Switch */}
                            <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-3 gap-2.5 h-10 transition-colors hover:bg-black/10 dark:hover:bg-white/10" title={t.autoEnhance}>
                                <span className={`text-sm transition-opacity ${autoEnhance ? 'opacity-100' : 'opacity-50'}`}>✨</span>
                                <div
                                    onClick={() => onAutoEnhanceChange(!autoEnhance)}
                                    className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors duration-300 ease-in-out border border-transparent ${autoEnhance ? 'bg-black/80 dark:bg-white/20' : 'bg-black/20 dark:bg-white/10'}`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${autoEnhance
                                            ? 'translate-x-[18px] bg-[#FFD60A] shadow-[0_0_8px_rgba(255,214,10,0.6)]'
                                            : 'translate-x-0.5 bg-white/40 dark:bg-white/60'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Precise Profile Pill */}
                            <button
                                onClick={() => hasReferences && onPreciseReferenceChange(!preciseReference)}
                                className={`h-full group relative flex items-center justify-center w-10 rounded-xl transition-all border ${preciseReference ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-600 dark:text-yellow-400' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text/40 dark:text-dark-text/40 hover:bg-white/5'} ${!hasReferences ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                                disabled={!hasReferences}
                                title={t.preciseReference}
                            >
                                <span className="text-base leading-none">👨</span>
                            </button>

                            {/* Google Grounding Pill */}
                            <button
                                onClick={() => onGroundingChange(!useGrounding)}
                                className={`h-full group relative flex items-center justify-center w-10 rounded-xl transition-all border ${useGrounding ? 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400' : 'bg-black/5 dark:bg-white/5 border-transparent text-light-text/40 dark:text-dark-text/40 hover:bg-white/5'}`}
                                title={t.groundingLabel || 'Google Grounding'}
                            >
                                <span className="text-base leading-none transition-transform group-hover:scale-110">🌐</span>
                            </button>

                            {/* Advanced Settings Cog */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAdvancedPanel(!showAdvancedPanel); setShowAspectMenu(false); setShowNumImagesMenu(false); setShowModelMenu(false); setShowResolutionMenu(false); }}
                                className={`h-full w-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90 border border-transparent ${showAdvancedPanel ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/20 ring-2 ring-brand-purple/10' : 'bg-black/5 dark:bg-white/5 text-light-text/40 dark:text-dark-text/40 hover:bg-white/10 hover:text-light-text/70 hover:rotate-90'}`}
                                title={t.advancedSettings}
                            >
                                <span className="text-base leading-none">⚙️</span>
                            </button>
                        </div>

                        {/* Spacer to push generate buttons to right */}
                        <div className="flex-1 min-w-[20px]" />

                        {/* 4. Action Buttons (Generate, Stop, Queue) */}
                        <div className="flex items-center gap-2 h-10">
                            {/* Generate / Stop Button */}
                            <button
                                onClick={() => (isLoading ? onAbortGeneration() : onGenerate())}
                                className={`h-full px-5 rounded-[14px] font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.03] active:scale-95 whitespace-nowrap ${isLoading
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 ring-1 ring-red-500/10 min-w-[40px] px-0 w-[40px]'
                                    : 'bg-gradient-to-r from-brand-yellow via-brand-magenta to-brand-yellow bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-brand-yellow/20 min-w-[120px]'
                                    }`}
                                title={isLoading ? t.stopGeneration : t.generateButton}
                            >
                                {isLoading ? (
                                    <span className="text-xl font-bold">✕</span>
                                ) : (
                                    <>
                                        <span className="text-sm">⚡</span>
                                        <span>{t.generateButton || "GENERATE"}</span>
                                    </>
                                )}
                            </button>

                            {/* Queue Button (Only appearing when loading) */}
                            {isLoading && (
                                <button
                                    onClick={onGenerate}
                                    className="h-full w-[40px] bg-brand-purple/10 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple/20 rounded-[14px] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center shadow-md hover:scale-[1.03] active:scale-95 ring-1 ring-brand-purple/10"
                                    title={t.putInQueue || "Queue"}
                                >
                                    <span className="text-sm">➕</span>
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
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple opacity-70">Aspect Ratio</span>
                        </div>
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => { onAspectRatioChange(ratio); setShowAspectMenu(false); }}
                                className={`px-2 py-2.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1.5 border ${ratio === aspectRatio ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent hover:border-white/10'}`}
                            >
                                <span className="text-xl leading-none">{getAspectRatioIcon(ratio)}</span>
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
                                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-extrabold transition-all border ${num === numImages ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
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
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple opacity-70">Select Model</span>
                        </div>
                        <button
                            onClick={() => { onModelChange('gemini-3-pro-image-preview'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-3-pro-image-preview' ? 'bg-brand-purple text-white border-brand-purple' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="text-yellow-500">★</span>
                                <span>Nano Banana PRO</span>
                            </span>
                            {selectedModel === 'gemini-3-pro-image-preview' && <span className="text-xs">✓</span>}
                        </button>
                        <button
                            onClick={() => { onModelChange('gemini-2.5-flash-image'); setShowModelMenu(false); }}
                            className={`px-4 py-3 rounded-[14px] text-[11px] font-bold transition-all text-left flex items-center justify-between border ${selectedModel === 'gemini-2.5-flash-image' ? 'bg-brand-purple text-white border-brand-purple' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                        >
                            <span className="flex items-center gap-2.5 opacity-80">
                                <span className="text-blue-400">⚡</span>
                                <span>Nano Banana FLASH</span>
                            </span>
                            {selectedModel === 'gemini-2.5-flash-image' && <span className="text-xs">✓</span>}
                        </button>
                    </div>
                )}

                {/* Resolution Menu */}
                {showResolutionMenu && (
                    <div className="absolute bottom-full mb-4 left-64 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-[50px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex gap-1.5 animate-slideUp z-[80]">
                        {['1k', '2k', '4k'].map(res => (
                            <button
                                key={res}
                                onClick={() => { onResolutionChange(res as ResolutionType); setShowResolutionMenu(false); }}
                                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-extrabold transition-all border ${selectedResolution === res ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20' : 'hover:bg-white/10 text-light-text/70 dark:text-dark-text/70 border-transparent'}`}
                            >
                                {res.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingActionBar;
