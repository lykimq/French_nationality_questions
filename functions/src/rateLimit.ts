import { HttpsError } from "firebase-functions/v2/https";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const CLEANUP_INTERVAL_MS = 5 * 60_000;

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const buckets = new Map<string, RateLimitEntry>();
let lastCleanupAt = Date.now();

const cleanupStaleBuckets = (now: number): void => {
    if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
        return;
    }
    lastCleanupAt = now;
    for (const [key, entry] of buckets.entries()) {
        if (now - entry.windowStart > WINDOW_MS) {
            buckets.delete(key);
        }
    }
};

export const resolveClientKey = (
    ip: string | undefined,
    forwardedFor: string | undefined
): string => {
    if (forwardedFor) {
        const first = forwardedFor.split(",")[0]?.trim();
        if (first) {
            return first;
        }
    }
    if (ip && ip.trim().length > 0) {
        return ip.trim();
    }
    return "unknown";
};

export const assertWithinRateLimit = (clientKey: string): void => {
    const now = Date.now();
    cleanupStaleBuckets(now);

    let entry = buckets.get(clientKey);
    if (!entry || now - entry.windowStart >= WINDOW_MS) {
        entry = { count: 0, windowStart: now };
    }

    entry.count += 1;
    buckets.set(clientKey, entry);

    if (entry.count > MAX_REQUESTS_PER_WINDOW) {
        throw new HttpsError(
            "resource-exhausted",
            "Too many speech synthesis requests. Please try again in a minute."
        );
    }
};
