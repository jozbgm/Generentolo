export interface GeneratedImage {
  id: string;
  imageDataUrl?: string; // Full resolution, optional for items loaded from storage
  thumbnailDataUrl?: string; // Lightweight thumbnail for history display and storage
  prompt: string;
  aspectRatio: string;
  timestamp: number;
  negativePrompt?: string;
  seed?: string;
}

export interface DynamicTool {
  name: string;
  label: string;
  options: string[];
}
