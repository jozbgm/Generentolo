// IndexedDB service for storing large images efficiently
const DB_NAME = 'GenerentoloImageDB';
const DB_VERSION = 2; // Incremented for DNA Characters store
const STORE_NAME = 'images';
const HISTORY_STORE = 'history';
const DNA_STORE = 'dna_characters'; // v1.7: DNA Character Consistency

export interface DnaCharacter {
    id: string;
    name: string;
    dna: string; // The textual "genetic code" description
    thumbnailData?: string; // Optional portrait image
    timestamp: number;
}

interface ImageData {
    id: string;
    fullImageData: string;
    thumbnailData: string;
    timestamp: number;
}

interface HistoryMetadata {
    id: string;
    prompt: string;
    aspectRatio: string;
    negativePrompt?: string;
    seed?: string;
    timestamp: number;
}

class IndexedDBService {
    private db: IDBDatabase | null = null;
    private isAvailable: boolean = true;

    async init(): Promise<void> {
        // Check if IndexedDB is available
        if (!('indexedDB' in window)) {
            this.isAvailable = false;
            console.warn('IndexedDB not available. Storage features will be limited.');
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = () => {
                    console.error('IndexedDB error:', request.error);
                    this.isAvailable = false;
                    // Don't reject - allow app to continue without IndexedDB
                    resolve();
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    this.isAvailable = true;
                    resolve();
                };

                request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                    const db = (event.target as IDBOpenDBRequest).result;

                    // Create images store
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const imageStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                        imageStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }

                    // Create history metadata store
                    if (!db.objectStoreNames.contains(HISTORY_STORE)) {
                        const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
                        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }

                    // Create DNA Characters store
                    if (!db.objectStoreNames.contains(DNA_STORE)) {
                        const dnaStore = db.createObjectStore(DNA_STORE, { keyPath: 'id' });
                        dnaStore.createIndex('timestamp', 'timestamp', { unique: false });
                        dnaStore.createIndex('name', 'name', { unique: false });
                    }
                };

                request.onblocked = () => {
                    console.warn('IndexedDB blocked. Please close other tabs with this app.');
                };
            } catch (error) {
                console.error('IndexedDB initialization failed:', error);
                this.isAvailable = false;
                resolve(); // Don't reject - allow app to continue
            }
        });
    }

    private checkAvailability(): boolean {
        if (!this.isAvailable || !this.db) {
            console.warn('IndexedDB not available. Operation skipped.');
            return false;
        }
        return true;
    }

    async saveImage(imageData: ImageData): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(imageData);

                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error('Failed to save image to IndexedDB:', request.error);
                    // Resolve instead of reject to not break app flow
                    resolve();
                };

                transaction.onerror = () => {
                    console.error('Transaction error while saving image:', transaction.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in saveImage:', error);
                resolve();
            }
        });
    }

    async saveHistoryMetadata(metadata: HistoryMetadata): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
                const store = transaction.objectStore(HISTORY_STORE);
                const request = store.put(metadata);

                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error('Failed to save history metadata:', request.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in saveHistoryMetadata:', error);
                resolve();
            }
        });
    }

    async getImage(id: string): Promise<ImageData | null> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve(null);

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => {
                    console.error('Failed to get image:', request.error);
                    resolve(null);
                };
            } catch (error) {
                console.error('Error in getImage:', error);
                resolve(null);
            }
        });
    }

    async getAllHistory(): Promise<HistoryMetadata[]> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve([]);

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([HISTORY_STORE], 'readonly');
                const store = transaction.objectStore(HISTORY_STORE);
                const index = store.index('timestamp');
                const request = index.openCursor(null, 'prev'); // Get newest first

                const results: HistoryMetadata[] = [];
                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => {
                    console.error('Failed to get history:', request.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('Error in getAllHistory:', error);
                resolve([]);
            }
        });
    }

    async deleteImage(id: string): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([STORE_NAME, HISTORY_STORE], 'readwrite');

                // Delete from both stores
                const imageStore = transaction.objectStore(STORE_NAME);
                const historyStore = transaction.objectStore(HISTORY_STORE);

                imageStore.delete(id);
                historyStore.delete(id);

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => {
                    console.error('Failed to delete image:', transaction.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in deleteImage:', error);
                resolve();
            }
        });
    }

    async clearAll(): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([STORE_NAME, HISTORY_STORE], 'readwrite');

                transaction.objectStore(STORE_NAME).clear();
                transaction.objectStore(HISTORY_STORE).clear();

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => {
                    console.error('Failed to clear storage:', transaction.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in clearAll:', error);
                resolve();
            }
        });
    }

    async deleteMultiple(ids: string[]): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([STORE_NAME, HISTORY_STORE], 'readwrite');
                const imageStore = transaction.objectStore(STORE_NAME);
                const historyStore = transaction.objectStore(HISTORY_STORE);

                ids.forEach(id => {
                    imageStore.delete(id);
                    historyStore.delete(id);
                });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => {
                    console.error('Failed to delete multiple images:', transaction.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in deleteMultiple:', error);
                resolve();
            }
        });
    }

    // --- DNA Character Methods ---

    async saveDnaCharacter(dnaChar: DnaCharacter): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([DNA_STORE], 'readwrite');
                const store = transaction.objectStore(DNA_STORE);
                const request = store.put(dnaChar);

                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error('Failed to save DNA Character:', request.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in saveDnaCharacter:', error);
                resolve();
            }
        });
    }

    async getAllDnaCharacters(): Promise<DnaCharacter[]> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve([]);

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([DNA_STORE], 'readonly');
                const store = transaction.objectStore(DNA_STORE);
                const index = store.index('timestamp');
                const request = index.openCursor(null, 'prev');

                const results: DnaCharacter[] = [];
                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => {
                    console.error('Failed to get DNA Characters:', request.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('Error in getAllDnaCharacters:', error);
                resolve([]);
            }
        });
    }

    async deleteDnaCharacter(id: string): Promise<void> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([DNA_STORE], 'readwrite');
                const store = transaction.objectStore(DNA_STORE);
                const request = store.delete(id);

                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error('Failed to delete DNA Character:', request.error);
                    resolve();
                };
            } catch (error) {
                console.error('Error in deleteDnaCharacter:', error);
                resolve();
            }
        });
    }

    async getStorageSize(): Promise<number> {
        if (!this.db) await this.init();
        if (!this.checkAvailability()) return Promise.resolve(0);

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const items = request.result;
                    let totalSize = 0;
                    items.forEach((item: ImageData) => {
                        totalSize += (item.fullImageData?.length || 0) + (item.thumbnailData?.length || 0);
                    });
                    // Convert to MB
                    resolve(totalSize / (1024 * 1024));
                };
                request.onerror = () => {
                    console.error('Failed to get storage size:', request.error);
                    resolve(0);
                };
            } catch (error) {
                console.error('Error in getStorageSize:', error);
                resolve(0);
            }
        });
    }
}

export const indexedDBService = new IndexedDBService();
