import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCard } from '../shared/components';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText } from '../shared/components';
import { useSearch, SearchSuggestion } from './useSearch';

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

    // Effect to handle suggestions visibility based on query length (originally inside hook effect but UI state needs control)
    React.useEffect(() => {
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

    const toggleCategoryFilter = (categoryId: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId]
        }));
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
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder="Rechercher une question..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.textMuted}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onFocus={() => {
                            if (searchQuery.length >= 2) {
                                setShowSuggestions(true);
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={toggleAdvancedSearch}
                        style={[styles.advancedButton, showAdvancedSearch && { backgroundColor: theme.colors.primary + '20' }]}
                    >
                        <Ionicons
                            name="options"
                            size={20}
                            color={showAdvancedSearch ? theme.colors.primary : theme.colors.textMuted}
                        />
                    </TouchableOpacity>
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                    <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        {searchSuggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
                                onPress={() => applySuggestion(suggestion)}
                            >
                                <Ionicons
                                    name={suggestion.type === 'category' ? 'folder-outline' : suggestion.type === 'id' ? 'help-outline' : 'search-outline'}
                                    size={16}
                                    color={theme.colors.textMuted}
                                />
                                <FormattedText style={[styles.suggestionText, { color: theme.colors.text }]}>
                                    {suggestion.text}
                                </FormattedText>
                                {suggestion.count && (
                                    <FormattedText style={[styles.suggestionCount, { color: theme.colors.textMuted }]}>
                                        {suggestion.count}
                                    </FormattedText>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Advanced Search Panel */}
                {showAdvancedSearch && (
                    <View style={[styles.advancedPanel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.advancedHeader}>
                            <FormattedText style={[styles.advancedTitle, { color: theme.colors.text }]}>
                                Recherche avancée
                            </FormattedText>
                            <TouchableOpacity onPress={resetFilters}>
                                <FormattedText style={[styles.resetButton, { color: theme.colors.primary }]}>
                                    Réinitialiser
                                </FormattedText>
                            </TouchableOpacity>
                        </View>

                        {/* Category Filter */}
                        <View style={styles.filterSection}>
                            <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                                Catégories:
                            </FormattedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTags}>
                                {availableCategories.map(category => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.categoryTag,
                                            { borderColor: theme.colors.border },
                                            filters.categories.includes(category.id) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}
                                        onPress={() => toggleCategoryFilter(category.id)}
                                    >
                                        <FormattedText style={[
                                            styles.categoryTagText,
                                            { color: filters.categories.includes(category.id) ? theme.colors.buttonText : theme.colors.text }
                                        ]}>
                                            {category.title} ({category.count})
                                        </FormattedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Image Filter */}
                        <View style={styles.filterSection}>
                            <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                                Questions avec images:
                            </FormattedText>
                            <View style={styles.imageFilterButtons}>
                                {(['all', 'with', 'without'] as const).map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.imageFilterButton,
                                            { borderColor: theme.colors.border },
                                            filters.hasImage === option && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}
                                        onPress={() => setFilters(prev => ({ ...prev, hasImage: option }))}
                                    >
                                        <FormattedText style={[
                                            styles.imageFilterText,
                                            { color: filters.hasImage === option ? theme.colors.buttonText : theme.colors.text }
                                        ]}>
                                            {option === 'all' ? 'Toutes' : option === 'with' ? 'Avec' : 'Sans'}
                                        </FormattedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Search Scope */}
                        <View style={styles.filterSection}>
                            <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                                Rechercher dans:
                            </FormattedText>
                            <View style={styles.scopeButtons}>
                                {(['question', 'explanation', 'both'] as const).map(scope => (
                                    <TouchableOpacity
                                        key={scope}
                                        style={[
                                            styles.scopeButton,
                                            { borderColor: theme.colors.border },
                                            filters.searchIn.includes(scope) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}
                                        onPress={() => {
                                            if (scope === 'both') {
                                                setFilters(prev => ({ ...prev, searchIn: ['both'] }));
                                            } else {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    searchIn: prev.searchIn.includes('both')
                                                        ? [scope]
                                                        : prev.searchIn.includes(scope)
                                                            ? prev.searchIn.filter(s => s !== scope)
                                                            : [...prev.searchIn.filter(s => s !== 'both'), scope]
                                                }));
                                            }
                                        }}
                                    >
                                        <FormattedText style={[
                                            styles.scopeButtonText,
                                            { color: filters.searchIn.includes(scope) ? theme.colors.buttonText : theme.colors.text }
                                        ]}>
                                            {scope === 'question' ? 'Questions' : scope === 'explanation' ? 'Explications' : 'Les deux'}
                                        </FormattedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Search Statistics */}
                <View style={styles.statsContainer}>
                    <FormattedText style={[styles.statsText, { color: theme.colors.textMuted }]}>
                        {`${totalQuestions} questions disponibles (${mainQuestions} principales + ${historyQuestions} histoire)`}
                    </FormattedText>
                    {(filters.categories.length > 0 || filters.hasImage !== 'all') && (
                        <FormattedText style={[styles.filterStatus, { color: theme.colors.primary }]}>
                            Filtres actifs
                        </FormattedText>
                    )}
                </View>
            </View>

            {/* Search History */}
            {searchQuery === '' && searchHistory.length > 0 && (
                <View style={[styles.historyContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.historyHeader}>
                        <FormattedText style={[styles.historyTitle, { color: theme.colors.text }]}>
                            Recherches récentes:
                        </FormattedText>
                        <TouchableOpacity onPress={clearSearchHistory}>
                            <FormattedText style={[styles.clearHistoryText, { color: theme.colors.primary }]}>
                                Effacer
                            </FormattedText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {searchHistory.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.historyItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                                onPress={() => setSearchQuery(item)}
                            >
                                <FormattedText style={[styles.historyText, { color: theme.colors.text }]}>
                                    {item}
                                </FormattedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {searchQuery === '' ? (
                <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
                    <FormattedText style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
                        Tapez votre question pour commencer la recherche
                    </FormattedText>
                    <FormattedText style={[styles.searchHintText, { color: theme.colors.textMuted }]}>
                        Utilisez la recherche avancée pour des filtres plus précis
                    </FormattedText>
                </View>
            ) : (
                <ScrollView
                    style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {searchResults.length > 0 ? (
                        <>
                            <View style={styles.resultsHeader}>
                                <FormattedText style={[styles.resultsTitle, { color: theme.colors.text }]}>
                                    {`${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`}
                                </FormattedText>
                                <FormattedText style={[styles.sortedByText, { color: theme.colors.textMuted }]}>
                                    Trié par pertinence
                                </FormattedText>
                            </View>
                            {searchResults.map((result) => (
                                <View key={`${result.categoryId}-${result.id}`} style={styles.resultItem}>
                                    <View style={styles.categoryLabel}>
                                        <FormattedText style={[styles.categoryLabelText, { color: theme.colors.primary }]}>
                                            {result.categoryTitle}
                                        </FormattedText>
                                        {result.hasImage && (
                                            <Ionicons name="image" size={12} color={theme.colors.primary} style={styles.imageIcon} />
                                        )}
                                    </View>
                                    <QuestionCard
                                        id={result.id}
                                        question={result.question}
                                        explanation={result.explanation}
                                        image={result.image}
                                    />
                                </View>
                            ))}
                        </>
                    ) : (
                        <View style={styles.noResults}>
                            <Ionicons name="document-text-outline" size={64} color={theme.colors.textMuted} />
                            <FormattedText style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
                                Aucune question trouvée pour votre recherche
                            </FormattedText>
                            <FormattedText style={[styles.searchHintText, { color: theme.colors.textMuted }]}>
                                Essayez d'ajuster vos filtres ou d'utiliser d'autres mots-clés
                            </FormattedText>
                        </View>
                    )}
                </ScrollView>
            )}
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    advancedButton: {
        padding: 8,
        borderRadius: 15,
        marginHorizontal: 5,
    },
    clearButton: {
        padding: 5,
        marginLeft: 5,
    },
    suggestionsContainer: {
        marginTop: 10,
        borderRadius: 15,
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    suggestionText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    suggestionCount: {
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    advancedPanel: {
        marginTop: 10,
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    advancedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    advancedTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    resetButton: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterSection: {
        marginBottom: 15,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    categoryTags: {
        marginHorizontal: -5,
    },
    categoryTag: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 20,
        marginHorizontal: 5,
        marginVertical: 3,
    },
    categoryTagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    imageFilterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    imageFilterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    imageFilterText: {
        fontSize: 13,
        fontWeight: '500',
    },
    scopeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    scopeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    scopeButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
    statsContainer: {
        marginTop: 8,
        paddingHorizontal: 5,
    },
    statsText: {
        fontSize: 12,
        textAlign: 'center',
    },
    filterStatus: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 3,
        fontWeight: '600',
    },
    historyContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    historyItem: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginRight: 10,
    },
    historyText: {
        fontSize: 13,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    resultsHeader: {
        marginBottom: 15,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    sortedByText: {
        fontSize: 12,
    },
    resultItem: {
        marginBottom: 15,
    },
    categoryLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    categoryLabelText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    imageIcon: {
        marginLeft: 5,
    },
    noResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    noResultsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 24,
    },
    searchHintText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
    },
    clearHistoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SearchScreen;