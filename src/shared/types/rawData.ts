/**
 * Raw/unvalidated data types from JSON files.
 */

/**
 * Raw question data from JSON (optional fields).
 */
export interface RawQuestion {
    readonly id?: number | string;
    readonly question?: string | Record<string, unknown>;
    readonly explanation?: string | Record<string, unknown>;
    readonly image?: string | null;
}

/**
 * Raw category data from JSON.
 */
export interface RawCategory {
    readonly id?: string;
    readonly title?: string;
    readonly icon?: string;
    readonly description?: string;
    readonly questions?: readonly RawQuestion[];
}

/**
 * Top-level raw questions data structure.
 */
export interface RawQuestionsData {
    readonly categories?: readonly RawCategory[];
}

/**
 * Raw data structure: category with subcategories or question list.
 */
export interface RawDataStructure {
    readonly id?: string;
    readonly title?: string;
    readonly subcategories?: readonly RawCategory[];
    readonly questions?: readonly RawQuestion[];
}
