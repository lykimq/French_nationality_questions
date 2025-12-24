import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText } from '../shared/components';
import { useSearch, SearchSuggestion } from './useSearch';
import {
    SearchBar,
    SearchSuggestions,
    AdvancedSearchPanel,
    SearchHistory,
    SearchResults,
    SearchStats,
} from './components';

const SearchScreen = () => {
    const { theme, themeMode } = useTheme();
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<string | null>(null);
    const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        searchSuggestions,
        filters,
        setFilters,
        searchHistory,
        setSearchHistory,
        availableCategories,
        getSearchStats,
        performSearch,
        isSearching
    } = useSearch();

    useEffect(() => {
        // Show suggestions when query length is 2-6, we have suggestions, and the user has not dismissed them
        const shouldShowSuggestions =
            searchQuery.length >= 2 &&
            searchQuery.length <= 6 &&
            searchSuggestions.length > 0 &&
            !suggestionsDismissed;

        setShowSuggestions(shouldShowSuggestions);
    }, [searchQuery, searchSuggestions.length, suggestionsDismissed]);

    useEffect(() => {
        return () => {
            if (selectionTimeoutRef.current) {
                clearTimeout(selectionTimeoutRef.current);
            }
        };
    }, []);

    const clearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
        setSuggestionsDismissed(false);
        setPendingSelection(null);
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }
        performSearch('');
    };

    const handleSearchChange = (query: string) => {
        setSuggestionsDismissed(false);
        setSearchQuery(query);
        if (pendingSelection) {
            setPendingSelection(null);
        }
    };

    const toggleAdvancedSearch = () => {
        setShowAdvancedSearch(!showAdvancedSearch);
    };

    const resetFilters = () => {
        setFilters({
            categories: [],
            hasImage: 'all',
            questionRange: { min: 1, max: 200 },
            searchIn: ['both'],
        });
    };


    const applySuggestion = (suggestion: SearchSuggestion) => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }

        setPendingSelection(suggestion.text);
        setSearchQuery(suggestion.text);
        selectionTimeoutRef.current = setTimeout(() => {
            setPendingSelection(null);
            setSuggestionsDismissed(true);
            setShowSuggestions(false);
        }, 200);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            performSearch(searchQuery.trim());
            setSuggestionsDismissed(true);
            setShowSuggestions(false);
        }
    };

    const clearSearchHistory = () => {
        setSearchHistory([]);
    };

    const { totalQuestions, mainQuestions, historyQuestions } = getSearchStats();


    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        Rechercher
                    </FormattedText>
                </View>
            </SafeAreaView>

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onToggleAdvanced={toggleAdvancedSearch}
                    showAdvanced={showAdvancedSearch}
                    onClear={clearSearch}
                    onSearch={handleSearch}
                    isSearching={isSearching}
                />

                {showSuggestions && (
                    <SearchSuggestions
                        suggestions={searchSuggestions}
                        onApplySuggestion={applySuggestion}
                        highlightedSuggestion={pendingSelection}
                    />
                )}

                {showAdvancedSearch && (
                    <AdvancedSearchPanel
                        filters={filters}
                        availableCategories={availableCategories}
                        onFilterChange={setFilters}
                        onResetFilters={resetFilters}
                    />
                )}

                <SearchStats
                    totalQuestions={totalQuestions}
                    mainQuestions={mainQuestions}
                    historyQuestions={historyQuestions}
                    hasActiveFilters={filters.categories.length > 0 || filters.hasImage !== 'all'}
                />
            </View>

            {searchQuery === '' && searchResults.length === 0 && (
                <SearchHistory
                    history={searchHistory}
                    onSelectQuery={(query) => {
                        setSearchQuery(query);
                        performSearch(query);
                    }}
                    onClearHistory={clearSearchHistory}
                />
            )}

            <SearchResults
                results={searchResults}
                searchQuery={searchQuery}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
});

export default SearchScreen;