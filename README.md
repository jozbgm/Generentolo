# 🎨 Generentolo PRO v1.9.7 DIRECTORATE

**Professional AI-Powered Image Generation & Storyboarding Suite**

A sophisticated web application for generating ultra-high-quality images using Google's Gemini models (Flash & **Gemini 3 Flash**) with **Advanced Native 2K/4K Generation**, **Cinematic Storyboarding**, **Generation Queue**, **DNA Character Consistency**, **advanced Google Search Grounding**, and professional production controls.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://www.dugongo.it/generentolo/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 **NEW v1.9.5: DIRECTORATE EDITION - Storyboard & Queue**
- **🎬 Cinematic Storyboard System** - Transform ONE reference image into a technical 9-frame storyboard with perfect continuity.
- **🔄 Smart Generation Queue** - Queue multiple tasks and monitor progress while you keep designing.
- **⚡ Gemini 3 Flash Master** - Optimized prompts for the latest G3 Flash engine.
- **🌊 Fluid Production UI** - Enhanced navigation and production shortcuts in the workspace.

## 🎯 **NEW v1.9.0: Auto-Enhance PRO & UI Streamlining**
- **✨ Auto-Enhance System** - New toggle switch that automatically optimizes your prompt using AI before every generation.
- **🪄 Streamlined UI** - Removed redundant manual enhancement buttons for a cleaner, faster workflow.
- **👨 Always-Visible Precise Reference** - Instant access to facial fidelity controls directly from the toolbar.

## 🎯 **NEW v1.7.1: DNA Profiling stability**
- 🚧 Improved stability for DNA extraction.

## 🎯 **NEW v1.7.0: DNA Character Consistency**
- **🧬 DNA Profile Extraction** - Capture the unique physical traits of a character from any image.
  - Analyzes face shape, hair style, eye color, skin tone, and more.
  - Stores a detailed "DNA Description" that acts as a consistent reference.
- **📂 Character Management System** - Specialized local storage for your characters.
  - Create and name custom characters with circular visual thumbnails.
  - Quick-selection bar in the Reference Panel for instant access.
  - Persistent storage across sessions using IndexedDB.
- **🧠 Automatic "DNA" Infiltration** - Seamlessly inject character traits into your prompts.
  - Works with BOTH Flash and PRO models.
  - Ensures the character remains the same across different scenes, outfits, and contexts.
- **✨ PRO Workflow**: Generate a character you like, then save its DNA to use it in your next 100 images.


## ✨ Features

### 🎯 **NEW v1.5.0: Explicit Search Keyword Control**
- **🔍 Square Bracket Syntax** - Precise control over Google Search Grounding keywords
  - Use `[text]` in your prompt to specify exact search terms
  - Example: `"product photo [iPhone 15 Pro Max]"` searches ONLY for "iPhone 15 Pro Max"
  - Perfect for product placement, brand integration, and precise reference fetching
  - Falls back to automatic keyword extraction when no brackets present
  - Industry-first feature for AI image generation tools
- **🎯 Use Cases**:
  - Product placement: `"model holding [Coca Cola bottle]"`
  - Brand assets: `"car interior with [Tesla Model S dashboard]"`
  - Architecture: `"modern office inspired by [Apple Park campus]"`
  - Fashion: `"outfit featuring [Nike Air Jordan 1]"`

### 🌟 **v1.4.0: Nano Banana Pro 3.0 Advanced Features**
- **🌐 Google Search Grounding** - Fetch real reference images from Google Images automatically
  - Works for ALL models (Flash and PRO)
  - Invisible reference images used during generation
  - Automatic watermark filtering from stock photo sites
  - Graceful CORS error handling for maximum compatibility
- **🎨 Style Presets Gallery** - 15+ one-click style applications
  - Artistic: Oil Painting, Watercolor, Anime, Pixel Art, Vector
  - Photo: Product Photography, Portrait Studio, Cinematic, Street, Macro
  - Scene: Isometric Game, UI/UX Mockup, Infographic, Social Media
  - Text: Typography Art
- **📸 Physics Control Presets** - Professional camera and lighting control
  - Lighting: Soft Studio, Golden Hour, Dramatic Shadows, Neon, Natural
  - Camera: Wide Angle, Portrait 50mm, Macro, Telephoto, Fisheye
  - Focus: Bokeh, Tack Sharp, Cinematic DOF, Tilt-Shift, Soft Focus
- **📊 Usage Tracker** - Session statistics and cost monitoring
  - Real-time tracking of images generated, total cost, tokens used
  - Average generation time per image
  - Transparent cost breakdown
- **🔄 Smart Auto-Fallback** - Automatic retry with Flash when Pro blocks
  - Handles `blockReason: "OTHER"` gracefully
  - Transparent user notification
  - Cost-effective alternative path
- Perfect for:
  - Real-time data visualization (weather, sports, stocks)
  - Professional photography with precise lighting control
  - Quick style iterations with preset templates
  - Cost-conscious workflows with usage monitoring
  - Agencies requiring reliable generation paths

### 🚀 **v1.3.1: Quick Win Features & UX Improvements**
- **🎲 Variations with 1 Click** - Generate 4 variations of any image with different random seeds
- **📋 Copy All Settings** - Instantly reuse ALL parameters from any image (prompt, model, resolution, aspect ratio, seed, negative prompt)
- **⏸ Abort Generation** - Cancel ongoing generations with brand-styled abort button
- **🐛 Mobile Safari Fix** - crypto.randomUUID() polyfill for iOS compatibility
- **⚡ Enhanced API Reliability** - AbortController + configurable timeout support (180s Pro, 90s Flash)
- **🎨 Improved Cost UX** - Cost calculator moved from floating bar to reduce user intimidation
- **🔧 Sequential Generation** - Optimized handling for multi-reference and Pro model scenarios
- Perfect for:
  - Quick iteration workflows
  - Testing multiple style variations
  - Rapid prototyping with consistent settings
  - Mobile users on iOS Safari
  - Professional agencies needing reliable cancellation

### 🎨 **v1.3: Optimized Presets & Performance**
- **Professional JSON Presets** for Nano Banana Flash & Pro 3.0
- **10+ Curated Templates** based on 2025 best practices
- **Detailed Prompt Engineering Guidelines** built-in
- **Model-Specific Optimization** (Flash vs Pro usage recommendations)
- **Cost Optimization Strategies** (60-70% savings workflow)
- **Performance Improvements** across the entire app
- Ready-to-use configurations for:
  - Luxury Product Photography
  - Food Social Media
  - Editorial Portraits
  - Concept Art
  - Tech Product Renders
  - Architecture
  - Children's Book Illustrations
  - Cinematic Landscapes
  - Social Media Templates
  - Abstract Modern Art

### 📚 **v1.2: Professional Prompt Library**
- **150+ Professional Prompts** for graphic design agencies
- **Standalone full-page experience** (not a popup)
- **Organized by Model**: Flash (fast & economical) vs PRO (4K quality)
- **15 Categories**: Packaging, Product Photography, Advertising, Fashion, Food & Beverage, Brand Identity, Real Estate, Travel, Automotive, and more
- **Bilingual Support**: EN/IT with live switching
- **Example Images**: Professional photography examples embedded for visual guidance
- **Smart Sorting**: Prompts with example images appear first for better understanding
- **Search & Filter**: Find the perfect prompt instantly
- **One-Click Use**: Applies prompt directly to your generation
- Perfect for:
  - E-commerce product shots
  - Marketing campaigns
  - Editorial fashion & beauty
  - Food & beverage styling
  - Packaging design
  - Brand identity & logos
  - Real estate photography
  - Automotive advertising
  - Travel & tourism
  - Event photography
  - Pet portraits
  - Architectural shots

### ✨ **v1.1: Native 4K Upscaling**
- **Powered by Nano Banana Pro 3.0** - No external APIs required
- **2K Upscaling** ($0.134 per image) - Double the resolution
- **4K Upscaling** ($0.24 per image) - Ultra-high quality enhancement
- Intelligent aspect ratio preservation
- Faithful recreation with detail enhancement
- Before/after comparison in image viewer
- Perfect for:
  - Print-ready materials
  - Large format displays
  - Professional portfolios
  - High-resolution archives

### 🚀 **Dual Model System**
- **Flash Model** (gemini-2.5-flash-image) - Fast & Economical ($0.04/image)
  - Perfect for rapid prototyping and testing
  - High-speed generation (2-3 seconds)
  - 2K maximum resolution

- **✨ PRO Model** (gemini-3-pro-image-preview) - **Nano Banana PRO 3.0**
  - **4K Native Resolution** (4096×4096px)
  - Advanced text rendering with legible fonts
  - Google Search grounding for fact-checking
  - Up to **14 reference images** (vs 4 in Flash)
  - **Text-in-Image** capabilities with style controls
  - Professional-grade output for final deliverables
  - $0.13-$0.24 per image (based on resolution)

### 📝 **NUOVO v1.0: Text-in-Image (PRO Only)**
- Add text directly to your generated images
- **Position Control**: Top, Center, Bottom, Overlay
- **Font Styles**: Bold, Italic, Calligraphy, Modern, Vintage
- Automatic contrast optimization
- Perfect for:
  - Infographics and diagrams
  - Marketing materials with headlines
  - Social media posts
  - Menus and promotional content

### 💰 **NUOVO v1.0: Real-Time Cost Calculator**
- See estimated cost **before** generating
- Dynamic pricing based on:
  - Selected model (Flash vs PRO)
  - Resolution (1K/2K/4K)
  - Number of reference images
- Transparent pricing display
- No surprises on your API bill

### 🖼️ **Enhanced Multi-Reference System**
- Upload up to **14 reference images** (PRO) or 4 (Flash)
- Separate **style reference image** for consistent visual branding
- **Structure guide image** (ControlNet-like) to preserve spatial composition
- **👤 Precise Reference Mode** - Maximum fidelity to facial features
  - Preserves faces, skin texture, eye color, hairstyle EXACTLY
  - One-click toggle with visual indicator
  - Tooltip guidance for easy understanding

### 🎯 **Professional Creative Controls**
- **3 AI-Generated Prompt Suggestions** (Hero Shot, Lifestyle, Detail/Macro)
- **Dynamic Professional Tools** - AI analyzes images and generates contextual controls:
  - For people: Hairstyle, outfit, pose, expression
  - For products: Camera angle, lighting, background setting
  - For scenes: Time of day, weather, artistic style
- **15-20 options per tool** for granular control

### 📐 **Flexible Resolution Options**
- **PRO Model**:
  - 1K (1024×1024) - Standard quality
  - 2K (2048×2048) - High quality
  - **4K (4096×4096) - Ultra quality** ✨
- **Flash Model**: Fixed 2K output
- **Auto Aspect Ratio** mode uses reference image proportions
- Support for: 1:1, 16:9, 9:16, 4:3, 3:4, 21:9
- Smart white border detection and cropping

### 🎨 **Advanced Image Controls**
- **Negative Prompts** with AI-powered generation
- **Seed Control** for reproducible results
- **Batch Generation** - Up to 4 images at once
- **Inpainting** - Edit specific regions with mask-based AI
- **✨ Native Image Upscaling** - Powered by Nano Banana Pro 3.0
  - 2K upscaling (2048px) - $0.134 per image
  - 4K upscaling (4096px) - $0.24 per image
  - No external API dependencies
  - Intelligent detail enhancement
  - Preserves original composition and style

### 💾 **Persistent History & Storage**
- Last 12 generations saved automatically
- **Favorites System** - Star your best work
- Filter by: All / Favorites
- **IndexedDB** for full-resolution images
- **localStorage** for metadata
- Reuse settings from any historical generation
- Generation metadata includes:
  - Model used (Flash/PRO)
  - Resolution
  - Estimated cost
  - All parameters (prompt, seed, aspect ratio)

### 🌐 **Bilingual Interface**
- Full support for **English** and **Italian**
- Toggle instantly with preserved state
- All PRO features fully translated

### ⚡ **Developer-Friendly**
- Keyboard shortcuts (Ctrl+G, Ctrl+E, etc.)
- Custom API key support
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)
- Clean, maintainable codebase

---

## 🚀 Live Demo

**Try it now:** [https://www.dugongo.it/generentolo/](https://www.dugongo.it/generentolo/)

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS 3.4.7
- **AI Models**:
  - Google Gemini 2.5 Flash Image
  - **Google Gemini 3 Pro Image (Nano Banana PRO)** 🆕
- **SDK**: `@google/genai` v1.25.0
- **Storage**: IndexedDB + localStorage
- **State Management**: React Hooks

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API Key ([Get one free](https://ai.google.dev/))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jozbgm/generentolo-pro.git
   cd generentolo-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Create a `.env.local` file:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

5. **Build for production**
   ```bash
   npm run build
   ```
   Output in `dist/` folder

---

## 💰 Pricing Guide

### Flash Model (gemini-2.5-flash-image)
- **Cost**: ~$0.04 per image (flat rate)
- **Speed**: 2-3 seconds
- **Resolution**: Up to 2K (2048px)
- **Best for**: Rapid iterations, testing, prototypes

### PRO Model (gemini-3-pro-image-preview)
| Resolution | Base Cost | + Input Images | Example Total |
|------------|-----------|----------------|---------------|
| **1K** | $0.134 | $0.067 each | $0.27 (2 refs) |
| **2K** | $0.134 | $0.067 each | $0.27 (2 refs) |
| **4K** | $0.240 | $0.067 each | $0.37 (2 refs) |

**Cost Formula**: `Base + (NumReferenceImages × $0.067) + $0.002 (prompt)`

**Example**: 14 reference images + 4K output = ~$1.18 per generation

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+G` | Generate images |
| `Ctrl+E` | Enhance prompt |
| `Ctrl+R` | Randomize seed |
| `Ctrl+K` | Reset interface |
| `Ctrl+,` | Open settings |
| `Ctrl+P` | Focus prompt field |
| `Ctrl+Shift+T` | Toggle theme |

---

## 🔄 Workflow Example (PRO Mode)

1. **Select PRO Model** (gemini-3-pro-image-preview)
2. **Choose Resolution** (1K / 2K / **4K**)
3. **Upload Reference Images** (up to 14!)
4. **Enable Text-in-Image** (optional)
   - Enter text: "SALE 50% OFF"
   - Position: Top
   - Font: Bold
5. **Generate Creative Prompts**
6. **Select Tool Options** (lighting, camera angle, etc.)
7. **Check Estimated Cost** ($0.37 for 2 refs + 4K)
8. **Generate!** 🎨
9. **Download** your 4K masterpiece

---

## 📊 Resolution Comparison

| Model | Max Resolution | Megapixels | Text Rendering | Google Search |
|-------|----------------|------------|----------------|---------------|
| **Flash** | 2048×2048 | 4.19 MP | Basic | ❌ |
| **PRO 1K** | 1024×1024 | 1.05 MP | ✅ Advanced | ✅ |
| **PRO 2K** | 2048×2048 | 4.19 MP | ✅ Advanced | ✅ |
| **PRO 4K** | 4096×4096 | **16.78 MP** ✨ | ✅ Advanced | ✅ |

---

## 📋 Changelog

### v1.9.0 (January 2026) 🪄
**🎉 AUTO-ENHANCE PRO - Intelligent Workflow Upgrade:**

**✨ NEW: Automatic Prompt Optimization**
- **AI-Powered Pre-processing**: Option to automatically enhance prompts before generation, ensuring maximum creative quality.
- **Contextual Awareness**: Enhancement takes into account all reference, style, and structure images.
- **State Preservation**: The original prompt is updated with the enhanced version for user review.

**🔧 UI/UX Streamlining**
- **Clean Sidebar**: Removal of legacy creative prompt and manual enhance buttons.
- **Quick-Access Toolbar**: Precise Reference is now permanently available in the floating action bar.
- **Smart Tooltips**: Enhanced guidance for all new controls in both EN/IT.

### v1.8.0 (December 2025) 🎞️
**🎉 VIRTUAL STUDIO & CINEMA MODE:**
- Professional cinematography controls (Arri Alexa, Red V-Raptor, etc.)
- Dynamic lighting and wardrobe presets.

### v1.7.1 (December 2025) 🚀
- 🚧 DNA Profiling stability improvements.

### v1.7.0 (December 2025) 🧬
**🎉 CHARACTER CONSISTENCY - DNA Profiling Upgrade:**

**✨ NEW: DNA Character Consistency Engine**
- **DNA Extraction**: Integrated `gemini-1.5-flash` to generate semantic descriptions of character's physical appearance.
- **Persistent Character Store**: New IndexedDB implementation to save, manage, and retrieve character profiles with thumbnails.
- **Save DNA from Results**: Instantly capture the identity of any generated character directly from the history, display panel, or lightbox.
- **Prompt Injection Logic**: Automated prepending of character descriptions to user prompts for consistent visual identity.
- **Circular Thumbnails**: Visual management system for easy identification of saved characters.

**🔧 UI/UX Enhancements**
- **Quick Character Bar**: New horizontal selection bar added to the Reference Panel.
- **DNA Manager Modal**: Comprehensive management interface for creating and deleting character profiles.
- **Bilingual Support**: Full English and Italian localized terms for all new features.
- **Version Updates**: Synchronized version numbering (v1.7.0) across the entire stack.

**⚡ Code & Performance**
- Removed redundant modal rendering calls in the main App component.
- Optimized reasoning logic for better Art Direction plan generation in parallel.
- Verified and fixed TypeScript strictly across the new DNA feature modules.

---


### v1.6.0 (December 2025) ✨
**🎉 NATIVE 4K GENERATION - Nano Banana PRO 3.1 Upgrade:**

**✨ NEW: Native 1K/2K/4K Resolution for PRO Model**
- **Native Generation**: Images are now generated directly at the requested resolution (up to 4096px).
- **Nano Banana PRO 3.1**: Leveraging the latest model capabilities for ultra-high-definition output.
- **Dynamic Post-Processing**: Optimized `aggressiveCropAndResize` algorithm that supports canvas dimensions up to 4K without quality loss.
- **High-Res Prompt Booster**: Automatic injection of technical high-resolution triggers for maximum sharpness.

**💎 Code Quality & Stability (NEW)**
- **100% TypeScript Error-Free**: Achieved zero errors and warnings in the entire project (`tsc --noEmit` clean).
- **Dead Code Elimination**: Removed +500 lines of obsolete components, unused states (`textInImageConfig`), and orphaned variables for a leaner, faster application.
- **Type Safety Overhaul**: Professional-grade typing for `geminiService` with strict checks for API responses and base64 data handling.
- **UI Robustness**: Optimized component prop structures in `FloatingActionBar` and `App.tsx` to prevent accidental logic breakage.
- **Performance Leak Fixes**: Removed unused listeners and optimized memoization across high-frequency UI elements.

**🔧 Technical Improvements**
- Integrated `imageSize` native parameter in Gemini API calls.
- Removed the 2048px limitation from the post-processing pipeline.
- Improved image smoothing quality for better visual fidelity.
- Fixed complex prop drilling and state synchronization issues in the main dashboard.

---

### v1.5.0 (December 2025) 🎯
**🎉 EXPLICIT KEYWORD CONTROL - Industry-First Feature:**

**🔍 NEW: Square Bracket Syntax for Google Search Grounding**
- Use `[text]` in prompts to specify exact search keywords
- Example: `"macro product photo... [borotalco original] ..."` → searches only "borotalco original"
- Perfect for product placement scenarios with long, complex prompts
- Automatic fallback to keyword extraction when no brackets present
- Console logging shows which mode is active (🎯 explicit vs 🤖 automatic)

**🎯 Key Benefits**
- **Precision**: No more random keyword extraction from complex prompts
- **Control**: You decide exactly what to search on Google Images
- **Flexibility**: Works alongside automatic extraction seamlessly
- **Professional**: Ideal for agencies doing branded content and product placement

**💡 Use Cases**
- Product placement: `"lifestyle shot with person drinking [Coca Cola Classic]"`
- Brand integration: `"office desk setup featuring [MacBook Pro 16]"`
- Architecture: `"modern home inspired by [Fallingwater Frank Lloyd Wright]"`
- Fashion: `"street style outfit with [Nike Air Jordan 1 Chicago]"`

**🔧 Technical Implementation**
- Modified `extractSearchKeywords()` in googleSearchService.ts
- Regex pattern: `/\[([^\]]+)\]/` to detect bracketed text
- Preserves all existing automatic extraction logic as fallback
- Version updated across package.json, index.html, README.md

**📊 Files Modified**
- `services/googleSearchService.ts`: Enhanced keyword extraction with bracket detection
- `package.json`: Version bump to 1.5.0
- `index.html`: Title updated to v1.5
- `README.md`: Feature documentation and examples

---

### v1.3.1 (December 2025) ⚡
**🎉 QUICK WIN FEATURES - Enhanced Workflow & Reliability:**

**🎲 NEW: Variations with 1 Click**
- Generate 4 variations of any image with different random seeds
- One-click button (🎲) on history panel images
- Sequential generation to prevent API overload
- Maintains original prompt, aspect ratio, model, and resolution
- Perfect for rapid iteration and A/B testing
- Loading state prevents multiple simultaneous generations

**📋 NEW: Copy All Settings**
- One-click button (📋) to copy ALL parameters from any image
- Copies and applies:
  - Prompt (fills textarea)
  - Aspect ratio
  - Model (Flash/Pro)
  - Resolution (1K/2K/4K)
  - Seed
  - Negative prompt
- Toast notification confirms successful copy
- Faster than manual "Reuse" workflow

**⏸ NEW: Abort Generation**
- Cancel ongoing generations instantly
- Brand-styled button with purple/magenta gradient
- Works in both compact and expanded floating bar modes
- AbortController implementation across entire API chain
- User-friendly toast notifications
- Proper cleanup and state management

**🐛 FIXED: Mobile Safari Compatibility**
- crypto.randomUUID() polyfill for iOS Safari <15.4
- RFC4122 v4 compliant UUID generation
- Fixes crashes on older iOS devices
- Placed at App.tsx entry point

**⚡ ENHANCED: API Reliability**
- AbortSignal support throughout Gemini SDK calls
- Configurable HTTP timeouts:
  - 180 seconds (3 min) for Nano Banana Pro
  - 90 seconds (1.5 min) for Nano Banana Flash
- Improved error handling for abort/timeout scenarios
- Better retry logic with exponential backoff
- Sequential generation for complex scenarios (multi-reference + Pro)

**🎨 UX IMPROVEMENTS**
- Cost calculator removed from floating bar (less intimidating)
- Abort button uses brand palette (purple/magenta)
- Pause icon (⏸) for visual clarity
- Consistent button styling across viewports
- Improved mobile responsiveness

**🔧 Technical Details**
- `abortControllerRef` with React useRef pattern
- `handleAbortGeneration` callback with proper cleanup
- `variationsLoadingId` state for loading tracking
- `handleCopySettings` with comprehensive parameter transfer
- Enhanced error messages for Italian/English

**📊 Files Modified**
- `App.tsx`: +150 lines (abort controller, variations, copy settings, polyfill)
- `components/FloatingActionBar.tsx`: Abort button integration, cost calculator removal
- `services/geminiService.ts`: AbortSignal + timeout support

---

### v1.2.0 (December 2025) 📚
**🎉 PROMPT LIBRARY RELEASE - Professional Templates:**

**📚 NEW: Standalone Prompt Library (150+ Prompts)**
- **150+ Professional Prompts** organized for graphic design agencies (up from 60+)
- **Full-page standalone experience** via window.open()
- **Model-specific organization**: Flash vs PRO capabilities
- **15 Professional Categories**:
  - Aesthetic Presets (Y2K, Film, Minimal, Cinematic, 80s/90s, Cottagecore, Dark Academia, Vaporwave)
  - PRO Features (4K, Text-in-Image, Infographics)
  - Packaging Design (Luxury, Cosmetics, Food)
  - Product Photography (E-commerce, Lifestyle, Flat Lay, Watches, Sneakers, Tech)
  - Advertising & Marketing (Billboard, Print, Social)
  - Fashion & Editorial (Haute Couture, Magazine Covers, Lookbooks, Street Style, Beauty Close-ups)
  - Food & Beverage (Menu, Commercial, Styling)
  - People & Portraits (Studio, Cinematic, B&W, Concerts, Weddings, Pets)
  - Real Estate (Interior, Exterior, Staging)
  - Travel & Tourism (Destinations, Lifestyle)
  - Automotive (Cars, Motorcycles)
  - Sports & Action (Frozen moments, Street sports)
  - Architecture & Interiors (Modern, Classic)
  - Nature & Landscapes (Mountains, Oceans)
  - Illustration Styles (Anime, Comic Book, Digital Painting)
  - Brand Identity (Logos, Mockups, Systems)
  - Seasonal & Holiday (Christmas, Halloween)
  - Plus: Combine, Style, Environment, Edit, Creative categories

**🎨 Library Features**
- **Smart Sorting**: Prompts with example images appear first for better visual guidance
- Search bar with real-time filtering
- Category filter chips (15 categories)
- Model tabs (All/Flash/PRO)
- **Real example images** embedded from professional photography sources
- Copy and Use Prompt buttons
- Bilingual EN/IT with sync to main app
- Responsive mobile design
- Dark theme matching main app

**🔧 Technical Implementation**
- PostMessage API for parent-child communication
- Language preference synchronization
- Sends selected prompts back to main app
- Tailwind CSS responsive design
- Toast notifications
- Clean professional UI

**📊 Prompt Content**
- Detailed professional prompts
- Best practices for each use case
- Reference image guidance
- Settings recommendations (resolution, aspect ratio)
- Difficulty levels (easy/medium/advanced)
- Professional photography techniques

---

### v1.1.0 (December 2025) ✨
**🎉 UPSCALING RELEASE - Native 4K Enhancement:**

**✨ NEW: Native Image Upscaling System**
- Powered by Nano Banana Pro 3.0 (gemini-3-pro-image-preview)
- **2K Upscaling** ($0.134) - Perfect for web and social media
- **4K Upscaling** ($0.24) - Print-ready ultra-high quality
- No external API dependencies or quota limits
- Intelligent aspect ratio detection and preservation
- Temperature 0.4 for faithful recreation
- Advanced prompt engineering for detail enhancement

**🎨 UI/UX Improvements**
- Upscale button with sparkle icon in image display
- Dropdown menu with 2K/4K options and pricing
- Loading overlay during upscaling with spinner
- Success/error toast notifications
- Upscaled images marked with "[2K/4K Upscaled]" prefix

**🌐 Complete Translations**
- upscaleAction, upscale2K, upscale4K (EN/IT)
- upscaling status messages
- Success and error notifications

**🔧 Technical Implementation**
- New `upscaleImage()` function in geminiService
- Helper functions: `detectImageAspectRatio()`, `dataURLToFile()`
- State management with `upscalingImageId`
- Automatic thumbnail generation for upscaled images
- Integration with history and favorites system

**📊 Performance**
- 2K upscale: ~8-12 seconds processing time
- 4K upscale: ~15-20 seconds processing time
- Output: High-fidelity recreation with enhanced details
- File sizes: 2-5MB (2K), 5-15MB (4K)

---

### v1.0.0 PRO (November 2025) 🚀
**🎉 MAJOR RELEASE - Nano Banana PRO Integration:**

**✨ NEW: Dual Model System**
- Flash Model (gemini-2.5-flash-image) - Fast & cheap
- **PRO Model (gemini-3-pro-image-preview)** - High quality with 4K support
- Model selector in UI with clear indicators
- Smart model recommendations based on use case

**📐 NEW: Resolution Selector (PRO Only)**
- 1K (1024×1024) - Standard
- 2K (2048×2048) - High Quality
- **4K (4096×4096) - Ultra Quality** ✨
- Dynamic UI - only shows when PRO selected
- Visual feedback with gradient highlights

**💰 NEW: Real-Time Cost Calculator**
- Shows estimated cost BEFORE generation
- Updates dynamically as you:
  - Switch models (Flash ↔ PRO)
  - Change resolution (1K → 2K → 4K)
  - Add/remove reference images
- Transparent pricing with no surprises
- Beautiful gradient badge display

**📝 NEW: Text-in-Image System (PRO Only)**
- Add text directly to generated images
- Position controls: Top, Center, Bottom, Overlay
- Font styles: Bold, Italic, Calligraphy, Modern, Vintage
- Automatic text contrast optimization
- Perfect for marketing materials, infographics, menus
- Smart toggle - only visible when PRO model selected

**🖼️ NEW: 14 Reference Images Support**
- Increased from 4 to 14 (PRO model capability)
- Better multi-image combining
- Support for complex compositions
- Visual counter shows available slots

**🎨 UI/UX Improvements**
- Model selector with icons (⚡ Flash / ⭐ PRO)
- Resolution buttons with clear labels
- Cost estimator badge with yellow-magenta gradient
- Text-in-image panel with purple gradient
- **Precise Reference** now uses 👤 icon (cleaner mobile view)
- **Generate button** consistent gradient on all screen sizes
- Smooth animations and transitions
- Better mobile responsiveness

**🌐 Complete Italian/English Translations**
- All PRO features fully localized
- Model names, resolution labels, tooltips
- Text-in-image controls
- Cost calculator labels

**🔧 Technical Improvements**
- New types: `ModelType`, `ResolutionType`, `TextInImageConfig`
- `calculateEstimatedCost()` function in geminiService
- Enhanced `generateImage()` with 3 new parameters
- Updated FloatingActionBar with PRO controls
- Cost tracking in generation metadata
- Better TypeScript type safety

**📦 Package Updates**
- Version bumped to 1.0.0
- Package name updated to `generentolo-pro`
- Ready for production deployment

**Bug Fixes:**
- Fixed text overflow on mobile (Precise Reference)
- Unified Generate button styling across viewports
- Better handling of reference image limits
- Improved error messages for quota exceeded

[Previous versions 0.9.1 → 0.1 Beta history omitted for brevity - see full CHANGELOG.md]

---

## 🚧 Roadmap

- [ ] Google Search grounding UI toggle
- [ ] "Thinking mode" visualization (intermediate images)
- [ ] SynthID watermark indicator
- [ ] Batch processing with different models
- [ ] Export generation report with cost breakdown
- [ ] Advanced history filtering (by model, resolution, cost)
- [ ] Template system for common use cases
- [ ] API endpoint for programmatic access

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini Team** - For Gemini 2.5 Flash & **Nano Banana PRO 3.0**
- **React Team** - For React 19
- **Tailwind CSS** - For utility-first CSS

---

## 📞 Contact

**Developer**: Joz BGM
**Website**: [https://bgm.media](https://bgm.media)
**Email**: [joz@bgm.media](mailto:joz@bgm.media)
**Project**: [https://github.com/jozbgm/generentolo-pro](https://github.com/jozbgm/generentolo-pro)

---

## ⚠️ Disclaimer

This application uses Google's Gemini API. Users are responsible for complying with [Google's Terms of Service](https://ai.google.dev/terms) and [Usage Guidelines](https://ai.google.dev/gemini-api/docs/safety-guidance). API keys should be kept private and secure.

**Note**: Nano Banana PRO (gemini-3-pro-image-preview) requires billing enabled on your API key. It is not available in the free tier.

---

<div align="center">

**Made with ❤️ and 🤖 by Joz BGM**

⭐ **Star this repo if you find it useful!** ⭐

[Report Bug](https://github.com/jozbgm/generentolo-pro/issues) · [Request Feature](https://github.com/jozbgm/generentolo-pro/issues)

</div>
