/**
 * String utilities for conversion, sanitization, and normalization.
 */

// ==================== TYPE CONVERSION ====================

/**
 * Converts value to string, handles null/undefined/objects.
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

// ==================== SANITIZATION ====================

/**
 * Trims string, returns empty for non-strings.
 */
export const sanitizeString = (value: unknown): string => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
};

/**
 * Sanitizes string array: filters non-strings/empty, trims valid strings.
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
 * Checks if value is non-empty string.
 */
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

// ==================== TEXT NORMALIZATION ====================

/**
 * Normalizes text for search: lowercase, removes accents, trims.
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
 * Normalizes text for comparison: lowercase, removes non-alphanumeric.
 */
export const normalizeForComparison = (text: string): string => 
    (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

