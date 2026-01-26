import React from 'react';
import { GenerationTask } from '../types';

interface QueuePanelProps {
    queue: GenerationTask[];
    onRemoveFromQueue: (id: string) => void;
    t: any;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ queue, onRemoveFromQueue, t }) => {
    if (queue.length === 0) return null;

    return (
        <div className="bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-brand-purple/10 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-2">
                    <span className="animate-pulse">⏳</span> {t.generationQueue} ({queue.length})
                </span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>

            {/* Queue Items */}
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                {queue.map((task, idx) => (
                    <div
                        key={task.id}
                        className="group px-3 py-2.5 flex items-center justify-between hover:bg-light-surface-accent/30 dark:hover:bg-dark-surface-accent/30 transition-colors border-b border-light-border/30 dark:border-dark-border/30 last:border-0"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            <div className="relative flex-shrink-0 w-7 h-7 rounded-lg bg-brand-purple/20 flex items-center justify-center text-xs font-bold text-brand-purple border border-brand-purple/30">
                                {idx + 1}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs text-light-text dark:text-dark-text font-medium truncate">
                                    {task.prompt || t.untitledTask}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] px-1.5 py-0.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded text-light-text-muted dark:text-dark-text-muted">
                                        {task.model === 'gemini-3-pro-image-preview' ? 'PRO' : 'Flash'}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded text-light-text-muted dark:text-dark-text-muted">
                                        {task.numImages}x
                                    </span>
                                    {task.selectedDnaId && <span className="text-[9px]">🧬</span>}
                                    {task.referenceImages.length > 0 && <span className="text-[9px]">🖼️ {task.referenceImages.length}</span>}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemoveFromQueue(task.id)}
                            className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-sm"
                            title={t.removeFromQueue}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QueuePanel;
