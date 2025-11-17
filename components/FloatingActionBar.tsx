import React, { useState, useCallback } from 'react';
import { useLocalization } from '../App';

interface FloatingActionBarProps {
    // Prompt
    prompt: string;
    onPromptChange: (value: string) => void;
    promptTextareaRef: React.RefObject<HTMLTextAreaElement>;

    // Actions
    onGenerate: () => void;
    onEnhancePrompt: () => void;
    onMagicPrompt: () => void;
    onGenerate3Prompts: () => void;

    // State
    isLoading: boolean;
    isEnhancing: boolean;
    hasReferences: boolean;
    hasGeneratedImages: boolean;

    // Controls
    aspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
    numImages: number;
    onNumImagesChange: (num: number) => void;
    seed: string;
    onSeedChange: (seed: string) => void;
    onRandomizeSeed: () => void;
    negativePrompt: string;
    onNegativePromptChange: (value: string) => void;

    // v0.7: Precise Reference
    preciseReference: boolean;
    onPreciseReferenceChange: (enabled: boolean) => void;

    // Dynamic Tools
    dynamicTools: any[];
    onGenerateTools: () => void;
    isToolsLoading: boolean;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
    prompt,
    onPromptChange,
    promptTextareaRef,
    onGenerate,
    onEnhancePrompt,
    onMagicPrompt,
    onGenerate3Prompts,
    isLoading,
    isEnhancing,
    hasReferences,
    hasGeneratedImages,
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
    dynamicTools,
    onGenerateTools,
    isToolsLoading,
}) => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAspectMenu, setShowAspectMenu] = useState(false);
    const [showNumImagesMenu, setShowNumImagesMenu] = useState(false);
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

    const aspectRatios = ["Auto", "1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
    const numImagesOptions = [1, 2, 3, 4];

    const handleExpandClick = useCallback(() => {
        setIsExpanded(true);
        setShowAdvancedPanel(false);
        setShowAspectMenu(false);
        setShowNumImagesMenu(false);
        setTimeout(() => promptTextareaRef.current?.focus(), 100);
    }, [promptTextareaRef]);

    return (
        <>
            {/* Backdrop for Advanced Panel */}
            {showAdvancedPanel && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
                    onClick={() => setShowAdvancedPanel(false)}
                />
            )}

            {/* Advanced Panel Overlay (slide up from bottom) */}
            {showAdvancedPanel && (
                <div className={`fixed ${isExpanded ? 'bottom-[200px]' : 'bottom-[88px]'} left-1/2 -translate-x-1/2 lg:left-[calc(50%+160px)] lg:-translate-x-1/2 w-[95%] lg:w-[calc(100%-360px)] max-w-5xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-2xl z-50 p-6 max-h-[40vh] overflow-y-auto transition-all duration-300 ease-out`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-light-text dark:text-dark-text">{t.advancedSettings || 'Advanced Settings'}</h3>
                        <button
                            onClick={() => setShowAdvancedPanel(false)}
                            className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text hover:scale-110 active:scale-95 transition-all duration-150"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Negative Prompt */}
                    <div className="mb-4">
                        <label className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2 block">{t.negativePrompt || 'Negative Prompt'}</label>
                        <input
                            type="text"
                            value={negativePrompt}
                            onChange={(e) => onNegativePromptChange(e.target.value)}
                            placeholder={t.negativePromptPlaceholder || "What to avoid..."}
                            className="w-full px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-brand-purple outline-none"
                        />
                    </div>

                    {/* Seed */}
                    <div className="mb-4">
                        <label className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2 block">{t.seed || 'Seed'}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={seed}
                                onChange={(e) => onSeedChange(e.target.value)}
                                placeholder={t.randomSeed || "Random"}
                                className="flex-1 px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-brand-purple outline-none"
                            />
                            <button
                                onClick={onRandomizeSeed}
                                className="px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg hover:bg-light-border dark:hover:bg-dark-border hover:scale-105 active:scale-95 transition-all duration-150"
                            >
                                🎲
                            </button>
                        </div>
                    </div>

                    {/* Professional Tools */}
                    {hasReferences && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.professionalTools || 'Professional Tools'}</label>
                                <button
                                    onClick={onGenerateTools}
                                    disabled={isToolsLoading}
                                    className="text-sm text-brand-purple hover:text-brand-pink hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isToolsLoading ? <span className="inline-block animate-pulse">⏳</span> : '🔄'} {t.generate || 'Generate'}
                                </button>
                            </div>
                            {dynamicTools.length > 0 ? (
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                    {dynamicTools.length} {t.toolsAvailable || 'tools available'}
                                </div>
                            ) : (
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted italic">
                                    {t.noToolsYet || 'Click generate to create professional tools'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main Floating Bar */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-[calc(50%+160px)] lg:-translate-x-1/2 w-[95%] lg:w-[calc(100%-360px)] max-w-5xl bg-light-surface/98 dark:bg-dark-surface/98 backdrop-blur-xl border border-light-border dark:border-dark-border rounded-2xl shadow-2xl z-[60] transition-all duration-300 ease-out">
                {/* Progress Bar */}
                {isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-light-surface-accent/30 dark:bg-dark-surface-accent/30 overflow-hidden rounded-t-2xl">
                        <div className="h-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple bg-[length:200%_100%] animate-shimmer" />
                    </div>
                )}
                {/* Compact Mode */}
                {!isExpanded && (
                    <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 animate-fadeIn">
                        {/* Prompt Preview (clickable to expand) */}
                        <button
                            onClick={handleExpandClick}
                            className="flex-1 text-left px-3 lg:px-4 py-2 lg:py-2.5 bg-transparent text-xs lg:text-sm text-light-text-muted dark:text-dark-text-muted truncate hover:text-light-text dark:hover:text-dark-text transition-all duration-150 min-w-0"
                        >
                            {prompt || t.promptPlaceholder || "Describe what you want to generate..."}
                        </button>

                        {/* Quick Pills - Compact Style */}
                        <div className="relative z-[70]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAspectMenu(!showAspectMenu);
                                    setShowNumImagesMenu(false);
                                }}
                                className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">📐</span>
                                <span>{aspectRatio}</span>
                            </button>
                            {showAspectMenu && (
                                <>
                                    <div className="fixed inset-0 z-[65]" onClick={() => setShowAspectMenu(false)} />
                                    <div className="absolute bottom-full mb-2 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border z-[70] animate-slideDown">
                                        {aspectRatios.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => {
                                                    onAspectRatioChange(ratio);
                                                    setShowAspectMenu(false);
                                                }}
                                                className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 transition-all duration-150 ${ratio === aspectRatio ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative z-[70]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNumImagesMenu(!showNumImagesMenu);
                                    setShowAspectMenu(false);
                                }}
                                className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">🖼️</span>
                                <span>{numImages}x</span>
                            </button>
                            {showNumImagesMenu && (
                                <>
                                    <div className="fixed inset-0 z-[65]" onClick={() => setShowNumImagesMenu(false)} />
                                    <div className="absolute bottom-full mb-2 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[100px] border border-light-border dark:border-dark-border z-[70] animate-slideDown">
                                        {numImagesOptions.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => {
                                                    onNumImagesChange(num);
                                                    setShowNumImagesMenu(false);
                                                }}
                                                className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 transition-all duration-150 ${num === numImages ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                            >
                                                {num}x
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setShowAdvancedPanel(!showAdvancedPanel);
                                setShowAspectMenu(false);
                                setShowNumImagesMenu(false);
                                setIsExpanded(false);
                            }}
                            className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150"
                        >
                            <span>⚙️</span>
                        </button>

                        {/* v0.7: Precise Reference Toggle Switch */}
                        {hasReferences && (
                            <div className="relative group/tooltip flex items-center gap-2 lg:gap-2.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg">
                                <span className="text-xs font-medium text-light-text dark:text-dark-text hidden sm:inline">
                                    🎯 {t.preciseReference}
                                </span>
                                <button
                                    onClick={() => onPreciseReferenceChange(!preciseReference)}
                                    className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-all duration-300 ${
                                        preciseReference
                                            ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    disabled={isLoading}
                                >
                                    <span
                                        className={`inline-block h-4 lg:h-5 w-4 lg:w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                            preciseReference ? 'translate-x-5 lg:translate-x-6' : 'translate-x-0.5'
                                        }`}
                                    />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black/90 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
                                    {t.preciseReferenceTooltip}
                                </div>
                            </div>
                        )}

                        {/* Primary Action - HERO BUTTON */}
                        <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="relative px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple bg-[length:200%_100%] hover:bg-[position:100%_0] hover:scale-110 active:scale-95 rounded-xl font-bold text-white text-sm lg:text-base shadow-[0_0_20px_rgba(138,120,244,0.5)] hover:shadow-[0_0_30px_rgba(138,120,244,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg whitespace-nowrap"
                        >
                            {isLoading ? <span className="inline-block animate-pulse">⏳</span> : "⚡"} <span className="hidden sm:inline">{isLoading ? "Generating..." : "Generate"}</span>
                        </button>
                    </div>
                )}

                {/* Expanded Mode */}
                {isExpanded && (
                    <div className="px-3 lg:px-4 py-2.5 lg:py-3 space-y-2 lg:space-y-3 animate-fadeIn">
                        {/* Prompt Textarea with Paste/Clear buttons */}
                        <div className="relative">
                            <textarea
                                ref={promptTextareaRef}
                                value={prompt}
                                onChange={(e) => onPromptChange(e.target.value)}
                                rows={3}
                                placeholder={t.promptPlaceholder || "Describe what you want to generate..."}
                                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 pr-16 lg:pr-20 bg-transparent text-sm lg:text-base text-light-text dark:text-dark-text resize-y min-h-[72px] max-h-[400px] focus:ring-2 focus:ring-brand-purple/50 rounded-xl outline-none"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            onPromptChange(text);
                                        } catch (err) {
                                            console.error('Failed to read clipboard:', err);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="p-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Paste from clipboard"
                                    title="Paste"
                                >
                                    <svg className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                                {prompt && (
                                    <button
                                        onClick={() => {
                                            onPromptChange('');
                                            promptTextareaRef.current?.focus();
                                        }}
                                        disabled={isLoading}
                                        className="p-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Clear prompt"
                                        title="Clear"
                                    >
                                        <svg className="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* v0.8: Live Quality Tips */}
                        {prompt && (() => {
                            const tips: string[] = [];
                            const promptLower = prompt.toLowerCase();
                            const wordCount = prompt.trim().split(/\s+/).length;

                            // Too short
                            if (wordCount < 3) {
                                tips.push("💡 Add more details for better results");
                            }
                            // Missing lighting
                            if (!promptLower.includes('light') && !promptLower.includes('glow') && !promptLower.includes('bright') && !promptLower.includes('dark') && !promptLower.includes('shadow')) {
                                tips.push("💡 Try adding lighting details (e.g., 'golden hour', 'soft lighting')");
                            }
                            // Missing camera/composition
                            if (!promptLower.includes('shot') && !promptLower.includes('angle') && !promptLower.includes('view') && !promptLower.includes('perspective') && !promptLower.includes('lens')) {
                                tips.push("💡 Specify camera angle (e.g., 'low-angle shot', '85mm lens')");
                            }
                            // Missing mood/atmosphere
                            if (!promptLower.includes('mood') && !promptLower.includes('atmosphere') && !promptLower.includes('feeling') && !promptLower.includes('vibe') && wordCount > 3) {
                                tips.push("💡 Add mood/atmosphere (e.g., 'cinematic', 'dreamy', 'dramatic')");
                            }

                            // Show max 2 tips to avoid clutter
                            const displayTips = tips.slice(0, 2);

                            return displayTips.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 text-xs text-brand-purple dark:text-brand-pink animate-fade-in">
                                    {displayTips.map((tip, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-brand-purple/10 dark:bg-brand-pink/10 rounded-md">
                                            {tip}
                                        </span>
                                    ))}
                                </div>
                            ) : null;
                        })()}

                        {/* All Controls Row */}
                        <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap">
                            {/* Quick Actions */}
                            <button
                                onClick={onEnhancePrompt}
                                disabled={isEnhancing || !prompt}
                                className="px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                ✨ <span className="hidden sm:inline">Enhance</span>
                            </button>
                            <button
                                onClick={onMagicPrompt}
                                disabled={isEnhancing || !hasReferences}
                                className="px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                🪄 <span className="hidden sm:inline">Magic</span>
                            </button>
                            <button
                                onClick={onGenerate3Prompts}
                                disabled={isEnhancing || !hasReferences}
                                className="px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                📝 <span className="hidden sm:inline">3 Prompts</span>
                            </button>

                            {/* Divider */}
                            <div className="h-6 w-px bg-light-border dark:bg-dark-border hidden sm:block"></div>

                            {/* Settings Pills */}
                            <div className="relative z-[70]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAspectMenu(!showAspectMenu);
                                        setShowNumImagesMenu(false);
                                    }}
                                    className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 whitespace-nowrap"
                                >
                                    <span>{aspectRatio}</span>
                                </button>
                                {showAspectMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[65]" onClick={() => setShowAspectMenu(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border z-[70] animate-slideDown">
                                            {aspectRatios.map(ratio => (
                                                <button
                                                    key={ratio}
                                                    onClick={() => {
                                                        onAspectRatioChange(ratio);
                                                        setShowAspectMenu(false);
                                                    }}
                                                    className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 transition-all duration-150 ${ratio === aspectRatio ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                                >
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative z-[70]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowNumImagesMenu(!showNumImagesMenu);
                                        setShowAspectMenu(false);
                                    }}
                                    className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150 whitespace-nowrap"
                                >
                                    <span>{numImages}x</span>
                                </button>
                                {showNumImagesMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[65]" onClick={() => setShowNumImagesMenu(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[100px] border border-light-border dark:border-dark-border z-[70] animate-slideDown">
                                            {numImagesOptions.map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => {
                                                        onNumImagesChange(num);
                                                        setShowNumImagesMenu(false);
                                                    }}
                                                    className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 transition-all duration-150 ${num === numImages ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                                >
                                                    {num}x
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setShowAdvancedPanel(!showAdvancedPanel);
                                    setShowAspectMenu(false);
                                    setShowNumImagesMenu(false);
                                }}
                                className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent hover:scale-105 active:scale-95 transition-all duration-150"
                            >
                                <span>⚙️</span>
                            </button>

                            {/* v0.7: Precise Reference Toggle Switch (Expanded Mode) */}
                            {hasReferences && (
                                <div className="relative group/tooltip flex items-center gap-2 lg:gap-2.5 px-2 lg:px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg">
                                    <span className="text-xs font-medium text-light-text dark:text-dark-text">
                                        🎯 {t.preciseReference}
                                    </span>
                                    <button
                                        onClick={() => onPreciseReferenceChange(!preciseReference)}
                                        className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-all duration-300 ${
                                            preciseReference
                                                ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                                                : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <span
                                            className={`inline-block h-4 lg:h-5 w-4 lg:w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                                preciseReference ? 'translate-x-5 lg:translate-x-6' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black/90 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
                                        {t.preciseReferenceTooltip}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1" />

                            {/* Collapse */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-2 lg:px-3 py-1.5 text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text hover:scale-110 active:scale-95 transition-all duration-150 text-xs"
                            >
                                ▼
                            </button>

                            {/* Generate - HERO BUTTON */}
                            <button
                                onClick={onGenerate}
                                disabled={isLoading}
                                className="relative px-4 lg:px-6 py-2 lg:py-2.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple bg-[length:200%_100%] hover:bg-[position:100%_0] hover:scale-110 active:scale-95 rounded-xl font-bold text-white text-xs lg:text-sm shadow-[0_0_20px_rgba(138,120,244,0.5)] hover:shadow-[0_0_30px_rgba(138,120,244,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg whitespace-nowrap"
                            >
                                {isLoading ? <span className="inline-block animate-pulse">⏳</span> : "⚡"} <span className="hidden sm:inline">{isLoading ? "Generating..." : "Generate"}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingActionBar;
