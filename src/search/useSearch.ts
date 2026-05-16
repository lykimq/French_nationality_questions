import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useData } from "../shared/contexts/DataContext";
import {
    buildSearchCatalog,
    createDefaultSearchFilters,
    generateSearchSuggestions,
    searchQuestions,
    type SearchFilters,
    type SearchResultQuestion,
    type SearchSuggestion,
} from "../shared/utils/searchQuestions";

export type { SearchFilters, SearchResultQuestion, SearchSuggestion };

export const useSearch = () => {
    const { questionsData } = useData();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>(
        []
    );
    const [totalMatchCount, setTotalMatchCount] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [searchSuggestions, setSearchSuggestions] = useState<
        SearchSuggestion[]
    >([]);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const catalog = useMemo(
        () => buildSearchCatalog(questionsData),
        [questionsData]
    );

    const [filters, setFilters] = useState<SearchFilters>(() =>
        createDefaultSearchFilters(catalog.idRange)
    );

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            questionRange: {
                min: prev.questionRange.min,
                max: Math.max(prev.questionRange.max, catalog.idRange.max),
            },
        }));
    }, [catalog.idRange.max, catalog.idRange.min]);

    const availableCategories = useMemo(() => {
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
    }, [catalog.allQuestions]);

    const runSearch = useCallback(
        (
            query: string,
            appliedFilters: SearchFilters,
            recordHistory: boolean
        ) => {
            const trimmedQuery = query.trim();
            if (trimmedQuery === "") {
                setSearchResults([]);
                setTotalMatchCount(0);
                setIsSearching(false);
                return;
            }

            const { results, totalCount } = searchQuestions(
                catalog,
                trimmedQuery,
                appliedFilters
            );
            setSearchResults(results);
            setTotalMatchCount(totalCount);
            setIsSearching(false);

            if (
                recordHistory &&
                trimmedQuery &&
                !searchHistory.includes(trimmedQuery)
            ) {
                setSearchHistory((prev) => [trimmedQuery, ...prev.slice(0, 9)]);
            }
        },
        [catalog, searchHistory]
    );

    const performSearch = useCallback(
        (
            query: string,
            appliedFilters: SearchFilters = filters,
            options?: { recordHistory?: boolean }
        ) => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            const trimmedQuery = query.trim();
            if (trimmedQuery === "") {
                setSearchResults([]);
                setTotalMatchCount(0);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            const recordHistory = options?.recordHistory ?? true;

            searchTimeoutRef.current = setTimeout(() => {
                runSearch(trimmedQuery, appliedFilters, recordHistory);
            }, 150);
        },
        [filters, runSearch]
    );

    const resetFilters = useCallback(() => {
        setFilters(createDefaultSearchFilters(catalog.idRange));
    }, [catalog.idRange]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setSearchResults([]);
            setTotalMatchCount(0);
            setIsSearching(false);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(() => {
            runSearch(trimmed, filters, false);
        }, 150);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, filters, runSearch]);

    useEffect(() => {
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
        }, 120);

        return () => {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, [searchQuery, catalog, availableCategories]);

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
        catalogIdRange: catalog.idRange,
    };
};
