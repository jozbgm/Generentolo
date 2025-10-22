// Prompt Library Service for saving and managing favorite prompts

export interface SavedPrompt {
    id: string;
    name: string;
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: string;
    category?: string;
    timestamp: number;
}

const STORAGE_KEY = 'generentolo-prompt-library';

export class PromptLibraryService {
    private prompts: SavedPrompt[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.prompts = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load prompt library:', error);
            this.prompts = [];
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prompts));
        } catch (error) {
            console.error('Failed to save prompt library:', error);
        }
    }

    addPrompt(prompt: Omit<SavedPrompt, 'id' | 'timestamp'>): SavedPrompt {
        const newPrompt: SavedPrompt = {
            ...prompt,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        this.prompts.unshift(newPrompt);
        this.saveToStorage();
        return newPrompt;
    }

    getAll(): SavedPrompt[] {
        return [...this.prompts];
    }

    getByCategory(category: string): SavedPrompt[] {
        return this.prompts.filter(p => p.category === category);
    }

    delete(id: string): boolean {
        const initialLength = this.prompts.length;
        this.prompts = this.prompts.filter(p => p.id !== id);
        const deleted = initialLength !== this.prompts.length;
        if (deleted) this.saveToStorage();
        return deleted;
    }

    update(id: string, updates: Partial<Omit<SavedPrompt, 'id' | 'timestamp'>>): boolean {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        this.prompts[index] = {
            ...this.prompts[index],
            ...updates,
        };
        this.saveToStorage();
        return true;
    }

    clear() {
        this.prompts = [];
        this.saveToStorage();
    }

    search(query: string): SavedPrompt[] {
        const lowerQuery = query.toLowerCase();
        return this.prompts.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.prompt.toLowerCase().includes(lowerQuery) ||
            p.category?.toLowerCase().includes(lowerQuery)
        );
    }

    export(): string {
        return JSON.stringify(this.prompts, null, 2);
    }

    import(jsonString: string): boolean {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.prompts = [...imported, ...this.prompts];
                this.saveToStorage();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import prompts:', error);
            return false;
        }
    }
}

export const promptLibrary = new PromptLibraryService();
