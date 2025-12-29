/**
 * Text normalization utilities for consistent text processing across the application.
 * Different normalization strategies are provided for different use cases.
 * 
 * **When to use each function:**
 * - `normalizeForSearch`: Use for search/filtering operations where you want to match
 *   text with or without accents (e.g., "français" matches "francais")
 * - `normalizeForComparison`: Use for strict equality checks and deduplication where
 *   you only care about alphanumeric content (removes all punctuation, spaces, accents)
 */

/**
 * Normalizes text for search operations.
 * 
 * **Use case:** Search queries, filtering, text matching where accents should be ignored.
 * 
 * **Behavior:**
 * - Converts to lowercase
 * - Removes accents/diacritics (é -> e, ç -> c)
 * - Trims whitespace
 * - Preserves spaces, punctuation, and special characters
 * 
 * @param text - The text to normalize
 * @returns Normalized text suitable for search
 * 
 * @example
 * normalizeForSearch("  Français  ") // "francais"
 * normalizeForSearch("Café au lait") // "cafe au lait"
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
 * Normalizes text for strict comparison and deduplication.
 * 
 * **Use case:** Detecting duplicate content, exact matching where only alphanumeric
 * characters matter (ignores punctuation, spaces, accents).
 * 
 * **Behavior:**
 * - Converts to lowercase
 * - Removes ALL non-alphanumeric characters (spaces, punctuation, accents, etc.)
 * - Keeps only letters (a-z) and numbers (0-9)
 * 
 * @param text - The text to normalize
 * @returns Normalized text with only alphanumeric characters
 * 
 * @example
 * normalizeForComparison("Hello, World!") // "helloworld"
 * normalizeForComparison("Café au lait") // "cafeaulait"
 * normalizeForComparison("Question 1: What is...") // "question1whatis"
 */
export const normalizeForComparison = (text: string): string => 
    (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Checks if two texts are similar after normalization.
 * Uses strict comparison normalization.
 * 
 * @param text1 - First text to compare
 * @param text2 - Second text to compare
 * @returns True if texts are similar
 * 
 * @example
 * areSimilarTexts("Hello, World!", "hello world") // true
 */
export const areSimilarTexts = (text1: string, text2: string): boolean => {
    const norm1 = normalizeForComparison(text1);
    const norm2 = normalizeForComparison(text2);
    return norm1.length > 0 && norm1 === norm2;
};

/**
 * Checks if one text contains another after normalization.
 * 
 * @param haystack - The text to search in
 * @param needle - The text to search for
 * @returns True if haystack contains needle
 * 
 * @example
 * containsNormalized("Hello World", "WORLD") // true
 */
export const containsNormalized = (haystack: string, needle: string): boolean => {
    const normHaystack = normalizeForComparison(haystack);
    const normNeedle = normalizeForComparison(needle);
    return normNeedle.length > 0 && normHaystack.includes(normNeedle);
};

