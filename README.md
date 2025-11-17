# 🎨 Generentolo v0.9.0 Beta

**Professional AI-Powered Image Generation Web Application**

A sophisticated web application for generating high-quality images using Google's Gemini 2.5 Flash Image model with ControlNet-like structure guidance. Designed for graphic designers, marketers, and creative professionals who need precise control over AI-generated imagery.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://www.dugongo.it/generentolo/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ Features

### 🖼️ **Multi-Reference Image Generation**
- Upload up to **4 reference images** to combine elements intelligently
- Separate **style reference image** for consistent visual branding
- **Structure guide image** (ControlNet-like) to preserve spatial composition and depth
- **NEW v0.7: 🎯 Precise Reference Mode** - Maximum fidelity to facial features
  - Preserves faces, skin texture, eye color, hairstyle EXACTLY as in reference
  - Toggle on/off for each generation
- Advanced AI prompt engineering ensures all subjects are included in final output

### 🎯 **Professional Creative Controls**
- **3 AI-Generated Prompt Suggestions** (Hero Shot, Lifestyle, Detail/Macro)
- **Dynamic Professional Tools** - AI analyzes your images and generates contextual controls:
  - For people: Hairstyle, outfit, pose, expression
  - For products: Camera angle, lighting, background setting
  - For scenes: Time of day, weather, artistic style
- **15-20 options per tool** for granular creative control

### 📐 **Aspect Ratio Mastery**
- **NEW: "Auto" mode** - Uses reference image's original aspect ratio
- Support for all common ratios: **1:1, 16:9, 9:16, 4:3, 3:4**
- **Aggressive white border detection** and automatic cropping
- **High-resolution output**: Always 2048px on longest side, minimum 1024px on shortest
- Smart sizing ensures frame is completely filled with no letterboxing

### 🎨 **Advanced Image Controls**
- **Negative Prompts** with AI-powered generation
- **Seed Control** for reproducible results
- **Batch Generation** - Create up to 4 images at once
- **Inpainting** - Edit specific regions with mask-based AI editing
- **NEW: Image Upscaling** - 2x/4x quality enhancement with ClipDrop API
  - Monthly quota tracking (100 free upscales/month)
  - Interactive before/after comparison slider
  - Automatic quality optimization

### 💾 **Persistent History & Storage**
- **Last 12 generations** saved automatically
- **IndexedDB** for full-resolution images
- **localStorage** for metadata and thumbnails
- Reuse settings from any historical generation

### 🌐 **Bilingual Interface**
- Full support for **English** and **Italian**
- Toggle languages instantly with preserved state

### ⚡ **Developer-Friendly**
- **Keyboard shortcuts** (Ctrl+G to generate, Ctrl+E to enhance, etc.)
- Custom API key support (or use shared default)
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)

---

## 🚀 Live Demo

**Try it now:** [https://www.dugongo.it/generentolo/](https://www.dugongo.it/generentolo/)

---

## 📸 Screenshots

### Main Interface
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌────────────────────────────┐  ┌─────────┐ │
│  │  Reference   │  │   Generated Images         │  │ History │ │
│  │  Images      │  │                            │  │         │ │
│  │  (Up to 4)   │  │   [High-res 2048px]        │  │ [Last   │ │
│  │              │  │                            │  │  12]    │ │
│  │  + Style Ref │  └────────────────────────────┘  └─────────┘ │
│  └──────────────┘                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Creative Prompts  |  Professional Tools  |  Settings   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS 3.4.7
- **AI Model**: Google Gemini 2.5 Flash Image (`@google/genai` v1.25.0)
- **Storage**: IndexedDB + localStorage
- **State Management**: React Hooks (useState, useCallback, useContext)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API Key ([Get one free](https://ai.google.dev/))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jozbgm/generentolo-v0.1-beta.git
   cd generentolo-v0.1-beta
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   ```
   Output will be in `dist/` folder

---

## 🔧 Configuration

### Deployment Path

Edit `vite.config.ts` to set the base path:

```typescript
export default defineConfig({
  base: '/generentolo/',  // For subdirectory deployment
  // base: '/',           // For root deployment
  // ...
});
```

### API Key Options

Users can:
1. Use the **shared default key** (defined in `.env.local`)
2. Enter their **own API key** via Settings (stored locally in browser)

---

## 📁 Project Structure

```
generentolo-v0.1-beta/
├── src/
│   ├── App.tsx                    # Main application component (1,908 lines)
│   ├── index.tsx                  # React entry point
│   ├── types.ts                   # TypeScript interfaces
│   ├── services/
│   │   ├── geminiService.ts       # Gemini API wrapper (800+ lines)
│   │   ├── indexedDB.ts           # Image storage service
│   │   └── promptLibrary.ts       # Prompt management
│   ├── components/
│   │   └── icons.tsx              # Custom SVG icons
│   └── hooks/
│       └── useKeyboardShortcuts.ts # Keyboard shortcuts hook
├── public/
│   └── _redirects                 # SPA routing configuration
├── dist/                          # Production build output
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind theme customization
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🎨 Design System

### Color Palette (v0.9.0 - Bold & Creative)

```css
/* Brand Colors */
--brand-yellow: #FFD93D;    /* Banana Yellow - Primary */
--brand-magenta: #FF006E;   /* Magenta - Secondary */
--brand-cyan: #00F5FF;      /* Bright Cyan - Accent */

/* Dark Mode - Anthracite Grey */
--dark-bg: #0A0B0F;
--dark-surface: #16171D;
--dark-surface-accent: #1F2027;
--dark-text: #F0F0F3;

/* Light Mode */
--light-bg: #FAFBFC;
--light-surface: #FFFFFF;
--light-text: #0A0B0F;
```

### Typography
- **Primary Font**: System UI font stack
- **Sizes**: Responsive scale (text-sm to text-lg)
- **Weights**: Regular (400), Semibold (600), Bold (700)

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

## 🔄 Workflow Example

1. **Upload Reference Images** (drag & drop or click to browse)
2. **Add Style Image** (optional - for consistent branding)
3. **Generate Creative Prompts** (AI suggests 3 professional prompts)
4. **Generate Professional Tools** (AI creates contextual controls)
5. **Select Tool Options** (hairstyle, lighting, camera angle, etc.)
6. **Choose Aspect Ratio** (1:1, 16:9, 9:16, etc.)
7. **Set Advanced Options** (negative prompt, seed, number of images)
8. **Generate!** 🎨
9. **Download, Edit, or Reuse** your creations

---

## 📊 Image Resolution Guarantees

| Aspect Ratio | Output Size | Megapixels | Notes |
|--------------|-------------|------------|-------|
| 1:1 | 2048 × 2048 | 4.19 MP | Maximum quality |
| 16:9 | 2048 × 1152 | 2.36 MP | Full HD+ |
| 9:16 | 1152 × 2048 | 2.36 MP | Vertical HD+ |
| 4:3 | 2048 × 1536 | 3.15 MP | Classic |
| 21:9 | 2048 × 878 | 1.80 MP | Ultra-wide, min 1024px |

**All images:**
- ✅ PNG format with 100% quality
- ✅ 2048px on longest side
- ✅ Minimum 1024px on shortest side
- ✅ High-quality image smoothing enabled

---

## 🐛 Bug Fixes & Improvements (Latest Release)

### v0.1-beta (November 2025)
- ✅ **Fixed**: History scroll with unlimited images
- ✅ **Fixed**: Low-resolution output (now always 2048px max)
- ✅ **Fixed**: API key popup closing on text selection
- ✅ **Fixed**: Multiple reference images not recognized (critical fix)
- ✅ **Fixed**: White bands in aspect ratio output
- ✅ **Fixed**: Reset interface not working
- ✅ **Improved**: Aggressive border detection (threshold 230, sample 5px)
- ✅ **Improved**: Smart aspect ratio sizing with minimum dimension guarantee
- ✅ **UI**: Removed placeholder icon, cleaner professional design

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini Team** - For the powerful Gemini 2.5 Flash Image model
- **React Team** - For the amazing React 19 framework
- **Tailwind CSS** - For the beautiful utility-first CSS framework
- **Claude AI** - Development assistance and code review

---

## 📞 Contact

**Developer**: Joz BGM
**Website**: [https://bgm.media](https://bgm.media)
**Email**: [joz@bgm.media](mailto:joz@bgm.media)
**Project Link**: [https://github.com/jozbgm/generentolo-v0.1-beta](https://github.com/jozbgm/generentolo-v0.1-beta)

---

## 📋 Changelog

### v0.9.0 Beta (January 2025)
**🎨 Bold Creative Redesign + Major Enhancements:**
- **NEW: Modern Color Palette**
  - Banana Yellow (#FFD93D) + Magenta (#FF006E) + Cyan (#00F5FF)
  - Anthracite grey dark mode (#0A0B0F → #16171D)
  - Bold, energetic, and professional aesthetic
  - All gradient buttons updated (yellow → magenta)

- **✨ Enhanced Prompt Enhancement**
  - Aggressive systemInstruction forcing creativity
  - Temperature increased (0.7/0.9 for standard, 1.2 for retry)
  - Automatic retry if model returns identical prompt
  - maxOutputTokens: 500 (was 300)
  - Removed 400-character truncation
  - Italian translations for prompt tips

- **🎯 UI/UX Improvements**
  - Fixed layout height alignment (all columns same height)
  - Removed backdrop-blur artifact (dark horizontal bar)
  - Hidden empty Creative Prompts section when not needed
  - Cleaner, more polished interface

**Technical:**
- ControlNet structure guidance improvements
- Better aspect ratio handling
- High-res output (2048px) consistently applied

### v0.8.1 Beta (January 2025)
**🔖 Favorites & History Filtering:**
- ⭐ **Favorites System** - Bookmark your best generations
  - Star icon on each image (hover to reveal)
  - Toggle favorite status with one click
  - Yellow star indicator for favorited images
  - Filter history to show only favorites
  - Persistent across sessions (stored in IndexedDB)
  - "All" / "⭐ Favorites" tabs in history sidebar
  - Visual feedback with smooth transitions

**UX Enhancements:**
- 🎨 Better hover states on history images
- 🔄 Instant filter switching with no reload
- 💾 Favorites data synced with image metadata
- ⚡ Performance optimized for large histories

**Bug Fixes:**
- Fixed favorite status persistence after page reload
- Improved history image loading performance

### v0.7 Beta (January 2025)
**🎯 Precise Reference Mode:**
- **NEW: Precise Reference Checkbox** - Maximum fidelity to facial features
  - Preserves EXACTLY facial features, skin texture, eye color, nose shape
  - Maintains hair color, hairstyle, and length unchanged
  - Prevents AI from altering or reinterpreting faces
  - Works with multiple reference images
  - Toggle on/off with clear visual indicator
  - Smart prompt engineering for photorealistic accuracy

**UX Improvements:**
- Changed "Nano is generating" to "Generentolo is generating"
- Better branding consistency throughout the app

**Bug Fixes:**
- Optimized `enhancePrompt()` to prevent IMAGE_OTHER errors
  - No longer analyzes reference images during enhancement
  - Only analyzes style/structure images
  - Reduced prompt duplication with API
  - More stable generation with Enhance + Generate workflow

### v0.6 Beta (January 2025)
**Productivity & Organization Features:**
- ⭐ **Prompt Presets System** - Save and reuse your favorite prompts
  - Save up to 50 presets with custom names
  - Store both main prompt and negative prompt
  - Quick load presets with one click
  - Export/Import presets as JSON for backup and sharing
  - LocalStorage-based (no account needed)
  - Smart UI with tabs: History / Presets
- 📜 **Infinite Scroll History** - Browse unlimited generations smoothly
  - Loads 30 images initially, then 20 more per scroll
  - Performance-optimized with IntersectionObserver
  - Image counter shows loaded count (e.g., "Showing 50 of 150 images")
  - Smooth loading spinner when fetching more
- 🖼️ **Image Navigation in Lightbox**
  - Navigate between images with arrow keys (← →)
  - Click navigation arrows on desktop
  - Swipe left/right on mobile (50px threshold)
  - Image counter (e.g., "2/4") in top-left
  - Circular navigation (loops back to first/last)
  - Works with both current images and history
- ✏️ **Prompt Textarea Enhancements**
  - Paste button to quickly insert clipboard content
  - Clear button to delete all text at once
  - Buttons appear/hide intelligently
  - Hover effects and smooth transitions

**UX Improvements:**
- 🎯 Tab-based sidebar (History / Presets) with smooth switching
- 💾 All presets data stored locally in browser
- 🔄 Smart preset management (add, load, delete, export, import)
- ⚡ Keyboard navigation support in lightbox
- 📱 Touch-optimized swipe gestures for mobile

**Technical:**
- New service: `presetsService.ts` for preset management
- IntersectionObserver for infinite scroll implementation
- Touch event handlers for mobile swipe detection
- LocalStorage persistence with max 50 presets limit
- JSON export/import for preset portability

### v0.5 Beta (January 2025)
**Visual & Animation Overhaul:**
- ✨ **Micro-animations** - Smooth transitions for all UI elements (fadeIn, slideUp, slideDown)
- 🎯 **Hero Generate Button** - Gradient background with glow effect, larger size, bold typography
- 📊 **Progress Bar** - Animated shimmer bar during image generation
- 💫 **Interactive Feedback** - Hover scale effects (1.05x-1.10x) on all buttons
- 🎨 **Dropdown Animations** - SlideDown effect for all menus with smooth transitions
- ⚡ **Success/Error States** - Prepared animations (pulse success, shake error) for future integration
- 🖱️ **Enhanced Hover States** - All interactive elements have scale and color transitions
- 🎭 **Loading States** - Pulsing emoji animations during processing
- 🌊 **Smooth Transitions** - 150ms-300ms duration with ease-out timing for all interactions
- 🎪 **Visual Hierarchy** - Generate button stands out with gradient (purple→pink→purple) and shadow glow

**Technical Improvements:**
- Custom Tailwind animations: fadeIn, slideUp, slideDown, scaleIn, shimmer, success, shake
- Optimized transition timing for fluid user experience
- Professional animation curves (ease-out, cubic-bezier)
- Consistent 150-300ms transition durations across all components

### v0.4 Beta (January 2025)
**Polish & Refinements:**
- 🐛 **Mobile Scroll Fix** - Complete scroll now working on mobile after generation
- 📱 **Improved Mobile Padding** - Better spacing (pb-32) for floating bar visibility
- 🎯 **Repository Branding** - Updated all references to v0.4 Beta
- 📝 **Enhanced Documentation** - Comprehensive changelog and feature documentation
- ✨ **Code Quality** - Cleaner codebase with better organization
- 🔧 **Build Optimization** - Faster builds and better performance

**Foundation for Future:**
- Infrastructure ready for upcoming features
- Drag & drop system prepared
- Undo/Redo architecture planned
- Swipe gestures groundwork laid
- Progressive loading structure in place

### v0.3 Beta (January 2025)
**Major UX Overhaul:**
- 🎨 **Floating Action Bar** - Floating menu for streamlined workflow
- 📱 **Mobile Optimization** - Fully responsive with touch-friendly controls
- ⚡ **Always-Accessible Controls** - Aspect ratio, num images, and Generate button always visible
- 🎯 **Expanded Mode** - Write prompts with all controls accessible simultaneously
- 🔧 **Advanced Panel** - Slide-up overlay for negative prompt, seed, and professional tools
- 💫 **Smart Positioning** - No more overlapping menus, z-index hierarchy perfected
- 🎭 **Compact Pills** - Space-efficient design with emoji indicators
- 🖼️ **Improved Layout** - Sidebar reduced to 280px, more space for image display
- ✨ **Better UX** - Click outside to close menus, smooth transitions, professional glassmorphism

**Technical Improvements:**
- Context-aware UI that adapts to app state
- Backdrop blur for modern visual depth
- Proper z-index management (40→50→60→65→70)
- Mobile-first responsive breakpoints (sm: 640px, lg: 1024px)
- Export of LanguageContext for component reusability

### v0.2 Beta (January 2025)
**Major Features:**
- ✨ **Structure Guide** - ControlNet-like spatial composition preservation
- 🎯 **Auto Aspect Ratio** - Automatically use reference image proportions
- ⚡ **Image Upscaling** - 2x/4x enhancement with ClipDrop integration
- 📊 **Quota Tracking** - Visual monthly upscale counter
- 🔄 **Image Comparison** - Interactive before/after slider for upscaled images

**Improvements:**
- 🐛 Fixed prompt textarea flickering bug with React.memo optimization
- 🎨 Improved UI responsiveness
- 💾 Better memory management for large images
- 📱 Enhanced mobile experience

### v0.1 Beta (December 2024)
**Initial Release:**
- Multi-reference image generation
- Style reference support
- Professional tools with AI-generated options
- Aspect ratio controls with aggressive cropping
- Negative prompts & seed control
- Inpainting functionality
- Bilingual interface (EN/IT)
- History management with IndexedDB
- Keyboard shortcuts

---

## 🚧 Roadmap

- [ ] Export/Import prompt library
- [ ] Batch processing for multiple generation sets
- [ ] Advanced history filtering and search
- [ ] Template system for common use cases
- [ ] Collaboration features (share generations)
- [ ] API endpoint for programmatic access
- [ ] More AI models support

---

## ⚠️ Disclaimer

This application uses Google's Gemini API. Users are responsible for complying with [Google's Terms of Service](https://ai.google.dev/terms) and [Usage Guidelines](https://ai.google.dev/gemini-api/docs/safety-guidance). API keys should be kept private and secure.

---

<div align="center">

**Made with ❤️ and 🤖 by Joz BGM**

⭐ **Star this repo if you find it useful!** ⭐

[Report Bug](https://github.com/jozbgm/generentolo-v0.1-beta/issues) · [Request Feature](https://github.com/jozbgm/generentolo-v0.1-beta/issues)

</div>
