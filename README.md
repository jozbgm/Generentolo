# 🎨 Generentolo Pro v1.0.0

**Professional AI-Powered Image Generation Web Application**

A sophisticated web application for generating ultra-high-quality images using Google's Gemini models (Flash & **Nano Banana Pro 3.0**) with ControlNet-like structure guidance, 4K resolution support, and text-in-image capabilities. Designed for graphic designers, marketers, and creative professionals who demand the highest quality and precision.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://www.dugongo.it/generentolo/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ Features

### 🚀 **NEW v1.0: Dual Model System**
- **Flash Model** (gemini-2.5-flash-image) - Fast & Economical ($0.04/image)
  - Perfect for rapid prototyping and testing
  - High-speed generation (2-3 seconds)
  - 2K maximum resolution

- **✨ Pro Model** (gemini-3-pro-image-preview) - **Nano Banana Pro 3.0**
  - **4K Native Resolution** (4096×4096px)
  - Advanced text rendering with legible fonts
  - Google Search grounding for fact-checking
  - Up to **14 reference images** (vs 4 in Flash)
  - **Text-in-Image** capabilities with style controls
  - Professional-grade output for final deliverables
  - $0.13-$0.24 per image (based on resolution)

### 📝 **NEW v1.0: Text-in-Image (Pro Only)**
- Add text directly to your generated images
- **Position Control**: Top, Center, Bottom, Overlay
- **Font Styles**: Bold, Italic, Calligraphy, Modern, Vintage
- Automatic contrast optimization
- Perfect for:
  - Infographics and diagrams
  - Marketing materials with headlines
  - Social media posts
  - Menus and promotional content

### 💰 **NEW v1.0: Real-Time Cost Calculator**
- See estimated cost **before** generating
- Dynamic pricing based on:
  - Selected model (Flash vs Pro)
  - Resolution (1K/2K/4K)
  - Number of reference images
- Transparent pricing display
- No surprises on your API bill

### 🖼️ **Enhanced Multi-Reference System**
- Upload up to **14 reference images** (Pro) or 4 (Flash)
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
- **Pro Model**:
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
- **Image Upscaling** - 2x/4x quality enhancement (ClipDrop API)
  - Monthly quota tracking (100 free/month)
  - Before/after comparison slider
  - Automatic quality optimization

### 💾 **Persistent History & Storage**
- Last 12 generations saved automatically
- **Favorites System** - Star your best work
- Filter by: All / Favorites
- **IndexedDB** for full-resolution images
- **localStorage** for metadata
- Reuse settings from any historical generation
- Generation metadata includes:
  - Model used (Flash/Pro)
  - Resolution
  - Estimated cost
  - All parameters (prompt, seed, aspect ratio)

### 🌐 **Bilingual Interface**
- Full support for **English** and **Italian**
- Toggle instantly with preserved state
- All Pro features fully translated

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
  - **Google Gemini 3 Pro Image (Nano Banana Pro)** 🆕
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

### Pro Model (gemini-3-pro-image-preview)
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

## 🔄 Workflow Example (Pro Mode)

1. **Select Pro Model** (gemini-3-pro-image-preview)
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
| **Pro 1K** | 1024×1024 | 1.05 MP | ✅ Advanced | ✅ |
| **Pro 2K** | 2048×2048 | 4.19 MP | ✅ Advanced | ✅ |
| **Pro 4K** | 4096×4096 | **16.78 MP** ✨ | ✅ Advanced | ✅ |

---

## 📋 Changelog

### v1.0.0 Pro (November 2025) 🚀
**🎉 MAJOR RELEASE - Nano Banana Pro Integration:**

**✨ NEW: Dual Model System**
- Flash Model (gemini-2.5-flash-image) - Fast & cheap
- **Pro Model (gemini-3-pro-image-preview)** - High quality with 4K support
- Model selector in UI with clear indicators
- Smart model recommendations based on use case

**📐 NEW: Resolution Selector (Pro Only)**
- 1K (1024×1024) - Standard
- 2K (2048×2048) - High Quality
- **4K (4096×4096) - Ultra Quality** ✨
- Dynamic UI - only shows when Pro selected
- Visual feedback with gradient highlights

**💰 NEW: Real-Time Cost Calculator**
- Shows estimated cost BEFORE generation
- Updates dynamically as you:
  - Switch models (Flash ↔ Pro)
  - Change resolution (1K → 2K → 4K)
  - Add/remove reference images
- Transparent pricing with no surprises
- Beautiful gradient badge display

**📝 NEW: Text-in-Image System (Pro Only)**
- Add text directly to generated images
- Position controls: Top, Center, Bottom, Overlay
- Font styles: Bold, Italic, Calligraphy, Modern, Vintage
- Automatic text contrast optimization
- Perfect for marketing materials, infographics, menus
- Smart toggle - only visible when Pro model selected

**🖼️ NEW: 14 Reference Images Support**
- Increased from 4 to 14 (Pro model capability)
- Better multi-image combining
- Support for complex compositions
- Visual counter shows available slots

**🎨 UI/UX Improvements**
- Model selector with icons (⚡ Flash / ⭐ Pro)
- Resolution buttons with clear labels
- Cost estimator badge with yellow-magenta gradient
- Text-in-image panel with purple gradient
- **Precise Reference** now uses 👤 icon (cleaner mobile view)
- **Generate button** consistent gradient on all screen sizes
- Smooth animations and transitions
- Better mobile responsiveness

**🌐 Complete Italian/English Translations**
- All Pro features fully localized
- Model names, resolution labels, tooltips
- Text-in-image controls
- Cost calculator labels

**🔧 Technical Improvements**
- New types: `ModelType`, `ResolutionType`, `TextInImageConfig`
- `calculateEstimatedCost()` function in geminiService
- Enhanced `generateImage()` with 3 new parameters
- Updated FloatingActionBar with Pro controls
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

- **Google Gemini Team** - For Gemini 2.5 Flash & **Nano Banana Pro 3.0**
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

**Note**: Nano Banana Pro (gemini-3-pro-image-preview) requires billing enabled on your API key. It is not available in the free tier.

---

<div align="center">

**Made with ❤️ and 🤖 by Joz BGM**

⭐ **Star this repo if you find it useful!** ⭐

[Report Bug](https://github.com/jozbgm/generentolo-pro/issues) · [Request Feature](https://github.com/jozbgm/generentolo-pro/issues)

</div>
