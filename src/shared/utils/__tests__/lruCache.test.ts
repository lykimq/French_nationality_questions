import { LRUCache } from "../lruCache";

describe("LRUCache", () => {
    it("evictOldestKey removes the least recently used entry", () => {
        const cache = new LRUCache<string>(2);
        const now = Date.now();

        cache.set("a", { value: "a", fetchedAt: now });
        cache.set("b", { value: "b", fetchedAt: now });
        cache.get("a");

        expect(cache.evictOldestKey()).toBe("b");
        expect(cache.has("b")).toBe(false);
        expect(cache.has("a")).toBe(true);
    });
});
