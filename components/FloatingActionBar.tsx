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
                        {/* Prompt Textarea */}
                        <textarea
                            ref={promptTextareaRef}
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            rows={3}
                            placeholder={t.promptPlaceholder || "Describe what you want to generate..."}
                            className="w-full px-3 lg:px-4 py-2 lg:py-2.5 bg-transparent text-sm lg:text-base text-light-text dark:text-dark-text resize-none focus:ring-2 focus:ring-brand-purple/50 rounded-xl outline-none"
                        />

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
