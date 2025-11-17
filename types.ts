export interface GeneratedImage {
  id: string;
  imageDataUrl?: string; // Full resolution, optional for items loaded from storage
  thumbnailDataUrl?: string; // Lightweight thumbnail for history display and storage
  prompt: string;
  aspectRatio: string;
  timestamp: number;
  negativePrompt?: string;
  seed?: string;
  originalImageDataUrl?: string; // Original image before upscaling (for comparison)
  isFavorite?: boolean; // v0.8: Bookmark/favorite system
}

export interface DynamicTool {
  name: string;
  label: string;
  options: string[];
}

export interface PromptPreset {
  id: string;
  name: string;
  prompt: string;
  negativePrompt?: string;
  timestamp: number;
}
