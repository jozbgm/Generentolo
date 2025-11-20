import React from 'react';
import { SparklesIcon } from './icons';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 animate-fadeIn">
            <div className="mb-4 text-6xl opacity-50">
                {icon || <SparklesIcon className="w-16 h-16 mx-auto text-light-text-muted dark:text-dark-text-muted" />}
            </div>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                {title}
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted mb-6 max-w-sm">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-medium rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
