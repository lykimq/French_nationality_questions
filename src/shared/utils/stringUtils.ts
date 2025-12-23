/**
 * String sanitization and type conversion utilities.
 * Provides safe, consistent ways to handle string data from various sources.
 */

/**
 * Safely converts any value to a string.
 * Handles null, undefined, objects, and primitives.
 * 
 * @param value - The value to convert
 * @param defaultValue - The default value if conversion fails
 * @returns A string representation of the value
 * 
 * @example
 * ensureString("hello") // "hello"
 * ensureString(null, "default") // "default"
 * ensureString({toString: () => "obj"}) // "obj"
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
 * Sanitizes a string by trimming whitespace.
 * Returns empty string for non-string inputs.
 * 
 * @param value - The value to sanitize
 * @returns Trimmed string or empty string
 * 
 * @example
 * sanitizeString("  hello  ") // "hello"
 * sanitizeString(null) // ""
 * sanitizeString(123) // ""
 */
export const sanitizeString = (value: unknown): string => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
};

/**
 * Sanitizes an array of strings.
 * Filters out non-strings and empty strings, trims all valid strings.
 * 
 * @param arr - The array to sanitize
 * @returns Array of sanitized strings
 * 
 * @example
 * sanitizeStringArray(["hello", "  ", null, "world"]) // ["hello", "world"]
 * sanitizeStringArray(null) // []
 */
export const sanitizeStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim());
};

/**
 * Checks if a value is a non-empty string.
 * 
 * @param value - The value to check
 * @returns True if value is a non-empty string
 * 
 * @example
 * isNonEmptyString("hello") // true
 * isNonEmptyString("") // false
 * isNonEmptyString(null) // false
 */
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Safely extracts a string property from an object.
 * 
 * @param obj - The object to extract from
 * @param key - The property key
 * @param defaultValue - The default value if extraction fails
 * @returns The extracted string or default value
 * 
 * @example
 * getStringProperty({name: "John"}, "name") // "John"
 * getStringProperty({}, "name", "Unknown") // "Unknown"
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

/**
 * Validates that a string meets minimum length requirements.
 * 
 * @param value - The string to validate
 * @param minLength - Minimum required length
 * @returns True if string meets length requirement
 * 
 * @example
 * isValidLength("hello", 3) // true
 * isValidLength("hi", 3) // false
 */
export const isValidLength = (value: string, minLength: number = 1): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength;
};

