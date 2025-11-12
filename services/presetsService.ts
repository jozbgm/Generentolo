import { PromptPreset } from '../types';

const PRESETS_STORAGE_KEY = 'generentolo_prompt_presets';
const MAX_PRESETS = 50;

export const loadPresets = (): PromptPreset[] => {
    try {
        const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load presets:', error);
        return [];
    }
};

export const savePresets = (presets: PromptPreset[]): void => {
    try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
        console.error('Failed to save presets:', error);
    }
};

export const addPreset = (name: string, prompt: string, negativePrompt?: string): PromptPreset => {
    const presets = loadPresets();

    // Check if max presets reached
    if (presets.length >= MAX_PRESETS) {
        throw new Error(`Maximum ${MAX_PRESETS} presets allowed`);
    }

    const newPreset: PromptPreset = {
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        prompt,
        negativePrompt,
        timestamp: Date.now()
    };

    const updatedPresets = [newPreset, ...presets];
    savePresets(updatedPresets);
    return newPreset;
};

export const deletePreset = (id: string): void => {
    const presets = loadPresets();
    const filtered = presets.filter(p => p.id !== id);
    savePresets(filtered);
};

export const updatePreset = (id: string, updates: Partial<PromptPreset>): void => {
    const presets = loadPresets();
    const index = presets.findIndex(p => p.id === id);
    if (index !== -1) {
        presets[index] = { ...presets[index], ...updates };
        savePresets(presets);
    }
};

export const exportPresets = (): string => {
    const presets = loadPresets();
    return JSON.stringify(presets, null, 2);
};

export const importPresets = (jsonString: string): void => {
    try {
        const imported = JSON.parse(jsonString) as PromptPreset[];

        // Validate structure
        if (!Array.isArray(imported)) {
            throw new Error('Invalid presets format');
        }

        const existing = loadPresets();
        const merged = [...imported, ...existing];

        // Remove duplicates and limit to MAX_PRESETS
        const uniquePresets = Array.from(
            new Map(merged.map(p => [p.id, p])).values()
        ).slice(0, MAX_PRESETS);

        savePresets(uniquePresets);
    } catch (error) {
        console.error('Failed to import presets:', error);
        throw error;
    }
};
