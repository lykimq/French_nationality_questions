/**
 * Shared types for raw/unvalidated data structures from JSON files.
 * These types represent the shape of data before validation and processing.
 */

/**
 * Raw question data as it appears in JSON files.
 * Fields are optional because JSON may have missing or malformed data.
 */
export interface RawQuestion {
    readonly id?: number | string;
    readonly question?: string | Record<string, unknown>;
    readonly explanation?: string | Record<string, unknown>;
    readonly image?: string | null;
}

/**
 * Raw category data as it appears in JSON files.
 * Used for both main categories and subcategories.
 */
export interface RawCategory {
    readonly id?: string;
    readonly title?: string;
    readonly icon?: string;
    readonly description?: string;
    readonly questions?: readonly RawQuestion[];
}

/**
 * Raw questions data structure containing categories.
 * This is the top-level structure for question data files.
 */
export interface RawQuestionsData {
    readonly categories?: readonly RawCategory[];
}

/**
 * Raw data structure that can represent either:
 * - A category with subcategories (metadata structure)
 * - A collection of questions (question list structure)
 */
export interface RawDataStructure {
    readonly id?: string;
    readonly title?: string;
    readonly subcategories?: readonly RawCategory[];
    readonly questions?: readonly RawQuestion[];
}



