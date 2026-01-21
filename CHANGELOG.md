# Changelog - Generentolo PRO

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.9.0] - 2026-01-21 🪄

### 🎉 MAJOR RELEASE - Auto-Enhance PRO & UI Streamlining

This update focuses on streamlining the prompt optimization workflow, moving from manual enhancement to a more intelligent, automated system.

### ✨ Added
- **Auto-Enhance System**: New toggle switch that automatically optimizes your prompt using AI before every generation.
- **Enhanced Always-Visible Precise Reference**: The Precise Reference feature is now always visible in the toolbar for faster access, with smart tooltips for image requirements.

### 🎨 Changed
- **Manual Buttons Removal**: Removed manual "Enhance Prompt" and "3 Prompts" buttons to reduce interface clutter.
- **Improved Workspace Layout**: Optimized the floating bar to accommodate new switches while maintaining a clean aesthetic.

---

## [1.8.0] - 2025-12-29 🎞️

### 🎉 MAJOR RELEASE - Virtual Studio & Cinema Mode

This major update introduces professional-grade cinematography controls, allowing users to simulate high-end film production environments directly within Generentolo.

### ✨ Added

#### Cinema Studio Mode
- **Cinema Rig**:
  - Professional camera model selection (Arri Alexa 35, Red V-Raptor, Sony Venice 2, IMAX 70mm, etc.)
  - High-end lens types including Anamorphic, Zeiss Ultra Primes, and vintage Helios 44-2 lenses
  - Precise focal length controls (14mm to 135mm telephoto)
- **Light Forge**:
  - Dynamic light direction controls (God rays, Rim lighting, Rembrandt style, Bottom/Horror)
  - Light quality toggle (Soft/Diffused vs Hard/Sharp)
  - Advanced color picker for atmospheric lighting effects
- **Wardrobe Studio**:
  - Gendered clothing presets (Tops, Outerwear, Bottoms, Full Sets)
  - Fashion-forward categories from high-end designer aesthetics
- **Production Shots**:
  - One-click grid for standard cinematic shot types (Frontal, Profile, Hero Low-Angle, Bird's eye)
- **Production Kits**:
  - **Urban Cut**: Paparazzi street photography simulation
  - **BTS**: "Behind the Scenes" meta-generation showing crew and equipment
  - **Billboard Ad**: High-end commercial commercial look

#### UI/UX Enhancements
- **Mode Toggle**: Seamlessly switch between Classic (Standard) and Studio (Pro) modes
- **Refined Scrollbars**: Global and local custom scrollbar styling for a cleaner sidebar interface
- **Optimized Layout**: Better sidebar containment for complex studio configurations

### 🎨 Changed
- Sidebar components refactored for better performance and conditional rendering
- Unified Studio state management for consistent prompt injection
- Enhanced prompt building logic to integrate technical cinematic parameters

---

## [1.0.0] - 2025-11-21 🚀

### 🎉 MAJOR RELEASE - Nano Banana PRO 3.0 Integration

This is the first major release of Generentolo PRO, featuring support for Google's Nano Banana PRO (Gemini 3 Pro Image) model with 4K resolution, text-in-image capabilities, and professional-grade output.

### ✨ Added

#### Dual Model System
- **Flash Model** (gemini-2.5-flash-image)
  - Fast and economical ($0.04/image)
  - Perfect for rapid iterations and testing
  - 2K maximum resolution (2048×2048)
  - 2-3 second generation time

- **PRO Model** (gemini-3-pro-image-preview) - Nano Banana PRO 3.0
  - Professional-grade quality with 4K support
  - Advanced text rendering with legible fonts
  - Google Search grounding for fact-checking
  - Support for up to 14 reference images
  - $0.13-$0.24 per image (based on resolution)

#### Resolution Selector (PRO Model Only)
- **1K** (1024×1024) - Standard quality
- **2K** (2048×2048) - High quality
- **4K** (4096×4096) - Ultra quality ✨
- Dynamic UI that only shows when PRO model is selected
- Visual feedback with gradient highlights
- Smart resolution recommendations

#### Real-Time Cost Calculator
- Live cost estimation **before** generation
- Dynamic updates based on:
  - Selected model (Flash ↔ PRO)
  - Resolution (1K → 2K → 4K)
  - Number of reference images (up to 14)
- Beautiful gradient badge display (yellow-magenta)
- Transparent pricing with detailed breakdown
- No API bill surprises

#### Text-in-Image System (PRO Model Only)
- Add text directly to generated images
- **Position Controls**:
  - Top - Text at the top of the image
  - Center - Centered text
  - Bottom - Text at the bottom
  - Overlay - Text overlaid on main subject
- **Font Styles**:
  - Bold - Strong, impactful text
  - Italic - Elegant, flowing text
  - Calligraphy - Artistic, handwritten style
  - Modern - Clean, sans-serif font
  - Vintage - Retro, classic typography
- Automatic text contrast optimization
- Smart toggle - only visible when PRO model selected
- Perfect for marketing materials, infographics, menus

#### Enhanced Reference Image System
- Increased limit from 4 to **14 reference images** (PRO model)
- Better multi-image combining algorithm
- Support for complex compositions
- Visual counter showing available slots
- Drag & drop support for all 14 slots
- Better memory management for large image sets

### 🎨 Changed

#### UI/UX Improvements
- Model selector with intuitive icons:
  - ⚡ Flash - for speed
  - ⭐ PRO - for quality
- Resolution buttons with clear labels and tooltips
- Cost estimator badge with gradient styling
- Text-in-image panel with purple gradient accent
- **Precise Reference** indicator:
  - Changed from text "Precise Reference" to 👨 emoji
  - Fixes mobile layout overflow
  - Cleaner, more compact design
  - Tooltip on hover for explanation
- **Generate button** styling:
  - Consistent yellow-magenta gradient on all screen sizes
  - Fixed mobile/desktop styling discrepancy
  - Unified hover effects and animations
- Smooth animations and transitions throughout
- Better mobile responsiveness

#### Translations
- Complete Italian/English localization for all PRO features:
  - Model names and descriptions
  - Resolution labels and tooltips
  - Text-in-image controls
  - Cost calculator labels
  - Error messages and warnings
- Maintained consistency across all UI elements
- Professional tone for both languages

### 🔧 Technical Improvements

#### Type System
- New TypeScript types:
  - `ModelType`: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'
  - `ResolutionType`: '1k' | '2k' | '4k'
  - `TextInImageConfig`: Interface for text-in-image settings
- Extended `GeneratedImage` interface with:
  - `model?: ModelType` - Tracks which model was used
  - `resolution?: ResolutionType` - Stores resolution setting
  - `estimatedCost?: number` - Records generation cost

#### Services
- **geminiService.ts**:
  - New `calculateEstimatedCost()` function
    - Accurate PRO model pricing
    - Reference image cost calculation
    - Prompt token cost estimation
  - Enhanced `generateImage()` function with 3 new parameters:
    - `model: ModelType` - Select Flash or PRO
    - `resolution: ResolutionType` - Choose output resolution
    - `textInImage?: TextInImageConfig` - Add text to image
  - Text-in-image prompt guidance system
  - Resolution configuration for PRO model
  - Better error handling for quota exceeded

#### Components
- **FloatingActionBar.tsx**:
  - Added PRO feature controls
  - Model selector with state management
  - Resolution selector (conditional rendering)
  - Text-in-image configuration panel
  - Cost display integration
- **App.tsx**:
  - New state management for:
    - `selectedModel: ModelType`
    - `selectedResolution: ResolutionType`
    - `textInImageConfig: TextInImageConfig`
  - Updated `handleGenerate()` with cost logging
  - Props passing to FloatingActionBar
  - Metadata storage for generated images

#### Build System
- Package name updated to `generentolo-pro`
- Version bumped to 1.0.0
- Dependencies verified and updated
- Build optimization for production
- Clean dist output structure

### 🐛 Fixed

- Text overflow on mobile for "Precise Reference" label
- Generate button gradient inconsistency between mobile and desktop views
- Reference image limit validation (now properly handles 14 images)
- Cost calculator decimal precision (3 decimal places)
- PRO model API parameter formatting
- Resolution selector visibility logic
- Text-in-image panel z-index issues
- Tooltip positioning on small screens
- localStorage persistence for new model/resolution settings

### 📦 Package Updates

- `package.json`:
  - Name: `generentolo-pro`
  - Version: `1.0.0`
  - Type: `module`
  - Ready for production deployment

### 🔒 Security

- API key validation for PRO model (requires billing)
- Cost warnings for expensive operations (>$0.50)
- Rate limiting considerations documented
- Secure handling of reference images (up to 14)

---

## [0.9.1] - 2025-01-XX

### Added
- Revolutionary Prompt Enhancement System v2.0
- Smart Contextual Hints
- CO-STAR Framework integration
- Self-evaluation quality scoring

### Changed
- Removed "already optimal" messages
- Aggressive retry logic
- Enhanced image captioning

---

## [0.9.0] - 2025-01-XX

### Added
- Bold Creative Redesign
- Modern color palette (Banana Yellow + Magenta + Cyan)
- Anthracite grey dark mode

### Changed
- Enhanced prompt enhancement system
- UI/UX improvements
- Better layout alignment

---

## [0.8.1] - 2025-01-XX

### Added
- Favorites system with star bookmarks
- History filtering (All / Favorites)
- Persistent favorites across sessions

---

## [0.7.0] - 2025-01-XX

### Added
- Precise Reference Mode with toggle
- Maximum facial fidelity feature

### Changed
- Branding update ("Generentolo is generating")
- Optimized prompt enhancement

---

## [0.6.0] - 2025-01-XX

### Added
- Prompt Presets System
- Infinite Scroll History
- Image Navigation in Lightbox
- Prompt Textarea enhancements

---

## [0.5.0] - 2025-01-XX

### Added
- Micro-animations throughout UI
- Hero Generate Button with glow
- Progress bar with shimmer
- Interactive hover effects

---

## [0.4.0] - 2025-01-XX

### Fixed
- Mobile scroll issues
- Improved padding for floating bar
- Repository branding updates

---

## [0.3.0] - 2025-01-XX

### Added
- Floating Action Bar
- Mobile optimization
- Expanded Mode
- Advanced Panel overlay

---

## [0.2.0] - 2025-01-XX

### Added
- Structure Guide (ControlNet-like)
- Auto Aspect Ratio
- Image Upscaling (2x/4x)
- Quota tracking
- Before/after comparison slider

---

## [0.1.0] - 2024-12-XX

### Added
- Initial release
- Multi-reference image generation
- Style reference support
- Professional tools with AI-generated options
- Aspect ratio controls
- Negative prompts & seed control
- Inpainting functionality
- Bilingual interface (EN/IT)
- History management
- Keyboard shortcuts

---

## Legend

- ✨ **Added**: New features
- 🎨 **Changed**: Changes to existing functionality
- 🐛 **Fixed**: Bug fixes
- 🗑️ **Deprecated**: Soon-to-be removed features
- 🔒 **Security**: Security improvements
- 📦 **Package**: Package/dependency updates

---

## Links

- **Repository**: [github.com/jozbgm/generentolo-pro](https://github.com/jozbgm/generentolo-pro)
- **Live Demo**: [dugongo.it/generentolo](https://www.dugongo.it/generentolo/)
- **Report Issues**: [github.com/jozbgm/generentolo-pro/issues](https://github.com/jozbgm/generentolo-pro/issues)
