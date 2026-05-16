import {
    useQuestionSearch,
    type SearchFilters,
    type SearchResultQuestion,
    type SearchSuggestion,
} from "../shared/hooks/useQuestionSearch";

export type { SearchFilters, SearchResultQuestion, SearchSuggestion };

export const useSearch = () =>
    useQuestionSearch({
        debounceMs: 150,
        features: {
            filters: true,
            history: true,
            suggestions: true,
        },
    });
