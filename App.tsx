import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import { GeneratedImage, DynamicTool, PromptPreset, ModelType, ResolutionType } from './types';
import * as geminiService from './services/geminiService';
import * as presetsService from './services/presetsService';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { SunIcon, MoonIcon, UploadIcon, DownloadIcon, SparklesIcon, CopyIcon, SettingsIcon, XIcon, CheckIcon, LanguageIcon, BrushIcon, DiceIcon, TrashIcon, ReloadIcon, StarIcon, CornerUpLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from './components/icons';
import { indexedDBService, DnaCharacter } from './services/indexedDB';
import FloatingActionBar from './components/FloatingActionBar';
import ZoomableImage from './components/ZoomableImage';
import UsageTracker from './components/UsageTracker'; // v1.4
import { STYLE_PRESETS, PHYSICS_PRESETS } from './data/stylePresets'; // v1.4
import { fetchInvisibleReferences, removeBracketsFromPrompt } from './services/googleSearchService'; // v1.5.1
import StudioPanel from './components/StudioPanel'; // v1.8: Studio Mode
import { CAMERAS, LENSES, FOCAL_LENGTHS, LIGHT_DIRECTIONS, WARDROBE_CATEGORIES, SHOTS, PRODUCTION_KITS } from './data/studioPresets';

// Polyfill for crypto.randomUUID() on browsers that don't support it (mobile Safari, etc)
if (!crypto.randomUUID) {
    (crypto as any).randomUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`;
    };
}

// --- Localization ---
const translations = {
    en: {
        headerTitle: 'Generentolo PRO v1.8',
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
        abort: 'Abort',
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
        upscaleAction: 'Upscale to 4K',
        upscale2K: 'Upscale to 2K ($0.134)',
        upscale4K: 'Upscale to 4K ($0.24)',
        upscaling: 'Upscaling to high resolution...',
        upscaleSuccess: 'Image upscaled successfully!',
        upscaleFailed: 'Upscaling failed. Please try again.',
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
        promptLibraryCategoryAesthetic: 'Aesthetic Presets',
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
        // v1.4: New Features
        groundingLabel: 'Google Search Grounding',
        groundingTooltip: 'Automatically fetches reference images from Google based on your prompt keywords to improve accuracy and realism.',
        stylePresetsTitle: 'Quick Style Presets',
        stylePresetsNone: 'None',
        physicsControlTitle: 'Physics Controls',
        lightingLabel: 'Lighting',
        cameraLabel: 'Camera',
        focusLabel: 'Focus',
        usageTrackerTitle: 'Session Stats',
        // Cost Calculator
        costEstimate: 'Cost Estimate',
        costOutput: 'Output',
        costInputImages: 'Input Images',
        costPrompt: 'Prompt',
        costTotal: 'Total',
        costDisclaimer: '* Estimate based on official Google pricing',
        // Compatibility for FloatingActionBar
        advancedSettings: 'Advanced Settings',
        negativePrompt: 'Negative Prompt',
        seed: 'Seed',
        randomSeed: 'Random',
        professionalTools: 'Professional Tools',
        generate: 'Generate',
        toolsAvailable: 'tools available',
        noToolsYet: 'Click generate to create professional tools',
        // v1.7: DNA Character
        dnaCharacterTitle: 'DNA Character',
        dnaCharacterSubtitle: 'Character Consistency',
        dnaCharacterManage: 'Manage Character DNA',
        dnaCharacterSave: 'Capture DNA',
        dnaCharacterExtracting: 'Analizing DNA...',
        dnaCharacterSuccess: 'DNA Profile Captured!',
        dnaCharacterFailed: 'DNA Extraction Failed.',
        dnaCharacterNone: 'No DNA active',
        dnaCharacterDelete: 'Delete Profile',
        dnaCharacterEnterName: 'Character Name',
        // v1.8: Studio Mode
        studioModeToggleClassic: 'Classic',
        studioModeToggleStudio: 'Studio',
        studioCinemaRigTitle: 'Cinema Rig',
        studioLightForgeTitle: 'Light Forge',
        studioWardrobeTitle: 'Wardrobe Studio',
        studioCameraModel: 'Camera Model',
        studioLensModel: 'Lens Type',
        studioFocalLength: 'Focal Length',
        studioLightDirection: 'Direction',
        studioLightQuality: 'Quality',
        studioLightColor: 'Light Color',
        studioLightSoft: 'Soft / Diffused',
        studioLightHard: 'Hard / Sharp',
        studioWardrobeGender: 'Gender',
        studioWardrobeTop: 'Top',
        studioWardrobeOuter: 'Outerwear',
        studioWardrobeBottom: 'Bottom',
        studioWardrobeSet: 'Full Set',
        studioShotGridTitle: 'Production Shots',
        studioShotFront: 'Frontal',
        studioShotSide: 'Profile',
        studioShotLow: 'Hero (Low)',
        studioShotHigh: 'Bird\'s Eye',
        studioShotClose: 'Close-up',
        studioShotWide: 'Wide Shot',
    },
    it: {
        headerTitle: 'Generentolo PRO v1.8',
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
        abort: 'Annulla',
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
        upscaleAction: 'Upscale a 4K',
        upscale2K: 'Upscale a 2K ($0.134)',
        upscale4K: 'Upscale a 4K ($0.24)',
        upscaling: 'Upscaling ad alta risoluzione...',
        upscaleSuccess: 'Immagine potenziata con successo!',
        upscaleFailed: 'Upscaling fallito. Riprova.',
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
        promptLibraryCategoryAesthetic: 'Preset Estetici',
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
        // v1.4: Nuove Funzionalità
        groundingLabel: 'Google Search Grounding',
        groundingTooltip: 'Scarica automaticamente immagini di riferimento da Google basandosi sulle parole chiave del prompt per migliorare accuratezza e realismo.',
        stylePresetsTitle: 'Preset Stile Rapidi',
        stylePresetsNone: 'Nessuno',
        physicsControlTitle: 'Controlli Fisica',
        lightingLabel: 'Illuminazione',
        cameraLabel: 'Fotocamera',
        focusLabel: 'Fuoco',
        usageTrackerTitle: 'Statistiche Sessione',
        // Cost Calculator
        costEstimate: 'Stima Costo',
        costOutput: 'Output',
        costInputImages: 'Immagini Input',
        costPrompt: 'Prompt',
        costTotal: 'Totale',
        costDisclaimer: '* Stima basata sui prezzi ufficiali Google',
        // Compatibility for FloatingActionBar
        advancedSettings: 'Impostazioni Avanzate',
        negativePrompt: 'Prompt Negativo',
        seed: 'Seed',
        randomSeed: 'Casuale',
        professionalTools: 'Strumenti Professionali',
        generate: 'Genera',
        toolsAvailable: 'strumenti disponibili',
        noToolsYet: 'Genera per creare strumenti professionali',
        // v1.7: DNA Character
        dnaCharacterTitle: 'DNA Character',
        dnaCharacterSubtitle: 'Consistenza Personaggio',
        dnaCharacterManage: 'Gestisci DNA Personaggi',
        dnaCharacterSave: 'Cattura DNA',
        dnaCharacterExtracting: 'Analisi DNA in corso...',
        dnaCharacterSuccess: 'Profilo DNA salvato!',
        dnaCharacterFailed: 'Estrazione DNA fallita.',
        dnaCharacterNone: 'Nessun DNA attivo',
        dnaCharacterDelete: 'Elimina Profilo',
        dnaCharacterEnterName: 'Nome Personaggio',
        // v1.8: Studio Mode
        studioModeToggleClassic: 'Classico',
        studioModeToggleStudio: 'Studio',
        studioCinemaRigTitle: 'Cinema Rig',
        studioLightForgeTitle: 'Light Forge',
        studioWardrobeTitle: 'Wardrobe Studio',
        studioCameraModel: 'Modello Camera',
        studioLensModel: 'Tipo Lente',
        studioFocalLength: 'Focale',
        studioLightDirection: 'Direzione',
        studioLightQuality: 'Qualità',
        studioLightColor: 'Colore Luce',
        studioLightSoft: 'Morbida / Diffusa',
        studioLightHard: 'Dura / Netta',
        studioWardrobeGender: 'Genere',
        studioWardrobeTop: 'Sopra',
        studioWardrobeOuter: 'Capispalla',
        studioWardrobeBottom: 'Sotto',
        studioWardrobeSet: 'Set Completo',
        studioShotGridTitle: 'Inquadrature Production',
        studioShotFront: 'Frontale',
        studioShotSide: 'Profilo',
        studioShotLow: 'Hero (Basso)',
        studioShotHigh: 'Bird\'s Eye',
        studioShotClose: 'Primo Piano',
        studioShotWide: 'Campo Largo',
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
    setLanguage: () => { },
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
    if (typeof window !== 'undefined' && window.localStorage) {
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
    while (n--) { u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, { type: mime });
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
    <div className={`bg-light-surface-accent/50 dark:bg-dark-surface-accent/50 rounded-lg animate-pulse ${className || ''}`} />
);

interface HeaderProps {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    onOpenSettings: () => void;
    onOpenShortcuts: () => void;
    onOpenPromptLibrary: () => void;
}
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onOpenSettings, onOpenShortcuts, onOpenPromptLibrary }) => {
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
                <button onClick={onOpenShortcuts} className="p-2 rounded-full text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors" title="Keyboard Shortcuts">
                    <span className="text-lg">⌨️</span>
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
                        <XIcon className="w-3 h-3" />
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
                    <XIcon className="w-4 h-4" />
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
    // v1.4: Style Presets and Physics Controls
    selectedStylePreset: string | null;
    setSelectedStylePreset: (id: string | null) => void;
    selectedLighting: string | null;
    setSelectedLighting: (id: string | null) => void;
    selectedCamera: string | null;
    setSelectedCamera: (id: string | null) => void;
    selectedFocus: string | null;
    setSelectedFocus: (id: string | null) => void;
    selectedModel: ModelType;
    setEditedPrompt: (value: string | ((prev: string) => string)) => void;
    preciseReference: boolean;
    setPreciseReference: (value: boolean) => void;
    useGrounding: boolean;
    setUseGrounding: (value: boolean) => void;
    dnaCharacters: DnaCharacter[];
    selectedDnaId: string | null;
    onSelectDna: (id: string | null) => void;
    onManageDna: () => void;
    // v1.8: Studio Mode
    appMode: 'classic' | 'studio';
    setAppMode: (mode: 'classic' | 'studio') => void;
    studioConfig: any;
    setStudioConfig: (config: any) => void;
}> = ({ onAddImages, onRemoveImage, referenceImages, onAddStyleImage, onRemoveStyleImage, styleImage, onAddStructureImage, onRemoveStructureImage, structureImage, selectedStylePreset, setSelectedStylePreset, selectedLighting, setSelectedLighting, selectedCamera, setSelectedCamera, selectedFocus, setSelectedFocus, setEditedPrompt, preciseReference, setPreciseReference, useGrounding, setUseGrounding, dnaCharacters, selectedDnaId, onSelectDna, onManageDna, appMode, setAppMode, studioConfig, setStudioConfig }) => {
    const { t, language } = useLocalization();
    const [isDraggingRef, setIsDraggingRef] = useState(false);
    const [isDraggingStyle, setIsDraggingStyle] = useState(false);
    const [isDraggingStructure, setIsDraggingStructure] = useState(false);

    // v1.7.1: Collapsible sections to save space
    const [showPresets, setShowPresets] = useState(false);
    const [showPhysics, setShowPhysics] = useState(false);

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
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* v1.8: Mode Toggle */}
                <div className="flex p-0.5 rounded-xl bg-light-surface-accent dark:bg-dark-surface-accent border border-light-border dark:border-dark-border/50 mb-2">
                    <button
                        onClick={() => setAppMode('classic')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${appMode === 'classic' ? 'bg-white dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm border border-light-border dark:border-dark-border/30' : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'}`}
                    >
                        {t.studioModeToggleClassic}
                    </button>
                    <button
                        onClick={() => setAppMode('studio')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${appMode === 'studio' ? 'bg-gradient-to-r from-brand-yellow to-brand-magenta text-white shadow-sm' : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'}`}
                    >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        {t.studioModeToggleStudio}
                    </button>
                </div>

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

                {/* v1.7: DNA Character Section */}
                <div className="border-t border-light-border dark:border-dark-border/50 pt-4"></div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                            <span>🧬</span>
                            <span>{t.dnaCharacterTitle}</span>
                        </h3>
                        <button
                            onClick={onManageDna}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition-colors"
                        >
                            {t.select}
                        </button>
                    </div>

                    {dnaCharacters.length === 0 ? (
                        <div className="p-3 rounded-xl border border-dashed border-light-border dark:border-dark-border text-center">
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted italic">{t.dnaCharacterNone}</p>
                        </div>
                    ) : (
                        <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
                            {dnaCharacters.slice(0, 5).map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => onSelectDna(char.id)}
                                    title={char.name}
                                    className={`flex-shrink-0 w-12 h-12 rounded-full border-2 transition-all relative group ${selectedDnaId === char.id ? 'border-brand-purple shadow-[0_0_10px_rgba(114,9,183,0.5)] scale-110' : 'border-transparent grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                                >
                                    {char.thumbnailData ? (
                                        <img src={char.thumbnailData} alt={char.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full bg-light-surface-accent dark:bg-dark-surface-accent rounded-full flex items-center justify-center text-xs font-bold">
                                            {char.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {selectedDnaId === char.id && (
                                        <div className="absolute -top-1 -right-1 bg-brand-purple text-white rounded-full w-4 h-4 flex items-center justify-center">
                                            <CheckIcon className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            {dnaCharacters.length > 5 && (
                                <button
                                    onClick={onManageDna}
                                    className="flex-shrink-0 w-12 h-12 rounded-full bg-light-surface-accent dark:bg-dark-surface-accent flex items-center justify-center text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    +{dnaCharacters.length - 5}
                                </button>
                            )}
                        </div>
                    )}

                    {selectedDnaId && (
                        <div className="px-3 py-1.5 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-between">
                            <span className="text-xs font-semibold text-brand-purple truncate max-w-[150px]">
                                {dnaCharacters.find(c => c.id === selectedDnaId)?.name}
                            </span>
                            <button onClick={() => onSelectDna(null)} className="text-brand-purple hover:opacity-70">
                                <XIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Control Checkboxes Section */}
                <div className="border-t border-light-border dark:border-dark-border/50 pt-4"></div>
                <div className="space-y-3">
                    {/* Precise Reference Mode */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="precise-reference-toggle"
                            checked={preciseReference}
                            onChange={(e) => setPreciseReference(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-brand-purple focus:ring-2 focus:ring-brand-purple focus:ring-offset-0"
                        />
                        <label htmlFor="precise-reference-toggle" className="flex-1 cursor-pointer">
                            <div className="text-sm font-medium text-light-text dark:text-dark-text">
                                👤 {t.preciseReference}
                            </div>
                            <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                                {t.preciseReferenceTooltip}
                            </div>
                        </label>
                    </div>

                    {/* Google Search Grounding - v1.5.1: Now available for all models */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="grounding-toggle"
                            checked={useGrounding}
                            onChange={(e) => setUseGrounding(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-brand-yellow focus:ring-2 focus:ring-brand-yellow focus:ring-offset-0"
                        />
                        <label htmlFor="grounding-toggle" className="flex-1 cursor-pointer">
                            <div className="text-sm font-medium text-light-text dark:text-dark-text">
                                🌐 {t.groundingLabel}
                            </div>
                            <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                                {t.groundingTooltip}
                            </div>
                        </label>
                    </div>
                </div>

                {appMode === 'classic' ? (
                    <>
                        {/* v1.4: Style Presets Section - Collapsible v1.7.1 */}
                        <div className="border-t border-light-border dark:border-dark-border/50 pt-3">
                            <button
                                onClick={() => setShowPresets(!showPresets)}
                                className="w-full flex items-center justify-between font-semibold text-light-text dark:text-dark-text group hover:text-brand-yellow transition-colors"
                            >
                                <div className="flex items-center gap-2 text-sm">
                                    <span>🎨</span>
                                    <span>{t.stylePresetsTitle}</span>
                                </div>
                                {showPresets ? <ChevronUpIcon className="w-4 h-4 opacity-50 group-hover:opacity-100" /> : <ChevronDownIcon className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                            </button>

                            {showPresets && (
                                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <select
                                        value={selectedStylePreset || ''}
                                        onChange={(e) => {
                                            const presetId = e.target.value || null;
                                            setSelectedStylePreset(presetId);
                                            if (presetId) {
                                                const preset = STYLE_PRESETS.find(p => p.id === presetId);
                                                if (preset) {
                                                    setEditedPrompt(prev => {
                                                        const cleanPrompt = prev.replace(/,\s*(oil painting style|watercolor style|anime style|pixel art style|vector illustration|professional product photography|professional portrait photography|cinematic film style|street photography|macro photography|isometric view|UI\/UX design mockup|infographic design|social media post design|typography art)[^,]*/gi, '');
                                                        return cleanPrompt + preset.promptSuffix;
                                                    });
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                                    >
                                        <option value="">{language === 'it' ? 'Nessuno' : 'None'}</option>
                                        {STYLE_PRESETS.map(preset => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.icon} {language === 'it' ? preset.nameIt : preset.name}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedStylePreset && (
                                        <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted leading-tight">
                                            {STYLE_PRESETS.find(p => p.id === selectedStylePreset)?.[language === 'it' ? 'descriptionIt' : 'description']}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Physics Controls Section - Collapsible v1.7.1 */}
                        <div className="border-t border-light-border dark:border-dark-border/50 pt-3">
                            <button
                                onClick={() => setShowPhysics(!showPhysics)}
                                className="w-full flex items-center justify-between font-semibold text-light-text dark:text-dark-text group hover:text-brand-magenta transition-colors"
                            >
                                <div className="flex items-center gap-2 text-sm">
                                    <span>⚙️</span>
                                    <span>{t.physicsControlTitle}</span>
                                </div>
                                {showPhysics ? <ChevronUpIcon className="w-4 h-4 opacity-50 group-hover:opacity-100" /> : <ChevronDownIcon className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                            </button>

                            {showPhysics && (
                                <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {/* Lighting Control */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                            {language === 'it' ? 'Illuminazione' : 'Lighting'}
                                        </label>
                                        <select
                                            value={selectedLighting || ''}
                                            onChange={(e) => {
                                                const lightingId = e.target.value || null;
                                                setSelectedLighting(lightingId);
                                                if (lightingId) {
                                                    const preset = PHYSICS_PRESETS.lighting.find(p => p.id === lightingId);
                                                    if (preset) {
                                                        setEditedPrompt(prev => {
                                                            const cleanPrompt = prev.replace(/,\s*(soft studio lighting|golden hour lighting|dramatic lighting|neon lighting|natural daylight)[^,]*/gi, '');
                                                            return cleanPrompt + ', ' + preset.prompt;
                                                        });
                                                    }
                                                }
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                                        >
                                            <option value="">{language === 'it' ? 'Nessuna' : 'None'}</option>
                                            {PHYSICS_PRESETS.lighting.map(preset => (
                                                <option key={preset.id} value={preset.id}>
                                                    {language === 'it' ? preset.nameIt : preset.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Camera Control */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                            {language === 'it' ? 'Fotocamera' : 'Camera'}
                                        </label>
                                        <select
                                            value={selectedCamera || ''}
                                            onChange={(e) => {
                                                const cameraId = e.target.value || null;
                                                setSelectedCamera(cameraId);
                                                if (cameraId) {
                                                    const preset = PHYSICS_PRESETS.camera.find(p => p.id === cameraId);
                                                    if (preset) {
                                                        setEditedPrompt(prev => {
                                                            const cleanPrompt = prev.replace(/,\s*(wide angle lens|portrait lens|macro lens|telephoto lens|fisheye lens)[^,]*/gi, '');
                                                            return cleanPrompt + ', ' + preset.prompt;
                                                        });
                                                    }
                                                }
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                                        >
                                            <option value="">{language === 'it' ? 'Nessuna' : 'None'}</option>
                                            {PHYSICS_PRESETS.camera.map(preset => (
                                                <option key={preset.id} value={preset.id}>
                                                    {language === 'it' ? preset.nameIt : preset.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Focus Control */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
                                            {language === 'it' ? 'Messa a Fuoco' : 'Focus'}
                                        </label>
                                        <select
                                            value={selectedFocus || ''}
                                            onChange={(e) => {
                                                const focusId = e.target.value || null;
                                                setSelectedFocus(focusId);
                                                if (focusId) {
                                                    const preset = PHYSICS_PRESETS.focus.find(p => p.id === focusId);
                                                    if (preset) {
                                                        setEditedPrompt(prev => {
                                                            const cleanPrompt = prev.replace(/,\s*(shallow depth of field|tack sharp|cinematic depth of field|tilt-shift effect|soft focus)[^,]*/gi, '');
                                                            return cleanPrompt + ', ' + preset.prompt;
                                                        });
                                                    }
                                                }
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                                        >
                                            <option value="">{language === 'it' ? 'Nessuna' : 'None'}</option>
                                            {PHYSICS_PRESETS.focus.map(preset => (
                                                <option key={preset.id} value={preset.id}>
                                                    {language === 'it' ? preset.nameIt : preset.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <StudioPanel t={t} language={language} studioConfig={studioConfig} setStudioConfig={setStudioConfig} />
                )}
            </div>
        </div>
    );
};




interface ImageDisplayProps {
    images: GeneratedImage[];
    isLoading: boolean;
    onDownload: (image: GeneratedImage) => void;
    onZoom: (image: GeneratedImage) => void;
    onEdit: (image: GeneratedImage) => void;
    onReroll: (image: GeneratedImage) => void; // v0.8
    onToggleFavorite: (imageId: string) => void; // v0.8
    onUpscale: (image: GeneratedImage, resolution: '2k' | '4k') => void; // v1.1
    upscalingImageId: string | null; // v1.1
    onSaveDna: (image: GeneratedImage) => void; // v1.7
    reasoningText?: string; // v1.7: Creative reasoning plan
}
const ImageDisplay: React.FC<ImageDisplayProps> = ({ images, isLoading, onDownload, onZoom, onEdit, onReroll, onToggleFavorite, onUpscale, upscalingImageId, onSaveDna, reasoningText }) => {
    const { t } = useLocalization();
    const [showUpscaleMenu, setShowUpscaleMenu] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-light-surface/50 dark:bg-dark-surface/30 rounded-2xl p-4">
            {isLoading && (
                <div className="flex flex-col items-center text-center max-w-md px-6 text-light-text-muted dark:text-dark-text-muted">
                    <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="font-bold text-lg mb-2 text-light-text dark:text-dark-text animate-pulse">{t.generatingStatus}</p>
                    <div className="min-h-[3rem] flex items-center justify-center">
                        <p className={`text-sm italic transition-opacity duration-1000 ${reasoningText ? 'opacity-100' : 'opacity-60'}`}>
                            {reasoningText || t.generatingSubtext}
                        </p>
                    </div>
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
                                        <div className="absolute inset-0 bg-black/60 rounded-md flex flex-col items-center justify-center z-10">
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

                                        {/* v1.7: Save as DNA button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onSaveDna(image); }}
                                            className="p-2 rounded-full bg-black/50 text-white hover:bg-brand-purple transition-colors"
                                            aria-label="Save as DNA Character"
                                            title="🧬 Save as DNA Character Consistency"
                                        >
                                            <span className="text-xl leading-none">🧬</span>
                                        </button>

                                        <button onClick={() => onEdit(image)} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label={t.editAction}><BrushIcon className="w-5 h-5" /></button>

                                        {/* v1.1: Upscale button with dropdown */}
                                        {!isUpscaling && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowUpscaleMenu(showUpscaleMenu === image.id ? null : image.id)}
                                                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                                    aria-label={t.upscaleAction}
                                                    title={t.upscaleAction}
                                                >
                                                    <SparklesIcon className="w-5 h-5" />
                                                </button>

                                                {showUpscaleMenu === image.id && (
                                                    <div className="absolute top-full right-0 mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg overflow-hidden z-20 min-w-[160px]">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onUpscale(image, '2k'); setShowUpscaleMenu(null); }}
                                                            className="w-full px-4 py-2 text-left text-white hover:bg-dark-surface-accent transition-colors"
                                                        >
                                                            {t.upscale2K}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onUpscale(image, '4k'); setShowUpscaleMenu(null); }}
                                                            className="w-full px-4 py-2 text-left text-white hover:bg-dark-surface-accent transition-colors"
                                                        >
                                                            {t.upscale4K}
                                                        </button>
                                                    </div>
                                                )}
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
    onGenerateVariations: (image: GeneratedImage) => void; // v1.3
    variationsLoadingId: string | null; // v1.3
    onCopySettings: (image: GeneratedImage) => void; // v1.3
    onSaveDna: (image: GeneratedImage) => void; // v1.7
}
const HistoryPanel: React.FC<HistoryPanelProps> = ({
    history, onSelect, onZoom, onDelete, onClearAll,
    isSelectionMode, selectedIds, onEnterSelectionMode, onCancelSelectionMode, onToggleSelection, onDeleteSelected,
    onGenerateVariations, variationsLoadingId, onCopySettings, onSaveDna
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
                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${!showFavoritesOnly
                            ? 'bg-white dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                            : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'
                            }`}
                    >
                        {t.allHistory}
                    </button>
                    <button
                        onClick={() => setShowFavoritesOnly(true)}
                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${showFavoritesOnly
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
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                                            {/* Top Left: Delete/Destructive Actions */}
                                            <div className="absolute top-1.5 left-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                    className="p-1.5 rounded-full bg-red-600/60 text-white transition-all hover:bg-red-500 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md"
                                                    aria-label={t.deleteAction}
                                                    title={t.deleteAction}
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Top Right: Creative & Utility Actions */}
                                            <div className="absolute top-1.5 right-1.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity max-h-[calc(100%-12px)] flex-wrap-reverse content-end items-end">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                                                    className="p-1.5 rounded-full bg-black/60 text-white transition-all hover:bg-brand-purple hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md"
                                                    aria-label={t.reuseAction}
                                                    title={t.reuseAction}
                                                >
                                                    <ReloadIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onCopySettings(item); }}
                                                    className="p-1.5 rounded-full bg-black/60 text-white transition-all hover:bg-brand-magenta hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md"
                                                    aria-label="Copy settings"
                                                    title="📋 Copy all settings"
                                                >
                                                    <CopyIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onSaveDna(item); }}
                                                    className="p-1.5 rounded-full bg-black/60 text-white transition-all hover:bg-indigo-500 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md"
                                                    aria-label="Save as DNA"
                                                    title="🧬 Save as DNA Character"
                                                >
                                                    <span className="text-xs">🧬</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onGenerateVariations(item); }}
                                                    className="p-1.5 rounded-full bg-black/60 text-white transition-all hover:bg-brand-yellow hover:text-black hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md disabled:opacity-50"
                                                    aria-label="Generate variations"
                                                    title="🎲 Generate 4 variations"
                                                    disabled={variationsLoadingId !== null}
                                                >
                                                    <DiceIcon className="w-3.5 h-3.5" />
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
    useLocalization();
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
                    Presets {presets.length > 0 && <span className="text-sm text-light-text-muted dark:text-dark-text-muted">({presets.length}/50) </span>}
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
                <div className="text-center py-4 space-y-3">
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
                        <span className="text-2xl">ℹ️</span>
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
            {isSuccess ? <span>✅</span> : <span>⚠️</span>}
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
            if (ctx) ctx.lineWidth = brushSize;
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


// --- v1.7: DNA Character Modal ---
interface DnaCharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    characters: DnaCharacter[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onSave: (image: File, name: string) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

const DnaCharacterModal: React.FC<DnaCharacterModalProps> = ({ isOpen, onClose, characters, selectedId, onSelect, onSave, onDelete, isLoading }) => {
    const { t, language } = useLocalization();
    const [newName, setNewName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (!newName) {
                const fileName = file.name.split('.')[0];
                setNewName(fileName);
            }
        }
    };

    const handleSave = () => {
        if (selectedFile && newName.trim()) {
            onSave(selectedFile, newName.trim());
            setSelectedFile(null);
            setNewName('');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🧬</span>
                        {t.dnaCharacterTitle}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Add New DNA */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                            <span>✨</span> {language === 'it' ? 'Crea Nuovo Profilo' : 'Create New Profile'}
                        </h3>
                        <div className="p-4 bg-light-surface-accent dark:bg-dark-surface-accent rounded-2xl flex flex-col sm:flex-row gap-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full sm:w-24 h-24 rounded-xl border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center cursor-pointer hover:border-brand-purple transition-colors bg-black/5 overflow-hidden"
                            >
                                {selectedFile ? (
                                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <UploadIcon className="w-6 h-6 mx-auto opacity-50" />
                                        <span className="text-[10px] mt-1 block opacity-50">{t.select}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder={t.dnaCharacterEnterName}
                                    className="w-full px-4 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-purple focus:outline-none transition-all text-sm"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || !selectedFile || !newName.trim()}
                                    className="w-full py-2.5 bg-brand-purple text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span>🧬 {t.dnaCharacterSave}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {/* Existing DNA List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                            <span>📂</span> {t.dnaCharacterSubtitle}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {characters.map(char => (
                                <div
                                    key={char.id}
                                    className={`relative group rounded-2xl p-3 border-2 transition-all cursor-pointer ${selectedId === char.id ? 'border-brand-purple bg-brand-purple/5' : 'border-light-border dark:border-dark-border hover:border-light-text-muted dark:hover:border-dark-text-muted'}`}
                                    onClick={() => onSelect(char.id)}
                                >
                                    <div className="aspect-square rounded-xl bg-black/10 overflow-hidden mb-2">
                                        {char.thumbnailData ? (
                                            <img src={char.thumbnailData} alt={char.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold opacity-30">
                                                {char.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center truncate font-medium text-sm">
                                        {char.name}
                                    </div>

                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                                            className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {selectedId === char.id && (
                                        <div className="absolute -top-2 -right-2 bg-brand-purple text-white rounded-full p-1 shadow-lg">
                                            <CheckIcon className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {characters.length === 0 && (
                                <div className="col-span-full py-12 text-center text-light-text-muted dark:text-dark-text-muted italic bg-light-surface-accent dark:bg-dark-surface-accent rounded-3xl">
                                    {t.dnaCharacterNone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-light-surface-accent dark:bg-dark-surface-accent flex justify-center">
                    <button onClick={onClose} className="px-8 py-2.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl font-bold hover:opacity-80 transition-opacity">
                        {t.save}
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
    const [currentImages, setCurrentImages] = useState<GeneratedImage[]>([]);
    const [history, setHistory] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reasoningText, setReasoningText] = useState<string>(''); // v1.7: Creative reasoning plan
    const [isToolsLoading, setIsToolsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [numImagesToGenerate, setNumImagesToGenerate] = useState(1);
    const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);
    const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);

    const [userApiKey, setUserApiKey] = useState<string>('');
    const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
    const [isHistorySelectionMode, setIsHistorySelectionMode] = useState(false);
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
    const [upscalingImageId, setUpscalingImageId] = useState<string | null>(null);
    const [presets, setPresets] = useState<PromptPreset[]>([]);
    const [sidebarTab, setSidebarTab] = useState<'history' | 'presets'>('history');
    const [variationsLoadingId, setVariationsLoadingId] = useState<string | null>(null); // v1.3: For variations

    // v1.7: DNA Character Consistency
    const [dnaCharacters, setDnaCharacters] = useState<DnaCharacter[]>([]);
    const [selectedDnaId, setSelectedDnaId] = useState<string | null>(null);
    const [isDnaLoading, setIsDnaLoading] = useState(false);

    // v1.8: Studio Mode
    const [appMode, setAppMode] = useState<'classic' | 'studio'>('classic');
    const [studioConfig, setStudioConfig] = useState<{
        camera?: string;
        lens?: string;
        focal?: string;
        lightDir?: string;
        lightQuality?: 'soft' | 'hard';
        lightColor?: string;
        wardrobeGender?: 'male' | 'female' | 'unisex';
        wardrobeTop?: string;
        wardrobeOuter?: string;
        wardrobeBottom?: string;
        wardrobeSet?: string;
        shot?: string;
        kit?: string;
    }>({});

    // v1.4: New features states
    const [useGrounding, setUseGrounding] = useState(false); // Google Search Grounding
    const [selectedStylePreset, setSelectedStylePreset] = useState<string | null>(null);
    const [selectedLighting, setSelectedLighting] = useState<string | null>(null);
    const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
    const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
    const [showUsageTracker, setShowUsageTracker] = useState(false);
    const [usageStats, setUsageStats] = useState({
        imagesGenerated: 0,
        totalCost: 0,
        tokensUsed: 0,
        averageTime: 0,
        generationTimes: [] as number[]
    });
    const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const t = useMemo(() => translations[language], [language]);

    // Load presets and DNA characters from storage on mount
    useEffect(() => {
        const loadedPresets = presetsService.loadPresets();
        setPresets(loadedPresets);

        // Load DNA Characters from IndexedDB
        indexedDBService.getAllDnaCharacters().then(chars => {
            setDnaCharacters(chars);
        });
    }, []);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ id: Date.now(), message, type });
    }, []);

    const handleAspectRatioChange = useCallback((ratio: string) => {
        setAspectRatio(ratio);
    }, []);



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

    const handleSaveDna = async (imageFile: File, name: string) => {
        setIsDnaLoading(true);
        try {
            const dna = await geminiService.extractCharacterDna(imageFile, userApiKey, language);
            if (!dna) throw new Error("Could not extract DNA");

            // Create thumbnail for the profile
            let thumbnailData: string | undefined;
            try {
                const reader = new FileReader();
                thumbnailData = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(imageFile);
                });
            } catch (e) {
                console.error("Failed to create DNA thumbnail", e);
            }

            const newChar: DnaCharacter = {
                id: crypto.randomUUID(),
                name,
                dna,
                thumbnailData,
                timestamp: Date.now()
            };

            await indexedDBService.saveDnaCharacter(newChar);
            setDnaCharacters(prev => [newChar, ...prev]);
            showToast(t.dnaCharacterSuccess, 'success');
        } catch (error: any) {
            console.error("Failed to save DNA", error);
            showToast(t.dnaCharacterFailed, 'error');
        } finally {
            setIsDnaLoading(false);
        }
    };

    const handleSaveImageAsDna = useCallback(async (image: GeneratedImage) => {
        const name = window.prompt(language === 'it' ? 'Inserisci un nome per questo personaggio:' : 'Enter a name for this character:', 'Character Name');
        if (!name) return;

        const imageUrl = image.imageDataUrl || image.thumbnailDataUrl;
        if (!imageUrl) return;

        const file = dataURLtoFile(imageUrl, `dna-${image.id}.png`);
        await handleSaveDna(file, name);
    }, [language, handleSaveDna]);

    const handleDeleteDna = async (id: string) => {
        await indexedDBService.deleteDnaCharacter(id);
        setDnaCharacters(prev => prev.filter(c => c.id !== id));
        if (selectedDnaId === id) setSelectedDnaId(null);
    };

    const handleSelectDna = (id: string | null) => {
        setSelectedDnaId(prev => prev === id ? null : id);
    };


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

        const startTime = Date.now();

        // v1.3: Create new AbortController for this generation
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setReasoningText(''); // Reset reasoning
        setCurrentImages([]);

        // v1.7: Start reasoning plan in parallel (don't await it to not block generation)
        geminiService.getReasoningPlan(editedPrompt || "Image generation", userApiKey, language)
            .then(plan => setReasoningText(plan));
        try {
            // v1.5.1: Fetch invisible reference images from Google if grounding is enabled
            let invisibleReferences: File[] = [];
            if (useGrounding && editedPrompt) {
                console.log('🌐 Google Search Grounding active - fetching reference images...');
                showToast(
                    language === 'it'
                        ? '🔍 Ricerca immagini di riferimento da Google...'
                        : '🔍 Fetching reference images from Google...',
                    'success'
                );
                invisibleReferences = await fetchInvisibleReferences(editedPrompt, 2);
                if (invisibleReferences.length > 0) {
                    console.log(`✅ Added ${invisibleReferences.length} invisible reference images from Google`);
                    showToast(
                        language === 'it'
                            ? `✅ ${invisibleReferences.length} immagini di riferimento trovate`
                            : `✅ ${invisibleReferences.length} reference images found`,
                        'success'
                    );
                } else {
                    console.log('⚠️ No reference images found from Google Search');
                }
            }

            // v1.5.1: Remove square brackets from prompt to avoid ambiguous keywords (e.g., "Coin" = money vs brand)
            let cleanedPrompt = useGrounding ? removeBracketsFromPrompt(editedPrompt) : editedPrompt;

            // v1.7: Inject DNA Character description and IMAGE reference if selected
            let dnaReferenceFile: File | null = null;
            if (selectedDnaId) {
                const selectedDna = dnaCharacters.find(c => c.id === selectedDnaId);
                if (selectedDna) {
                    console.log(`🧬 Injecting DNA Character: ${selectedDna.name}`);

                    // 1. Textual Injection
                    const dnaHeader = language === 'it'
                        ? `🧬 RIFERIMENTO DNA PERSONAGGIO (MANDATORIO): ${selectedDna.dna}. Il soggetto dell'immagine DEVE avere esattamente questo aspetto fisico e questi tratti somatici. Prompt Utente: `
                        : `🧬 CHARACTER DNA REFERENCE (MANDATORY): ${selectedDna.dna}. The subject of the image MUST have this exact physical appearance and facial features. User Prompt: `;
                    cleanedPrompt = `${dnaHeader}${cleanedPrompt}`;

                    // 2. Visual Reference Injection (if thumbnail exists)
                    if (selectedDna.thumbnailData) {
                        try {
                            dnaReferenceFile = dataURLtoFile(selectedDna.thumbnailData, `dna-ref-${selectedDnaId}.png`);
                            console.log(`📸 Added DNA visual reference: ${selectedDna.name}`);
                        } catch (e) {
                            console.error("Failed to convert DNA thumbnail to file", e);
                        }
                    }
                }
            }

            // v1.8: Studio Mode Prompt Injection
            if (appMode === 'studio') {
                const studioSnippets: string[] = [];

                if (studioConfig.camera) {
                    const camera = CAMERAS.find(c => c.id === studioConfig.camera);
                    if (camera) studioSnippets.push(camera.prompt);
                }
                if (studioConfig.lens) {
                    const lens = LENSES.find(l => l.id === studioConfig.lens);
                    if (lens) studioSnippets.push(lens.prompt);
                }
                if (studioConfig.focal) {
                    const focal = FOCAL_LENGTHS.find(f => f.id === studioConfig.focal);
                    if (focal) studioSnippets.push(focal.prompt);
                }
                if (studioConfig.lightDir) {
                    const light = LIGHT_DIRECTIONS.find(l => l.id === studioConfig.lightDir);
                    if (light) studioSnippets.push(light.prompt);
                }
                if (studioConfig.lightQuality) {
                    studioSnippets.push(studioConfig.lightQuality === 'soft' ? 'soft lighting' : 'hard contrast lighting');
                }
                if (studioConfig.lightColor) {
                    studioSnippets.push(`${studioConfig.lightColor} colored light`);
                }
                if (studioConfig.wardrobeTop) {
                    const top = WARDROBE_CATEGORIES.tops.find(t => t.id === studioConfig.wardrobeTop);
                    if (top) studioSnippets.push(top.prompt);
                }
                if (studioConfig.wardrobeOuter) {
                    const outer = WARDROBE_CATEGORIES.outerwear.find(o => o.id === studioConfig.wardrobeOuter);
                    if (outer) studioSnippets.push(outer.prompt);
                }
                if (studioConfig.wardrobeBottom) {
                    const bottom = WARDROBE_CATEGORIES.bottoms.find(b => b.id === studioConfig.wardrobeBottom);
                    if (bottom) studioSnippets.push(bottom.prompt);
                }
                if (studioConfig.wardrobeSet) {
                    const set = WARDROBE_CATEGORIES.sets.find(s => s.id === studioConfig.wardrobeSet);
                    if (set) studioSnippets.push(set.prompt);
                }
                if (studioConfig.shot) {
                    const shot = SHOTS.find(s => s.id === studioConfig.shot);
                    if (shot) studioSnippets.push(shot.prompt);
                }
                if (studioConfig.kit) {
                    const kit = PRODUCTION_KITS.find(k => k.id === studioConfig.kit);
                    if (kit) studioSnippets.push(kit.prompt);
                }

                if (studioSnippets.length > 0) {
                    cleanedPrompt = `${cleanedPrompt}, ${studioSnippets.join(', ')}`;
                }
            }

            // Merge user's visible references with invisible Google references and DNA references
            const allReferenceFiles = [...referenceImages, ...invisibleReferences];
            if (dnaReferenceFile) {
                allReferenceFiles.unshift(dnaReferenceFile); // Add DNA first to give it high priority
            }

            console.log(useGrounding && editedPrompt !== cleanedPrompt
                ? `🧹 Cleaned prompt for Gemini: "${cleanedPrompt}" (removed brackets)`
                : '');

            // v1.0: Calculate estimated cost
            const estimatedCost = geminiService.calculateEstimatedCost(
                selectedModel,
                selectedResolution,
                allReferenceFiles.length + (styleReferenceImage ? 1 : 0) + (structureImage ? 1 : 0)
            );
            console.log(`💰 Estimated cost: $${estimatedCost.toFixed(3)}`);

            // Batch generation: add prompt variations for each image to create diversity
            // NOTE: Gemini API doesn't support seed parameter for image models, so we add subtle prompt variations
            // v1.3 FIX: Generate sequentially instead of parallel to avoid NO_IMAGE errors with multiple references
            const hasMultipleReferences = allReferenceFiles.length > 1 || styleReferenceImage || structureImage;
            const imageDataUrls: string[] = [];

            for (let index = 0; index < numImagesToGenerate; index++) {
                let variantPrompt = cleanedPrompt;

                // Add subtle variations to prompt for batch generation (index > 0)
                if (numImagesToGenerate > 1 && index > 0) {
                    const keepSame = language === 'it'
                        ? ', mantieni stesso soggetto e aspetto'
                        : ', keep same subject appearance';

                    const variations = language === 'it'
                        ? [
                            ', prospettiva alternativa',
                            ', angolazione diversa',
                            ', composizione alternativa',
                            ', illuminazione variata'
                        ]
                        : [
                            ', alternate perspective',
                            ', different angle',
                            ', alternative composition',
                            ', varied lighting'
                        ];
                    variantPrompt = cleanedPrompt + variations[index % variations.length] + keepSame;
                }

                // Generate sequentially if there are multiple references/complex setup to avoid API overload
                // Otherwise parallel is fine
                if (hasMultipleReferences || selectedModel === 'gemini-3-pro-image-preview') {
                    const imageDataUrl = await geminiService.generateImage(
                        variantPrompt,
                        aspectRatio,
                        allReferenceFiles,
                        styleReferenceImage,
                        structureImage,
                        userApiKey,
                        negativePrompt,
                        seed,
                        language,
                        preciseReference,
                        selectedModel,
                        selectedResolution,
                        undefined,
                        controller.signal,
                        useGrounding // v1.4: Google Search Grounding
                    );
                    imageDataUrls.push(imageDataUrl);
                    console.log(`✅ Image ${index + 1}/${numImagesToGenerate} generated`);
                } else {
                    // Simple case: can generate in parallel
                    const generationPromises = Array(numImagesToGenerate).fill(0).map((_, idx) => {
                        let vPrompt = cleanedPrompt;
                        if (numImagesToGenerate > 1 && idx > 0) {
                            const keepSame = language === 'it'
                                ? ', mantieni stesso soggetto e aspetto'
                                : ', keep same subject appearance';

                            const variations = language === 'it'
                                ? [
                                    ', prospettiva alternativa',
                                    ', angolazione diversa',
                                    ', composizione alternativa',
                                    ', illuminazione variata'
                                ]
                                : [
                                    ', alternate perspective',
                                    ', different angle',
                                    ', alternative composition',
                                    ', varied lighting'
                                ];
                            vPrompt = cleanedPrompt + variations[idx % variations.length] + keepSame;
                        }
                        return geminiService.generateImage(
                            vPrompt,
                            aspectRatio,
                            allReferenceFiles,
                            styleReferenceImage,
                            structureImage,
                            userApiKey,
                            negativePrompt,
                            seed,
                            language,
                            preciseReference,
                            selectedModel,
                            selectedResolution,
                            undefined,
                            controller.signal,
                            useGrounding // v1.4: Google Search Grounding
                        );
                    });
                    imageDataUrls.push(...await Promise.all(generationPromises));
                    break; // Exit loop since we generated all in parallel
                }
            }

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

            // v1.4: Update usage stats
            const generationTime = (Date.now() - startTime) / 1000;
            setUsageStats(prev => ({
                imagesGenerated: prev.imagesGenerated + newImages.length,
                totalCost: prev.totalCost + estimatedCost,
                tokensUsed: prev.tokensUsed + 0, // Gemini Image API cost is per image, not tokens
                averageTime: (prev.averageTime * prev.imagesGenerated + generationTime) / (prev.imagesGenerated + 1),
                generationTimes: [...prev.generationTimes, generationTime]
            }));
        } catch (error: any) {
            console.error("Image generation failed", error);
            showToast(error.message || t.generationFailed, 'error');
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null; // v1.3: Clear abort controller
        }
    }, [referenceImages, styleReferenceImage, structureImage, preciseReference, userApiKey, aspectRatio, showToast, t.generationFailed, language, editedPrompt, negativePrompt, seed, numImagesToGenerate, selectedModel, selectedResolution, useGrounding]);

    // v1.3: Abort generation
    const handleAbortGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            showToast(language === 'it' ? '🛑 Generazione annullata' : '🛑 Generation cancelled', 'success');
        }
    }, [language, showToast]);

    // v1.3: Generate 4 variations of an image
    const handleGenerateVariations = useCallback(async (sourceImage: GeneratedImage) => {
        if (isLoading || variationsLoadingId) return;

        setVariationsLoadingId(sourceImage.id);

        try {
            const NUM_VARIATIONS = 4;
            const variations: GeneratedImage[] = [];

            showToast(
                language === 'it'
                    ? `🎲 Generando ${NUM_VARIATIONS} variazioni...`
                    : `🎲 Generating ${NUM_VARIATIONS} variations...`,
                'success'
            );

            // Generate variations sequentially with different seeds
            for (let i = 0; i < NUM_VARIATIONS; i++) {
                const randomSeed = Math.floor(Math.random() * 1000000).toString();

                const imageDataUrl = await geminiService.generateImage(
                    sourceImage.prompt,
                    sourceImage.aspectRatio,
                    [], // No reference images for variations
                    null, // No style
                    null, // No structure
                    userApiKey,
                    '', // No negative prompt
                    randomSeed,
                    language,
                    false,
                    sourceImage.model || selectedModel,
                    sourceImage.resolution || selectedResolution,
                    undefined,
                    undefined, // No abort signal for variations
                    false // v1.4: No grounding for variations
                );

                const thumbnailDataUrl = await createThumbnailDataUrl(imageDataUrl);

                const newImage: GeneratedImage = {
                    id: crypto.randomUUID(),
                    imageDataUrl,
                    thumbnailDataUrl,
                    prompt: sourceImage.prompt,
                    aspectRatio: sourceImage.aspectRatio,
                    timestamp: Date.now(),
                    model: sourceImage.model,
                    resolution: sourceImage.resolution,
                    seed: randomSeed
                };

                variations.push(newImage);
                console.log(`✅ Variation ${i + 1}/${NUM_VARIATIONS} generated`);
            }

            // Add variations to current images and history
            setCurrentImages(variations);
            setHistory(prev => [...variations, ...prev].slice(0, MAX_HISTORY_ITEMS));

            showToast(
                language === 'it'
                    ? `✅ ${NUM_VARIATIONS} variazioni generate!`
                    : `✅ ${NUM_VARIATIONS} variations generated!`,
                'success'
            );
        } catch (error: any) {
            console.error("Variation generation failed", error);
            showToast(error.message || (language === 'it' ? 'Generazione variazioni fallita' : 'Variation generation failed'), 'error');
        } finally {
            setVariationsLoadingId(null);
        }
    }, [isLoading, variationsLoadingId, language, userApiKey, selectedModel, selectedResolution, showToast]);

    // v1.3: Copy settings from an image
    const handleCopySettings = useCallback((sourceImage: GeneratedImage) => {
        setEditedPrompt(sourceImage.prompt);
        setAspectRatio(sourceImage.aspectRatio);
        if (sourceImage.model) setSelectedModel(sourceImage.model);
        if (sourceImage.resolution) setSelectedResolution(sourceImage.resolution);
        if (sourceImage.seed) setSeed(sourceImage.seed);
        if (sourceImage.negativePrompt) setNegativePrompt(sourceImage.negativePrompt);

        showToast(
            language === 'it'
                ? '📋 Parametri copiati!'
                : '📋 Settings copied!',
            'success'
        );
    }, [language, showToast]);

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
                preciseReference,
                image.model || selectedModel,
                image.resolution || selectedResolution,
                undefined,
                undefined,
                false // v1.4: No grounding for recreate
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

    // v1.1: Upscale image using Nano Banana Pro 3.0
    const handleUpscale = useCallback(async (image: GeneratedImage, resolution: '2k' | '4k') => {
        const imageDataUrl = image.imageDataUrl || image.thumbnailDataUrl;
        if (!imageDataUrl) return;

        setUpscalingImageId(image.id);

        try {
            const upscaledDataUrl = await geminiService.upscaleImage(
                imageDataUrl,
                resolution,
                userApiKey,
                language
            );

            // Create new upscaled image entry
            const thumbnailDataUrl = await createThumbnailDataUrl(upscaledDataUrl);
            const upscaledImage: GeneratedImage = {
                ...image,
                id: `${image.id}-upscaled-${resolution}-${Date.now()}`,
                imageDataUrl: upscaledDataUrl,
                thumbnailDataUrl,
                prompt: `[${resolution.toUpperCase()} Upscaled] ${image.prompt}`,
            };

            // Add to current images and history
            setCurrentImages(prev => [...prev, upscaledImage]);
            setHistory(prev => [upscaledImage, ...prev].slice(0, MAX_HISTORY_ITEMS));

            showToast(t.upscaleSuccess, 'success');
        } catch (error: any) {
            console.error('Upscaling error:', error);
            showToast(error.message || t.upscaleFailed, 'error');
        } finally {
            setUpscalingImageId(null);
        }
    }, [userApiKey, language, showToast, t.upscaleSuccess, t.upscaleFailed]);

    // Preset handlers
    const handleSavePreset = useCallback((name: string, prompt: string, negativePrompt?: string) => {
        try {
            presetsService.addPreset(name, prompt, negativePrompt);
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
                <Header theme={theme} toggleTheme={toggleTheme} onOpenSettings={() => setIsSettingsOpen(true)} onOpenShortcuts={() => setIsShortcutsOpen(true)} onOpenPromptLibrary={() => {
                    const libraryWindow = window.open('./prompt-library.html', '_blank', 'width=1400,height=900');
                    if (libraryWindow) {
                        libraryWindow.addEventListener('load', () => {
                            libraryWindow.postMessage({ type: 'SET_LANGUAGE', language }, '*');
                        });
                    }
                }} />
                <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 pt-4 pb-32 lg:pb-28 overflow-y-auto lg:overflow-hidden">
                    {/* --- Left Sidebar (only references/style/structure) --- */}
                    <aside className="w-full lg:w-[280px] flex-shrink-0 bg-light-surface/50 dark:bg-dark-surface/30 backdrop-blur-xl rounded-3xl overflow-y-auto h-full custom-scrollbar">
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
                            selectedStylePreset={selectedStylePreset}
                            setSelectedStylePreset={setSelectedStylePreset}
                            selectedLighting={selectedLighting}
                            setSelectedLighting={setSelectedLighting}
                            selectedCamera={selectedCamera}
                            setSelectedCamera={setSelectedCamera}
                            selectedFocus={selectedFocus}
                            setSelectedFocus={setSelectedFocus}
                            selectedModel={selectedModel}
                            setEditedPrompt={setEditedPrompt}
                            preciseReference={preciseReference}
                            setPreciseReference={setPreciseReference}
                            useGrounding={useGrounding}
                            setUseGrounding={setUseGrounding}
                            dnaCharacters={dnaCharacters}
                            selectedDnaId={selectedDnaId}
                            onSelectDna={handleSelectDna}
                            onManageDna={() => setIsDnaModalOpen(true)}
                            appMode={appMode}
                            setAppMode={setAppMode}
                            studioConfig={studioConfig}
                            setStudioConfig={setStudioConfig}
                        />
                    </aside>

                    {/* --- Main Content --- */}
                    <div className="flex-1 flex flex-col gap-2 lg:gap-6 min-w-0 h-full">
                        <div className="flex-1 min-h-0 bg-light-surface/50 dark:bg-dark-surface/30 rounded-3xl overflow-hidden">
                            <ImageDisplay images={currentImages} isLoading={isLoading} onDownload={handleDownload} onZoom={handleZoom} onEdit={setEditingImage} onReroll={handleReroll} onToggleFavorite={handleToggleFavorite} onUpscale={handleUpscale} upscalingImageId={upscalingImageId} onSaveDna={handleSaveImageAsDna} reasoningText={reasoningText} />
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
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${sidebarTab === 'history'
                                        ? 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm'
                                        : 'text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'
                                        }`}
                                >
                                    History
                                </button>
                                <button
                                    onClick={() => setSidebarTab('presets')}
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${sidebarTab === 'presets'
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
                                        onGenerateVariations={handleGenerateVariations}
                                        variationsLoadingId={variationsLoadingId}
                                        onCopySettings={handleCopySettings}
                                        onSaveDna={handleSaveImageAsDna}
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
                    onAbortGeneration={handleAbortGeneration}
                    onEnhancePrompt={handleEnhancePrompt}
                    onGenerate3Prompts={handleGenerateCreativePrompts}
                    isLoading={isLoading}
                    isEnhancing={isEnhancing}
                    hasReferences={referenceImages.length > 0 || !!styleReferenceImage || !!structureImage}
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
                />

                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveApiKey} currentApiKey={userApiKey} />
                <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
                <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
                <DnaCharacterModal
                    isOpen={isDnaModalOpen}
                    onClose={() => setIsDnaModalOpen(false)}
                    characters={dnaCharacters}
                    selectedId={selectedDnaId}
                    onSelect={handleSelectDna}
                    onSave={handleSaveDna}
                    onDelete={handleDeleteDna}
                    isLoading={isDnaLoading}
                />

                {/* v1.4: Usage Tracker Modal */}
                <UsageTracker
                    stats={usageStats}
                    isVisible={showUsageTracker}
                    onClose={() => setShowUsageTracker(false)}
                    language={language}
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
                                <ZoomableImage
                                    src={zoomedImage.imageDataUrl || zoomedImage.thumbnailDataUrl!}
                                    alt={zoomedImage.prompt}
                                />

                                {/* Top bar with counter, download and close */}
                                <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
                                    {/* Counter */}
                                    {showNavigation && (
                                        <div className="px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium">
                                            {nav.current} / {nav.total}
                                        </div>
                                    )}
                                    <div className={`flex gap-2 ${!showNavigation ? 'ml-auto' : ''}`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSaveImageAsDna(zoomedImage); }}
                                            className="p-2 rounded-full bg-black/60 text-white hover:bg-brand-purple transition-colors"
                                            title="🧬 Save as DNA Character"
                                        >
                                            <span className="text-xl">🧬</span>
                                        </button>
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
