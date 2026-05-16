import { useMemo, useState } from "react";
import { searchQuestions, type SearchResultQuestion } from "../utils/searchQuestions";
import { useDebouncedValue } from "./useDebouncedValue";
import { useSearchCatalog } from "./useSearchCatalog";

export const useLiveSearchResults = (debounceMs: number = 200) => {
    const { catalog, defaultFilters, questionsData } = useSearchCatalog();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebouncedValue(searchQuery.trim(), debounceMs);
    const isSearching = searchQuery.trim() !== debouncedQuery;

    const results = useMemo((): SearchResultQuestion[] => {
        if (!debouncedQuery) {
            return [];
        }
        return searchQuestions(catalog, debouncedQuery, defaultFilters).results;
    }, [catalog, debouncedQuery, defaultFilters]);

    return {
        searchQuery,
        setSearchQuery,
        results,
        isSearching,
        catalog,
        defaultFilters,
        questionsData,
    };
};
