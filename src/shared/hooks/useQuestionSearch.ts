import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchCatalog } from "./useSearchCatalog";
import { useDebouncedValue } from "./useDebouncedValue";
import {
    loadSearchHistory,
    persistSearchHistory,
} from "../utils/searchHistoryStorage";
import {
    createDefaultSearchFilters,
    generateSearchSuggestions,
    searchQuestions,
    type SearchFilters,
    type SearchResultQuestion,
    type SearchSuggestion,
} from "../utils/searchQuestions";

export type { SearchFilters, SearchResultQuestion, SearchSuggestion };

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

const DEFAULT_FEATURES: Required<UseQuestionSearchFeatures> = {
    filters: false,
    history: false,
    suggestions: false,
};

const SUGGESTIONS_DEBOUNCE_MS = 120;

export const useQuestionSearch = (options: UseQuestionSearchOptions = {}) => {
    const features: Required<UseQuestionSearchFeatures> = {
        ...DEFAULT_FEATURES,
        ...options.features,
    };
    const debounceMs = options.debounceMs ?? 200;
    const suggestionsDebounceMs =
        options.suggestionsDebounceMs ?? SUGGESTIONS_DEBOUNCE_MS;

    const { catalog, defaultFilters, questionsData } = useSearchCatalog();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [searchSuggestions, setSearchSuggestions] = useState<
        SearchSuggestion[]
    >([]);
    const [filters, setFilters] = useState<SearchFilters>(() =>
        createDefaultSearchFilters(catalog.idRange)
    );
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const historyLoadedRef = useRef(false);

    const debouncedQuery = useDebouncedValue(searchQuery.trim(), debounceMs);
    const isSearching = searchQuery.trim() !== debouncedQuery;

    useEffect(() => {
        if (!features.filters) {
            return;
        }
        setFilters((prev) => ({
            ...prev,
            questionRange: {
                min: prev.questionRange.min,
                max: Math.max(prev.questionRange.max, catalog.idRange.max),
            },
        }));
    }, [catalog.idRange.max, catalog.idRange.min, features.filters]);

    useEffect(() => {
        if (!features.history) {
            historyLoadedRef.current = false;
            return;
        }

        let cancelled = false;
        historyLoadedRef.current = false;

        void loadSearchHistory().then((stored) => {
            if (!cancelled) {
                setSearchHistory(stored);
                historyLoadedRef.current = true;
            }
        });

        return () => {
            cancelled = true;
        };
    }, [features.history]);

    useEffect(() => {
        if (!features.history || !historyLoadedRef.current) {
            return;
        }
        void persistSearchHistory(searchHistory);
    }, [searchHistory, features.history]);

    const effectiveFilters = features.filters ? filters : defaultFilters;

    const { searchResults, totalMatchCount } = useMemo(() => {
        if (!debouncedQuery) {
            return { searchResults: [], totalMatchCount: 0 };
        }
        const { results, totalCount } = searchQuestions(
            catalog,
            debouncedQuery,
            effectiveFilters
        );
        return { searchResults: results, totalMatchCount: totalCount };
    }, [catalog, debouncedQuery, effectiveFilters]);

    const availableCategories = useMemo(() => {
        if (!features.filters && !features.suggestions) {
            return [];
        }

        const categories = new Map<
            string,
            { id: string; title: string; count: number }
        >();

        catalog.allQuestions.forEach((q) => {
            const existing = categories.get(q.categoryId);
            if (existing) {
                existing.count++;
            } else {
                categories.set(q.categoryId, {
                    id: q.categoryId,
                    title: q.categoryTitle || q.categoryId,
                    count: 1,
                });
            }
        });

        return Array.from(categories.values()).sort(
            (a, b) => b.count - a.count
        );
    }, [catalog.allQuestions, features.filters, features.suggestions]);

    const recordSearchHistory = useCallback((query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || !features.history) {
            return;
        }
        setSearchHistory((prev) => {
            if (prev.includes(trimmedQuery)) {
                return prev;
            }
            return [trimmedQuery, ...prev.slice(0, 9)];
        });
    }, [features.history]);

    const performSearch = useCallback(
        (
            query: string,
            appliedFilters: SearchFilters = effectiveFilters,
            searchOptions?: { recordHistory?: boolean }
        ) => {
            const trimmedQuery = query.trim();
            if (trimmedQuery === "") {
                setSearchQuery("");
                return;
            }

            if (features.filters) {
                setFilters(appliedFilters);
            }
            setSearchQuery(trimmedQuery);

            if (searchOptions?.recordHistory) {
                recordSearchHistory(trimmedQuery);
            }
        },
        [effectiveFilters, features.filters, recordSearchHistory]
    );

    const resetFilters = useCallback(() => {
        setFilters(createDefaultSearchFilters(catalog.idRange));
    }, [catalog.idRange]);

    useEffect(() => {
        if (!features.suggestions) {
            return;
        }

        return () => {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, [features.suggestions]);

    useEffect(() => {
        if (!features.suggestions) {
            return;
        }

        if (suggestionsTimeoutRef.current) {
            clearTimeout(suggestionsTimeoutRef.current);
        }

        if (searchQuery.length < 2) {
            setSearchSuggestions([]);
            return;
        }

        suggestionsTimeoutRef.current = setTimeout(() => {
            setSearchSuggestions(
                generateSearchSuggestions(
                    catalog,
                    searchQuery,
                    availableCategories
                )
            );
        }, suggestionsDebounceMs);

        return () => {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, [
        searchQuery,
        catalog,
        availableCategories,
        features.suggestions,
        suggestionsDebounceMs,
    ]);

    const getSearchStats = useCallback(() => {
        const totalQuestions = catalog.allQuestions.length;
        const mainQuestions = questionsData.categories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
        );
        const historyQuestions = totalQuestions - mainQuestions;

        return { totalQuestions, mainQuestions, historyQuestions };
    }, [catalog.allQuestions, questionsData.categories]);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        results: searchResults,
        totalMatchCount,
        searchSuggestions,
        filters,
        setFilters,
        searchHistory,
        setSearchHistory,
        availableCategories,
        getSearchStats,
        performSearch,
        resetFilters,
        isSearching,
        catalog,
        defaultFilters,
        questionsData,
    };
};
