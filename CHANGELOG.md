# 📋 Changelog - Generentolo PRO

## [1.9.7] - 2026-01-26 🎨
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
