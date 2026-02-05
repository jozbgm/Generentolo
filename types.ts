export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
export type ResolutionType = '1k' | '2k' | '4k';

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
  model?: ModelType; // v1.0: Model used for generation
  resolution?: ResolutionType; // v1.0: Resolution used (only for PRO model)
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

export interface TextInImageConfig {
  enabled: boolean;
  text?: string;
  position?: 'top' | 'center' | 'bottom' | 'overlay';
  fontStyle?: 'bold' | 'italic' | 'calligraphy' | 'modern' | 'vintage';
}

export interface GenerationTask {
  id: string;
  prompt: string;
  negativePrompt: string;
  seed: string;
  aspectRatio: string;
  numImages: number;
  model: ModelType;
  resolution: ResolutionType;
  referenceImages: File[];
  styleImage: File | null;
  structureImage: File | null;
  selectedDnaIds: string[]; // v2.0: Multi-DNA selection support
  studioConfig: any;
  useGrounding: boolean;
  preciseReference: boolean;
  autoEnhance: boolean;
  timestamp: number;
}
