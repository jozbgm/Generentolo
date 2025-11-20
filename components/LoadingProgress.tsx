import React, { useState, useEffect } from 'react';

interface LoadingProgressProps {
    isLoading: boolean;
    steps?: string[];
    duration?: number; // Total duration in ms
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({
    isLoading,
    steps = ['Preparing...', 'Processing...', 'Finalizing...'],
    duration = 15000 // Default 15s
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isLoading) {
            setCurrentStep(0);
            setProgress(0);
            return;
        }

        const stepDuration = duration / steps.length;
        const progressInterval = 100; // Update every 100ms

        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + (100 / (duration / progressInterval));
                return Math.min(newProgress, 95); // Max 95% until done
            });
        }, progressInterval);

        const stepTimer = setInterval(() => {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }, stepDuration);

        return () => {
            clearInterval(progressTimer);
            clearInterval(stepTimer);
        };
    }, [isLoading, steps.length, duration]);

    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-sm z-10 animate-fadeIn rounded-3xl">
            <div className="w-full max-w-md px-8">
                {/* Animated spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-light-border dark:border-dark-border rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-brand-purple border-r-brand-pink border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>

                {/* Step indicator */}
                <div className="text-center mb-4">
                    <p className="text-lg font-medium text-light-text dark:text-dark-text mb-1">
                        {steps[currentStep]}
                    </p>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Progress percentage */}
                <p className="text-center text-xs text-light-text-muted dark:text-dark-text-muted mt-2">
                    {Math.round(progress)}%
                </p>

                {/* Steps dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index < currentStep
                                    ? 'bg-brand-purple scale-110'
                                    : index === currentStep
                                    ? 'bg-brand-pink scale-125 animate-pulse'
                                    : 'bg-light-border dark:bg-dark-border'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingProgress;
