export interface UseQuestionSearchFeatures {
    filters?: boolean;
    history?: boolean;
    suggestions?: boolean;
}

export interface UseQuestionSearchOptions {
    debounceMs?: number;
    suggestionsDebounceMs?: number;
    features?: UseQuestionSearchFeatures;
}

export const DEFAULT_SEARCH_FEATURES: Required<UseQuestionSearchFeatures> = {
    filters: false,
    history: false,
    suggestions: false,
};

export const SEARCH_TAB_OPTIONS: UseQuestionSearchOptions = {
    debounceMs: 150,
    features: {
        filters: true,
        history: true,
        suggestions: true,
    },
};

export const SEARCH_LIVE_OPTIONS: UseQuestionSearchOptions = {
    debounceMs: 200,
};

export const mergeSearchOptions = (
    base: UseQuestionSearchOptions,
    overrides: UseQuestionSearchOptions = {}
): UseQuestionSearchOptions => ({
    ...base,
    ...overrides,
    features: {
        ...DEFAULT_SEARCH_FEATURES,
        ...base.features,
        ...overrides.features,
    },
});
