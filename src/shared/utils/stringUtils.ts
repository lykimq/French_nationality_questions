/**
 * String utilities for conversion, sanitization, and normalization.
 */
/**
 * Converts value to string, handles null/undefined/objects.
 */
export const ensureString = (
    value: unknown,
    defaultValue: string = ""
): string => {
    if (typeof value === "string") {
        return value;
    }
    if (value === null || value === undefined) {
        return defaultValue;
    }
    if (typeof value === "object") {
        return String(value);
    }
    return defaultValue;
};
/**
 * Trims string, returns empty for non-strings.
 */
export const sanitizeString = (value: unknown): string => {
    if (typeof value !== "string") {
        return "";
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
        .filter(
            (item): item is string =>
                typeof item === "string" && item.trim().length > 0
        )
        .map((item) => item.trim());
};
/**
 * Checks if value is non-empty string.
 */
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
};
/**
 * Normalizes text for search: lowercase, removes accents, unifies punctuation, trims.
 */
export const normalizeForSearch = (text: string): string => {
    if (!text) return "";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u2018\u2019\u201A\u2032\u2035']/g, "'")
        .replace(/[\u201C\u201D\u201E\u2033\u2036"]/g, " ")
        .replace(/[«»]/g, " ")
        .replace(/[?!.,;:!…]/g, " ")
        .replace(/\s*-\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

/**
 * Normalizes text for comparison: lowercase, removes non-alphanumeric.
 */
export const normalizeForComparison = (text: string): string =>
    (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
