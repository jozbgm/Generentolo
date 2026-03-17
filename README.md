# Generentolo PRO

**Professional AI image generation suite powered by Google Gemini.**

Generate, iterate, and storyboard images at up to 4K resolution with triple-model support, DNA character consistency, and advanced production controls — all in the browser.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://www.dugongo.it/generentolo/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## Features

- **Triple-model support** — Flash (fast), PRO (4K quality), Nano Banana 2 (speed + quality)
- **Native 4K generation** — up to 4096×4096px with PRO and NB2 models
- **DNA Character Consistency** — extract a character's physical profile from reference images and inject it into any generation
- **Perspective Studio** — 3D camera gizmo for multi-angle character turnarounds and batch angle generation
- **Cinematic Storyboard** — transform a single reference image into a 9-frame storyboard with narrative continuity
- **Generation Queue** — queue multiple tasks and monitor progress without interrupting your workflow
- **Google Search Grounding** — automatically fetch real reference images from Google Images; use `[brackets]` for explicit keyword control
- **Auto-Enhance** — AI art director optimizes your prompt before every generation
- **Inpainting** — mask-based region editing on existing images
- **Prompt Library** — 150+ professional prompts across 15 categories, with search and one-click apply
- **Multi-reference support** — up to 14 reference images (PRO), style reference, and structure guide image
- **Persistent history** — last 12 generations saved with full metadata; favorites system
- **Bilingual UI** — full English / Italian support with live toggle

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19.2 |
| **Language** | TypeScript 5.8 |
| **Build** | Vite 6.2 |
| **Styling** | Tailwind CSS 3.4 |
| **AI SDK** | `@google/genai` v1.38 |
| **Storage** | IndexedDB + localStorage |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/jozbgm/Generentolo.git
cd Generentolo

# 2. Install
npm install

# 3. Configure (see Environment Variables below)
cp .env.example .env.local

# 4. Run
npm run dev
```

Open [http://localhost:5173/generentolo/](http://localhost:5173/generentolo/)

---

## Environment Variables

Create a `.env.local` file at the project root:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_KEY` | ✅ | Google Gemini API key — [get one free](https://ai.google.dev/) |
| `VITE_GOOGLE_SEARCH_API_KEY` | Optional | Enables Google Search Grounding |
| `VITE_GOOGLE_SEARCH_ENGINE_ID` | Optional | Custom Search Engine ID (pairs with above) |

> **Note**: PRO and NB2 models require billing enabled on your API key.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+G` | Generate |
| `Ctrl+E` | Enhance prompt |
| `Ctrl+R` | Randomize seed |
| `Ctrl+K` | Reset interface |
| `Ctrl+,` | Open settings |
| `Ctrl+P` | Focus prompt |
| `Ctrl+Shift+T` | Toggle theme |

---

## Pricing Reference

| Model | Resolution | Est. cost / image |
|---|---|---|
| Flash (`gemini-2.5-flash-image`) | up to 2K | ~$0.04 |
| PRO (`gemini-3-pro-image-preview`) | 1K / 2K | ~$0.13 |
| PRO (`gemini-3-pro-image-preview`) | 4K | ~$0.24 |
| Nano Banana 2 (`gemini-3.1-flash-image-preview`) | 1K / 2K | variable |

Reference images add ~$0.067 each (PRO model). Costs are estimates — see [Google AI pricing](https://ai.google.dev/pricing) for current rates.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit and push
4. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Contact

**Joz BGM** · [bgm.media](https://bgm.media) · [joz@bgm.media](mailto:joz@bgm.media)

---

<div align="center">

[Live Demo](https://www.dugongo.it/generentolo/) · [Report Bug](https://github.com/jozbgm/Generentolo/issues) · [Request Feature](https://github.com/jozbgm/Generentolo/issues)

</div>
