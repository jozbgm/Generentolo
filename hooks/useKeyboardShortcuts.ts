import { useEffect } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            for (const shortcut of shortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

                if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
};

// Predefined shortcuts for the app
export const APP_SHORTCUTS = {
    GENERATE: { key: 'g', ctrlKey: true, description: 'Generate images (Ctrl+G)' },
    ENHANCE_PROMPT: { key: 'e', ctrlKey: true, description: 'Enhance prompt (Ctrl+E)' },
    RANDOM_SEED: { key: 'r', ctrlKey: true, description: 'Randomize seed (Ctrl+R)' },
    CLEAR_INTERFACE: { key: 'k', ctrlKey: true, description: 'Clear interface (Ctrl+K)' },
    OPEN_SETTINGS: { key: ',', ctrlKey: true, description: 'Open settings (Ctrl+,)' },
    FOCUS_PROMPT: { key: 'p', ctrlKey: true, description: 'Focus prompt field (Ctrl+P)' },
    TOGGLE_THEME: { key: 't', ctrlKey: true, shiftKey: true, description: 'Toggle theme (Ctrl+Shift+T)' },
};
