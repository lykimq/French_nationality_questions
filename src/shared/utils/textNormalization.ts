/**
 * Text normalization utilities for consistent text processing across the application.
 * Different normalization strategies are provided for different use cases.
 */

/**
 * Normalizes text for search operations.
 * Converts to lowercase and trims whitespace.
 * 
 * @param text - The text to normalize
 * @returns Normalized text suitable for search
 * 
 * @example
 * normalizeForSearch("  Hello World  ") // "hello world"
 */
export const normalizeForSearch = (text: string): string => 
    (text || '').toLowerCase().trim();

/**
 * Normalizes text for strict comparison.
 * Removes all non-alphanumeric characters and converts to lowercase.
 * Useful for detecting duplicate content.
 * 
 * @param text - The text to normalize
 * @returns Normalized text with only alphanumeric characters
 * 
 * @example
 * normalizeForComparison("Hello, World!") // "helloworld"
 * normalizeForComparison("Café") // "caf"
 */
export const normalizeForComparison = (text: string): string => 
    (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Normalizes text for fuzzy matching.
 * Handles common variations like apostrophes and multiple spaces.
 * 
 * @param text - The text to normalize
 * @returns Normalized text suitable for fuzzy matching
 * 
 * @example
 * normalizeForMatching("l'école  française") // "l'ecole francaise"
 */
export const normalizeForMatching = (text: string): string => {
    if (!text) return '';
    
    let normalized = text.toLowerCase().trim();
    
    // Normalize apostrophes
    normalized = normalized.replace(/['']/g, "'");
    
    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ');
    
    return normalized;
};

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

