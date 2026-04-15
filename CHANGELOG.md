# 📋 Changelog - Generentolo PRO

## [2.5.0] - 2026-04-15
### Added
- **Cinematic Storyboard v2** — completamente riscritto con flusso theme-first: modale dedicata per scrivere il tema creativo prima di avviare la generazione. Selezione shot count (3/6/9/12). Struttura rigida 3×3 orientata al cinema pubblicitario. Generi ADV-focused: ADV, Fashion, Editorial, Beauty, Make-up, Luxury, Lifestyle, Mockup, Food, Automotive, Corporate, Sport, E-commerce, Street + cinematici.
- **Lock/Unlock per singola card** — ogni shot dello storyboard può essere bloccato per escluderlo dalla rigenerazione globale. Bordo giallo quando bloccato.
- **Rigenera singolo shot** — icona regen per shot con spinner live; riapre la modale tema per il singolo shot selezionato.
- **Form Transfer** — toggle nella FloatingActionBar (visibile solo con reference caricate). Analizza la forma/silhouette del soggetto nella prima reference tramite Gemini Vision e la trasferisce alla nuova generazione. Funziona per qualsiasi tipo di soggetto: persone, scarpe, architetture, oggetti. Icona ShapeIcon (esagono).
- **Two-step AI analysis per Style e Structure reference** — le immagini di reference per stile e struttura vengono ora analizzate da Gemini Vision prima della generazione. La descrizione testuale risultante (palette colori, mood, composizione spaziale, ecc.) viene iniettata nel prompt per risultati molto più fedeli. Cache WeakMap per evitare chiamate ridondanti su generazioni multiple.
- **Focus & Depth nella tab Studio** — nuova sezione collassabile con 5 preset: Bokeh Background, Tack Sharp, Cinematic Depth, Tilt-Shift, Soft Focus.

### Removed
- **Physics Controls dropdown** — rimosso il menu a tendina "Physics Controls" dalla sidebar (Lighting, Camera, Focus). Le funzionalità uniche (Focus) sono state migrate nella tab Studio. Lighting e Camera erano ridondanti rispetto a Studio.

### Fixed
- Prevenuti console timer warning da timer leaked in generazione
- Corretti cursor jump e text break nell'editing del prompt nella FAB
- Propagazione corretta di `SAFETY_SETTINGS_PERMISSIVE` a tutte le chiamate API Gemini

## [2.4.0] - 2026-04-03
### Added
- **Thinking Level selector** (NB2 / PRO only): Nuovo controllo nel model group della FloatingActionBar per selezionare la profondità di ragionamento interno del modello. ⚡ Fast (minimal, default), 🧠 Balanced (medium), 🔬 Deep (high). Visibile solo quando è selezionato NB2 o PRO.
- **Video Reference input** (NB2 only): Nuova zona di upload video nella sidebar (visibile solo con NB2 selezionato). Supporta mp4, mov, webm. Genera automaticamente una thumbnail frame dal video al momento dell'upload. Il video viene passato come parte inline alla chiamata di generazione prima delle immagini di reference.
- **Quick Edit bar**: Barra di editing rapido sempre visibile sotto l'immagine generata. Permette di digitare un'istruzione testuale ("make the sky orange", "add fog") e applicarla all'immagine corrente con un click o Enter. Responsive su mobile.
- **Outpaint**: Pulsante expand nella hover bar di ogni immagine. Apre un menu a griglia con 4 direzioni (↑↓←→). Espande il canvas del 50% nella direzione scelta, riempie l'area bianca con il modello AI continuando la scena in modo seamless.

## [2.3.0] - 2026-04-03
### Changed
- **Angles — prompt engine v4.0**: Riscritto `anglePromptService.ts` con vocabolario cinematografico research-backed (natural language + gradi combinati, terminologia Gemini-native: `rear view`, `bird's-eye view`, `three-quarter angle`, ecc.), struttura prompt a 5 layer, aggiunta simulazione lente fotografica in base allo zoom. Il cognitive step ora estrae descrizione soggetto+ambiente dalla reference per constraint di consistency più specifici.
- **Angles — header badge compatto**: Badge posizione (es. "FRONT-R • EYE-LEVEL") ridotto (`text-[9px]`, padding minimo) per evitare che "3D Angles" vada a capo.
- **SettingsModal background**: Rimosso colore hardcoded bianco (`bg-[#f8f8f6]/90`) — ora usa `bg-light-surface/95 dark:bg-dark-surface/95` per rispettare il tema.

### Fixed
- **[CRITICO] AbortSignal in variazioni**: Le variazioni ora possono essere annullate correttamente tramite il pulsante Stop.
- **[CRITICO] Race condition queue**: Aggiunto mutex `isProcessingQueueRef` che previene la doppia esecuzione di task dalla coda.
- **[CRITICO] AbortSignal in Angles**: `generateCognitiveAnglePrompt` ora accetta e propaga un `AbortSignal`; anche le chiamate `generateImage` nella tab Angles usano il controller corretto.
- **[CRITICO] Object URL leak in GenerAngles**: Sostituita la `useMemo` con `useEffect + useState` per la gestione dell'URL della reference image — l'URL viene ora revocato correttamente al cleanup.
- **Thumbnail fallback**: In caso di errore nella creazione del thumbnail, si usa `undefined` invece del full image DataURL, prevenendo overflow dello storage.
- **Enhancement feedback**: Se Auto-Enhance fallisce, viene mostrato un toast esplicito invece di un silent failure.
- **Storage quota**: In caso di `QuotaExceededError` su localStorage, la history viene ridotta automaticamente al 50% prima di mostrare l'errore.

### Changed
- **Angles — prompt sempre in inglese**: `generateCognitiveAnglePrompt` produce sempre prompt in inglese per l'API di generazione (requisito dell'API), indipendentemente dalla lingua dell'UI.
- **Angles — modello aggiornato**: Il modello di analisi cognitiva è passato da `gemini-2.0-flash` a `gemini-2.5-flash` per migliore qualità di analisi visiva.
- **PRO model warning**: Badge `⚠ UNSTABLE` nel model selector per segnalare i problemi di stabilità API del modello `gemini-3-pro-image-preview`.
- **Google Search retry**: `searchGoogleImages` ora ritenta fino a 2 volte con exponential backoff su errori transitori (429, 5xx).
- **Debounce prompt input**: L'input del prompt ora aggiorna il parent state dopo 150ms di inattività, riducendo i re-render durante la digitazione veloce.
- **Aria labels**: Aggiunti `aria-label` ai 3 slider della tab Angles (Orbit, Tilt, Zoom).
- **Pricing README**: Aggiornata la tabella prezzi con i valori corretti per tutti e 3 i modelli (aprile 2026).

## [2.2.0] - 2026-04-03
### Added
- **Accent Color Picker**: New swatch icon in the header allows changing the app's accent color on the fly. Includes 8 curated presets (Amber, Lime, Violet, Rose, Sky, Emerald, Orange, Slate), a custom hex input, a native color wheel, and a "Reset to default" option. Choice persists across sessions via localStorage.

### Changed
- **Amber palette as new default**: Replaced the lime/acid-green accent (`#c8f23a`) with a warm amber (`#f59e0b`) for a more professional and refined look across both dark and light modes.
- **Dynamic glow system**: Replaced all hardcoded `rgba()` glow values in Tailwind arbitrary classes with CSS helper classes (`.glow-accent-sm/md/lg/xl`, `.shadow-floating-bar`) driven by `--color-brand-yellow-rgb`, ensuring glows update instantly when the accent color changes.

## [2.1.0] - 2026-03-17
### Changed
- **FloatingActionBar visual refresh**: Selected pills (aspect ratio, count, model, resolution) now show a persistent lime tint at rest; separators updated to brand-yellow/20; Auto-Enhance toggle gains a ring when active; subtle ambient glow on bar background.
- **Tailwind opacity variants**: Fixed `brand-yellow` color definition to support opacity modifiers (`/10`, `/20`, etc.) via RGB channel variables.

### Removed
- **Creative Prompts panel**: Removed the panel and its Generate Suggestions button, along with all related state, handlers, and dead code (`generatePromptsFromImage` ~150 lines).

### Fixed
- **Accessibility**: Added `role="dialog"`, `aria-modal`, `aria-labelledby` to all 4 modals (HelpModal, ShortcutsModal, InpaintEditor, DnaCharacterModal); added `aria-label` to all icon-only buttons (header, toast, lightbox mobile nav, modal close buttons).
- **Touch targets**: Increased close button padding in ShortcutsModal and Toast to meet 44px minimum.
- **Production cleanup**: Removed 6 debug `console.log` calls across App.tsx, QueuePanel, and googleSearchService.
- **Null guard**: Added base64 validation in storyboardService to prevent silent failures on malformed image data.
- **Queue button border**: Replaced hardcoded `#c8f23a55` with CSS variable-based `color-mix()`.

## [2.0.0] - 2026-02-27 🍌
### Added
- **🍌 Nano Banana 2 (Gemini 3.1 Flash Image)**: Third AI model integrated into the application.
  - **API Model**: `gemini-3.1-flash-image-preview` — combines Flash speed with Pro-level quality.
  - **Native Resolution**: Supports 1K/2K imageSize, same as Pro model.
  - **Google Search Grounding**: Full support for real-time web search integration.
  - **Smart Timeout**: 7-minute API timeout (between Flash 5min and Pro 10min).
  - **Auto-Fallback**: Automatic fallback to Flash when blocked with "OTHER" safety reason.
  - **Prompt Optimization**: Multi-image prompt optimization for complex scenarios.
- **🎛️ Triple Model Selector**: New dropdown menu with three options: PRO, FLASH, and Nano Banana 2.
  - Emerald/teal color scheme for NB2 badge and indicators.
  - Resolution selector visible for both PRO and NB2 models.
  - Sequential generation enabled for NB2 (same as PRO).
- **📊 Updated Badges**: NB2 model badge displayed in FloatingActionBar, QueuePanel, and ReferencePanel.

### Changed
- **Version Bump**: 1.9.9 → 2.0.0 (milestone release).
- **`isAdvancedModel()` Helper**: New utility function in geminiService to avoid code duplication for Pro/NB2 feature checks.

## [1.9.9] - 2026-02-05
### Added
- **🧬 DNA Character v2.0**: Massive upgrade to character consistency.
  - **Multi-Image DNA Extraction**: Support for analyzed a subject from up to 14 different angles using **Gemini 3.0 Flash**.
  - **Multi-DNA Selection**: Ability to select multiple DNA characters simultaneously.
  - **Source Gallery**: Expanded view in DNA Manager to review all angles provided for a character.
- **⚡ Stability & Performance**:
  - **Auto-Resizing**: Intelligent image optimization (1024px) to prevent API payload errors and speed up extraction.
  - **Optimized Storage**: Reduced IndexedDB footprint for saved characters.
- **🖼️ Improved DNA UI**:
  - **Batch Upload**: New mobile-friendly interface for multiple angles.
  - **Active State Indicators**: Visual feedback in sidebar and modal.
- **🧠 Advanced Prompt Infiltration**: Seamless concatenation of multiple subject traits for G3 Pro.

## [1.9.8] - 2026-01-27
### Added
- **Perspective Studio (Angles v2)**: Completely overhauled the Angles feature with a cinematic 3D viewport, CSS-based 3D gizmo, and high-fidelity controls.
- **Batch Generation**: Added "12 Precision Shots" mode to automatically generate a comprehensive set of cinematic angles.
- **Visual Feedback**: Implemented dynamic zoom scaling and a "laser" depth connector in the 3D viewport.
- **Premium UI**: Integrated a sleek, dark glassmorphism aesthetic for the Perspective Studio controls.
- **Aspect Ratio Detection**, **Optimized Prompts**, and **Synchronized Loading States**.

## [1.9.7] - 2026-01-27 🎨
### Added
- **📋 Smart Prompt Actions**: Integrated Copy, Paste, and Clear buttons directly inside the prompt box.
- **🍏 Apple-Style Switch**: New high-fidelity toggle with yellow indicator for Auto-Enhance.

### Changed
- **✨ Refined Floating Action Bar**: Major UI overhaul for the main control center.
  - **Always Expanded**: removed collapsed state for faster access.
  - **Compact Layout**: Single-line bottom controls with harmonized grouping.
  - **Icon-Only States**: Stop (✕) and Queue (+) buttons become compact icons during generation.
  - **Vibrant Loading Bar**: Restored the signature gradient loading bar with perfect border radius clipping.
- **🤫 Silent Queueing**: "Add to Queue" is now silent (removed toast notification) for smoother flow.
- **🎨 Visual Polish**: Custom gray scrollbars for text inputs (replacing browser defaults) and improved button alignment.

### Fixed
- **📝 Live Prompt Editing**: You can now edit the prompt while a generation is running (text input is no longer disabled).
- **🛠️ Application Stabilization**: Fixed critical JSX syntax errors in `App.tsx` that were breaking the sidebar and mode switching (Classic/Studio/Angles).
- **📐 GenerAngles Restoration**: Restored the missing `GenerAngles` component and fixed its integration in the sidebar.

## [1.9.6] - 2026-01-26 🚀
### Added
- **🛠️ Full Studio Integration in Auto-Enhance**: The Art Director AI is now fully aware of Camera, Lighting, and Production Kit settings.
- **✨ Intelligent Kit Morphing**: Production Kits (Billboard, Urban Cut, BTS) are now woven into the creative narrative of the prompt instead of just appended as tags.
- **⏳ Sidebar Generation Queue**: Relocated the queue from an intrusive floating bar to a dedicated, scrollable sidebar panel for better workspace management.
- **🌐 Unified Quick-Controls**: Google Search Grounding and Precise Reference toggles are now unified in the floating action bar for instant access.

### Changed
- **⏹️ Smaller Stop Button**: Redesigned the "Stop" (formerly Abort) button to be more elegant and less visually dominant.
- **Improved UI Semantics**: Renamed "Abort" to "Stop" across the entire application (EN/IT) for better clarity.

### Fixed
- **⚡ handleGenerate Dependency Bug**: Fixed a critical React bug where generation settings (enhance, studio, dna) weren't correctly picked up due to stale closures.
- **🔄 Studio Kit Desynchronization**: Fixed a logic error in `StudioPanel` where Production Kits were not correctly deselecting when switching between them.
- **Safe Abort Logic**: Fixed race conditions during generation cancellation to ensure the queue is properly cleared.
- **Console Optimization**: Removed unused variables and fixed lint warnings in `App.tsx` and `FloatingActionBar.tsx`.

## [1.9.5] - 2026-01-23 🎬
### Added
- **🎬 Cinematic Storyboard System**: Generate professional 9-frame storyboards with thematic continuity.
- **🔄 Generation Queue**: Support for queuing multiple generations.
- **🧬 DNA Character Consistency**: Initial character profiling engine.

[... previous versions history ...]
