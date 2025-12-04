// v1.4: Usage Tracker Component - Session stats and cost estimation
import React from 'react';

interface UsageStats {
    imagesGenerated: number;
    totalCost: number;
    tokensUsed: number;
    averageTime: number; // in seconds
}

interface UsageTrackerProps {
    stats: UsageStats;
    isVisible: boolean;
    onClose: () => void;
    language: 'en' | 'it';
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ stats, isVisible, onClose, language }) => {
    if (!isVisible) return null;

    const translations = {
        en: {
            title: 'Session Statistics',
            imagesGenerated: 'Images Generated',
            totalCost: 'Total Cost',
            tokensUsed: 'Tokens Used',
            avgTime: 'Avg. Time per Image',
            seconds: 's',
            close: 'Close'
        },
        it: {
            title: 'Statistiche Sessione',
            imagesGenerated: 'Immagini Generate',
            totalCost: 'Costo Totale',
            tokensUsed: 'Token Usati',
            avgTime: 'Tempo Medio per Immagine',
            seconds: 's',
            close: 'Chiudi'
        }
    };

    const t = translations[language];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
             onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border max-w-md w-full p-6"
                 onClick={(e) => e.stopPropagation()}>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-yellow to-brand-magenta">
                        📊 {t.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-light-surface-accent/50 dark:bg-dark-surface-accent/50">
                        <span className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.imagesGenerated}</span>
                        <span className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.imagesGenerated}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <span className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.totalCost}</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">${stats.totalCost.toFixed(3)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-light-surface-accent/50 dark:bg-dark-surface-accent/50">
                        <span className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.tokensUsed}</span>
                        <span className="text-lg font-semibold text-light-text dark:text-dark-text">{stats.tokensUsed.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-light-surface-accent/50 dark:bg-dark-surface-accent/50">
                        <span className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.avgTime}</span>
                        <span className="text-lg font-semibold text-light-text dark:text-dark-text">
                            {stats.averageTime > 0 ? stats.averageTime.toFixed(1) : '0'}{t.seconds}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white font-semibold hover:opacity-90 transition-opacity"
                >
                    {t.close}
                </button>
            </div>
        </div>
    );
};

export default UsageTracker;
