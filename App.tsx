import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import { GeneratedImage, DynamicTool } from './types';
import * as geminiService from './services/geminiService';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { SunIcon, MoonIcon, UploadIcon, DownloadIcon, ZoomInIcon, SparklesIcon, CopyIcon, SettingsIcon, XIcon, CheckIcon, LanguageIcon, WandIcon, InfoIcon, AlertTriangleIcon, BrushIcon, DiceIcon, TrashIcon, ReloadIcon, EnvelopeIcon, StarIcon, CornerUpLeftIcon } from './components/icons';

// --- Localization ---
const translations = {
  en: {
    headerTitle: 'Generentolo v0.1 Beta',
    headerSubtitle: 'Let me do it for you!',
    letMeDoForYou: 'Magic Prompt',
    refImagesTitle: 'Reference & Style Images',
    styleRefTitle: 'Style Reference',
    addStyleImage: 'Add / Drop Style Image',
    addImage: 'Add / Drop Images',
    optional: 'Optional',
    creativePromptsTitle: 'Creative Prompts',
    generateSuggestions: 'Generate Suggestions',
    suggestionsPlaceholder: "Click 'Generate Suggestions' to get creative ideas.",
    promptsLoading: 'Upload an image to generate prompts.',
    promptPlaceholder: 'Write your prompt or generate one from images...',
    magicPromptButton: 'Your prompt suck? Let me do it for you!',
    createFromImage: 'Create from Images',
    enhancePrompt: 'Enhance Prompt',
    professionalToolsTitle: 'Professional Tools',
    generateTools: 'Generate Tools',
    advancedSettingsTitle: 'Advanced Settings',
    negativePromptLabel: 'Negative Prompt',
    negativePromptTooltip: "Terms to exclude from the image (e.g., ugly, deformed). Helps refine results.",
    generateNegativePrompt: 'Generate Negative Prompt',
    negativePromptPlaceholder: 'e.g., text, watermarks, ugly...',
    seedLabel: 'Seed',
    seedTooltip: "A specific number that ensures an identical image is generated every time with the same prompt. Leave blank for random.",
    seedPlaceholder: 'Number for consistency',
    copySeed: 'Copy Seed',
    toolsLoading: 'Click \'Generate Tools\' to get professional controls.',
    toolsPlaceholder: "Click 'Generate Tools' to unlock professional controls based on your images.",
    chooseOptions: 'Choose options...',
    numImagesTitle: 'Number of Images',
    aspectRatioTitle: 'Aspect Ratio',
    aspectRatioTooltip: "Sets the width-to-height ratio of the final image (e.g., 16:9 for landscape).",
    generateButton: 'Generate',
    generatingButton: 'Generating...',
    generatingStatus: 'Nano is generating...',
    generatingSubtext: 'This can take a moment.',
    imageDisplayPlaceholderTitle: 'Your creations will appear here.',
    imageDisplayPlaceholderSubtext: 'Upload an image and generate to begin.',
    historyTitle: 'History',
    historyEmpty: 'No generations yet.',
    historyCapped: 'History is limited to the last 12 creations.',
    clearHistory: 'Clear all history',
    confirmClearHistory: 'Are you sure you want to clear the entire history? This action cannot be undone.',
    generationPromptTitle: 'Generation Prompt',
    copy: 'Copy',
    copied: 'Copied!',
    settingsTitle: 'Settings',
    apiKeyLabel: 'Gemini API Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeySubtext: 'If you leave this empty, the application will use the default shared key. Your key is saved locally in your browser.',
    cancel: 'Cancel',
    save: 'Save',
    clearSelection: 'Clear Selection',
    editAction: 'Inpaint',
    inpaintModalTitle: 'Inpaint Image',
    inpaintPromptLabel: 'Describe the change for the masked area:',
    brushSizeLabel: 'Brush Size',
    clearMask: 'Clear Mask',
    randomize: 'Randomize',
    deleteAction: 'Delete',
    reuseAction: 'Reuse Settings',
    confirmDeleteHistory: 'Are you sure you want to delete this item from history?',
    feedbackTitle: 'Leave Feedback',
    yourRating: 'Your Rating',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourMessage: 'Your Message',
    sendFeedback: 'Send Feedback',
    useAsReference: 'Use as Reference',
    resetInterface: 'Reset Interface',
    select: 'Select',
    deleteSelected: 'Delete Selected',
    confirmDeleteSelected: 'Are you sure you want to delete the selected items? This action cannot be undone.',
    keyboardShortcuts: 'Keyboard Shortcuts',
    shortcutsDescription: 'Use these shortcuts to speed up your workflow:',
    helpGuide: 'Help Guide',
    helpDescription: 'Complete guide to using Generentolo',
    // Toasts
    apiKeySaved: 'API Key saved!',
    downloadStarted: 'Download started!',
    generationFailed: 'Generation failed. Please try again.',
    inpaintingFailed: 'Inpainting failed. Please try again.',
    historySaveFailed: 'Could not save full history, storage is full.',
    promptEnhancementFailed: 'Prompt enhancement failed.',
    promptCreationFailed: 'Prompt creation failed.',

  },
  it: {
    headerTitle: 'Generentolo v0.1 Beta',
    headerSubtitle: 'Let me do it for you!',
    letMeDoForYou: 'Magic Prompt',
    refImagesTitle: 'Immagini di Riferimento e Stile',
    styleRefTitle: 'Riferimento Stile',
    addStyleImage: 'Aggiungi / Trascina Stile',
    addImage: 'Aggiungi / Trascina Immagini',
    optional: 'Facoltativo',
    creativePromptsTitle: 'Prompt Creativi',
    generateSuggestions: 'Genera Suggerimenti',
    suggestionsPlaceholder: "Clicca 'Genera Suggerimenti' per ottenere idee creative.",
    promptsLoading: 'Carica un\'immagine per generare i prompt.',
    promptPlaceholder: 'Scrivi il tuo prompt o creane uno dalle immagini...',
    magicPromptButton: 'Il tuo prompt fa cagher? Ci penso io!',
    createFromImage: 'Crea da Immagini',
    enhancePrompt: 'Migliora Prompt',
    professionalToolsTitle: 'Strumenti Professionali',
    generateTools: 'Genera Strumenti',
    advancedSettingsTitle: 'Impostazioni Avanzate',
    negativePromptLabel: 'Prompt Negativo',
    negativePromptTooltip: "Termini da escludere dall'immagine (es. brutto, deforme). Aiuta a rifinire i risultati.",
    generateNegativePrompt: 'Genera Prompt Negativo',
    negativePromptPlaceholder: 'es. testo, watermark, brutto...',
    seedLabel: 'Seed',
    seedTooltip: "Un numero specifico che assicura la generazione di un'immagine identica ogni volta con lo stesso prompt. Lascia vuoto per un risultato casuale.",
    seedPlaceholder: 'Numero per coerenza',
    copySeed: 'Copia Seed',
    toolsLoading: 'Clicca \'Genera Strumenti\' per ottenere controlli professionali.',
    toolsPlaceholder: "Clicca 'Genera Strumenti' per sbloccare i controlli professionali in base alle tue immagini.",
    chooseOptions: 'Scegli opzioni...',
    numImagesTitle: 'Numero di Immagini',
    aspectRatioTitle: 'Proporzioni',
    aspectRatioTooltip: "Imposta il rapporto larghezza-altezza dell'immagine finale (es. 16:9 per orizzontale).",
    generateButton: 'Genera',
    generatingButton: 'In generazione...',
    generatingStatus: 'Nano sta generando...',
    generatingSubtext: 'Potrebbe volerci un momento.',
    imageDisplayPlaceholderTitle: 'Le tue creazioni appariranno qui.',
    imageDisplayPlaceholderSubtext: 'Carica un\'immagine e genera per iniziare.',
    historyTitle: 'Cronologia',
    historyEmpty: 'Nessuna generazione ancora.',
  	historyCapped: 'La cronologia è limitata alle ultime 12 creazioni.',
    clearHistory: 'Svuota cronologia',
    confirmClearHistory: 'Sei sicuro di voler svuotare l\'intera cronologia? L\'azione è irreversibile.',
    generationPromptTitle: 'Prompt di Generazione',
    copy: 'Copia',
    copied: 'Copiato!',
    settingsTitle: 'Impostazioni',
    apiKeyLabel: 'Chiave API Gemini',
    apiKeyPlaceholder: 'Inserisci la tua chiave API',
    apiKeySubtext: 'Se lasci vuoto, l\'applicazione userà la chiave condivisa predefinita. La tua chiave è salvata localmente nel browser.',
    cancel: 'Annulla',
    save: 'Salva',
    clearSelection: 'Pulisci Selezione',
    editAction: 'Modifica',
    inpaintModalTitle: 'Modifica Immagine',
    inpaintPromptLabel: 'Descrivi la modifica per l\'area mascherata:',
    brushSizeLabel: 'Dim. Pennello',
    clearMask: 'Pulisci Maschera',
    randomize: 'Randomizza',
    deleteAction: 'Elimina',
    reuseAction: 'Riusa Impostazioni',
    confirmDeleteHistory: 'Sei sicuro di voler eliminare questo elemento dalla cronologia?',
    feedbackTitle: 'Lascia un Feedback',
    yourRating: 'La tua Valutazione',
    yourName: 'Il tuo Nome',
    yourEmail: 'La tua Email',
    yourMessage: 'Il tuo Messaggio',
    sendFeedback: 'Invia Feedback',
    useAsReference: 'Usa come Riferimento',
    resetInterface: 'Resetta Interfaccia',
    select: 'Seleziona',
    deleteSelected: 'Elimina Selezionati',
    confirmDeleteSelected: 'Sei sicuro di voler eliminare gli elementi selezionati? L\'azione è irreversibile.',
    keyboardShortcuts: 'Scorciatoie Tastiera',
    shortcutsDescription: 'Usa queste scorciatoie per velocizzare il tuo lavoro:',
    helpGuide: 'Guida',
    helpDescription: 'Guida completa all\'uso di Generentolo',
    // Toasts
    apiKeySaved: 'Chiave API salvata!',
    downloadStarted: 'Download avviato!',
    generationFailed: 'Generazione fallita. Riprova.',
    inpaintingFailed: 'Modifica fallita. Riprova.',
    historySaveFailed: 'Impossibile salvare la cronologia, memoria piena.',
    promptEnhancementFailed: 'Miglioramento del prompt fallito.',
    promptCreationFailed: 'Creazione del prompt fallita.',
  }
};

type Language = keyof typeof translations;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LocalizationContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

const useLocalization = () => useContext(LanguageContext);


// --- Helper Functions ---
const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('color-theme');
    if (typeof storedPrefs === 'string') return storedPrefs as 'dark' | 'light';
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) return 'dark';
  }
  return 'dark';
};

const getInitialLanguage = (): Language => {
    if(typeof window !== 'undefined' && window.localStorage) {
        const storedLang = window.localStorage.getItem('language');
        if (storedLang === 'en' || storedLang === 'it') return storedLang;
    }
    return 'en';
}

const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
}

const createThumbnailDataUrl = (dataUrl: string, maxSize = 256): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));

            let { width, height } = img;
            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (err) => reject(err);
        img.src = dataUrl;
    });
};



// --- Child Components ---
const MAX_USER_IMAGES = 4;

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg animate-pulse ${className}`} />
);

interface HeaderProps {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    onOpenSettings: () => void;
    onOpenFeedback: () => void;
    onOpenShortcuts: () => void;
    onOpenHelp: () => void;
}
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onOpenSettings, onOpenFeedback, onOpenShortcuts, onOpenHelp }) => {
    const { t, language, setLanguage } = useLocalization();
    const toggleLanguage = () => setLanguage(language === 'en' ? 'it' : 'en');
    return (
        <header className="flex justify-between items-center p-4">
            <div>
                 <h1 className="text-xl font-bold flex items-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-purple">
                        {t.headerTitle}
                    </span>
                </h1>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    {t.headerSubtitle} Powered by <span className="font-bold text-yellow-400">JOZ</span> for <span className="font-bold text-brand-pink">Dugongo</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onOpenHelp} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors" title="Help Guide">
                    <InfoIcon className="w-5 h-5" />
                </button>
                <button onClick={onOpenShortcuts} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors" title="Keyboard Shortcuts">
                    <span className="text-lg">⌨️</span>
                </button>
                <button onClick={onOpenFeedback} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">
                    <EnvelopeIcon className="w-5 h-5" />
                </button>
                <button onClick={toggleLanguage} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">
                    <LanguageIcon className="w-5 h-5" />
                </button>
                <button onClick={onOpenSettings} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

const ReferencePanel: React.FC<{
    onAddImages: (files: File[]) => void;
    onRemoveImage: (index: number) => void;
    referenceImages: File[];
    onAddStyleImage: (file: File) => void;
    onRemoveStyleImage: () => void;
    styleImage: File | null;
}> = ({ onAddImages, onRemoveImage, referenceImages, onAddStyleImage, onRemoveStyleImage, styleImage }) => {
    const { t } = useLocalization();
    const [isDraggingRef, setIsDraggingRef] = useState(false);
    const [isDraggingStyle, setIsDraggingStyle] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) onAddImages(Array.from(e.target.files));
        e.target.value = '';
    };

    const handleStyleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) onAddStyleImage(e.target.files[0]);
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleRefDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingRef(true); };
    const handleRefDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingRef(false); };
    const handleRefDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDraggingRef(false);
        const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
        if (files.length > 0) onAddImages(files);
    };

    const handleStyleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStyle(true); };
    const handleStyleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStyle(false); };
    const handleStyleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDraggingStyle(false);
        const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
        if (files.length > 0) onAddStyleImage(files[0]);
    };
    
    const ImagePreview: React.FC<{ file: File, index: number, isGuide?: boolean, onRemove?: (index: number) => void }> = ({ file, index, isGuide, onRemove }) => {
        const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
        useEffect(() => {
            return () => URL.revokeObjectURL(previewUrl);
        }, [previewUrl]);

        return (
            <div className="relative group aspect-square rounded-xl shadow-[0_0_12px_3px_rgba(250,204,21,0.6)] bg-light-surface/50 dark:bg-dark-surface/30 flex items-center justify-center">
                <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-sm z-10 ${isGuide ? 'bg-blue-400/20 text-blue-800 dark:text-blue-300' : 'bg-yellow-400/30 text-yellow-800 dark:text-yellow-300'}`}>
                    {isGuide ? 'GUIDE' : `REF.${index + 1}`}
                </div>
                <img src={previewUrl} alt={`Reference ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                {!isGuide && onRemove && (
                    <button onClick={(e) => { e.stopPropagation(); onRemove(index); }} className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label={`Remove image ${index + 1}`}>
                        <XIcon className="w-3 h-3"/>
                    </button>
                )}
            </div>
        );
    };

    const StyleImagePreview: React.FC<{ file: File, onRemove: () => void }> = ({ file, onRemove }) => {
        const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
        useEffect(() => {
            return () => URL.revokeObjectURL(previewUrl);
        }, [previewUrl]);

        return (
            <>
                <img src={previewUrl} alt="Style reference" className="w-full h-auto max-h-48 object-cover rounded-xl" />
                <button onClick={onRemove} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="Remove style image">
                    <XIcon className="w-4 h-4"/>
                </button>
            </>
        );
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-light-text dark:text-dark-text">{t.refImagesTitle}</h3>
            <div 
                onDragEnter={handleRefDragEnter} onDragLeave={handleRefDragLeave} onDragOver={handleDragOver} onDrop={handleRefDrop}
                className={`rounded-xl transition-all relative ${isDraggingRef ? 'border-2 border-dashed border-brand-purple bg-brand-purple/10 p-1' : 'border-2 border-transparent'}`}
            >
                <div className="grid grid-cols-3 gap-3">
                    {referenceImages.map((file, index) => (
                        <ImagePreview key={`${file.name}-${file.lastModified}-${index}`} file={file} index={index} onRemove={onRemoveImage} />
                    ))}

                    {referenceImages.length < MAX_USER_IMAGES && (
                         <div onClick={() => fileInputRef.current?.click()} className="relative group aspect-square rounded-xl shadow-[0_0_12px_3px_rgba(94,139,255,0.5)] bg-light-surface/50 dark:bg-dark-surface/30 flex items-center justify-center cursor-pointer">
                             <div className="text-light-text-muted dark:text-dark-text-muted text-center">
                                <UploadIcon className="w-6 h-6 mx-auto" />
                                <span className="text-xs mt-1 block">{t.addImage}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <input ref={fileInputRef} id="file-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />

            <div className="border-t border-light-border dark:border-dark-border/50"></div>

            <div
                onDragEnter={handleStyleDragEnter} onDragLeave={handleStyleDragLeave} onDragOver={handleDragOver} onDrop={handleStyleDrop}
                className={`rounded-xl transition-all relative ${isDraggingStyle ? 'border-2 border-dashed border-brand-pink bg-brand-pink/10 p-1' : 'border-2 border-transparent'}`}
            >
                <div className="relative group shadow-[0_0_8px_2px_rgba(217,70,239,0.5)] rounded-xl">
                     <div className="absolute top-2 left-2 px-2 py-1 bg-brand-pink/80 text-white text-xs rounded-full font-semibold backdrop-blur-sm z-10">STYLE</div>
                    {styleImage ? (
                        <StyleImagePreview file={styleImage} onRemove={onRemoveStyleImage} />
                    ) : (
                        <label htmlFor="style-file-upload" className="cursor-pointer w-full bg-light-surface dark:bg-dark-surface/50 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl flex flex-col justify-center items-center text-light-text-muted dark:text-dark-text-muted hover:border-brand-pink transition-colors p-6 text-center">
                            <UploadIcon className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">{t.addStyleImage}</span>
                            <span className="text-xs mt-1">{t.styleRefTitle} ({t.optional})</span>
                        </label>
                    )}
                    <input id="style-file-upload" type="file" className="hidden" accept="image/*" onChange={handleStyleFileChange} />
                </div>
            </div>
        </div>
    );
};

interface ToolSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tool: DynamicTool | null;
    initialSelections: string[];
    onSave: (toolName: string, selections: string[]) => void;
}
const ToolSelectionModal: React.FC<ToolSelectionModalProps> = ({ isOpen, onClose, tool, initialSelections, onSave }) => {
    const { t } = useLocalization();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    useEffect(() => { if (tool) setSelected(new Set(initialSelections)); }, [tool, initialSelections, isOpen]);
    if (!isOpen || !tool) return null;

    const handleToggle = (option: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(option)) newSet.delete(option); else newSet.add(option);
            return newSet;
        });
    };
    const handleSave = () => { onSave(tool.name, Array.from(selected)); onClose(); };
    const handleClear = () => setSelected(new Set());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">{tool.label}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="overflow-y-auto max-h-[60vh] p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {tool.options.map(option => {
                            const isSelected = selected.has(option);
                            return (
                                <label key={option} className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-brand-purple ring-2 ring-brand-purple' : 'border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>
                                    <input type="checkbox" checked={isSelected} onChange={() => handleToggle(option)} className="absolute opacity-0 w-0 h-0" />
                                    {isSelected && <div className="absolute top-1 right-1 text-brand-purple"><CheckIcon className="w-4 h-4" /></div>}
                                    <span className="text-sm select-none text-light-text dark:text-dark-text">{option}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t border-light-border dark:border-dark-border">
                    <button onClick={handleClear} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-semibold hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">{t.clearSelection}</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity">{t.save} ({selected.size})</button>
                </div>
            </div>
        </div>
    );
};

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group flex items-center">
      <InfoIcon className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 text-xs text-dark-text bg-dark-bg/90 backdrop-blur-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 dark:bg-light-bg/90 dark:text-light-text">
        {text}
      </div>
    </div>
);

interface ControlPanelProps {
    dynamicTools: DynamicTool[];
    selectedAspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
    onMagicPrompt: () => void;
    onGenerateTools: () => void;
    isLoading: boolean;
    isToolsLoading: boolean;
    isEnhancing: boolean;
    referenceImages: File[];
    styleReferenceImage: File | null;
    numImages: number;
    onNumImagesChange: (num: number) => void;
    userApiKey: string;
    language: Language;
    editedPrompt: string;
    onEditedPromptChange: (val: string) => void;
    negativePrompt: string;
    onNegativePromptChange: (val: string) => void;
    seed: string;
    onSeedChange: (val: string) => void;
    onRandomizeSeed: () => void;
    onCopySeed: () => void;
    promptTextareaRef: React.RefObject<HTMLTextAreaElement>;
}
const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { 
        dynamicTools, selectedAspectRatio, onAspectRatioChange, onMagicPrompt, onGenerateTools,
        isLoading, isToolsLoading, isEnhancing, referenceImages, styleReferenceImage, numImages, onNumImagesChange,
        userApiKey, language, editedPrompt, onEditedPromptChange, negativePrompt, onNegativePromptChange, seed, onSeedChange, onRandomizeSeed, onCopySeed, promptTextareaRef
    } = props;
    const { t } = useLocalization();
    const [toolSettings, setToolSettings] = useState<Record<string, string[]>>({});
    const [editingTool, setEditingTool] = useState<DynamicTool | null>(null);
    const [isRewriting, setIsRewriting] = useState(false);
    const [isGeneratingNegativePrompt, setIsGeneratingNegativePrompt] = useState(false);
    
    useEffect(() => {
        const newSettings: Record<string, string[]> = {};
        dynamicTools.forEach(tool => { newSettings[tool.name] = []; });
        setToolSettings(newSettings);
    }, [dynamicTools]);
    
    const handleGenerateNegativePrompt = useCallback(async () => {
        if (!editedPrompt || isGeneratingNegativePrompt) return;

        setIsGeneratingNegativePrompt(true);
        try {
            const newNegativePrompt = await geminiService.generateNegativePrompt(editedPrompt, referenceImages, styleReferenceImage, userApiKey, language);
            onNegativePromptChange(newNegativePrompt);
        } catch (error: any) {
            console.error("Failed to generate negative prompt:", error);
        } finally {
            setIsGeneratingNegativePrompt(false);
        }
    }, [editedPrompt, referenceImages, styleReferenceImage, userApiKey, language, onNegativePromptChange, isGeneratingNegativePrompt]);


    const handleToolSave = async (toolName: string, selections: string[]) => {
        const newToolSettings = { ...toolSettings, [toolName]: selections };
        setToolSettings(newToolSettings);

        const toolModifiers = Object.keys(newToolSettings)
            .filter((key) => newToolSettings[key].length > 0)
            .map((key) => `${key.replace(/_/g, ' ')}: (${newToolSettings[key].join(', ')})`)
            .join(', ');

        if (toolModifiers) {
            setIsRewriting(true);
            try {
                const rewrittenPrompt = await geminiService.rewritePromptWithOptions(editedPrompt || "A professional photograph", toolModifiers, userApiKey, language);
                onEditedPromptChange(rewrittenPrompt);
            } catch (e: any) {
                console.error(e);
                const conjunction = language === 'it' ? ', con ' : ', with ';
                onEditedPromptChange(editedPrompt + conjunction + toolModifiers);
            } finally {
                setIsRewriting(false);
            }
        }
    };

    const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
    const isActionDisabled = isLoading || isRewriting || isEnhancing || isGeneratingNegativePrompt;
    const hasImages = referenceImages.length > 0 || styleReferenceImage;
    const isPromptEmpty = editedPrompt.trim() === '';

    return (
        <div className="p-4 space-y-6">
            <div className="relative">
                <div className={`absolute inset-0 bg-light-surface/50 dark:bg-dark-bg/50 z-10 flex items-center justify-center transition-opacity rounded-xl ${(isRewriting || isEnhancing) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
                <textarea 
                    ref={promptTextareaRef}
                    value={editedPrompt} 
                    onChange={(e) => onEditedPromptChange(e.target.value)} 
                    rows={4} 
                    className="w-full p-3 bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-purple focus:outline-none text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted" 
                    placeholder={t.promptPlaceholder} 
                    disabled={isRewriting || isEnhancing} 
                />
            </div>
            <button 
                onClick={onMagicPrompt} 
                disabled={isActionDisabled || (isPromptEmpty && !hasImages)} 
                className="w-full text-center py-2 px-4 rounded-lg bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-brand-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-dark-border font-semibold text-sm flex items-center justify-center gap-2"
            >
                 <WandIcon className="w-4 h-4 text-brand-purple" />
                 <span>{isPromptEmpty ? t.createFromImage : t.enhancePrompt}</span>
            </button>
            
            <div>
                <h3 className="font-semibold mb-3 text-light-text dark:text-dark-text">{t.professionalToolsTitle}</h3>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {isToolsLoading && hasImages ? (
                             <> <SkeletonLoader className="h-[52px]" /> <SkeletonLoader className="h-[52px]" /> </>
                         ) : dynamicTools.length > 0 ? dynamicTools.map(tool => {
                            const selectionCount = toolSettings[tool.name]?.length || 0;
                            return (
                                <div key={tool.name}>
                                    <button onClick={() => setEditingTool(tool)} className="w-full text-left p-2 bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-lg hover:border-brand-purple transition-colors">
                                        <div className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">{tool.label}</div>
                                        <div className={`text-xs ${selectionCount > 0 ? 'text-brand-purple' : 'text-light-text-muted dark:text-dark-text-muted'}`}>{selectionCount > 0 ? `${selectionCount} selected` : t.chooseOptions}</div>
                                    </button>
                                </div>
                            )
                        }) : (
                            <div className="col-span-2">
                                {hasImages ? (
                                    <button onClick={onGenerateTools} disabled={isActionDisabled} className="w-full text-center py-2 px-4 rounded-lg bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-brand-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm">
                                        {t.generateTools}
                                    </button>
                                ) : (
                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted col-span-2">{t.toolsLoading}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border space-y-4">
                <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">{t.advancedSettingsTitle}</h4>
                 <div>
                    <label htmlFor="num-images" className="block text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-2">{t.numImagesTitle}</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(num => (
                            <button
                                key={num}
                                onClick={() => onNumImagesChange(num)}
                                className={`p-3 rounded-lg font-semibold text-center transition-colors ${numImages === num ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white' : 'bg-light-surface-accent dark:bg-dark-surface-accent hover:bg-light-surface-accent/70 dark:hover:bg-dark-surface-accent/70'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative">
                     <label htmlFor="negative-prompt" className="flex items-center gap-2 text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                        <span>{t.negativePromptLabel}</span>
                        <Tooltip text={t.negativePromptTooltip} />
                        {isGeneratingNegativePrompt && <div className="w-3 h-3 border-2 border-brand-purple/50 border-t-transparent rounded-full animate-spin"></div>}
                    </label>
                    <textarea id="negative-prompt" value={negativePrompt} onChange={e => onNegativePromptChange(e.target.value)} rows={2} className="w-full p-2 pr-10 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder={t.negativePromptPlaceholder} />
                    <button onClick={handleGenerateNegativePrompt} disabled={isActionDisabled || !editedPrompt} title={t.generateNegativePrompt} className="absolute bottom-2 right-2 p-1.5 rounded-full text-brand-purple hover:bg-brand-purple/20 transition-colors disabled:text-gray-400 disabled:hover:bg-transparent">
                        <WandIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div>
                    <label htmlFor="seed" className="flex items-center gap-2 text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                        <span>{t.seedLabel}</span>
                        <Tooltip text={t.seedTooltip} />
                    </label>
                    <div className="flex gap-2">
                        <input id="seed" type="text" value={seed} onChange={e => onSeedChange(e.target.value.replace(/\D/g, ''))} placeholder={t.seedPlaceholder} className="w-full p-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                        <button onClick={onCopySeed} title={t.copySeed} className="p-2 rounded-lg bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border hover:border-dark-text-muted transition-colors"><CopyIcon className="w-5 h-5"/></button>
                        <button onClick={onRandomizeSeed} title={t.randomize} className="p-2 rounded-lg bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border hover:border-dark-text-muted transition-colors"><DiceIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>

            <div>
                 <h3 className="font-semibold mb-3 text-light-text dark:text-dark-text flex items-center gap-2">
                    <span>{t.aspectRatioTitle}</span>
                    <Tooltip text={t.aspectRatioTooltip} />
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map(ratio => (
                        <button key={ratio} onClick={() => onAspectRatioChange(ratio)} className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${selectedAspectRatio === ratio ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>{ratio}</button>
                    ))}
                </div>
            </div>
            <ToolSelectionModal isOpen={!!editingTool} onClose={() => setEditingTool(null)} tool={editingTool} initialSelections={editingTool ? toolSettings[editingTool.name] : []} onSave={handleToolSave} />
        </div>
    );
};

interface ImageDisplayProps {
    images: GeneratedImage[];
    isLoading: boolean;
    onDownload: (image: GeneratedImage) => void;
    onZoom: (image: GeneratedImage) => void;
    onEdit: (image: GeneratedImage) => void;
}
const ImageDisplay: React.FC<ImageDisplayProps> = ({ images, isLoading, onDownload, onZoom, onEdit }) => {
    const { t } = useLocalization();

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-light-surface/50 dark:bg-dark-surface/30 rounded-2xl p-4">
            {isLoading && (
                <div className="flex flex-col items-center text-light-text-muted dark:text-dark-text-muted">
                    <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-semibold">{t.generatingStatus}</p>
                    <p className="text-sm">{t.generatingSubtext}</p>
                </div>
            )}
            {!isLoading && images.length > 0 && (
                 <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`w-full flex-1 min-h-0 grid ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 p-4`}>
                        {images.map(image => (
                            <div key={image.id} className="relative group flex items-center justify-center min-h-0">
                                <img src={image.imageDataUrl || image.thumbnailDataUrl} alt={image.prompt} className="max-w-full max-h-full object-contain rounded-md cursor-zoom-in" onClick={() => onZoom(image)} />
                                <div className="absolute top-2 right-2 flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs font-mono backdrop-blur-sm">{image.aspectRatio}</span>
                                    <button onClick={() => onEdit(image)} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label={t.editAction}><BrushIcon className="w-5 h-5" /></button>
                                    <button onClick={() => onDownload(image)} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Download image"><DownloadIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
            {!isLoading && images.length === 0 && (
                 <div className="text-center text-light-text-muted dark:text-dark-text-muted">
                     <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-30 text-brand-purple"/>
                    <p className="font-semibold">{t.imageDisplayPlaceholderTitle}</p>
                    <p className="text-sm">{t.imageDisplayPlaceholderSubtext}</p>
                </div>
            )}
        </div>
    );
};

interface HistoryPanelProps {
    history: GeneratedImage[];
    onSelect: (image: GeneratedImage) => void;
    onZoom: (image: GeneratedImage) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
    isSelectionMode: boolean;
    selectedIds: Set<string>;
    onEnterSelectionMode: () => void;
    onCancelSelectionMode: () => void;
    onToggleSelection: (id: string) => void;
    onDeleteSelected: () => void;
}
const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
    history, onSelect, onZoom, onDelete, onClearAll,
    isSelectionMode, selectedIds, onEnterSelectionMode, onCancelSelectionMode, onToggleSelection, onDeleteSelected
}) => {
    const { t } = useLocalization();
    return (
        <div className="h-full flex flex-col bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-light-text dark:text-dark-text">{t.historyTitle}</h2>
              {history.length > 0 && (
                 <div className="flex items-center gap-2">
                  {!isSelectionMode ? (
                    <>
                      <button onClick={onEnterSelectionMode} className="text-sm font-medium text-brand-blue hover:underline">{t.select}</button>
                      <button 
                        onClick={onClearAll} 
                        title={t.clearHistory} 
                        className="p-1.5 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-red-500/20 hover:text-red-500 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={onDeleteSelected} disabled={selectedIds.size === 0} className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50 disabled:no-underline">{t.deleteSelected} ({selectedIds.size})</button>
                      <button onClick={onCancelSelectionMode} className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted hover:underline">{t.cancel}</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {history.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                        {history.map(item => {
                            const isSelected = selectedIds.has(item.id);
                            return (
                                <div key={item.id} className="relative group" onClick={() => isSelectionMode ? onToggleSelection(item.id) : onZoom(item)}>
                                    <img src={item.thumbnailDataUrl || item.imageDataUrl} alt={item.prompt} className={`aspect-square object-cover rounded-xl w-full transition-transform duration-300 ${isSelectionMode ? 'group-hover:scale-95 cursor-pointer' : 'cursor-zoom-in'}`} />
                                    
                                    {isSelectionMode ? (
                                        <div className={`absolute inset-0 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-brand-blue bg-brand-blue/30' : 'border-transparent group-hover:bg-black/30'}`}>
                                            <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-2 border-white' : 'bg-black/30 border-2 border-white/50'}`}>
                                                {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                                            <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                                                    className="p-1.5 rounded-full bg-black/60 text-white transition-all hover:bg-brand-purple"
                                                    aria-label={t.reuseAction}
                                                    title={t.reuseAction}
                                                >
                                                    <ReloadIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                    className="p-1.5 rounded-full bg-red-600/80 text-white transition-all hover:bg-red-500"
                                                    aria-label={t.deleteAction}
                                                    title={t.deleteAction}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-center text-light-text-muted dark:text-dark-text-muted">{t.historyEmpty}</p>
                )}
            </div>
            <p className="text-xs text-center text-light-text-muted dark:text-dark-text-muted mt-4 pt-2 border-t border-light-border/50 dark:border-dark-border/50">{t.historyCapped}</p>
        </div>
    );
}

interface CreativePromptsPanelProps {
    prompts: string[];
    onSelectPrompt: (prompt: string) => void;
    onGenerate: () => void;
    selectedPrompt: string;
    isLoading: boolean;
    hasImages: boolean;
}
const CreativePromptsPanel: React.FC<CreativePromptsPanelProps> = ({ prompts, onSelectPrompt, onGenerate, selectedPrompt, isLoading, hasImages }) => {
    const { t } = useLocalization();
    return (
        <div className="flex-shrink-0 w-full p-4 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-2xl border border-light-border dark:border-dark-border/50 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">{t.creativePromptsTitle}</h4>
                {prompts.length > 0 && hasImages && (
                    <button 
                        onClick={onGenerate} 
                        disabled={isLoading}
                        className="p-1.5 rounded-full text-brand-purple hover:bg-brand-purple/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t.generateSuggestions}
                    >
                        <ReloadIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <SkeletonLoader className="h-20" />
                    <SkeletonLoader className="h-20" />
                    <SkeletonLoader className="h-20" />
                </div>
            ) : prompts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {prompts.map((prompt, index) => {
                        const isSelected = selectedPrompt === prompt;
                        return (
                            <button 
                                key={`${index}-${prompt}`} 
                                onClick={() => onSelectPrompt(prompt)}
                                className={`text-left p-3 rounded-lg text-sm transition-all border ${isSelected ? 'bg-brand-purple/20 border-brand-purple text-light-text dark:text-dark-text font-medium' : 'bg-light-surface/50 dark:bg-dark-surface/50 border-transparent hover:border-dark-border text-light-text-muted dark:text-dark-text-muted'}`}
                            >
                                {prompt}
                            </button>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-4">
                    {hasImages ? (
                        <button onClick={onGenerate} className="text-center py-2 px-4 rounded-lg bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-brand-purple transition-colors font-semibold text-sm">
                            {t.generateSuggestions}
                        </button>
                    ) : (
                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.promptsLoading}</p>
                    )}
                 </div>
            )}
        </div>
    );
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (apiKey: string) => void;
    currentApiKey: string;
}
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
    const { t } = useLocalization();
    const [apiKeyInput, setApiKeyInput] = useState(currentApiKey);
    useEffect(() => { setApiKeyInput(currentApiKey); }, [currentApiKey, isOpen]);
    if (!isOpen) return null;
    const handleSave = () => { onSave(apiKeyInput); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 id="settings-title" className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">{t.settingsTitle}</h2>
                <div>
                    <label htmlFor="api-key-input" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">{t.apiKeyLabel}</label>
                    <input id="api-key-input" type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} placeholder={t.apiKeyPlaceholder} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-2">{t.apiKeySubtext}</p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-semibold hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">{t.cancel}</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity">{t.save}</button>
                </div>
            </div>
        </div>
    );
};

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const { t, language } = useLocalization();
    if (!isOpen) return null;

    const helpContent = language === 'it' ? {
        sections: [
            {
                title: "👋 Benvenuto in Generentolo!",
                content: "Generentolo è un potente generatore di immagini AI che ti permette di creare immagini pubblicitarie professionali utilizzando l'intelligenza artificiale di Google Gemini."
            },
            {
                title: "🚀 Come Iniziare",
                content: "1. **Aggiungi Immagini di Riferimento**: Carica fino a 4 immagini che vuoi usare come ispirazione (prodotti, persone, scene).\n\n2. **Scrivi o Genera un Prompt**: Descrivi l'immagine che vuoi creare, oppure clicca 'Genera Suggerimenti' per ottenere idee creative.\n\n3. **Seleziona l'Aspect Ratio**: Scegli il formato desiderato (1:1 quadrato, 16:9 orizzontale, 9:16 verticale, ecc.).\n\n4. **Genera**: Premi il pulsante viola 'Genera' o usa Ctrl+G!"
            },
            {
                title: "🖼️ Immagini di Riferimento",
                content: "**Reference Images**: Fino a 4 immagini che il modello userà come soggetti principali.\n\n**Style Image**: Un'immagine separata per definire lo stile visivo (colori, lighting, mood). Perfetta per mantenere coerenza con il tuo brand!"
            },
            {
                title: "✨ Magic Prompt",
                content: "Il pulsante con la bacchetta magica ha due funzioni:\n\n• **Senza testo**: Genera automaticamente un prompt dalle tue immagini\n• **Con testo**: Migliora e arricchisce il tuo prompt esistente\n\nUsa Ctrl+E come scorciatoia!"
            },
            {
                title: "🎨 Strumenti Professionali",
                content: "Clicca 'Genera Strumenti' per ottenere controlli avanzati basati sulle tue immagini:\n\n• **Hairstyle/Outfit** per persone\n• **Camera Angle/Lighting** per prodotti\n• **Time of Day/Weather** per scene\n\nSeleziona le opzioni che preferisci e il prompt verrà riscritto automaticamente!"
            },
            {
                title: "⚙️ Impostazioni Avanzate",
                content: "**Negative Prompt**: Specifica cosa NON vuoi nell'immagine (es: 'testo, watermark, sfocato'). Clicca la bacchetta per generarlo automaticamente.\n\n**Seed**: Un numero per riprodurre la stessa immagine. Lascia vuoto per risultati casuali. Usa Ctrl+R per randomizzare!"
            },
            {
                title: "⌨️ Scorciatoie Tastiera",
                content: "• Ctrl+G: Genera immagini\n• Ctrl+E: Migliora prompt\n• Ctrl+R: Seed casuale\n• Ctrl+K: Pulisci interfaccia\n• Ctrl+P: Focus prompt\n• Ctrl+Shift+T: Cambia tema"
            },
            {
                title: "💡 Tips & Tricks",
                content: "• **Aspect Ratio**: Le immagini vengono croppate al formato esatto, nessuna banda bianca!\n\n• **Adapt Buttons**: Dopo aver generato un'immagine, usa i pulsanti 'Adapt to Portrait/Landscape' per estendere la scena.\n\n• **History**: Clicca un'immagine nella cronologia per riusare le sue impostazioni.\n\n• **'Let Me Do For You'**: Il pulsante 'Magic Prompt' rosa genera automaticamente tutto per te!"
            },
            {
                title: "🔑 API Key",
                content: "L'app usa una chiave condivisa, ma per uso intensivo puoi inserire la tua chiave Gemini gratuita:\n\n1. Vai su ai.google.dev\n2. Crea una API key gratuita\n3. Inseriscila nelle Impostazioni (icona ingranaggio)\n\nLa tua chiave è salvata solo nel tuo browser!"
            }
        ]
    } : {
        sections: [
            {
                title: "👋 Welcome to Generentolo!",
                content: "Generentolo is a powerful AI image generator that lets you create professional advertising images using Google Gemini's artificial intelligence."
            },
            {
                title: "🚀 Getting Started",
                content: "1. **Add Reference Images**: Upload up to 4 images to use as inspiration (products, people, scenes).\n\n2. **Write or Generate a Prompt**: Describe the image you want, or click 'Generate Suggestions' for creative ideas.\n\n3. **Select Aspect Ratio**: Choose your desired format (1:1 square, 16:9 landscape, 9:16 portrait, etc.).\n\n4. **Generate**: Press the purple 'Generate' button or use Ctrl+G!"
            },
            {
                title: "🖼️ Reference Images",
                content: "**Reference Images**: Up to 4 images the model will use as main subjects.\n\n**Style Image**: A separate image to define visual style (colors, lighting, mood). Perfect for maintaining brand consistency!"
            },
            {
                title: "✨ Magic Prompt",
                content: "The wand button has two functions:\n\n• **Without text**: Automatically generates a prompt from your images\n• **With text**: Enhances and enriches your existing prompt\n\nUse Ctrl+E as a shortcut!"
            },
            {
                title: "🎨 Professional Tools",
                content: "Click 'Generate Tools' to get advanced controls based on your images:\n\n• **Hairstyle/Outfit** for people\n• **Camera Angle/Lighting** for products\n• **Time of Day/Weather** for scenes\n\nSelect your preferred options and the prompt will be automatically rewritten!"
            },
            {
                title: "⚙️ Advanced Settings",
                content: "**Negative Prompt**: Specify what you DON'T want in the image (e.g., 'text, watermark, blurry'). Click the wand to generate it automatically.\n\n**Seed**: A number to reproduce the same image. Leave empty for random results. Use Ctrl+R to randomize!"
            },
            {
                title: "⌨️ Keyboard Shortcuts",
                content: "• Ctrl+G: Generate images\n• Ctrl+E: Enhance prompt\n• Ctrl+R: Random seed\n• Ctrl+K: Clear interface\n• Ctrl+P: Focus prompt\n• Ctrl+Shift+T: Toggle theme"
            },
            {
                title: "💡 Tips & Tricks",
                content: "• **Aspect Ratio**: Images are cropped to exact format, no white bars!\n\n• **Adapt Buttons**: After generating an image, use 'Adapt to Portrait/Landscape' buttons to extend the scene.\n\n• **History**: Click an image in history to reuse its settings.\n\n• **'Let Me Do For You'**: The pink 'Magic Prompt' button automatically generates everything for you!"
            },
            {
                title: "🔑 API Key",
                content: "The app uses a shared key, but for intensive use you can insert your own free Gemini key:\n\n1. Go to ai.google.dev\n2. Create a free API key\n3. Insert it in Settings (gear icon)\n\nYour key is saved only in your browser!"
            }
        ]
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog">
            <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <InfoIcon className="w-6 h-6 text-brand-purple" />
                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">{t.helpGuide}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {helpContent.sections.map((section, index) => (
                        <div key={index} className="space-y-2">
                            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{section.title}</h3>
                            <div className="text-sm text-light-text-muted dark:text-dark-text-muted whitespace-pre-line leading-relaxed">
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end p-6 border-t border-light-border dark:border-dark-border">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold hover:opacity-90 transition-opacity">
                        {t.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    if (!isOpen) return null;

    const shortcuts = [
        { keys: 'Ctrl+G', description: t.generateButton },
        { keys: 'Ctrl+E', description: t.enhancePrompt },
        { keys: 'Ctrl+R', description: t.randomize + ' Seed' },
        { keys: 'Ctrl+K', description: t.resetInterface },
        { keys: 'Ctrl+,', description: t.settingsTitle },
        { keys: 'Ctrl+P', description: 'Focus Prompt' },
        { keys: 'Ctrl+Shift+T', description: 'Toggle Theme' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⌨️</span>
                        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">{t.keyboardShortcuts}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-4">{t.shortcutsDescription}</p>
                <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                            <span className="text-sm text-light-text dark:text-dark-text">{shortcut.description}</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded">{shortcut.keys}</kbd>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                        {t.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setName('');
            setEmail('');
            setMessage('');
        }
    }, [isOpen]);

    const handleSend = () => {
        const subject = encodeURIComponent(`Feedback for Generentolo`);
        const body = encodeURIComponent(
`Rating: ${rating}/5
Name: ${name}
Email: ${email}

Message:
${message}`
        );
        window.location.href = `mailto:bergamasterz@gmail.com?subject=${subject}&body=${body}`;
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 id="feedback-title" className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">{t.feedbackTitle}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-2">{t.yourRating}</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="text-yellow-400"
                                >
                                    <StarIcon filled={(hoverRating || rating) >= star} className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="feedback-name" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">{t.yourName}</label>
                        <input id="feedback-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="feedback-email" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">{t.yourEmail}</label>
                        <input id="feedback-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="feedback-message" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">{t.yourMessage}</label>
                        <textarea id="feedback-message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-semibold hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">{t.cancel}</button>
                    <button onClick={handleSend} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity">{t.sendFeedback}</button>
                </div>
            </div>
        </div>
    );
};

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-3 rounded-lg shadow-2xl border animate-fade-in-down ${isSuccess ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-red-500/20 text-red-200 border-red-500/30'}`}>
            {isSuccess ? <InfoIcon className="w-5 h-5" /> : <AlertTriangleIcon className="w-5 h-5" />}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="p-1 -mr-1 rounded-full hover:bg-white/10"><XIcon className="w-4 h-4" /></button>
        </div>
    );
};

interface InpaintEditorProps {
    image: GeneratedImage;
    onClose: () => void;
    onSave: (imageFile: File, maskFile: File, prompt: string) => void;
}
const InpaintEditor: React.FC<InpaintEditorProps> = ({ image, onClose, onSave }) => {
    const { t } = useLocalization();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [brushSize, setBrushSize] = useState(40);
    const [inpaintPrompt, setInpaintPrompt] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0] : null;
        const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
        const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const { x, y } = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPosition(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };

    const handleImageLoad = () => {
        const img = imageRef.current;
        const canvas = canvasRef.current;
        if (img && canvas) {
            canvas.width = img.clientWidth;
            canvas.height = img.clientHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    };
    
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if(ctx) ctx.lineWidth = brushSize;
        }
    }, [brushSize]);

    const handleClearMask = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = async () => {
        if (!canvasRef.current || !inpaintPrompt || !image.imageDataUrl) return;
        setIsLoading(true);
        const imageFile = dataURLtoFile(image.imageDataUrl, 'source.png');
        canvasRef.current.toBlob(async (blob) => {
            if (blob) {
                const maskFile = new File([blob], 'mask.png', { type: 'image/png' });
                await onSave(imageFile, maskFile, inpaintPrompt);
            }
            setIsLoading(false);
        }, 'image/png');
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog">
            <div className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-lg font-semibold">{t.inpaintModalTitle}</h2>
                    <button onClick={onClose}><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                    <div className="md:col-span-2 relative w-full h-full min-h-[400px]">
                        <img ref={imageRef} src={image.imageDataUrl || image.thumbnailDataUrl} alt="Inpainting source" className="w-full h-full object-contain" onLoad={handleImageLoad} />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t.inpaintPromptLabel}</label>
                            <textarea value={inpaintPrompt} onChange={(e) => setInpaintPrompt(e.target.value)} rows={4} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t.brushSizeLabel}: {brushSize}</label>
                            <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full" />
                        </div>
                        <button onClick={handleClearMask} className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-semibold">{t.clearMask}</button>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t border-light-border dark:border-dark-border">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg">{t.cancel}</button>
                    <button onClick={handleSave} disabled={!inpaintPrompt || isLoading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isLoading ? t.generatingButton : t.generateButton}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
const MAX_HISTORY_ITEMS = 12;

export default function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme());
    const [language, setLanguage] = useState<Language>(getInitialLanguage());
    const [referenceImages, setReferenceImages] = useState<File[]>([]);
    const [styleReferenceImage, setStyleReferenceImage] = useState<File | null>(null);
    const [prompts, setPrompts] = useState<string[]>([]);
    const [isPromptsLoading, setIsPromptsLoading] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [seed, setSeed] = useState<string>('');
    const [dynamicTools, setDynamicTools] = useState<DynamicTool[]>([]);
    const [aspectRatio, setAspectRatio] = useState<string>('1:1');
    const [currentImages, setCurrentImages] = useState<GeneratedImage[]>([]);
    const [history, setHistory] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isToolsLoading, setIsToolsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [numImagesToGenerate, setNumImagesToGenerate] = useState(1);
    const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);
    const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [userApiKey, setUserApiKey] = useState<string>('');
    const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
    const [isHistorySelectionMode, setIsHistorySelectionMode] = useState(false);
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
    const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

    const t = useMemo(() => translations[language], [language]);
    
    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ id: Date.now(), message, type });
    }, []);
    
    const handleAspectRatioChange = (ratio: string) => {
        setAspectRatio(ratio);
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('color-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);
    
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('nano-generator-history');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
            const savedApiKey = localStorage.getItem('gemini-api-key');
            if (savedApiKey) {
                setUserApiKey(savedApiKey);
            } else {
                setIsSettingsOpen(true);
            }
        } catch (error) { console.error("Failed to load data from localStorage", error); }
    }, []);

    useEffect(() => {
        try {
            const historyToSave = history.map(image => {
                const { imageDataUrl, ...savableImage } = image;
                return savableImage;
            });
            localStorage.setItem('nano-generator-history', JSON.stringify(historyToSave));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                showToast(t.historySaveFailed, 'error');
            }
        }
    }, [history, showToast, t.historySaveFailed]);

    const handleSaveApiKey = (apiKey: string) => {
        setUserApiKey(apiKey);
        localStorage.setItem('gemini-api-key', apiKey);
        showToast(t.apiKeySaved, 'success');
    };

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const generateInitialPrompt = useCallback(async (refFiles: File[], styleFile: File | null) => {
        if (refFiles.length === 0 && !styleFile) return;
        
        setIsEnhancing(true);
        try {
            const newPrompt = await geminiService.generateSinglePromptFromImage(refFiles, styleFile, userApiKey, language);
            setEditedPrompt(newPrompt);
        } catch (error: any) {
            console.error("Failed to generate initial prompt", error);
            showToast(error.message || t.promptCreationFailed, 'error');
        } finally {
            setIsEnhancing(false);
        }
    }, [userApiKey, language, showToast, t.promptCreationFailed]);

    useEffect(() => {
        const hasImages = referenceImages.length > 0 || styleReferenceImage;
        if (!hasImages) {
             setPrompts([]);
             setDynamicTools([]);
        }
    }, [referenceImages, styleReferenceImage]);
    
    const handleGenerateCreativePrompts = useCallback(async () => {
        const hasImages = referenceImages.length > 0 || styleReferenceImage;
        if (!hasImages) return;

        setIsPromptsLoading(true);
        try {
            const newPrompts = await geminiService.generatePromptsFromImage(referenceImages, styleReferenceImage, userApiKey, language);
            setPrompts(newPrompts);
            if (newPrompts.length > 0 && !editedPrompt) {
                setEditedPrompt(newPrompts[0]);
            }
        } catch (error: any) {
            console.error("Failed to generate creative prompts", error);
            showToast(error.message, 'error');
        } finally {
            setIsPromptsLoading(false);
        }
    }, [referenceImages, styleReferenceImage, userApiKey, language, showToast, editedPrompt]);

    const handleGenerateDynamicTools = useCallback(async () => {
        const hasImages = referenceImages.length > 0 || styleReferenceImage;
        if (!hasImages) return;

        setIsToolsLoading(true);
        try {
            const newTools = await geminiService.generateDynamicToolsFromImage(referenceImages, styleReferenceImage, userApiKey, language);
            setDynamicTools(newTools);
        } catch (error: any) {
            console.error("Failed to generate dynamic tools", error);
            showToast(error.message, 'error');
        } finally {
            setIsToolsLoading(false);
        }
    }, [referenceImages, styleReferenceImage, userApiKey, language, showToast]);


    const handleAddImages = (newFiles: File[]) => {
        setReferenceImages(prev => [...prev, ...newFiles].slice(0, MAX_USER_IMAGES));
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setReferenceImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddStyleImage = (file: File) => {
        setStyleReferenceImage(file);
    };
    
    const handleRemoveStyleImage = () => {
        setStyleReferenceImage(null);
    };
    
    const handleGenerate = useCallback(async () => {
        if (referenceImages.length === 0 && !editedPrompt && !styleReferenceImage) return;

        setIsLoading(true);
        setCurrentImages([]);
        try {
            const allReferenceFiles = [...referenceImages];
            
            const generationPromises = Array(numImagesToGenerate).fill(0).map(() => 
                geminiService.generateImage(editedPrompt, aspectRatio, allReferenceFiles, styleReferenceImage, userApiKey, negativePrompt, seed, language)
            );
            const imageDataUrls = await Promise.all(generationPromises);

            const newImages: GeneratedImage[] = await Promise.all(
                imageDataUrls.map(async (imageDataUrl) => {
                    let thumbnailDataUrl: string | undefined;
                    try {
                        thumbnailDataUrl = await createThumbnailDataUrl(imageDataUrl);
                    } catch (e) {
                        console.error("Failed to create thumbnail, falling back to full image.", e);
                        thumbnailDataUrl = imageDataUrl;
                    }
                    return ({
                        id: crypto.randomUUID(),
                        imageDataUrl,
                        thumbnailDataUrl,
                        prompt: editedPrompt,
                        aspectRatio,
                        negativePrompt,
                        seed,
                        timestamp: Date.now(),
                    });
                })
            );
            
            setCurrentImages(newImages);
            setHistory(prev => [...newImages, ...prev].slice(0, MAX_HISTORY_ITEMS));
        } catch (error: any) { 
            console.error("Image generation failed", error); 
            showToast(error.message || t.generationFailed, 'error');
        } finally { 
            setIsLoading(false); 
        }
    }, [referenceImages, styleReferenceImage, userApiKey, aspectRatio, showToast, t.generationFailed, language, editedPrompt, negativePrompt, seed, numImagesToGenerate]);

    const handleLetMeDoForYou = useCallback(async () => {
        if (prompts.length === 0 || isLoading) return;
        
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
        let toolSelectionsString = '';
        if (dynamicTools.length > 0) {
            const selections: string[] = [];
            dynamicTools.forEach(tool => {
                if (Math.random() > 0.5 && tool.options.length > 0) {
                    const randomOption = tool.options[Math.floor(Math.random() * tool.options.length)];
                    selections.push(`${tool.label}: (${randomOption})`);
                }
            });
            toolSelectionsString = selections.join(', ');
        }
    
        let finalPrompt = randomPrompt;
        if (toolSelectionsString) {
            try {
                finalPrompt = await geminiService.rewritePromptWithOptions(randomPrompt, toolSelectionsString, userApiKey, language);
            } catch (e) {
                console.error("Rewrite failed during 'Let Me Do For You', falling back.", e);
                const conjunction = language === 'it' ? ', con ' : ', with ';
                finalPrompt = `${randomPrompt}${conjunction}${toolSelectionsString}`;
            }
        }
        
        setEditedPrompt(finalPrompt);
        setNegativePrompt('');
    
        const randomSeed = String(Math.floor(Math.random() * 1000000000));
        setSeed(randomSeed);
    
        setTimeout(() => {
            setNumImagesToGenerate(1); // Reset to 1 for this action
            handleGenerate();
        }, 100);
    
    }, [prompts, isLoading, dynamicTools, userApiKey, language, handleGenerate]);
    
    
    const handleInpaint = async (imageFile: File, maskFile: File, prompt: string) => {
        try {
            const imageDataUrl = await geminiService.inpaintImage(prompt, imageFile, maskFile, userApiKey, language);
            const thumbnailDataUrl = await createThumbnailDataUrl(imageDataUrl);
            const newImage: GeneratedImage = {
                id: crypto.randomUUID(), imageDataUrl, thumbnailDataUrl,
                prompt: `Inpainted: ${editingImage?.prompt} with "${prompt}"`,
                aspectRatio: editingImage?.aspectRatio || '1:1',
                timestamp: Date.now()
            };
            setCurrentImages([newImage]);
            setHistory(prev => [newImage, ...prev].slice(0, MAX_HISTORY_ITEMS));
            setEditingImage(null);
        } catch (error: any) {
            console.error("Inpainting failed", error);
            showToast(error.message || t.inpaintingFailed, 'error');
        }
    }

    const handleEnhancePrompt = useCallback(async () => {
        if (!editedPrompt) return;
        setIsEnhancing(true);
        try {
            const enhanced = await geminiService.enhancePrompt(editedPrompt, referenceImages, styleReferenceImage, userApiKey, language);
            setEditedPrompt(enhanced);
        } catch (error: any) {
            console.error("Prompt enhancement failed", error);
            showToast(error.message || t.promptEnhancementFailed, 'error');
        } finally {
            setIsEnhancing(false);
        }
    }, [editedPrompt, referenceImages, styleReferenceImage, userApiKey, language, showToast, t.promptEnhancementFailed]);
    
    const handleMagicPrompt = useCallback(() => {
        if (editedPrompt.trim() === '') {
            generateInitialPrompt(referenceImages, styleReferenceImage);
        } else {
            handleEnhancePrompt();
        }
    }, [editedPrompt, referenceImages, styleReferenceImage, generateInitialPrompt, handleEnhancePrompt]);

    const handleDownload = (image: GeneratedImage) => {
        const downloadUrl = image.imageDataUrl || image.thumbnailDataUrl;
        if (!downloadUrl) return;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `nano-gen-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(t.downloadStarted, 'success');
    };

    const handleCopyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast(t.copied, 'success');
        });
    };

    const handleSelectHistory = (image: GeneratedImage) => {
        setCurrentImages([image]);
        setEditedPrompt(image.prompt);
        handleAspectRatioChange(image.aspectRatio);
        setNegativePrompt(image.negativePrompt || '');
        setSeed(image.seed || '');
        setReferenceImages([]);
        setStyleReferenceImage(null);
    };

    const handleRandomizeSeed = () => {
        setSeed(String(Math.floor(Math.random() * 1000000000)));
    };
    
    const handleCancelHistorySelectionMode = useCallback(() => {
        setIsHistorySelectionMode(false);
        setSelectedHistoryIds(new Set());
    }, []);

    const handleDeleteHistoryItem = (idToDelete: string) => {
        if (window.confirm(t.confirmDeleteHistory)) {
            setHistory(prevHistory => prevHistory.filter(item => item.id !== idToDelete));
        }
    };

    const handleClearAllHistory = () => {
        if (window.confirm(t.confirmClearHistory)) {
            setHistory([]);
            handleCancelHistorySelectionMode();
        }
    };

    const handleToggleHistorySelection = (id: string) => {
        setSelectedHistoryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleDeleteSelectedHistoryItems = () => {
        if (selectedHistoryIds.size === 0) return;
        if (window.confirm(t.confirmDeleteSelected)) {
            setHistory(prev => prev.filter(item => !selectedHistoryIds.has(item.id)));
            handleCancelHistorySelectionMode();
        }
    };

    const handleEnterHistorySelectionMode = () => setIsHistorySelectionMode(true);

    const handleResetInterface = useCallback(() => {
        setReferenceImages([]);
        setStyleReferenceImage(null);
        setPrompts([]);
        setEditedPrompt('');
        setNegativePrompt('');
        setSeed('');
        setDynamicTools([]);
        setAspectRatio('1:1');
        setCurrentImages([]);
        setNumImagesToGenerate(1);
    }, []);

     const handleUseAsReference = () => {
        if (currentImages.length === 0 || referenceImages.length >= MAX_USER_IMAGES) return;
        const imageToUse = currentImages[0];
        const imageUrl = imageToUse.imageDataUrl || imageToUse.thumbnailDataUrl;
        if (!imageUrl) return;

        const file = dataURLtoFile(imageUrl, `ref-${imageToUse.id}.png`);
        handleAddImages([file]);
        setCurrentImages([]);
    };
    
    const isActionDisabled = isLoading || isEnhancing;

    // Keyboard shortcuts
    const shortcuts = useMemo(() => [
        { ...APP_SHORTCUTS.GENERATE, action: () => !isActionDisabled && handleGenerate() },
        { ...APP_SHORTCUTS.ENHANCE_PROMPT, action: () => !isActionDisabled && handleMagicPrompt() },
        { ...APP_SHORTCUTS.RANDOM_SEED, action: handleRandomizeSeed },
        { ...APP_SHORTCUTS.CLEAR_INTERFACE, action: handleResetInterface },
        { ...APP_SHORTCUTS.OPEN_SETTINGS, action: () => setIsSettingsOpen(true) },
        { ...APP_SHORTCUTS.FOCUS_PROMPT, action: () => promptTextareaRef.current?.focus() },
        { ...APP_SHORTCUTS.TOGGLE_THEME, action: toggleTheme },
    ], [isActionDisabled, handleGenerate, handleMagicPrompt, handleRandomizeSeed, handleResetInterface, toggleTheme]);

    useKeyboardShortcuts(shortcuts, !isLoading && !isEnhancing);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col font-sans">
                <Header theme={theme} toggleTheme={toggleTheme} onOpenSettings={() => setIsSettingsOpen(true)} onOpenFeedback={() => setIsFeedbackOpen(true)} onOpenShortcuts={() => setIsShortcutsOpen(true)} onOpenHelp={() => setIsHelpOpen(true)} />
                <main className="flex-1 flex flex-col lg:flex-row gap-4 px-4 pb-4 overflow-y-auto lg:overflow-hidden">
                    {/* --- Left Sidebar --- */}
                    <aside className="w-full lg:w-[380px] flex-shrink-0 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl overflow-y-auto">
                        <ReferencePanel
                            onAddImages={handleAddImages}
                            onRemoveImage={handleRemoveImage}
                            referenceImages={referenceImages}
                            onAddStyleImage={handleAddStyleImage}
                            onRemoveStyleImage={handleRemoveStyleImage}
                            styleImage={styleReferenceImage}
                        />
                        <div className="border-t border-light-border dark:border-dark-border mx-4"></div>
                        <ControlPanel 
                            editedPrompt={editedPrompt}
                            onEditedPromptChange={setEditedPrompt}
                            dynamicTools={dynamicTools} 
                            selectedAspectRatio={aspectRatio} 
                            onAspectRatioChange={handleAspectRatioChange} 
                            onMagicPrompt={handleMagicPrompt}
                            onGenerateTools={handleGenerateDynamicTools}
                            isLoading={isLoading} 
                            isToolsLoading={isToolsLoading}
                            isEnhancing={isEnhancing}
                            referenceImages={referenceImages} 
                            styleReferenceImage={styleReferenceImage}
                            numImages={numImagesToGenerate} 
                            onNumImagesChange={setNumImagesToGenerate} 
                            userApiKey={userApiKey} 
                            language={language}
                            negativePrompt={negativePrompt}
                            onNegativePromptChange={setNegativePrompt}
                            seed={seed}
                            onSeedChange={setSeed}
                            onRandomizeSeed={handleRandomizeSeed}
                            onCopySeed={() => handleCopyToClipboard(seed)}
                            promptTextareaRef={promptTextareaRef}
                        />
                    </aside>
                    
                    {/* --- Main Content --- */}
                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                        <div className="flex-1 min-h-0">
                            <ImageDisplay images={currentImages} isLoading={isLoading} onDownload={handleDownload} onZoom={setZoomedImage} onEdit={setEditingImage}/>
                        </div>

                        <div className="flex-shrink-0 space-y-4 overflow-y-auto">
                           {(referenceImages.length > 0 || !!styleReferenceImage) && (
                                <CreativePromptsPanel 
                                    prompts={prompts} 
                                    onSelectPrompt={setEditedPrompt} 
                                    onGenerate={handleGenerateCreativePrompts}
                                    selectedPrompt={editedPrompt}
                                    isLoading={isPromptsLoading}
                                    hasImages={(referenceImages.length > 0 || !!styleReferenceImage)}
                                />
                            )}

                            {currentImages.length === 1 && (
                                <div className="w-full p-4 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-2xl border border-light-border dark:border-dark-border/50 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xs font-semibold mb-1 text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">{t.generationPromptTitle}</h4>
                                            <p className="text-sm mr-4">{currentImages[0].prompt}</p>
                                        </div>
                                        <button onClick={() => handleCopyToClipboard(currentImages[0].prompt)} className="flex-shrink-0 flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border hover:border-dark-text-muted transition-colors">
                                            <CopyIcon className="w-3 h-3" />
                                            <span>{t.copy}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Right Column (Buttons + History) --- */}
                    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
                        <div className="space-y-4 p-4 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl">
                             <button onClick={handleGenerate} disabled={isActionDisabled} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(138,120,244,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                                <span>{isLoading ? t.generatingButton : t.generateButton}</span>
                            </button>
                             <div className="flex flex-col gap-3">
                                <button onClick={handleLetMeDoForYou} disabled={isActionDisabled || prompts.length === 0} className="w-full p-[2px] bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl disabled:opacity-50 group transition-all">
                                    <div className="w-full h-full bg-light-surface dark:bg-dark-surface-accent rounded-[10px] flex justify-center items-center gap-2 text-light-text dark:text-dark-text font-semibold py-2 transition-all group-hover:bg-opacity-80 disabled:group-hover:bg-opacity-100 dark:group-hover:bg-opacity-80">
                                      <WandIcon className="w-4 h-4 text-brand-purple" />
                                      <span className="text-sm">{t.letMeDoForYou}</span>
                                    </div>
                                </button>
                                <button onClick={handleUseAsReference} disabled={isActionDisabled || currentImages.length === 0 || referenceImages.length >= MAX_USER_IMAGES} className="w-full p-[2px] bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl disabled:opacity-50 group transition-all">
                                   <div className="w-full h-full bg-light-surface dark:bg-dark-surface-accent rounded-[10px] flex justify-center items-center gap-2 text-light-text dark:text-dark-text font-semibold py-2 transition-all group-hover:bg-opacity-80 disabled:group-hover:bg-opacity-100 dark:group-hover:bg-opacity-80">
                                        <CornerUpLeftIcon className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm">{t.useAsReference}</span>
                                    </div>
                                </button>
                                <button onClick={handleResetInterface} title={t.resetInterface} disabled={isActionDisabled} className="w-full p-[2px] bg-gradient-to-r from-brand-pink to-fuchsia-500 rounded-xl disabled:opacity-50 group transition-all">
                                    <div className="w-full h-full bg-light-surface dark:bg-dark-surface-accent rounded-[10px] flex justify-center items-center gap-2 text-light-text dark:text-dark-text font-semibold py-2 transition-all group-hover:bg-opacity-80 disabled:group-hover:bg-opacity-100 dark:group-hover:bg-opacity-80">
                                        <ReloadIcon className="w-4 h-4 text-brand-pink" />
                                        <span className="text-sm">{t.resetInterface}</span>
                                    </div>
                                </button>
                             </div>
                        </div>

                        <aside className="flex-1 min-h-0">
                            <HistoryPanel 
                                history={history} 
                                onSelect={handleSelectHistory} 
                                onZoom={setZoomedImage} 
                                onDelete={handleDeleteHistoryItem} 
                                onClearAll={handleClearAllHistory}
                                isSelectionMode={isHistorySelectionMode}
                                selectedIds={selectedHistoryIds}
                                onEnterSelectionMode={handleEnterHistorySelectionMode}
                                onCancelSelectionMode={handleCancelHistorySelectionMode}
                                onToggleSelection={handleToggleHistorySelection}
                                onDeleteSelected={handleDeleteSelectedHistoryItems}
                            />
                        </aside>
                    </div>
                </main>

                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveApiKey} currentApiKey={userApiKey} />
                <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
                <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
                
                {editingImage && <InpaintEditor image={editingImage} onClose={() => setEditingImage(null)} onSave={handleInpaint} />}

                {toast && (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {zoomedImage && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImage(null)} role="dialog" aria-modal="true" aria-label="Zoomed image view">
                        <div className="relative" onClick={e => e.stopPropagation()}>
                            <img src={zoomedImage.imageDataUrl || zoomedImage.thumbnailDataUrl} alt={zoomedImage.prompt} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                            <div className="absolute -top-12 right-0 flex gap-2">
                                <button onClick={() => handleDownload(zoomedImage)} className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors" aria-label="Download image"><DownloadIcon className="w-6 h-6" /></button>
                                <button onClick={() => setZoomedImage(null)} className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors" aria-label="Close zoom view"><XIcon className="w-6 h-6" /></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LanguageContext.Provider>
    );
}
