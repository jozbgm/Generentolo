import React from 'react';
import { GenerationTask } from '../types';
import { HourglassIcon, DnaIcon, ImageIcon, XIcon } from './icons';

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
            <div className="px-4 py-3 bg-light-surface-accent dark:bg-dark-surface-accent border-b border-light-border dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text flex items-center gap-2">
                    <HourglassIcon className="w-3.5 h-3.5 animate-pulse text-brand-yellow" /> {t.generationQueue} ({queue.length})
                </span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '300ms' }} />
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
                            <div className="relative flex-shrink-0 w-7 h-7 rounded-lg bg-light-surface dark:bg-dark-surface flex items-center justify-center text-xs font-bold text-light-text dark:text-dark-text border border-light-border dark:border-dark-border">
                                {idx + 1}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs text-light-text dark:text-dark-text font-medium truncate">
                                    {task.prompt || t.untitledTask}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] px-1.5 py-0.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded text-light-text-muted dark:text-dark-text-muted">
                                        {task.model === 'gemini-3-pro-image-preview' ? 'PRO' : task.model === 'gemini-3.1-flash-image-preview' ? 'NB2' : 'Flash'}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded text-light-text-muted dark:text-dark-text-muted">
                                        {task.numImages}x
                                    </span>
                                    {task.selectedDnaIds && task.selectedDnaIds.length > 0 && <DnaIcon className="w-3 h-3 text-dark-text-muted" />}
                                    {task.referenceImages.length > 0 && <span className="flex items-center gap-0.5 text-[9px] text-dark-text-muted"><ImageIcon className="w-3 h-3" />{task.referenceImages.length}</span>}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemoveFromQueue(task.id)}
                            className="flex-shrink-0 p-1.5 text-light-text-muted dark:text-dark-text-muted hover:text-brand-yellow hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent rounded-lg transition-all"
                            title={t.removeFromQueue}
                        >
                            <XIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QueuePanel;
