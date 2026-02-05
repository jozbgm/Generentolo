# 📋 Changelog - Generentolo PRO

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
