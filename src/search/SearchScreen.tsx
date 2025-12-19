import React, { useState, useEffect } from 'react';
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
        getSearchStats
    } = useSearch();

    useEffect(() => {
        if (searchQuery.length >= 2 && searchQuery.length <= 3) {
            setShowSuggestions(searchSuggestions.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [searchQuery, searchSuggestions.length]);

    const clearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
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
        setSearchQuery(suggestion.text);
        setShowSuggestions(false);
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
                    onSearchChange={(query) => {
                        setSearchQuery(query);
                        if (query.length >= 2) {
                            setShowSuggestions(true);
                        }
                    }}
                    onToggleAdvanced={toggleAdvancedSearch}
                    showAdvanced={showAdvancedSearch}
                    onClear={clearSearch}
                />

                {showSuggestions && (
                    <SearchSuggestions
                        suggestions={searchSuggestions}
                        onApplySuggestion={applySuggestion}
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

            {searchQuery === '' && (
                <SearchHistory
                    history={searchHistory}
                    onSelectQuery={setSearchQuery}
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