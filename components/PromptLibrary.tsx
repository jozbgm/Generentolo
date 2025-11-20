import React, { useState, useMemo, useRef } from 'react';
import { PROMPT_LIBRARY, PROMPT_CATEGORIES, PromptTemplate } from '../data/promptLibrary';
import { XIcon, SearchIcon, CopyIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PromptLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onUsePrompt: (prompt: string) => void;
    t: {
        promptLibraryTitle: string;
        promptLibrarySearch: string;
        promptLibraryTemplates: string;
        promptLibraryTemplate: string;
        promptLibraryAvailable: string;
        promptLibraryNoResults: string;
        promptLibraryNoResultsDesc: string;
        promptLibraryCopy: string;
        promptLibraryCopied: string;
        promptLibraryUse: string;
        promptLibraryCategoryAll: string;
        promptLibraryCategoryCombine: string;
        promptLibraryCategoryStyle: string;
        promptLibraryCategoryPeople: string;
        promptLibraryCategoryEnvironment: string;
        promptLibraryCategoryEdit: string;
        promptLibraryCategoryCreative: string;
    };
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose, onUsePrompt, t }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const tabsContainerRef = useRef<HTMLDivElement>(null);

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

    // Get translated category name
    const getCategoryName = (categoryId: string) => {
        switch (categoryId) {
            case 'all': return t.promptLibraryCategoryAll;
            case 'combine': return t.promptLibraryCategoryCombine;
            case 'style': return t.promptLibraryCategoryStyle;
            case 'people': return t.promptLibraryCategoryPeople;
            case 'environment': return t.promptLibraryCategoryEnvironment;
            case 'edit': return t.promptLibraryCategoryEdit;
            case 'creative': return t.promptLibraryCategoryCreative;
            default: return categoryId;
        }
    };

    // Check scroll position for arrows
    const checkScroll = () => {
        if (tabsContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // Scroll tabs
    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsContainerRef.current) {
            const scrollAmount = 200;
            tabsContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    // Check scroll on mount and resize
    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="relative w-full max-w-6xl h-[90vh] bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl flex flex-col animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-light-border dark:border-dark-border flex-shrink-0">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                            {t.promptLibraryTitle}
                        </h2>
                        <p className="text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted">
                            {filteredPrompts.length} {filteredPrompts.length === 1 ? t.promptLibraryTemplate : t.promptLibraryTemplates} {t.promptLibraryAvailable}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-5 h-5 md:w-6 md:h-6 text-light-text dark:text-dark-text" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-light-text-muted dark:text-dark-text-muted" />
                        <input
                            type="text"
                            placeholder={t.promptLibrarySearch}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 text-sm md:text-base bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                        />
                    </div>
                </div>

                {/* Category Tabs with Arrows */}
                <div className="relative border-b border-light-border dark:border-dark-border flex-shrink-0">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scrollTabs('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 md:p-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-r-lg shadow-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors"
                        >
                            <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-light-text dark:text-dark-text" />
                        </button>
                    )}

                    {/* Tabs Container */}
                    <div
                        ref={tabsContainerRef}
                        className="flex gap-2 px-4 md:px-12 py-3 overflow-x-auto hide-scrollbar"
                        onScroll={checkScroll}
                    >
                        {PROMPT_CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg whitespace-nowrap transition-all text-sm md:text-base ${
                                    selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg'
                                        : 'bg-light-surface-accent dark:bg-dark-surface-accent text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                                }`}
                            >
                                <span className="text-sm md:text-base">{category.icon}</span>
                                <span className="text-xs md:text-sm font-medium">{getCategoryName(category.id)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <button
                            onClick={() => scrollTabs('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 md:p-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-l-lg shadow-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors"
                        >
                            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-light-text dark:text-dark-text" />
                        </button>
                    )}
                </div>

                {/* Prompt Grid */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 min-h-0 prompt-library-scroll">
                    {filteredPrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="text-4xl md:text-6xl mb-4 opacity-30">🔍</div>
                            <h3 className="text-lg md:text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                                {t.promptLibraryNoResults}
                            </h3>
                            <p className="text-sm md:text-base text-light-text-muted dark:text-dark-text-muted max-w-sm px-4">
                                {t.promptLibraryNoResultsDesc}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {filteredPrompts.map((template) => (
                                <div
                                    key={template.id}
                                    className="group bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border rounded-xl p-3 md:p-4 hover:border-brand-purple/50 hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-2 md:mb-3">
                                        <h3 className="text-base md:text-lg font-semibold text-light-text dark:text-dark-text flex-1 pr-2 line-clamp-2">
                                            {template.title}
                                        </h3>
                                        {template.difficulty && (
                                            <span className={`px-2 py-0.5 md:py-1 text-xs font-medium rounded-md flex-shrink-0 ${getDifficultyColor(template.difficulty)}`}>
                                                {template.difficulty}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted mb-2 md:mb-3 line-clamp-2">
                                        {template.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
                                        {template.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-1.5 md:px-2 py-0.5 text-xs bg-light-surface dark:bg-dark-surface text-light-text-muted dark:text-dark-text-muted rounded-md border border-light-border dark:border-dark-border"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {template.tags.length > 3 && (
                                            <span className="px-1.5 md:px-2 py-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
                                                +{template.tags.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Prompt Preview */}
                                    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted line-clamp-3 font-mono">
                                            {template.prompt}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopyPrompt(template.prompt, template.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                        >
                                            {copiedId === template.id ? (
                                                <>
                                                    <CheckIcon className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                                                    <span className="text-xs md:text-sm text-green-500 font-medium">{t.promptLibraryCopied}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CopyIcon className="w-3 h-3 md:w-4 md:h-4 text-light-text dark:text-dark-text" />
                                                    <span className="text-xs md:text-sm text-light-text dark:text-dark-text font-medium">{t.promptLibraryCopy}</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleUsePrompt(template.prompt)}
                                            className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-gradient-to-r from-brand-yellow to-brand-magenta text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,217,61,0.5)] text-xs md:text-sm"
                                        >
                                            {t.promptLibraryUse}
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
