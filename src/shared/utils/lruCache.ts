/**
 * LRU cache with TTL support and automatic eviction.
 */

type CacheEntry<T> = {
    value: T;
    fetchedAt: number;
};

export class LRUCache<T> {
    private cache: Map<string, CacheEntry<T>>;
    private maxSize: number;

    constructor(maxSize: number = 100) {
        if (maxSize <= 0) {
            throw new Error('LRU cache maxSize must be greater than 0');
        }
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key: string): CacheEntry<T> | undefined {
        const entry = this.cache.get(key);
        if (entry) {
            this.cache.delete(key);
            this.cache.set(key, entry);
        }
        return entry;
    }

    set(key: string, value: CacheEntry<T>): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    get size(): number {
        return this.cache.size;
    }

    get maxSizeLimit(): number {
        return this.maxSize;
    }

    cleanupStaleEntries(ttlMs: number, now: () => number = () => Date.now()): number {
        const currentTime = now();
        const keysToDelete: string[] = [];
        
        for (const [key, entry] of this.cache.entries()) {
            if (currentTime - entry.fetchedAt >= ttlMs) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
        
        return keysToDelete.length;
    }
}

