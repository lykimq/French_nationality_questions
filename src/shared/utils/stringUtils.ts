/**
 * String utilities for type conversion, sanitization, validation, and normalization.
 */

// ==================== TYPE CONVERSION ====================

/**
 * Converts any value to a string. Handles null, undefined, objects, and primitives.
 */
export const ensureString = (value: unknown, defaultValue: string = ''): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (value === null || value === undefined) {
        return defaultValue;
    }
    if (typeof value === 'object') {
        return String(value);
    }
    return defaultValue;
};

/**
 * Extracts a string property from an object.
 */
export const getStringProperty = (
    obj: unknown,
    key: string,
    defaultValue: string = ''
): string => {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }
    const value = (obj as Record<string, unknown>)[key];
    return ensureString(value, defaultValue);
};

// ==================== SANITIZATION ====================

/**
 * Trims whitespace from a string. Returns empty string for non-string inputs.
 */
export const sanitizeString = (value: unknown): string => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
};

/**
 * Sanitizes an array of strings. Filters out non-strings and empty strings, trims valid strings.
 */
export const sanitizeStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim());
};

// ==================== VALIDATION ====================

/**
 * Checks if a value is a non-empty string.
 */
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates that a string meets minimum length requirements.
 */
export const isValidLength = (value: string, minLength: number = 1): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength;
};

// ==================== TEXT NORMALIZATION ====================

/**
 * Normalizes text for search: lowercase, removes accents, trims whitespace.
 * Preserves spaces and punctuation.
 */
export const normalizeForSearch = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

/**
 * Normalizes text for strict comparison: lowercase, removes all non-alphanumeric characters.
 * Used for deduplication and exact matching.
 */
export const normalizeForComparison = (text: string): string => 
    (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// ==================== COMPARISON HELPERS ====================

/**
 * Checks if two texts are similar after normalization.
 */
export const areSimilarTexts = (text1: string, text2: string): boolean => {
    const norm1 = normalizeForComparison(text1);
    const norm2 = normalizeForComparison(text2);
    return norm1.length > 0 && norm1 === norm2;
};

/**
 * Checks if one text contains another after normalization.
 */
export const containsNormalized = (haystack: string, needle: string): boolean => {
    const normHaystack = normalizeForComparison(haystack);
    const normNeedle = normalizeForComparison(needle);
    return normNeedle.length > 0 && normHaystack.includes(normNeedle);
};
