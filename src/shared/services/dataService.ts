import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebaseConfig';
import { LOCAL_DATA_MAP, LOCAL_IMAGE_MAP } from '../config/dataConfig';
import { validateDataStructure } from '../utils/dataValidation';
import { createLogger } from '../utils/logger';
import type { FrenchQuestionsData } from '../../types/questionsData';

const logger = createLogger('DataService');

type CacheEntry<T> = {
    value: T;
    fetchedAt: number;
};

type ResourceCache<T> = Map<string, CacheEntry<T>>;

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

const dataCache: ResourceCache<FrenchQuestionsData | Record<string, unknown>> = new Map();
const imageCache: ResourceCache<{ uri: string }> = new Map();
const failedDataCache: Map<string, number> = new Map();
const failedImageCache: Map<string, number> = new Map();

const now = () => Date.now();

const isFresh = (entry?: CacheEntry<unknown>, ttlMs: number = DEFAULT_TTL_MS) =>
    entry ? now() - entry.fetchedAt < ttlMs : false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LoadOptions {
    ttlMs?: number;
    retryCount?: number;
    retryDelayMs?: number;
}

const getLocalJsonData = async (dataPath: string): Promise<FrenchQuestionsData | Record<string, unknown> | null> => {
    try {
        const localData = LOCAL_DATA_MAP[dataPath];
        if (localData) {
            return localData;
        }
        return null;
    } catch (error) {
        logger.error(`Failed to load local JSON data: ${dataPath}`, error);
        return null;
    }
};

const fetchFirebaseJson = async (dataPath: string): Promise<FrenchQuestionsData | Record<string, unknown> | null> => {
    if (!storage) return null;
    const dataRef = ref(storage, `French_questions/data/${dataPath}`);
    const downloadURL = await getDownloadURL(dataRef);
    const response = await fetch(downloadURL);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    const validationResult = validateDataStructure(jsonData, dataPath);

    if (!validationResult.isValid) {
        logger.error(`Data validation failed for ${dataPath}:`, validationResult.errors);
    }
    return jsonData;
};

const shouldRetry = (failureTime: number, ttlMs: number) => now() - failureTime > ttlMs;

export const loadJsonResource = async (
    dataPath: string,
    options: LoadOptions = {}
): Promise<FrenchQuestionsData | Record<string, unknown> | null> => {
    const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    const retryCount = options.retryCount ?? DEFAULT_RETRY_COUNT;
    const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

    const cached = dataCache.get(dataPath);
    if (isFresh(cached, ttlMs)) {
        return cached!.value;
    }

    const failedAt = failedDataCache.get(dataPath);
    if (failedAt && !shouldRetry(failedAt, ttlMs)) {
        const localFallback = await getLocalJsonData(dataPath);
        if (localFallback) return localFallback;
        return cached?.value ?? null;
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
            const remote = await fetchFirebaseJson(dataPath);
            if (remote) {
                dataCache.set(dataPath, { value: remote, fetchedAt: now() });
                failedDataCache.delete(dataPath);
                return remote;
            }
        } catch (error) {
            lastError = error;
            if (attempt < retryCount) {
                await delay(retryDelayMs);
            }
        }
    }

    const localData = await getLocalJsonData(dataPath);
    if (localData) {
        dataCache.set(dataPath, { value: localData, fetchedAt: now() });
        failedDataCache.set(dataPath, now());
        return localData;
    }

    failedDataCache.set(dataPath, now());
    logger.error(`Failed to load JSON data: ${dataPath}`, lastError);
    return cached?.value ?? null;
};

export const loadJsonCollection = async (
    files: readonly string[],
    directoryPrefix: string = '',
    keySuffixToRemove: string = '.json',
    useIdAsKey: boolean = false,
    options: LoadOptions = {}
): Promise<Record<string, FrenchQuestionsData | Record<string, unknown>>> => {
    const dataMap: Record<string, FrenchQuestionsData | Record<string, unknown>> = {};
    await Promise.all(files.map(async (filename) => {
        const fallbackKey = filename.replace(keySuffixToRemove, '');
        const dataPath = `${directoryPrefix}${filename}`;
        const data = await loadJsonResource(dataPath, options);
        const key = useIdAsKey && data && typeof data === 'object' && 'id' in data && typeof (data as any).id === 'string'
            ? (data as any).id
            : fallbackKey;

        if (data) {
            dataMap[key] = data;
        } else {
            logger.warn(`Failed to load collection item: ${key}`);
        }
    }));

    return dataMap;
};

export const invalidateDataCache = (dataPath?: string) => {
    if (dataPath) {
        dataCache.delete(dataPath);
        failedDataCache.delete(dataPath);
    } else {
        dataCache.clear();
        failedDataCache.clear();
    }
};

const fetchFirebaseImage = async (imagePath: string): Promise<string | null> => {
    if (!storage) return null;
    const imageRef = ref(storage, `French_questions/assets/${imagePath}`);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
};

export const loadImageResource = async (
    imagePath: string,
    options: LoadOptions = {}
): Promise<{ uri: string } | null> => {
    const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    const retryCount = options.retryCount ?? DEFAULT_RETRY_COUNT;
    const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

    if (!imagePath) return null;

    const cached = imageCache.get(imagePath);
    if (isFresh(cached, ttlMs)) {
        return cached!.value;
    }

    const failedAt = failedImageCache.get(imagePath);
    if (failedAt && !shouldRetry(failedAt, ttlMs)) {
        const localImage = LOCAL_IMAGE_MAP[imagePath];
        if (localImage) return localImage as any;
        return cached?.value ?? null;
    }

    if (imagePath.startsWith('https://')) {
        const value = { uri: imagePath };
        imageCache.set(imagePath, { value, fetchedAt: now() });
        failedImageCache.delete(imagePath);
        return value;
    }
    
    if (imagePath.startsWith('http://')) {
        logger.warn(`Blocked insecure HTTP image URL: ${imagePath}`);
        return null;
    }

    const localImage = LOCAL_IMAGE_MAP[imagePath];
    if (localImage) {
        imageCache.set(imagePath, { value: localImage as any, fetchedAt: now() });
        failedImageCache.delete(imagePath);
        return localImage as any;
    }

    const filename = imagePath.replace(/^.*[\\/]/, '');
    let lastError: unknown;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
            const firebaseUrl = await fetchFirebaseImage(filename);
            if (firebaseUrl) {
                const value = { uri: firebaseUrl };
                imageCache.set(imagePath, { value, fetchedAt: now() });
                failedImageCache.delete(imagePath);
                return value;
            }
        } catch (error) {
            lastError = error;
            if (attempt < retryCount) {
                await delay(retryDelayMs);
            }
        }
    }

    failedImageCache.set(imagePath, now());
    logger.error(`Failed to load image: ${imagePath}`, lastError);
    return cached?.value ?? null;
};

export const invalidateImageCache = (imagePath?: string) => {
    if (imagePath) {
        imageCache.delete(imagePath);
        failedImageCache.delete(imagePath);
    } else {
        imageCache.clear();
        failedImageCache.clear();
    }
};

export const getCachedImage = (imagePath: string): { uri: string } | null => {
    const cached = imageCache.get(imagePath);
    if (cached) {
        return cached.value;
    }
    const localImage = LOCAL_IMAGE_MAP[imagePath];
    if (localImage) return localImage as any;
    const filename = imagePath.replace(/^.*[\\/]/, '');
    return imageCache.get(filename)?.value ?? null;
};

