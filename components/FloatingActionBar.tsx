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
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setShowAdvancedPanel(false)}
                />
            )}

            {/* Advanced Panel Overlay (slide up from bottom) */}
            {showAdvancedPanel && (
                <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 lg:left-[calc(50%+160px)] lg:-translate-x-1/2 w-[95%] lg:w-[calc(100%-360px)] max-w-5xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-2xl z-50 p-6 max-h-[50vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-light-text dark:text-dark-text">{t.advancedSettings || 'Advanced Settings'}</h3>
                        <button
                            onClick={() => setShowAdvancedPanel(false)}
                            className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text"
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
                                className="px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
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
                                    className="text-sm text-brand-purple hover:text-brand-pink transition-colors disabled:opacity-50"
                                >
                                    {isToolsLoading ? '⏳' : '🔄'} {t.generate || 'Generate'}
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
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-[calc(50%+160px)] lg:-translate-x-1/2 w-[95%] lg:w-[calc(100%-360px)] max-w-5xl bg-light-surface/98 dark:bg-dark-surface/98 backdrop-blur-xl border border-light-border dark:border-dark-border rounded-2xl shadow-2xl z-[60]">
                {/* Compact Mode */}
                {!isExpanded && (
                    <div className="flex items-center gap-3 px-4 py-3">
                        {/* Prompt Preview (clickable to expand) */}
                        <button
                            onClick={handleExpandClick}
                            className="flex-1 text-left px-4 py-2.5 bg-transparent text-sm text-light-text-muted dark:text-dark-text-muted truncate hover:text-light-text dark:hover:text-dark-text transition-colors min-w-[200px] lg:min-w-[300px]"
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
                                className="flex items-center gap-1.5 px-3 py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors whitespace-nowrap"
                            >
                                <span>{aspectRatio}</span>
                            </button>
                            {showAspectMenu && (
                                <>
                                    <div className="fixed inset-0 z-[65]" onClick={() => setShowAspectMenu(false)} />
                                    <div className="absolute bottom-full mb-2 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border z-[70]">
                                        {aspectRatios.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => {
                                                    onAspectRatioChange(ratio);
                                                    setShowAspectMenu(false);
                                                }}
                                                className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${ratio === aspectRatio ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
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
                                className="flex items-center gap-1.5 px-3 py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors whitespace-nowrap"
                            >
                                <span>{numImages}x</span>
                            </button>
                            {showNumImagesMenu && (
                                <>
                                    <div className="fixed inset-0 z-[65]" onClick={() => setShowNumImagesMenu(false)} />
                                    <div className="absolute bottom-full mb-2 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[100px] border border-light-border dark:border-dark-border z-[70]">
                                        {numImagesOptions.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => {
                                                    onNumImagesChange(num);
                                                    setShowNumImagesMenu(false);
                                                }}
                                                className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${num === numImages ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
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
                            className="flex items-center gap-1.5 px-3 py-2 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors"
                        >
                            <span>⚙️</span>
                        </button>

                        {/* Primary Action */}
                        <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/90 rounded-lg font-medium text-white text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {isLoading ? "⏳ Generating..." : "⚡ Generate"}
                        </button>
                    </div>
                )}

                {/* Expanded Mode */}
                {isExpanded && (
                    <div className="px-4 py-3 space-y-3">
                        {/* Prompt Textarea */}
                        <textarea
                            ref={promptTextareaRef}
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            rows={3}
                            placeholder={t.promptPlaceholder || "Describe what you want to generate..."}
                            className="w-full px-4 py-2.5 bg-transparent text-light-text dark:text-dark-text resize-none focus:ring-2 focus:ring-brand-purple/50 rounded-xl outline-none"
                        />

                        {/* All Controls Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Quick Actions */}
                            <button
                                onClick={onEnhancePrompt}
                                disabled={isEnhancing || !prompt}
                                className="px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ✨ Enhance
                            </button>
                            <button
                                onClick={onMagicPrompt}
                                disabled={isEnhancing || !hasReferences}
                                className="px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🪄 Magic
                            </button>
                            <button
                                onClick={onGenerate3Prompts}
                                disabled={isEnhancing || !hasReferences}
                                className="px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                📝 3 Prompts
                            </button>

                            {/* Divider */}
                            <div className="h-6 w-px bg-light-border dark:bg-dark-border"></div>

                            {/* Settings Pills */}
                            <div className="relative z-[70]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAspectMenu(!showAspectMenu);
                                        setShowNumImagesMenu(false);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors whitespace-nowrap"
                                >
                                    <span>{aspectRatio}</span>
                                </button>
                                {showAspectMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[65]" onClick={() => setShowAspectMenu(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border z-[70]">
                                            {aspectRatios.map(ratio => (
                                                <button
                                                    key={ratio}
                                                    onClick={() => {
                                                        onAspectRatioChange(ratio);
                                                        setShowAspectMenu(false);
                                                    }}
                                                    className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${ratio === aspectRatio ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
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
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors whitespace-nowrap"
                                >
                                    <span>{numImages}x</span>
                                </button>
                                {showNumImagesMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[65]" onClick={() => setShowNumImagesMenu(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[100px] border border-light-border dark:border-dark-border z-[70]">
                                            {numImagesOptions.map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => {
                                                        onNumImagesChange(num);
                                                        setShowNumImagesMenu(false);
                                                    }}
                                                    className={`w-full px-3 py-1.5 text-left text-sm rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${num === numImages ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
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
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg text-xs text-light-text dark:text-dark-text hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors"
                            >
                                <span>⚙️</span>
                            </button>

                            <div className="flex-1" />

                            {/* Collapse */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-3 py-1.5 text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text text-xs"
                            >
                                ▼
                            </button>

                            {/* Generate */}
                            <button
                                onClick={onGenerate}
                                disabled={isLoading}
                                className="px-5 py-2 bg-brand-purple hover:bg-brand-purple/90 rounded-lg font-medium text-white text-xs shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isLoading ? "⏳ Generating..." : "⚡ Generate"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingActionBar;
