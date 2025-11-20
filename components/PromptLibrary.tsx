import React, { useState, useMemo } from 'react';
import { PROMPT_LIBRARY, PROMPT_CATEGORIES, PromptTemplate } from '../data/promptLibrary';
import { XIcon, SearchIcon, CopyIcon, CheckIcon } from './icons';

interface PromptLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onUsePrompt: (prompt: string) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose, onUsePrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Filter prompts based on category and search
    const filteredPrompts = useMemo(() => {
        let filtered = PROMPT_LIBRARY;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query)) ||
                p.prompt.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [selectedCategory, searchQuery]);

    const handleCopyPrompt = async (prompt: string, id: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleUsePrompt = (prompt: string) => {
        onUsePrompt(prompt);
        onClose();
    };

    if (!isOpen) return null;

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500/10 text-green-500';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500';
            case 'advanced': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
                    <div>
                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                            Prompt Library
                        </h2>
                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                            {filteredPrompts.length} {filteredPrompts.length === 1 ? 'template' : 'templates'} available
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6 text-light-text dark:text-dark-text" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-light-border dark:border-dark-border">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                        <input
                            type="text"
                            placeholder="Search prompts by title, description, or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-light-border dark:border-dark-border scrollbar-thin">
                    {PROMPT_CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg'
                                    : 'bg-light-surface-accent dark:bg-dark-surface-accent text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                            }`}
                        >
                            <span>{category.icon}</span>
                            <span className="text-sm font-medium">{category.name}</span>
                        </button>
                    ))}
                </div>

                {/* Prompt Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredPrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="text-6xl mb-4 opacity-30">🔍</div>
                            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                                No prompts found
                            </h3>
                            <p className="text-light-text-muted dark:text-dark-text-muted max-w-sm">
                                Try adjusting your search or selecting a different category
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPrompts.map((template) => (
                                <div
                                    key={template.id}
                                    className="group bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border rounded-xl p-4 hover:border-brand-purple/50 hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text flex-1 pr-2 line-clamp-2">
                                            {template.title}
                                        </h3>
                                        {template.difficulty && (
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${getDifficultyColor(template.difficulty)}`}>
                                                {template.difficulty}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-3 line-clamp-2">
                                        {template.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {template.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 text-xs bg-light-surface dark:bg-dark-surface text-light-text-muted dark:text-dark-text-muted rounded-md border border-light-border dark:border-dark-border"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {template.tags.length > 3 && (
                                            <span className="px-2 py-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
                                                +{template.tags.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Prompt Preview */}
                                    <div className="mb-4 p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted line-clamp-3 font-mono">
                                            {template.prompt}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopyPrompt(template.prompt, template.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                        >
                                            {copiedId === template.id ? (
                                                <>
                                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm text-green-500 font-medium">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CopyIcon className="w-4 h-4 text-light-text dark:text-dark-text" />
                                                    <span className="text-sm text-light-text dark:text-dark-text font-medium">Copy</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleUsePrompt(template.prompt)}
                                            className="flex-1 px-3 py-2 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-medium rounded-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm"
                                        >
                                            Use Prompt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromptLibrary;
