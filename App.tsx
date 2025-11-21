import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import { GeneratedImage, DynamicTool, PromptPreset, ModelType, ResolutionType, TextInImageConfig } from './types';
import * as geminiService from './services/geminiService';
import * as upscaleService from './services/upscaleService';
import * as presetsService from './services/presetsService';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { SunIcon, MoonIcon, UploadIcon, DownloadIcon, ZoomInIcon, SparklesIcon, CopyIcon, SettingsIcon, XIcon, CheckIcon, LanguageIcon, WandIcon, InfoIcon, AlertTriangleIcon, BrushIcon, DiceIcon, TrashIcon, ReloadIcon, EnvelopeIcon, StarIcon, CornerUpLeftIcon, UpscaleIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from './components/icons';
import FloatingActionBar from './components/FloatingActionBar';
import ZoomableImage from './components/ZoomableImage';
import PromptLibrary from './components/PromptLibrary';

// --- Localization ---
const translations = {
  en: {
    headerTitle: 'Generentolo PRO v1.0',
    headerSubtitle: 'Let me do it for you!',
    refImagesTitle: 'Reference & Style Images',
    styleRefTitle: 'Style Reference',
    structureRefTitle: 'Structure Guide',
    addStyleImage: 'Add / Drop Style Image',
    addStructureImage: 'Add / Drop Structure Image',
    addImage: 'Add / Drop Images',
    optional: 'Optional',
    preciseReference: 'Precise Reference',
    preciseReferenceTooltip: 'Preserves EXACTLY facial features, skin texture, eye color, and hairstyle from reference images without any modification. Maximum fidelity to original faces.',
    structureTooltip: 'Upload an image whose composition and structure will be preserved in the generation (like ControlNet depth map)',
    creativePromptsTitle: 'Creative Prompts',
    generateSuggestions: 'Generate Suggestions',
    suggestionsPlaceholder: "Click 'Generate Suggestions' to get creative ideas.",
    promptsLoading: 'Upload an image to generate prompts.',
    promptPlaceholder: 'Write your prompt or generate one from images...',
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
    aspectRatioTooltip: "Sets the width-to-height ratio of the final image. 'Auto' uses the aspect ratio of the reference image.",
    modelTitle: 'Model',
    modelFlash: 'Flash (Fast & Cheap)',
    modelPro: 'PRO (High Quality)',
    modelTooltip: "Flash: Fast and economical ($0.04/image). PRO: High quality with 4K support ($0.13-$0.24/image).",
    resolutionTitle: 'Resolution',
    resolution1k: '1K (Standard)',
    resolution2k: '2K (High)',
    resolution4k: '4K (Ultra)',
    resolutionTooltip: "PRO model only. Higher resolution = better quality but slower and more expensive.",
    estimatedCost: 'Estimated Cost',
    textInImageTitle: 'Text in Image',
    textInImageEnable: 'Add Text',
    textInImagePlaceholder: 'Enter text to display...',
    textPosition: 'Position',
    textPositionTop: 'Top',
    textPositionCenter: 'Center',
    textPositionBottom: 'Bottom',
    textPositionOverlay: 'Overlay',
    fontStyle: 'Font Style',
    fontBold: 'Bold',
    fontItalic: 'Italic',
    fontCalligraphy: 'Calligraphy',
    fontModern: 'Modern',
    fontVintage: 'Vintage',
    generateButton: 'Generate',
    generatingButton: 'Generating...',
    generatingStatus: 'Generentolo is generating...',
    generatingSubtext: 'This can take a moment.',
    imageDisplayPlaceholderTitle: 'Your creations will appear here.',
    imageDisplayPlaceholderSubtext: 'Upload an image and generate to begin.',
    historyTitle: 'History',
    historyEmpty: 'No generations yet.',
    historyCapped: 'History is limited to the last 12 creations.',
    clearHistory: 'Clear all history',
    confirmClearHistory: 'Are you sure you want to clear the entire history? This action cannot be undone.',
    allHistory: 'All',
    favoritesOnly: 'Favorites',
    noFavorites: 'No favorites yet. Click the star icon on images to bookmark them.',
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
    upscaleAction: 'Upscale',
    upscaling: 'Upscaling...',
    upscaleSuccess: 'Image upscaled successfully!',
    upscaleFailed: 'Upscaling failed. Please try again.',
    upscale2x: 'Upscale 2x',
    upscale4x: 'Upscale 4x',
    upscaleQuota: 'Upscales remaining',
    upscaleQuotaExceeded: 'Monthly quota exceeded',
    compareImages: 'Compare Before/After',
    // Prompt Library
    promptLibraryTitle: 'Prompt Library',
    promptLibrarySearch: 'Search prompts by title, description, or tags...',
    promptLibraryTemplates: 'templates',
    promptLibraryTemplate: 'template',
    promptLibraryAvailable: 'available',
    promptLibraryNoResults: 'No prompts found',
    promptLibraryNoResultsDesc: 'Try adjusting your search or selecting a different category',
    promptLibraryCopy: 'Copy',
    promptLibraryCopied: 'Copied!',
    promptLibraryUse: 'Use Prompt',
    promptLibraryCategoryAll: 'All',
    promptLibraryCategoryPro: 'PRO Features',
    promptLibraryCategoryCombine: 'Combine & Merge',
    promptLibraryCategoryStyle: 'Style & Transform',
    promptLibraryCategoryPeople: 'People & Characters',
    promptLibraryCategoryEnvironment: 'Environment & Scene',
    promptLibraryCategoryEdit: 'Edit & Modify',
    promptLibraryCategoryCreative: 'Creative & Fun',
    promptLibraryDifficultyEasy: 'easy',
    promptLibraryDifficultyMedium: 'medium',
    promptLibraryDifficultyAdvanced: 'advanced',
    // Cost Calculator
    costEstimate: 'Cost Estimate',
    costOutput: 'Output',
    costInputImages: 'Input Images',
    costPrompt: 'Prompt',
    costTotal: 'Total',
    costDisclaimer: '* Estimate based on official Google pricing',
  },
  it: {
    headerTitle: 'Generentolo PRO v1.0',
    headerSubtitle: 'Let me do it for you!',
    refImagesTitle: 'Immagini di Riferimento e Stile',
    styleRefTitle: 'Riferimento Stile',
    structureRefTitle: 'Guida Struttura',
    addStyleImage: 'Aggiungi / Trascina Stile',
    addStructureImage: 'Aggiungi / Trascina Struttura',
    addImage: 'Aggiungi / Trascina Immagini',
    optional: 'Facoltativo',
    preciseReference: 'Riferimento Preciso',
    preciseReferenceTooltip: 'Preserva ESATTAMENTE i tratti del viso, texture della pelle, colore degli occhi e acconciatura dalle immagini di riferimento senza alcuna modifica. Massima fedeltà ai volti originali.',
    structureTooltip: 'Carica un\'immagine la cui composizione e struttura verranno preservate nella generazione (come depth map ControlNet)',
    creativePromptsTitle: 'Prompt Creativi',
    generateSuggestions: 'Genera Suggerimenti',
    suggestionsPlaceholder: "Clicca 'Genera Suggerimenti' per ottenere idee creative.",
    promptsLoading: 'Carica un\'immagine per generare i prompt.',
    promptPlaceholder: 'Scrivi il tuo prompt o creane uno dalle immagini...',
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
    aspectRatioTooltip: "Imposta il rapporto larghezza-altezza dell'immagine finale. 'Auto' usa le proporzioni dell'immagine di riferimento.",
    modelTitle: 'Modello',
    modelFlash: 'Flash (Veloce & Economico)',
    modelPro: 'PRO (Alta Qualità)',
    modelTooltip: "Flash: Veloce ed economico ($0.04/immagine). PRO: Alta qualità con supporto 4K ($0.13-$0.24/immagine).",
    resolutionTitle: 'Risoluzione',
    resolution1k: '1K (Standard)',
    resolution2k: '2K (Alta)',
    resolution4k: '4K (Ultra)',
    resolutionTooltip: "Solo modello PRO. Risoluzione maggiore = qualità migliore ma più lento e costoso.",
    estimatedCost: 'Costo Stimato',
    textInImageTitle: 'Testo nell\'Immagine',
    textInImageEnable: 'Aggiungi Testo',
    textInImagePlaceholder: 'Inserisci il testo da mostrare...',
    textPosition: 'Posizione',
    textPositionTop: 'Alto',
    textPositionCenter: 'Centro',
    textPositionBottom: 'Basso',
    textPositionOverlay: 'Sovrapposto',
    fontStyle: 'Stile Font',
    fontBold: 'Grassetto',
    fontItalic: 'Corsivo',
    fontCalligraphy: 'Calligrafia',
    fontModern: 'Moderno',
    fontVintage: 'Vintage',
    generateButton: 'Genera',
    generatingButton: 'In generazione...',
    generatingStatus: 'Generentolo sta generando...',
    generatingSubtext: 'Potrebbe volerci un momento.',
    imageDisplayPlaceholderTitle: 'Le tue creazioni appariranno qui.',
    imageDisplayPlaceholderSubtext: 'Carica un\'immagine e genera per iniziare.',
    historyTitle: 'Cronologia',
    historyEmpty: 'Nessuna generazione ancora.',
  	historyCapped: 'La cronologia è limitata alle ultime 12 creazioni.',
    clearHistory: 'Svuota cronologia',
    confirmClearHistory: 'Sei sicuro di voler svuotare l\'intera cronologia? L\'azione è irreversibile.',
    allHistory: 'Tutte',
    favoritesOnly: 'Preferiti',
    noFavorites: 'Nessun preferito. Clicca sulla stella per segnare le immagini.',
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
    upscaleAction: 'Aumenta Qualità',
    upscaling: 'Aumento qualità...',
    upscaleSuccess: 'Immagine potenziata con successo!',
    upscaleFailed: 'Aumento qualità fallito. Riprova.',
    upscale2x: 'Potenzia 2x',
    upscale4x: 'Potenzia 4x',
    upscaleQuota: 'Upscale rimanenti',
    upscaleQuotaExceeded: 'Quota mensile esaurita',
    compareImages: 'Confronta Prima/Dopo',
    // Prompt Library
    promptLibraryTitle: 'Libreria Prompt',
    promptLibrarySearch: 'Cerca prompt per titolo, descrizione o tag...',
    promptLibraryTemplates: 'template',
    promptLibraryTemplate: 'template',
    promptLibraryAvailable: 'disponibili',
    promptLibraryNoResults: 'Nessun prompt trovato',
    promptLibraryNoResultsDesc: 'Prova a modificare la ricerca o seleziona una categoria diversa',
    promptLibraryCopy: 'Copia',
    promptLibraryCopied: 'Copiato!',
    promptLibraryUse: 'Usa Prompt',
    promptLibraryCategoryAll: 'Tutti',
    promptLibraryCategoryPro: 'Funzioni PRO',
    promptLibraryCategoryCombine: 'Combina e Unisci',
    promptLibraryCategoryStyle: 'Stile e Trasforma',
    promptLibraryCategoryPeople: 'Persone e Personaggi',
    promptLibraryCategoryEnvironment: 'Ambiente e Scena',
    promptLibraryCategoryEdit: 'Modifica e Ritocca',
    promptLibraryCategoryCreative: 'Creativo e Divertente',
    promptLibraryDifficultyEasy: 'facile',
    promptLibraryDifficultyMedium: 'medio',
    promptLibraryDifficultyAdvanced: 'avanzato',
    // Cost Calculator
    costEstimate: 'Stima Costo',
    costOutput: 'Output',
    costInputImages: 'Immagini Input',
    costPrompt: 'Prompt',
    costTotal: 'Totale',
    costDisclaimer: '* Stima basata sui prezzi ufficiali Google',
  }
};

type Language = keyof typeof translations;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
}

export const LanguageContext = createContext<LocalizationContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const useLocalization = () => useContext(LanguageContext);


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
const MAX_USER_IMAGES = 14; // v1.0: Increased for Nano Banana PRO support (up to 14 reference images)

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
    onOpenPromptLibrary: () => void;
}
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onOpenSettings, onOpenFeedback, onOpenShortcuts, onOpenHelp, onOpenPromptLibrary }) => {
    const { t, language, setLanguage } = useLocalization();
    const toggleLanguage = () => setLanguage(language === 'en' ? 'it' : 'en');
    return (
        <header className="flex justify-between items-center p-4">
            <div>
                 <h1 className="text-xl font-bold flex items-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-yellow to-brand-magenta">
                        {t.headerTitle}
                    </span>
                </h1>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    {t.headerSubtitle} Powered by <span className="font-bold text-yellow-400">JOZ</span> for <span className="font-bold text-brand-magenta">Dugongo</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onOpenPromptLibrary}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white text-sm font-semibold hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,217,61,0.5)] flex items-center gap-2"
                    title="Prompt Library"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Prompts</span>
                </button>
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

// Memoized ImagePreview component to prevent flickering
const ImagePreview = React.memo<{ file: File; index: number; isGuide?: boolean; onRemove?: (index: number) => void }>(
    ({ file, index, isGuide, onRemove }) => {
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
    }
);

// Memoized StyleImagePreview component to prevent flickering
const StyleImagePreview = React.memo<{ file: File; onRemove: () => void }>(
    ({ file, onRemove }) => {
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
    }
);

const ReferencePanel: React.FC<{
    onAddImages: (files: File[]) => void;
    onRemoveImage: (index: number) => void;
    referenceImages: File[];
    onAddStyleImage: (file: File) => void;
    onRemoveStyleImage: () => void;
    styleImage: File | null;
    onAddStructureImage: (file: File) => void;
    onRemoveStructureImage: () => void;
    structureImage: File | null;
}> = ({ onAddImages, onRemoveImage, referenceImages, onAddStyleImage, onRemoveStyleImage, styleImage, onAddStructureImage, onRemoveStructureImage, structureImage }) => {
    const { t } = useLocalization();
    const [isDraggingRef, setIsDraggingRef] = useState(false);
    const [isDraggingStyle, setIsDraggingStyle] = useState(false);
    const [isDraggingStructure, setIsDraggingStructure] = useState(false);
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

    const handleStructureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) onAddStructureImage(e.target.files[0]);
        e.target.value = '';
    };

    const handleStructureDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStructure(true); };
    const handleStructureDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStructure(false); };
    const handleStructureDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDraggingStructure(false);
        const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
        if (files.length > 0) onAddStructureImage(files[0]);
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-light-text dark:text-dark-text">{t.refImagesTitle}</h3>
            <div 
                onDragEnter={handleRefDragEnter} onDragLeave={handleRefDragLeave} onDragOver={handleDragOver} onDrop={handleRefDrop}
                className={`rounded-xl transition-all relative ${isDraggingRef ? 'border-2 border-dashed border-brand-yellow bg-brand-purple/10 p-1' : 'border-2 border-transparent'}`}
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
                <div className="relative group shadow-[0_0_8px_2px_rgba(255,217,61,0.5)] rounded-xl">
                     <div className="absolute top-2 left-2 px-2 py-1 bg-brand-yellow/90 text-black text-xs rounded-full font-semibold backdrop-blur-sm z-10">STYLE</div>
                    {styleImage ? (
                        <StyleImagePreview file={styleImage} onRemove={onRemoveStyleImage} />
                    ) : (
                        <label htmlFor="style-file-upload" className="cursor-pointer w-full bg-light-surface dark:bg-dark-surface/50 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl flex flex-col justify-center items-center text-light-text-muted dark:text-dark-text-muted hover:border-brand-yellow transition-colors p-6 text-center">
                            <UploadIcon className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">{t.addStyleImage}</span>
                            <span className="text-xs mt-1">{t.styleRefTitle} ({t.optional})</span>
                        </label>
                    )}
                    <input id="style-file-upload" type="file" className="hidden" accept="image/*" onChange={handleStyleFileChange} />
                </div>
            </div>

            <div className="border-t border-light-border dark:border-dark-border/50"></div>

            <div
                onDragEnter={handleStructureDragEnter} onDragLeave={handleStructureDragLeave} onDragOver={handleDragOver} onDrop={handleStructureDrop}
                className={`rounded-xl transition-all relative ${isDraggingStructure ? 'border-2 border-dashed border-brand-blue bg-brand-blue/10 p-1' : 'border-2 border-transparent'}`}
            >
                <div className="relative group shadow-[0_0_8px_2px_rgba(255,0,110,0.5)] rounded-xl">
                     <div className="absolute top-2 left-2 px-2 py-1 bg-brand-magenta/90 text-white text-xs rounded-full font-semibold backdrop-blur-sm z-10">
                        STRUCTURE
                     </div>
                    {structureImage ? (
                        <StyleImagePreview file={structureImage} onRemove={onRemoveStructureImage} />
                    ) : (
                        <label htmlFor="structure-file-upload" className="cursor-pointer w-full bg-light-surface dark:bg-dark-surface/50 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl flex flex-col justify-center items-center text-light-text-muted dark:text-dark-text-muted hover:border-brand-magenta transition-colors p-6 text-center">
                            <UploadIcon className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">{t.addStructureImage}</span>
                            <span className="text-xs mt-1">{t.structureRefTitle} ({t.optional})</span>
                        </label>
                    )}
                    <input id="structure-file-upload" type="file" className="hidden" accept="image/*" onChange={handleStructureFileChange} />
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
                                <label key={option} className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-brand-yellow ring-2 ring-brand-purple' : 'border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>
                                    <input type="checkbox" checked={isSelected} onChange={() => handleToggle(option)} className="absolute opacity-0 w-0 h-0" />
                                    {isSelected && <div className="absolute top-1 right-1 text-brand-yellow"><CheckIcon className="w-4 h-4" /></div>}
                                    <span className="text-sm select-none text-light-text dark:text-dark-text">{option}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t border-light-border dark:border-dark-border">
                    <button onClick={handleClear} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-semibold hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">{t.clearSelection}</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white text-sm font-semibold hover:opacity-90 transition-opacity">{t.save} ({selected.size})</button>
                </div>
            </div>
        </div>
    );
};

interface ControlPanelProps {
    dynamicTools: DynamicTool[];
    selectedAspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
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
    // v1.0: PRO features
    selectedModel: ModelType;
    onModelChange: (model: ModelType) => void;
    selectedResolution: ResolutionType;
    onResolutionChange: (resolution: ResolutionType) => void;
    textInImageConfig: TextInImageConfig;
    onTextInImageConfigChange: (config: TextInImageConfig) => void;
}
// Memoized Prompt Textarea to prevent flickering
const PromptTextarea = React.memo<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled: boolean;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}>(({ value, onChange, placeholder, disabled, textareaRef }) => {
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange(text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const handleClear = () => {
        onChange('');
        textareaRef.current?.focus();
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="w-full p-3 pr-20 bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-purple focus:outline-none text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted"
                placeholder={placeholder}
                disabled={disabled}
            />
            <div className="absolute top-2 right-2 flex gap-1">
                <button
                    onClick={handlePaste}
                    disabled={disabled}
                    className="p-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Paste from clipboard"
                    title="Paste"
                >
                    <CopyIcon className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted" />
                </button>
                {value && (
                    <button
                        onClick={handleClear}
                        disabled={disabled}
                        className="p-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Clear prompt"
                        title="Clear"
                    >
                        <XIcon className="w-4 h-4 text-red-500" />
                    </button>
                )}
            </div>
        </div>
    );
});

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const {
        dynamicTools, selectedAspectRatio, onAspectRatioChange, onGenerateTools,
        isLoading, isToolsLoading, isEnhancing, referenceImages, styleReferenceImage, numImages, onNumImagesChange,
        userApiKey, language, editedPrompt, onEditedPromptChange, negativePrompt, onNegativePromptChange, seed, onSeedChange, onRandomizeSeed, onCopySeed, promptTextareaRef,
        // v1.0: PRO features
        selectedModel, onModelChange, selectedResolution, onResolutionChange, textInImageConfig, onTextInImageConfigChange
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

    const aspectRatios = ["Auto", "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "4:5", "5:4", "21:9"];
    const isActionDisabled = isLoading || isRewriting || isEnhancing || isGeneratingNegativePrompt;
    const hasImages = referenceImages.length > 0 || styleReferenceImage;
    const isPromptEmpty = editedPrompt.trim() === '';

    return (
        <div className="p-4 space-y-6">
            <div className="relative">
                <div className={`absolute inset-0 bg-light-surface/50 dark:bg-dark-bg/50 z-10 flex items-center justify-center transition-opacity rounded-xl ${(isRewriting || isEnhancing) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
                </div>
                <PromptTextarea
                    value={editedPrompt}
                    onChange={onEditedPromptChange}
                    placeholder={t.promptPlaceholder}
                    disabled={isRewriting || isEnhancing}
                    textareaRef={promptTextareaRef}
                />
            </div>
            
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
                                    <button onClick={() => setEditingTool(tool)} className="w-full text-left p-2 bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-lg hover:border-brand-yellow transition-colors">
                                        <div className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">{tool.label}</div>
                                        <div className={`text-xs ${selectionCount > 0 ? 'text-brand-yellow' : 'text-light-text-muted dark:text-dark-text-muted'}`}>{selectionCount > 0 ? `${selectionCount} selected` : t.chooseOptions}</div>
                                    </button>
                                </div>
                            )
                        }) : (
                            <div className="col-span-2">
                                {hasImages ? (
                                    <button onClick={onGenerateTools} disabled={isActionDisabled} className="w-full text-center py-2 px-4 rounded-lg bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-brand-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm">
                                        {t.generateTools}
                                    </button>
                                ) : (
                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted col-span-2">{t.toolsLoading}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* v1.0: Text-in-Image Controls */}
                    {selectedModel === 'gemini-3-pro-image-preview' && (
                        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">{t.textInImageTitle}</h4>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={textInImageConfig.enabled}
                                        onChange={(e) => onTextInImageConfigChange({ ...textInImageConfig, enabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-brand-yellow peer-checked:to-brand-magenta after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                </label>
                            </div>

                            {textInImageConfig.enabled && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={textInImageConfig.text || ''}
                                        onChange={(e) => onTextInImageConfigChange({ ...textInImageConfig, text: e.target.value })}
                                        placeholder={t.textInImagePlaceholder}
                                        className="w-full p-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-light-text-muted dark:text-dark-text-muted mb-1 block">{t.textPosition}</label>
                                            <select
                                                value={textInImageConfig.position || 'center'}
                                                onChange={(e) => onTextInImageConfigChange({ ...textInImageConfig, position: e.target.value as any })}
                                                className="w-full p-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            >
                                                <option value="top">{t.textPositionTop}</option>
                                                <option value="center">{t.textPositionCenter}</option>
                                                <option value="bottom">{t.textPositionBottom}</option>
                                                <option value="overlay">{t.textPositionOverlay}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-light-text-muted dark:text-dark-text-muted mb-1 block">{t.fontStyle}</label>
                                            <select
                                                value={textInImageConfig.fontStyle || 'modern'}
                                                onChange={(e) => onTextInImageConfigChange({ ...textInImageConfig, fontStyle: e.target.value as any })}
                                                className="w-full p-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            >
                                                <option value="bold">{t.fontBold}</option>
                                                <option value="italic">{t.fontItalic}</option>
                                                <option value="calligraphy">{t.fontCalligraphy}</option>
                                                <option value="modern">{t.fontModern}</option>
                                                <option value="vintage">{t.fontVintage}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
                                className={`p-3 rounded-lg font-semibold text-center transition-colors ${numImages === num ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white' : 'bg-light-surface-accent dark:bg-dark-surface-accent hover:bg-light-surface-accent/70 dark:hover:bg-dark-surface-accent/70'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative">
                     <label htmlFor="negative-prompt" className="flex items-center gap-2 text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                        <span>{t.negativePromptLabel}</span>
                        {isGeneratingNegativePrompt && <div className="w-3 h-3 border-2 border-brand-yellow/50 border-t-transparent rounded-full animate-spin"></div>}
                    </label>
                    <textarea id="negative-prompt" value={negativePrompt} onChange={e => onNegativePromptChange(e.target.value)} rows={2} className="w-full p-2 pr-10 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder={t.negativePromptPlaceholder} />
                    <button onClick={handleGenerateNegativePrompt} disabled={isActionDisabled || !editedPrompt} title={t.generateNegativePrompt} className="absolute bottom-2 right-2 p-1.5 rounded-full text-brand-yellow hover:bg-brand-purple/20 transition-colors disabled:text-gray-400 disabled:hover:bg-transparent">
                        <WandIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div>
                    <label htmlFor="seed" className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-1 block">
                        {t.seedLabel}
                    </label>
                    <div className="flex gap-2">
                        <input id="seed" type="text" value={seed} onChange={e => onSeedChange(e.target.value.replace(/\D/g, ''))} placeholder={t.seedPlaceholder} className="w-full p-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                        <button onClick={onCopySeed} title={t.copySeed} className="p-2 rounded-lg bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border hover:border-dark-text-muted transition-colors"><CopyIcon className="w-5 h-5"/></button>
                        <button onClick={onRandomizeSeed} title={t.randomize} className="p-2 rounded-lg bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border hover:border-dark-text-muted transition-colors"><DiceIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>

            <div>
                 <h3 className="font-semibold mb-3 text-light-text dark:text-dark-text">
                    {t.aspectRatioTitle}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map(ratio => (
                        <button key={ratio} onClick={() => onAspectRatioChange(ratio)} className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${selectedAspectRatio === ratio ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>{ratio}</button>
                    ))}
                </div>
            </div>

            {/* v1.0: Model Selector */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-xs sm:text-sm text-light-text dark:text-dark-text">{t.modelTitle}</h3>
                    <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-light-text-muted dark:text-dark-text-muted cursor-help" title={t.modelTooltip} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onModelChange('gemini-2.5-flash-image')} className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedModel === 'gemini-2.5-flash-image' ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white shadow-lg' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5">
                            <SparklesIcon className="w-4 h-4" />
                            <span className="text-[10px] sm:text-xs leading-tight">{t.modelFlash}</span>
                        </div>
                    </button>
                    <button onClick={() => onModelChange('gemini-3-pro-image-preview')} className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedModel === 'gemini-3-pro-image-preview' ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white shadow-lg' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5">
                            <StarIcon className="w-4 h-4" />
                            <span className="text-[10px] sm:text-xs leading-tight">{t.modelPro}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* v1.0: Resolution Selector (only for PRO model) */}
            {selectedModel === 'gemini-3-pro-image-preview' && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-xs sm:text-sm text-light-text dark:text-dark-text">{t.resolutionTitle}</h3>
                        <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-light-text-muted dark:text-dark-text-muted cursor-help" title={t.resolutionTooltip} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onResolutionChange('1k')} className={`w-full py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedResolution === '1k' ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>{t.resolution1k}</button>
                        <button onClick={() => onResolutionChange('2k')} className={`w-full py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedResolution === '2k' ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>{t.resolution2k}</button>
                        <button onClick={() => onResolutionChange('4k')} className={`w-full py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedResolution === '4k' ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white' : 'bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-dark-text-muted'}`}>{t.resolution4k}</button>
                    </div>
                </div>
            )}

            {/* v1.0: Estimated Cost Display */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium text-light-text dark:text-dark-text whitespace-nowrap">{t.estimatedCost}:</span>
                    <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500">
                        ${geminiService.calculateEstimatedCost(selectedModel, selectedResolution, referenceImages.length + (styleReferenceImage ? 1 : 0)).toFixed(3)}
                    </span>
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
    onUpscale: (image: GeneratedImage, scale: 2 | 4) => void;
    upscalingImageId: string | null;
    onReroll: (image: GeneratedImage) => void; // v0.8
    onToggleFavorite: (imageId: string) => void; // v0.8
}
const ImageDisplay: React.FC<ImageDisplayProps> = ({ images, isLoading, onDownload, onZoom, onEdit, onUpscale, upscalingImageId, onReroll, onToggleFavorite }) => {
    const { t } = useLocalization();
    const [showUpscaleMenu, setShowUpscaleMenu] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-light-surface/50 dark:bg-dark-surface/30 rounded-2xl p-4">
            {isLoading && (
                <div className="flex flex-col items-center text-light-text-muted dark:text-dark-text-muted">
                    <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-semibold">{t.generatingStatus}</p>
                    <p className="text-sm">{t.generatingSubtext}</p>
                </div>
            )}
            {!isLoading && images.length > 0 && (
                 <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`w-full flex-1 min-h-0 grid ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 p-4`}>
                        {images.map(image => {
                            const isUpscaling = upscalingImageId === image.id;
                            return (
                            <div key={image.id} className="relative group flex items-center justify-center min-h-0">
                                <img src={image.imageDataUrl || image.thumbnailDataUrl} alt={image.prompt} className="max-w-full max-h-full object-contain rounded-md cursor-zoom-in" onClick={() => onZoom(image)} />

                                {/* Upscaling overlay */}
                                {isUpscaling && (
                                    <div className="absolute inset-0 bg-black/60 rounded-md flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <p className="text-white font-semibold">{t.upscaling}</p>
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs font-mono backdrop-blur-sm">{image.aspectRatio}</span>

                                    {/* v0.8: Favorite/Bookmark button */}
                                    <button
                                        onClick={() => onToggleFavorite(image.id)}
                                        className={`p-2 rounded-full ${image.isFavorite ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white'} hover:bg-yellow-400 hover:text-black transition-colors`}
                                        aria-label={image.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        title={image.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <StarIcon className="w-5 h-5" />
                                    </button>

                                    <button onClick={() => onEdit(image)} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label={t.editAction}><BrushIcon className="w-5 h-5" /></button>

                                    {/* Upscale button with dropdown */}
                                    {upscaleService.isUpscalingEnabled() && !isUpscaling && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowUpscaleMenu(showUpscaleMenu === image.id ? null : image.id)}
                                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                                aria-label={t.upscaleAction}
                                            >
                                                <UpscaleIcon className="w-5 h-5" />
                                            </button>

                                            {showUpscaleMenu === image.id && (() => {
                                                const quota = upscaleService.getRemainingQuota();
                                                return (
                                                <div className="absolute top-full right-0 mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg overflow-hidden z-10 min-w-[160px]">
                                                    {/* Quota display */}
                                                    <div className="px-4 py-2 bg-dark-surface-accent/50 border-b border-dark-border">
                                                        <p className="text-xs text-dark-text-muted">{t.upscaleQuota}</p>
                                                        <p className="text-sm font-semibold text-white">{quota.remaining} / {quota.total}</p>
                                                    </div>

                                                    {quota.remaining > 0 ? (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onUpscale(image, 2); setShowUpscaleMenu(null); }}
                                                                className="w-full px-4 py-2 text-left text-white hover:bg-dark-surface-accent transition-colors"
                                                            >
                                                                {t.upscale2x}
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onUpscale(image, 4); setShowUpscaleMenu(null); }}
                                                                className="w-full px-4 py-2 text-left text-white hover:bg-dark-surface-accent transition-colors"
                                                            >
                                                                {t.upscale4x}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="px-4 py-3 text-center">
                                                            <p className="text-sm text-red-400">{t.upscaleQuotaExceeded}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <button onClick={() => onDownload(image)} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Download image"><DownloadIcon className="w-5 h-5" /></button>

                                    {/* v0.8: Re-roll button */}
                                    <button
                                        onClick={() => onReroll(image)}
                                        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                        aria-label="Re-roll (generate variant)"
                                        title="🎲 Generate variant with new seed"
                                    >
                                        <DiceIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                 </div>
            )}
            {!isLoading && images.length === 0 && (
                 <div className="text-center text-light-text-muted dark:text-dark-text-muted">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue/20 to-brand-purple/20"></div>
                    </div>
                    <p className="font-semibold text-lg">{t.imageDisplayPlaceholderTitle}</p>
                    <p className="text-sm opacity-70">{t.imageDisplayPlaceholderSubtext}</p>
                </div>
            )}
        </div>
    );
};

interface ImageComparerProps {
    originalImage: string;
    upscaledImage: string;
    alt: string;
}
const ImageComparer: React.FC<ImageComparerProps> = ({ originalImage, upscaledImage, alt }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handleMouseDown = () => setIsDragging(true);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    }, [isDragging, handleMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (isDragging && e.touches[0]) {
            e.preventDefault();
            handleMove(e.touches[0].clientX);
        }
    }, [isDragging, handleMove]);

    const handleEnd = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleEnd);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleEnd);
            };
        }
    }, [isDragging, handleMouseMove, handleTouchMove]);

    return (
        <div ref={containerRef} className="relative select-none max-w-[90vw] max-h-[90vh] overflow-hidden rounded-lg shadow-2xl">
            {/* Upscaled image (background) */}
            <img src={upscaledImage} alt={`${alt} - After`} className="w-full h-full object-contain" draggable={false} />

            {/* Original image (clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img src={originalImage} alt={`${alt} - Before`} className="w-full h-full object-contain" draggable={false} />
            </div>

            {/* Slider line */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Slider handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="flex gap-1">
                        <div className="w-0.5 h-4 bg-gray-400"></div>
                        <div className="w-0.5 h-4 bg-gray-400"></div>
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm font-semibold rounded-full backdrop-blur-sm">
                Before
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-white text-sm font-semibold rounded-full backdrop-blur-sm">
                After
            </div>
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
    const [displayCount, setDisplayCount] = useState(30); // Show 30 images initially
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // v0.8.1: Favorites filter
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // v0.8.1: Filter history by favorites if enabled
    const filteredHistory = showFavoritesOnly ? history.filter((img: GeneratedImage) => img.isFavorite) : history;

    // Infinite scroll observer
    useEffect(() => {
        const container = scrollContainerRef.current;
        const loadMoreTrigger = loadMoreRef.current;

        if (!container || !loadMoreTrigger) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && displayCount < filteredHistory.length) {
                    // Load 20 more images
                    setDisplayCount(prev => Math.min(prev + 20, filteredHistory.length));
                }
            },
            { root: container, threshold: 0.1 }
        );

        observer.observe(loadMoreTrigger);
        return () => observer.disconnect();
    }, [displayCount, filteredHistory.length]);

    // Reset display count when history changes significantly or filter changes
    useEffect(() => {
        if (filteredHistory.length < displayCount) {
            setDisplayCount(Math.min(30, filteredHistory.length));
        }
    }, [history.length, showFavoritesOnly]);

    // Reset to initial page when toggling favorites filter
    useEffect(() => {
        setDisplayCount(30);
    }, [showFavoritesOnly]);

    const visibleHistory = filteredHistory.slice(0, displayCount);

    return (
        <div className="h-full flex flex-col bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-light-text dark:text-dark-text">{t.historyTitle} {history.length > 0 && <span className="text-sm text-light-text-muted dark:text-dark-text-muted">({history.length})</span>}</h2>
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

            {/* v0.8.1: Favorites filter toggle */}
            {history.length > 0 && (
                <div className="flex gap-1 mb-3 bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-xl p-1">
                    <button
                        onClick={() => setShowFavoritesOnly(false)}
                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                            !showFavoritesOnly
                                ? 'bg-white dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                                : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'
                        }`}
                    >
                        {t.allHistory}
                    </button>
                    <button
                        onClick={() => setShowFavoritesOnly(true)}
                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            showFavoritesOnly
                                ? 'bg-white dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                                : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'
                        }`}
                    >
                        <StarIcon className="w-4 h-4" filled={showFavoritesOnly} />
                        {t.favoritesOnly}
                    </button>
                </div>
            )}

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-2 -mr-2">
                {filteredHistory.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                        {visibleHistory.map(item => {
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
                        {/* Infinite scroll trigger */}
                        {displayCount < filteredHistory.length && (
                            <div ref={loadMoreRef} className="col-span-full py-4 text-center">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-center text-light-text-muted dark:text-dark-text-muted">{showFavoritesOnly ? t.noFavorites : t.historyEmpty}</p>
                )}
            </div>
            {displayCount < filteredHistory.length && (
                <p className="text-xs text-center text-light-text-muted dark:text-dark-text-muted mt-4 pt-2 border-t border-light-border/50 dark:border-dark-border/50">Showing {displayCount} of {filteredHistory.length} images</p>
            )}
        </div>
    );
}

interface PresetsPanelProps {
    presets: PromptPreset[];
    onLoadPreset: (preset: PromptPreset) => void;
    onDeletePreset: (id: string) => void;
    onSavePreset: (name: string, prompt: string, negativePrompt?: string) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    currentPrompt: string;
    currentNegativePrompt: string;
}
const PresetsPanel: React.FC<PresetsPanelProps> = ({
    presets, onLoadPreset, onDeletePreset, onSavePreset, onExport, onImport, currentPrompt, currentNegativePrompt
}) => {
    const { t } = useLocalization();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [presetName, setPresetName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (!presetName.trim()) return;
        onSavePreset(presetName.trim(), currentPrompt, currentNegativePrompt);
        setPresetName('');
        setShowSaveDialog(false);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="h-full flex flex-col bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-brand-yellow" filled />
                    Presets {presets.length > 0 && <span className="text-sm text-light-text-muted dark:text-dark-text-muted">({presets.length}/50)</span>}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        disabled={!currentPrompt.trim()}
                        className="text-sm font-medium text-brand-yellow hover:underline disabled:opacity-50 disabled:no-underline"
                        title="Save current prompt"
                    >
                        + Save
                    </button>
                    <button onClick={onExport} disabled={presets.length === 0} className="p-1.5 rounded-lg text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors disabled:opacity-50" title="Export presets">
                        <DownloadIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleImportClick} className="p-1.5 rounded-lg text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors" title="Import presets">
                        <UploadIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="mb-4 p-3 bg-light-surface dark:bg-dark-surface rounded-xl border border-brand-yellow">
                    <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Preset name..."
                        className="w-full mb-2 p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none text-sm"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={!presetName.trim()}
                            className="flex-1 py-1.5 px-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => { setShowSaveDialog(false); setPresetName(''); }}
                            className="flex-1 py-1.5 px-3 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {presets.length > 0 ? (
                    <div className="space-y-2">
                        {presets.map(preset => (
                            <div key={preset.id} className="group p-3 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:border-brand-yellow transition-all">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="font-medium text-sm text-light-text dark:text-dark-text flex-1">{preset.name}</h3>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onLoadPreset(preset)}
                                            className="p-1 rounded-lg bg-brand-purple/10 text-brand-yellow hover:bg-brand-purple/20 transition-colors"
                                            title="Load preset"
                                        >
                                            <CornerUpLeftIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDeletePreset(preset.id)}
                                            className="p-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title="Delete preset"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-light-text-muted dark:text-dark-text-muted line-clamp-2">{preset.prompt}</p>
                                {preset.negativePrompt && (
                                    <p className="text-xs text-red-500/70 dark:text-red-400/70 mt-1 line-clamp-1">
                                        Negative: {preset.negativePrompt}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <StarIcon className="w-12 h-12 text-light-text-muted dark:text-dark-text-muted mx-auto mb-3 opacity-30" />
                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">No saved presets yet</p>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">Click "+ Save" to save your current prompt</p>
                    </div>
                )}
            </div>
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
                        className="p-1.5 rounded-full text-brand-yellow hover:bg-brand-purple/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className={`text-left p-3 rounded-lg text-sm transition-all border ${isSelected ? 'bg-brand-purple/20 border-brand-yellow text-light-text dark:text-dark-text font-medium' : 'bg-light-surface/50 dark:bg-dark-surface/50 border-transparent hover:border-dark-border text-light-text-muted dark:text-dark-text-muted'}`}
                            >
                                {prompt}
                            </button>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-4">
                    {hasImages ? (
                        <button onClick={onGenerate} className="text-center py-2 px-4 rounded-lg bg-light-surface dark:bg-dark-surface/50 border border-light-border dark:border-dark-border hover:border-brand-yellow transition-colors font-semibold text-sm">
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
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white text-sm font-semibold hover:opacity-90 transition-opacity">{t.save}</button>
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
                        <InfoIcon className="w-6 h-6 text-brand-yellow" />
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
                    <button onClick={onClose} className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white font-semibold hover:opacity-90 transition-opacity">
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
        { keys: '?', description: 'Show this help' }, // v0.8
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
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white text-sm font-semibold hover:opacity-90 transition-opacity">
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
                    <button onClick={handleSend} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white text-sm font-semibold hover:opacity-90 transition-opacity">{t.sendFeedback}</button>
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
                    <button onClick={handleSave} disabled={!inpaintPrompt || isLoading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-magenta text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isLoading ? t.generatingButton : t.generateButton}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
const MAX_HISTORY_ITEMS = 200; // Increased from 12 to support infinite scroll

export default function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme());
    const [language, setLanguage] = useState<Language>(getInitialLanguage());
    const [referenceImages, setReferenceImages] = useState<File[]>([]);
    const [styleReferenceImage, setStyleReferenceImage] = useState<File | null>(null);
    const [structureImage, setStructureImage] = useState<File | null>(null);
    const [preciseReference, setPreciseReference] = useState<boolean>(false); // v0.7: Precise Reference Mode
    const [prompts, setPrompts] = useState<string[]>([]);
    const [isPromptsLoading, setIsPromptsLoading] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [seed, setSeed] = useState<string>('');
    const [dynamicTools, setDynamicTools] = useState<DynamicTool[]>([]);
    const [aspectRatio, setAspectRatio] = useState<string>('1:1');
    // v1.0: New PRO features states
    const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-2.5-flash-image');
    const [selectedResolution, setSelectedResolution] = useState<ResolutionType>('2k');
    const [textInImageConfig, setTextInImageConfig] = useState<TextInImageConfig>({
        enabled: false,
        text: '',
        position: 'center',
        fontStyle: 'modern'
    });
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
    const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
    const [userApiKey, setUserApiKey] = useState<string>('');
    const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
    const [isHistorySelectionMode, setIsHistorySelectionMode] = useState(false);
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
    const [upscalingImageId, setUpscalingImageId] = useState<string | null>(null);
    const [presets, setPresets] = useState<PromptPreset[]>([]);
    const [sidebarTab, setSidebarTab] = useState<'history' | 'presets'>('history');
    const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

    const t = useMemo(() => translations[language], [language]);

    // Load presets from localStorage on mount
    useEffect(() => {
        const loadedPresets = presetsService.loadPresets();
        setPresets(loadedPresets);
    }, []);
    
    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ id: Date.now(), message, type });
    }, []);

    const handleAspectRatioChange = useCallback((ratio: string) => {
        setAspectRatio(ratio);
    }, []);

    const handleCopySeedCallback = useCallback(() => {
        handleCopyToClipboard(seed);
    }, [seed]);

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

    const generateInitialPrompt = useCallback(async (refFiles: File[], styleFile: File | null, structFile: File | null) => {
        if (refFiles.length === 0 && !styleFile && !structFile) return;

        setIsEnhancing(true);
        try {
            const newPrompt = await geminiService.generateSinglePromptFromImage(refFiles, styleFile, structFile, userApiKey, language);
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
        const hasImages = referenceImages.length > 0 || styleReferenceImage || structureImage;
        if (!hasImages) return;

        setIsPromptsLoading(true);
        try {
            const newPrompts = await geminiService.generatePromptsFromImage(referenceImages, styleReferenceImage, structureImage, userApiKey, language);
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
    }, [referenceImages, styleReferenceImage, structureImage, userApiKey, language, showToast, editedPrompt]);

    const handleGenerateDynamicTools = useCallback(async () => {
        const hasImages = referenceImages.length > 0 || styleReferenceImage || structureImage;
        if (!hasImages) return;

        setIsToolsLoading(true);
        try {
            const newTools = await geminiService.generateDynamicToolsFromImage(referenceImages, styleReferenceImage, structureImage, userApiKey, language);
            setDynamicTools(newTools);
        } catch (error: any) {
            console.error("Failed to generate dynamic tools", error);
            showToast(error.message, 'error');
        } finally {
            setIsToolsLoading(false);
        }
    }, [referenceImages, styleReferenceImage, structureImage, userApiKey, language, showToast]);


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

            // v1.0: Calculate estimated cost
            const estimatedCost = geminiService.calculateEstimatedCost(
                selectedModel,
                selectedResolution,
                allReferenceFiles.length + (styleReferenceImage ? 1 : 0) + (structureImage ? 1 : 0)
            );
            console.log(`💰 Estimated cost: $${estimatedCost.toFixed(3)}`);

            const generationPromises = Array(numImagesToGenerate).fill(0).map(() =>
                geminiService.generateImage(
                    editedPrompt,
                    aspectRatio,
                    allReferenceFiles,
                    styleReferenceImage,
                    structureImage,
                    userApiKey,
                    negativePrompt,
                    seed,
                    language,
                    preciseReference,
                    selectedModel, // v1.0: Pass selected model
                    selectedResolution, // v1.0: Pass selected resolution
                    textInImageConfig // v1.0: Pass text-in-image config
                )
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
                        model: selectedModel, // v1.0: Store model used
                        resolution: selectedResolution, // v1.0: Store resolution used
                        estimatedCost // v1.0: Store estimated cost
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
    }, [referenceImages, styleReferenceImage, structureImage, preciseReference, userApiKey, aspectRatio, showToast, t.generationFailed, language, editedPrompt, negativePrompt, seed, numImagesToGenerate, selectedModel, selectedResolution, textInImageConfig]);

    // Image navigation in lightbox
    const getImageNavigation = useCallback(() => {
        if (!zoomedImage) return { prev: null, next: null, current: 0, total: 0 };

        // Check if image is in currentImages
        let images = currentImages;
        let index = images.findIndex(img => img.id === zoomedImage.id);

        // If not found, check history
        if (index === -1) {
            images = history;
            index = images.findIndex(img => img.id === zoomedImage.id);
        }

        // If still not found, return null
        if (index === -1) return { prev: null, next: null, current: 0, total: 0 };

        const prevIndex = index > 0 ? index - 1 : images.length - 1;
        const nextIndex = index < images.length - 1 ? index + 1 : 0;

        return {
            prev: images[prevIndex] || null,
            next: images[nextIndex] || null,
            current: index + 1,
            total: images.length
        };
    }, [zoomedImage, currentImages, history]);

    // Handle zoom with full resolution loading
    const handleZoom = useCallback(async (image: GeneratedImage) => {
        // If image already has full resolution, use it directly
        if (image.imageDataUrl) {
            setZoomedImage(image);
            return;
        }

        // Otherwise, load full resolution from IndexedDB
        try {
            const fullImageData = await indexedDBService.getImage(image.id);
            if (fullImageData && fullImageData.fullImageData) {
                // Create new image object with full resolution
                const fullResImage: GeneratedImage = {
                    ...image,
                    imageDataUrl: fullImageData.fullImageData
                };
                setZoomedImage(fullResImage);
            } else {
                // Fallback to thumbnail if full res not available
                setZoomedImage(image);
            }
        } catch (error) {
            console.error('Failed to load full resolution image:', error);
            // Fallback to thumbnail
            setZoomedImage(image);
        }
    }, []);

    const navigateImage = useCallback(async (direction: 'prev' | 'next') => {
        const nav = getImageNavigation();
        const targetImage = direction === 'prev' ? nav.prev : nav.next;
        if (targetImage) {
            await handleZoom(targetImage);
        }
    }, [getImageNavigation, handleZoom]);

    // Keyboard navigation
    useEffect(() => {
        if (!zoomedImage) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateImage('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateImage('next');
            } else if (e.key === 'Escape') {
                setZoomedImage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedImage, navigateImage]);


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
            console.log('🔄 Starting enhance with prompt:', editedPrompt);
            const enhanced = await geminiService.enhancePrompt(editedPrompt, referenceImages, styleReferenceImage, structureImage, userApiKey, language);
            console.log('✅ Enhanced result:', enhanced);

            // Always update and show success
            setEditedPrompt(enhanced);
            showToast(language === 'it' ? '✨ Prompt migliorato!' : '✨ Prompt enhanced!', 'success');
        } catch (error: any) {
            console.error("Prompt enhancement failed", error);
            showToast(error.message || t.promptEnhancementFailed, 'error');
        } finally {
            setIsEnhancing(false);
        }
    }, [editedPrompt, referenceImages, styleReferenceImage, structureImage, userApiKey, language, showToast, t.promptEnhancementFailed]);

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

    // v0.8: Re-roll handler - regenerate with same settings but new seed
    const handleReroll = useCallback(async (image: GeneratedImage) => {
        setIsLoading(true);
        setCurrentImages([]);
        try {
            // Use same prompt, aspect ratio, negativePrompt, but generate NEW seed
            const newSeed = String(Math.floor(Math.random() * 1000000000));

            const imageDataUrl = await geminiService.generateImage(
                image.prompt,
                image.aspectRatio,
                referenceImages,
                styleReferenceImage,
                structureImage,
                userApiKey,
                image.negativePrompt,
                newSeed, // NEW seed for variation
                language,
                preciseReference
            );

            const thumbnailDataUrl = await createThumbnailDataUrl(imageDataUrl);
            const newImage: GeneratedImage = {
                id: crypto.randomUUID(),
                imageDataUrl,
                thumbnailDataUrl,
                prompt: image.prompt,
                aspectRatio: image.aspectRatio,
                negativePrompt: image.negativePrompt,
                seed: newSeed,
                timestamp: Date.now(),
            };

            setCurrentImages([newImage]);
            setHistory(prev => [newImage, ...prev].slice(0, MAX_HISTORY_ITEMS));
            showToast(language === 'it' ? '🎲 Variante generata!' : '🎲 Variant generated!', 'success');
        } catch (error: any) {
            console.error("Re-roll failed", error);
            showToast(error.message || t.generationFailed, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [referenceImages, styleReferenceImage, structureImage, userApiKey, language, preciseReference, showToast, t.generationFailed]);

    // v0.8: Toggle favorite/bookmark
    const handleToggleFavorite = useCallback((imageId: string) => {
        setHistory(prev => prev.map(img =>
            img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
        ));
        setCurrentImages(prev => prev.map(img =>
            img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
        ));
    }, []);

    // Preset handlers
    const handleSavePreset = useCallback((name: string, prompt: string, negativePrompt?: string) => {
        try {
            const newPreset = presetsService.addPreset(name, prompt, negativePrompt);
            setPresets(presetsService.loadPresets());
            showToast('Preset saved successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to save preset', 'error');
        }
    }, [showToast]);

    const handleLoadPreset = useCallback((preset: PromptPreset) => {
        setEditedPrompt(preset.prompt);
        if (preset.negativePrompt) {
            setNegativePrompt(preset.negativePrompt);
        }
        showToast(`Loaded preset: ${preset.name}`, 'success');
    }, [showToast]);

    const handleDeletePreset = useCallback((id: string) => {
        presetsService.deletePreset(id);
        setPresets(presetsService.loadPresets());
        showToast('Preset deleted', 'success');
    }, [showToast]);

    const handleExportPresets = useCallback(() => {
        try {
            const json = presetsService.exportPresets();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `generentolo-presets-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('Presets exported successfully!', 'success');
        } catch (error) {
            showToast('Failed to export presets', 'error');
        }
    }, [showToast]);

    const handleImportPresets = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                presetsService.importPresets(content);
                setPresets(presetsService.loadPresets());
                showToast('Presets imported successfully!', 'success');
            } catch (error) {
                showToast('Failed to import presets. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    }, [showToast]);

    const handleUpscale = useCallback(async (image: GeneratedImage, scale: 2 | 4) => {
        if (!upscaleService.isUpscalingEnabled()) {
            showToast(t.upscaleFailed, 'error');
            return;
        }

        const imageDataUrl = image.imageDataUrl || image.thumbnailDataUrl;
        if (!imageDataUrl) return;

        setUpscalingImageId(image.id);

        try {
            const upscaledDataUrl = await upscaleService.upscaleImage(imageDataUrl, { scale });

            // Create new upscaled image entry with original for comparison
            const upscaledImage: GeneratedImage = {
                ...image,
                id: `${image.id}-upscaled-${scale}x-${Date.now()}`,
                imageDataUrl: upscaledDataUrl,
                thumbnailDataUrl: await createThumbnailDataUrl(upscaledDataUrl),
                originalImageDataUrl: imageDataUrl, // Save original for comparison
            };

            // Add to current images and history
            setCurrentImages(prev => [...prev, upscaledImage]);
            setHistory(prev => {
                const updated = [upscaledImage, ...prev];
                return updated.slice(0, 12);
            });

            showToast(t.upscaleSuccess, 'success');
        } catch (error: any) {
            console.error('Upscaling error:', error);
            showToast(error.message || t.upscaleFailed, 'error');
        } finally {
            setUpscalingImageId(null);
        }
    }, [showToast, t.upscaleFailed, t.upscaleSuccess]);

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
        setStructureImage(null);
        setPrompts([]);
        setEditedPrompt('');
        setNegativePrompt('');
        setSeed('');
        setDynamicTools([]);
        setAspectRatio('Auto');
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
        { ...APP_SHORTCUTS.ENHANCE_PROMPT, action: () => !isActionDisabled && handleEnhancePrompt() },
        { ...APP_SHORTCUTS.RANDOM_SEED, action: handleRandomizeSeed },
        { ...APP_SHORTCUTS.CLEAR_INTERFACE, action: handleResetInterface },
        { ...APP_SHORTCUTS.OPEN_SETTINGS, action: () => setIsSettingsOpen(true) },
        { ...APP_SHORTCUTS.FOCUS_PROMPT, action: () => promptTextareaRef.current?.focus() },
        { ...APP_SHORTCUTS.TOGGLE_THEME, action: toggleTheme },
        { ...APP_SHORTCUTS.HELP, action: () => setIsShortcutsOpen(true) }, // v0.8
    ], [isActionDisabled, handleGenerate, handleEnhancePrompt, handleRandomizeSeed, handleResetInterface, toggleTheme]);

    useKeyboardShortcuts(shortcuts, !isLoading && !isEnhancing);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col font-sans">
                <Header theme={theme} toggleTheme={toggleTheme} onOpenSettings={() => setIsSettingsOpen(true)} onOpenFeedback={() => setIsFeedbackOpen(true)} onOpenShortcuts={() => setIsShortcutsOpen(true)} onOpenHelp={() => setIsHelpOpen(true)} onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)} />
                <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 pt-4 pb-32 lg:pb-28 overflow-y-auto lg:overflow-hidden">
                    {/* --- Left Sidebar (only references/style/structure) --- */}
                    <aside className="w-full lg:w-[280px] flex-shrink-0 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl overflow-y-auto h-full">
                        <ReferencePanel
                            onAddImages={handleAddImages}
                            onRemoveImage={handleRemoveImage}
                            referenceImages={referenceImages}
                            onAddStyleImage={handleAddStyleImage}
                            onRemoveStyleImage={handleRemoveStyleImage}
                            styleImage={styleReferenceImage}
                            onAddStructureImage={setStructureImage}
                            onRemoveStructureImage={() => setStructureImage(null)}
                            structureImage={structureImage}
                        />
                    </aside>

                    {/* --- Main Content --- */}
                    <div className="flex-1 flex flex-col gap-2 lg:gap-6 min-w-0 h-full">
                        <div className="flex-1 min-h-0 bg-light-surface/50 dark:bg-dark-surface/30 rounded-3xl overflow-hidden">
                            <ImageDisplay images={currentImages} isLoading={isLoading} onDownload={handleDownload} onZoom={handleZoom} onEdit={setEditingImage} onUpscale={handleUpscale} upscalingImageId={upscalingImageId} onReroll={handleReroll} onToggleFavorite={handleToggleFavorite} />
                        </div>

                        {((referenceImages.length > 0 || !!styleReferenceImage) || currentImages.length === 1) && (
                            <div className="flex-shrink-0 space-y-2 lg:space-y-4 overflow-y-auto max-h-[300px] lg:max-h-[250px]">
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
                        )}
                    </div>

                    {/* --- Right Column (Buttons + History) --- */}
                    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
                        <div className="space-y-4 p-4 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl">
                             <button onClick={handleGenerate} disabled={isActionDisabled} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-yellow to-brand-magenta text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,217,61,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                                <span>{isLoading ? t.generatingButton : t.generateButton}</span>
                            </button>
                             <div className="flex flex-col gap-3">
                                <button onClick={handleUseAsReference} disabled={isActionDisabled || currentImages.length === 0 || referenceImages.length >= MAX_USER_IMAGES} className="w-full p-[2px] bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl disabled:opacity-50 group transition-all">
                                   <div className="w-full h-full bg-light-surface dark:bg-dark-surface-accent rounded-[10px] flex justify-center items-center gap-2 text-light-text dark:text-dark-text font-semibold py-2 transition-all group-hover:bg-opacity-80 disabled:group-hover:bg-opacity-100 dark:group-hover:bg-opacity-80">
                                        <CornerUpLeftIcon className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm">{t.useAsReference}</span>
                                    </div>
                                </button>
                                <button onClick={handleResetInterface} title={t.resetInterface} disabled={isActionDisabled} className="w-full p-[2px] bg-gradient-to-r from-brand-pink to-fuchsia-500 rounded-xl disabled:opacity-50 group transition-all">
                                    <div className="w-full h-full bg-light-surface dark:bg-dark-surface-accent rounded-[10px] flex justify-center items-center gap-2 text-light-text dark:text-dark-text font-semibold py-2 transition-all group-hover:bg-opacity-80 disabled:group-hover:bg-opacity-100 dark:group-hover:bg-opacity-80">
                                        <ReloadIcon className="w-4 h-4 text-brand-magenta" />
                                        <span className="text-sm">{t.resetInterface}</span>
                                    </div>
                                </button>
                             </div>
                        </div>

                        <aside className="flex-1 min-h-0 flex flex-col gap-3">
                            {/* Tabs */}
                            <div className="flex gap-2 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-2xl p-1">
                                <button
                                    onClick={() => setSidebarTab('history')}
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                                        sidebarTab === 'history'
                                            ? 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                                            : 'text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'
                                    }`}
                                >
                                    History
                                </button>
                                <button
                                    onClick={() => setSidebarTab('presets')}
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                                        sidebarTab === 'presets'
                                            ? 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                                            : 'text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'
                                    }`}
                                >
                                    <StarIcon className="w-4 h-4 inline-block mr-1 -mt-0.5" filled={sidebarTab === 'presets'} />
                                    Presets
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-h-0">
                                {sidebarTab === 'history' ? (
                                    <HistoryPanel
                                        history={history}
                                        onSelect={handleSelectHistory}
                                        onZoom={handleZoom}
                                        onDelete={handleDeleteHistoryItem}
                                        onClearAll={handleClearAllHistory}
                                        isSelectionMode={isHistorySelectionMode}
                                        selectedIds={selectedHistoryIds}
                                        onEnterSelectionMode={handleEnterHistorySelectionMode}
                                        onCancelSelectionMode={handleCancelHistorySelectionMode}
                                        onToggleSelection={handleToggleHistorySelection}
                                        onDeleteSelected={handleDeleteSelectedHistoryItems}
                                    />
                                ) : (
                                    <PresetsPanel
                                        presets={presets}
                                        onLoadPreset={handleLoadPreset}
                                        onDeletePreset={handleDeletePreset}
                                        onSavePreset={handleSavePreset}
                                        onExport={handleExportPresets}
                                        onImport={handleImportPresets}
                                        currentPrompt={editedPrompt}
                                        currentNegativePrompt={negativePrompt}
                                    />
                                )}
                            </div>
                        </aside>
                    </div>
                </main>

                {/* Floating Action Bar */}
                <FloatingActionBar
                    prompt={editedPrompt}
                    onPromptChange={setEditedPrompt}
                    promptTextareaRef={promptTextareaRef}
                    onGenerate={handleGenerate}
                    onEnhancePrompt={handleEnhancePrompt}
                    onGenerate3Prompts={handleGenerateCreativePrompts}
                    isLoading={isLoading}
                    isEnhancing={isEnhancing}
                    hasReferences={referenceImages.length > 0 || !!styleReferenceImage || !!structureImage}
                    hasGeneratedImages={currentImages.length > 0}
                    aspectRatio={aspectRatio}
                    onAspectRatioChange={handleAspectRatioChange}
                    numImages={numImagesToGenerate}
                    onNumImagesChange={setNumImagesToGenerate}
                    seed={seed}
                    onSeedChange={setSeed}
                    onRandomizeSeed={handleRandomizeSeed}
                    negativePrompt={negativePrompt}
                    onNegativePromptChange={setNegativePrompt}
                    preciseReference={preciseReference}
                    onPreciseReferenceChange={setPreciseReference}
                    dynamicTools={dynamicTools}
                    onGenerateTools={handleGenerateDynamicTools}
                    isToolsLoading={isToolsLoading}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    selectedResolution={selectedResolution}
                    onResolutionChange={setSelectedResolution}
                    textInImageConfig={textInImageConfig}
                    onTextInImageConfigChange={setTextInImageConfig}
                    referenceImagesCount={referenceImages.length}
                    styleImageCount={styleReferenceImage ? 1 : 0}
                    structureImageCount={structureImage ? 1 : 0}
                />

                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveApiKey} currentApiKey={userApiKey} />
                <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
                <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

                <PromptLibrary
                    isOpen={isPromptLibraryOpen}
                    onClose={() => setIsPromptLibraryOpen(false)}
                    onUsePrompt={(prompt) => {
                        setEditedPrompt(prompt);
                        promptTextareaRef.current?.focus();
                    }}
                    t={t}
                />

                {editingImage && <InpaintEditor image={editingImage} onClose={() => setEditingImage(null)} onSave={handleInpaint} />}

                {toast && (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {zoomedImage && (() => {
                    const nav = getImageNavigation();
                    const showNavigation = nav.total > 1;

                    return (
                        <div
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-zoom-out"
                            onClick={() => setZoomedImage(null)}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Zoomed image view"
                        >
                            <div
                                className="relative select-none"
                                onClick={e => e.stopPropagation()}
                                onTouchStart={(e) => {
                                    const touch = e.touches[0];
                                    (e.currentTarget as any).touchStartX = touch.clientX;
                                }}
                                onTouchEnd={(e) => {
                                    const touch = e.changedTouches[0];
                                    const startX = (e.currentTarget as any).touchStartX;
                                    const diff = touch.clientX - startX;

                                    // Swipe threshold: 50px
                                    if (Math.abs(diff) > 50) {
                                        if (diff > 0) {
                                            // Swipe right = previous
                                            navigateImage('prev');
                                        } else {
                                            // Swipe left = next
                                            navigateImage('next');
                                        }
                                    }
                                }}
                            >
                                {/* Show image comparer if original image exists (upscaled image) */}
                                {zoomedImage.originalImageDataUrl ? (
                                    <ImageComparer
                                        originalImage={zoomedImage.originalImageDataUrl}
                                        upscaledImage={zoomedImage.imageDataUrl || zoomedImage.thumbnailDataUrl!}
                                        alt={zoomedImage.prompt}
                                    />
                                ) : (
                                    <ZoomableImage
                                        src={zoomedImage.imageDataUrl || zoomedImage.thumbnailDataUrl!}
                                        alt={zoomedImage.prompt}
                                    />
                                )}

                                {/* Top bar with counter, download and close */}
                                <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
                                    {/* Counter */}
                                    {showNavigation && (
                                        <div className="px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium">
                                            {nav.current} / {nav.total}
                                        </div>
                                    )}
                                    <div className={`flex gap-2 ${!showNavigation ? 'ml-auto' : ''}`}>
                                        <button onClick={() => handleDownload(zoomedImage)} className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors" aria-label="Download image">
                                            <DownloadIcon className="w-6 h-6" />
                                        </button>
                                        <button onClick={() => setZoomedImage(null)} className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors" aria-label="Close zoom view">
                                            <XIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Navigation arrows (only show if there are multiple images) */}
                                {showNavigation && (
                                    <>
                                        {/* Previous button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateImage('prev');
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-95"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeftIcon className="w-8 h-8" />
                                        </button>

                                        {/* Next button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateImage('next');
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-95"
                                            aria-label="Next image"
                                        >
                                            <ChevronRightIcon className="w-8 h-8" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </LanguageContext.Provider>
    );
}
