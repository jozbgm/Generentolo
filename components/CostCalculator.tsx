import React, { useMemo, useState } from 'react';
import { ModelType, ResolutionType } from '../types';

// Official pricing from: https://ai.google.dev/gemini-api/docs/pricing#gemini-3-pro-image-preview
const PRICING = {
    flash: {
        name: 'Flash',
        outputPerImage: 0.039, // Flat rate
        inputPerImage: 0, // Included
        promptPerMToken: 0.30, // $0.30/1M tokens
    },
    pro: {
        name: 'PRO (Nano Banana)',
        inputPerImage: 0.0011, // $0.0011 per reference image
        promptPerMToken: 2.0, // $2/1M tokens
        output: {
            '1k': 0.134,
            '2k': 0.134,
            '4k': 0.24,
        }
    }
};

// Estimate ~500 tokens for average prompt
const ESTIMATED_PROMPT_TOKENS = 500;

interface CostCalculatorProps {
    model: ModelType;
    resolution: ResolutionType;
    referenceCount: number;
    styleImageCount: number; // 0 or 1
    structureImageCount: number; // 0 or 1
    compact?: boolean; // Compact mode for collapsed bar
    t: {
        costEstimate: string;
        costOutput: string;
        costInputImages: string;
        costPrompt: string;
        costTotal: string;
        costDisclaimer: string;
    };
}

interface CostBreakdown {
    total: number;
    outputCost: number;
    inputImagesCost: number;
    promptCost: number;
    totalImages: number;
}

export const calculateCost = (
    model: ModelType,
    resolution: ResolutionType,
    referenceCount: number,
    styleImageCount: number = 0,
    structureImageCount: number = 0
): CostBreakdown => {
    const totalImages = referenceCount + styleImageCount + structureImageCount;

    if (model === 'gemini-2.5-flash-image') {
        const outputCost = PRICING.flash.outputPerImage;
        const promptCost = (ESTIMATED_PROMPT_TOKENS / 1_000_000) * PRICING.flash.promptPerMToken;
        return {
            total: outputCost + promptCost,
            outputCost,
            inputImagesCost: 0,
            promptCost,
            totalImages
        };
    }

    // PRO model
    const outputCost = PRICING.pro.output[resolution];
    const inputImagesCost = totalImages * PRICING.pro.inputPerImage;
    const promptCost = (ESTIMATED_PROMPT_TOKENS / 1_000_000) * PRICING.pro.promptPerMToken;

    return {
        total: outputCost + inputImagesCost + promptCost,
        outputCost,
        inputImagesCost,
        promptCost,
        totalImages
    };
};

const CostCalculator: React.FC<CostCalculatorProps> = ({
    model,
    resolution,
    referenceCount,
    styleImageCount,
    structureImageCount,
    compact = false,
    t
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const breakdown = useMemo(() =>
        calculateCost(model, resolution, referenceCount, styleImageCount, structureImageCount),
        [model, resolution, referenceCount, styleImageCount, structureImageCount]
    );

    const isFlash = model === 'gemini-2.5-flash-image';
    const modelName = isFlash ? 'Flash' : 'PRO';

    // Format price with appropriate decimals
    const formatPrice = (price: number, decimals: number = 3) => {
        if (price < 0.001) return '<$0.001';
        return `$${price.toFixed(decimals)}`;
    };

    if (compact) {
        return (
            <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg cursor-help transition-all hover:border-yellow-500/50">
                    <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500">
                        {formatPrice(breakdown.total)}
                    </span>
                </div>

                {/* Tooltip */}
                {showTooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-50 animate-fadeIn">
                        <div className="text-xs space-y-2">
                            {/* Header */}
                            <div className="flex justify-between items-center pb-2 border-b border-dark-border">
                                <span className="font-semibold text-dark-text">{t.costEstimate}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isFlash ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {modelName}
                                </span>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-1.5 text-dark-text-muted">
                                <div className="flex justify-between">
                                    <span>{t.costOutput} ({isFlash ? '2K' : resolution.toUpperCase()}):</span>
                                    <span className="text-dark-text">{formatPrice(breakdown.outputCost)}</span>
                                </div>

                                {!isFlash && (
                                    <div className="flex justify-between">
                                        <span>{t.costInputImages} ({breakdown.totalImages}):</span>
                                        <span className="text-dark-text">
                                            {breakdown.totalImages > 0 ? formatPrice(breakdown.inputImagesCost, 4) : '$0.000'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span>{t.costPrompt} (~{ESTIMATED_PROMPT_TOKENS} tokens):</span>
                                    <span className="text-dark-text">{formatPrice(breakdown.promptCost, 4)}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between pt-2 border-t border-dark-border font-bold text-sm">
                                <span className="text-dark-text">{t.costTotal}:</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-400">
                                    {formatPrice(breakdown.total)}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="pt-1 text-[10px] text-dark-text-muted opacity-70">
                                {t.costDisclaimer}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-dark-border"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full mode with details visible
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl">
            {/* Price Badge */}
            <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500">
                    {formatPrice(breakdown.total)}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isFlash ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {modelName}
                </span>
            </div>

            {/* Details */}
            <div className="hidden md:flex items-center gap-3 text-[10px] text-light-text-muted dark:text-dark-text-muted border-l border-yellow-500/30 pl-3">
                <span>Output: {formatPrice(breakdown.outputCost)}</span>
                {!isFlash && breakdown.totalImages > 0 && (
                    <span>+{breakdown.totalImages} img: {formatPrice(breakdown.inputImagesCost, 4)}</span>
                )}
            </div>
        </div>
    );
};

export default CostCalculator;
