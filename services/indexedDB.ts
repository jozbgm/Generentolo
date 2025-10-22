// IndexedDB service for storing large images efficiently
const DB_NAME = 'GenerentoloImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const HISTORY_STORE = 'history';

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

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
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
            };
        });
    }

    async saveImage(imageData: ImageData): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(imageData);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async saveHistoryMetadata(metadata: HistoryMetadata): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.put(metadata);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getImage(id: string): Promise<ImageData | null> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllHistory(): Promise<HistoryMetadata[]> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
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
            request.onerror = () => reject(request.error);
        });
    }

    async deleteImage(id: string): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME, HISTORY_STORE], 'readwrite');
            
            // Delete from both stores
            const imageStore = transaction.objectStore(STORE_NAME);
            const historyStore = transaction.objectStore(HISTORY_STORE);
            
            imageStore.delete(id);
            historyStore.delete(id);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async clearAll(): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME, HISTORY_STORE], 'readwrite');
            
            transaction.objectStore(STORE_NAME).clear();
            transaction.objectStore(HISTORY_STORE).clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async deleteMultiple(ids: string[]): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME, HISTORY_STORE], 'readwrite');
            const imageStore = transaction.objectStore(STORE_NAME);
            const historyStore = transaction.objectStore(HISTORY_STORE);

            ids.forEach(id => {
                imageStore.delete(id);
                historyStore.delete(id);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getStorageSize(): Promise<number> {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
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
            request.onerror = () => reject(request.error);
        });
    }
}

export const indexedDBService = new IndexedDBService();
