import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCard } from '../../components/search';
import { useLanguage } from '../../contexts/LanguageContext';
import type { MultiLangText } from '../../types';
import { getTextFromMultiLang } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { FormattedText } from '../../components/shared';

// Define the search result question type
interface SearchResultQuestion {
    id: number;
    question: string | MultiLangText;
    explanation: string | MultiLangText;
    categoryId: string;
    categoryTitle?: string;
    image?: string | null;
    matchScore?: number;
    hasImage?: boolean;
}

// Advanced search filters interface
interface SearchFilters {
    categories: string[];
    hasImage: 'all' | 'with' | 'without';
    questionRange: { min: number; max: number };
    searchIn: ('question' | 'explanation' | 'both')[];
}

// Search suggestion interface
interface SearchSuggestion {
    text: string;
    type: 'keyword' | 'category' | 'id';
    count?: number;
}

const SearchScreen = () => {
    const { language, toggleLanguage, questionsData, isTranslationLoaded, historyCategories, historySubcategories } = useLanguage();
    const { theme, themeMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);

    // Advanced search filters
    const [filters, setFilters] = useState<SearchFilters>({
        categories: [],
        hasImage: 'all',
        questionRange: { min: 1, max: 200 },
        searchIn: ['both'],
    });

    // Create a comprehensive list of all questions including history questions
    const allQuestions = useMemo(() => {
        const questions: SearchResultQuestion[] = [];

        // Add main category questions
        questionsData.categories.forEach(category => {
            category.questions.forEach(question => {
                questions.push({
                    ...question,
                    categoryId: category.id,
                    categoryTitle: isTranslationLoaded
                        ? (language === 'vi' ? (category as any).title_vi || category.title : category.title)
                        : category.title,
                    hasImage: !!question.image,
                });
            });
        });

        // Add history questions from subcategories
        if (historyCategories && historySubcategories) {
            Object.values(historySubcategories).forEach(subcategory => {
                if (subcategory.questions) {
                    subcategory.questions.forEach(question => {
                        const searchQuestion: SearchResultQuestion = {
                            id: question.id,
                            categoryId: subcategory.id,
                            categoryTitle: subcategory.title,
                            question: '', // Initialize with empty values first
                            explanation: '', // Initialize with empty values first
                            hasImage: !!question.image,
                        };

                        if (isTranslationLoaded) {
                            searchQuestion.question = {
                                fr: getTextFromMultiLang(question.question, 'fr'),
                                vi: question.question_vi || getTextFromMultiLang(question.question, 'fr')
                            };
                            searchQuestion.explanation = {
                                fr: getTextFromMultiLang(question.explanation || '', 'fr'),
                                vi: question.explanation_vi || getTextFromMultiLang(question.explanation || '', 'fr')
                            };
                        } else {
                            searchQuestion.question = getTextFromMultiLang(question.question, 'fr');
                            searchQuestion.explanation = question.explanation ? getTextFromMultiLang(question.explanation, 'fr') : '';
                        }

                        if (question.image) {
                            searchQuestion.image = question.image;
                        }

                        questions.push(searchQuestion);
                    });
                }
            });
        }

        return questions;
    }, [questionsData, historyCategories, historySubcategories, isTranslationLoaded, language]);

    // Get available categories for filter
    const availableCategories = useMemo(() => {
        const categories = new Map<string, { id: string; title: string; count: number }>();

        allQuestions.forEach(q => {
            const existing = categories.get(q.categoryId);
            if (existing) {
                existing.count++;
            } else {
                categories.set(q.categoryId, {
                    id: q.categoryId,
                    title: q.categoryTitle || q.categoryId,
                    count: 1
                });
            }
        });

        return Array.from(categories.values()).sort((a, b) => b.count - a.count);
    }, [allQuestions]);

    // Generate search suggestions based on current query
    const generateSuggestions = (query: string): SearchSuggestion[] => {
        if (query.length < 2) return [];

        const suggestions: SearchSuggestion[] = [];
        const normalizedQuery = query.toLowerCase();

        // Add category suggestions
        availableCategories.forEach(cat => {
            if (cat.title.toLowerCase().includes(normalizedQuery)) {
                suggestions.push({
                    text: cat.title,
                    type: 'category',
                    count: cat.count
                });
            }
        });

        // Add common keyword suggestions based on question content
        const commonKeywords = new Map<string, number>();
        allQuestions.forEach(q => {
            const text = typeof q.question === 'string'
                ? q.question
                : (isTranslationLoaded && language === 'vi' ? (q.question as MultiLangText).vi : (q.question as MultiLangText).fr);

            const words = text.toLowerCase().split(/\s+/).filter(word =>
                word.length > 3 && word.includes(normalizedQuery)
            );

            words.forEach(word => {
                commonKeywords.set(word, (commonKeywords.get(word) || 0) + 1);
            });
        });

        // Add top keyword suggestions
        Array.from(commonKeywords.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([keyword, count]) => {
                suggestions.push({
                    text: keyword,
                    type: 'keyword',
                    count
                });
            });

        // Add ID suggestion if query is numeric
        if (/^\d+$/.test(query)) {
            const id = parseInt(query);
            const matchingQuestion = allQuestions.find(q => q.id === id);
            if (matchingQuestion) {
                suggestions.push({
                    text: `Question #${id}`,
                    type: 'id'
                });
            }
        }

        return suggestions.slice(0, 8);
    };

    // Enhanced search function with advanced filters
    const performSearch = (query: string, appliedFilters: SearchFilters = filters) => {
        if (query.trim() === '') {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();

        let filteredQuestions = allQuestions;

        // Apply category filter
        if (appliedFilters.categories.length > 0) {
            filteredQuestions = filteredQuestions.filter(q =>
                appliedFilters.categories.includes(q.categoryId)
            );
        }

        // Apply image filter
        if (appliedFilters.hasImage !== 'all') {
            filteredQuestions = filteredQuestions.filter(q =>
                appliedFilters.hasImage === 'with' ? q.hasImage : !q.hasImage
            );
        }

        // Apply question ID range filter
        filteredQuestions = filteredQuestions.filter(q =>
            q.id >= appliedFilters.questionRange.min && q.id <= appliedFilters.questionRange.max
        );

        const results = filteredQuestions.map(item => {
            let matchScore = 0;
            let matches = [];

            // Check if searching by ID
            if (item.id.toString() === normalizedQuery) {
                matchScore = 1000; // Highest priority for exact ID match
                matches.push('ID');
            }

            // Get text content based on language and translation status
            let questionText = '';
            let explanationText = '';
            let categoryText = item.categoryTitle || '';

            if (isTranslationLoaded) {
                const q = item.question as MultiLangText;
                const e = item.explanation as MultiLangText;

                if (language === 'vi') {
                    questionText = q.vi || q.fr;
                    explanationText = e.vi || e.fr;
                } else {
                    questionText = q.fr;
                    explanationText = e.fr;
                }

                // Also search in both languages for comprehensive results
                const questionTextFr = q.fr.toLowerCase();
                const questionTextVi = (q.vi || '').toLowerCase();
                const explanationTextFr = e.fr.toLowerCase();
                const explanationTextVi = (e.vi || '').toLowerCase();

                // Apply search scope filter
                if (appliedFilters.searchIn.includes('question') || appliedFilters.searchIn.includes('both')) {
                    // Exact phrase match (highest score)
                    if (questionTextFr.includes(normalizedQuery) || questionTextVi.includes(normalizedQuery)) {
                        matchScore += 100;
                        matches.push('question_exact');
                    }

                    // Word-based matching
                    const queryWords = normalizedQuery.split(/\s+/);
                    queryWords.forEach(word => {
                        if (word.length > 2) {
                            if (questionTextFr.includes(word) || questionTextVi.includes(word)) {
                                matchScore += 50;
                                matches.push('question_word');
                            }
                        }
                    });
                }

                if (appliedFilters.searchIn.includes('explanation') || appliedFilters.searchIn.includes('both')) {
                    if (explanationTextFr.includes(normalizedQuery) || explanationTextVi.includes(normalizedQuery)) {
                        matchScore += 80;
                        matches.push('explanation_exact');
                    }

                    const queryWords = normalizedQuery.split(/\s+/);
                    queryWords.forEach(word => {
                        if (word.length > 2) {
                            if (explanationTextFr.includes(word) || explanationTextVi.includes(word)) {
                                matchScore += 30;
                                matches.push('explanation_word');
                            }
                        }
                    });
                }
            } else {
                questionText = (item.question as string).toLowerCase();
                explanationText = (item.explanation as string).toLowerCase();

                if (appliedFilters.searchIn.includes('question') || appliedFilters.searchIn.includes('both')) {
                    // Exact phrase match
                    if (questionText.includes(normalizedQuery)) {
                        matchScore += 100;
                        matches.push('question_exact');
                    }

                    // Word-based matching
                    const queryWords = normalizedQuery.split(/\s+/);
                    queryWords.forEach(word => {
                        if (word.length > 2) {
                            if (questionText.includes(word)) {
                                matchScore += 50;
                                matches.push('question_word');
                            }
                        }
                    });
                }

                if (appliedFilters.searchIn.includes('explanation') || appliedFilters.searchIn.includes('both')) {
                    if (explanationText.includes(normalizedQuery)) {
                        matchScore += 80;
                        matches.push('explanation_exact');
                    }

                    const queryWords = normalizedQuery.split(/\s+/);
                    queryWords.forEach(word => {
                        if (word.length > 2) {
                            if (explanationText.includes(word)) {
                                matchScore += 30;
                                matches.push('explanation_word');
                            }
                        }
                    });
                }
            }

            // Category name matching
            if (categoryText.toLowerCase().includes(normalizedQuery)) {
                matchScore += 20;
                matches.push('category');
            }

            return {
                ...item,
                matchScore,
                matches
            };
        }).filter(item => item.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore); // Sort by relevance

        setSearchResults(results);
        setShowSuggestions(false);

        // Add to search history
        if (query.trim() && !searchHistory.includes(query.trim())) {
            setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
        }
    };

    useEffect(() => {
        // Generate suggestions when query changes
        if (searchQuery.length >= 2 && searchQuery.length <= 3) {
            const suggestions = generateSuggestions(searchQuery);
            setSearchSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
        } else {
            setShowSuggestions(false);
        }

        // Debounce search to avoid too many operations
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, allQuestions, isTranslationLoaded, language, filters]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
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

    const getSearchStats = () => {
        const totalQuestions = allQuestions.length;
        const mainQuestions = questionsData.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
        const historyQuestions = totalQuestions - mainQuestions;

        return { totalQuestions, mainQuestions, historyQuestions };
    };

    const { totalQuestions, mainQuestions, historyQuestions } = getSearchStats();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        {language === 'fr' ? 'Rechercher' : 'Tìm kiếm'}
                    </FormattedText>
                    <View style={styles.languageSelector}>
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor={theme.colors.switchThumb}
                            trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                        />
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                    </View>
                </View>
            </SafeAreaView>

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder={language === 'fr' ? "Rechercher une question..." : "Tìm kiếm câu hỏi..."}
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
                                {language === 'fr' ? 'Recherche avancée' : 'Tìm kiếm nâng cao'}
                            </FormattedText>
                            <TouchableOpacity onPress={resetFilters}>
                                <FormattedText style={[styles.resetButton, { color: theme.colors.primary }]}>
                                    {language === 'fr' ? 'Réinitialiser' : 'Đặt lại'}
                                </FormattedText>
                            </TouchableOpacity>
                        </View>

                        {/* Category Filter */}
                        <View style={styles.filterSection}>
                            <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Catégories:' : 'Danh mục:'}
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
                                {language === 'fr' ? 'Questions avec images:' : 'Câu hỏi có hình ảnh:'}
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
                                            {language === 'fr'
                                                ? (option === 'all' ? 'Toutes' : option === 'with' ? 'Avec' : 'Sans')
                                                : (option === 'all' ? 'Tất cả' : option === 'with' ? 'Có' : 'Không')
                                            }
                                        </FormattedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Search Scope */}
                        <View style={styles.filterSection}>
                            <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Rechercher dans:' : 'Tìm kiếm trong:'}
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
                                            {language === 'fr'
                                                ? (scope === 'question' ? 'Questions' : scope === 'explanation' ? 'Explications' : 'Les deux')
                                                : (scope === 'question' ? 'Câu hỏi' : scope === 'explanation' ? 'Giải thích' : 'Cả hai')
                                            }
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
                        {language === 'fr'
                            ? `${totalQuestions} questions disponibles (${mainQuestions} principales + ${historyQuestions} histoire)`
                            : `${totalQuestions} câu hỏi có sẵn (${mainQuestions} chính + ${historyQuestions} lịch sử)`
                        }
                    </FormattedText>
                    {(filters.categories.length > 0 || filters.hasImage !== 'all') && (
                        <FormattedText style={[styles.filterStatus, { color: theme.colors.primary }]}>
                            {language === 'fr' ? 'Filtres actifs' : 'Bộ lọc đang hoạt động'}
                        </FormattedText>
                    )}
                </View>
            </View>

            {/* Search History */}
            {searchQuery === '' && searchHistory.length > 0 && (
                <View style={[styles.historyContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.historyHeader}>
                        <FormattedText style={[styles.historyTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Recherches récentes:' : 'Tìm kiếm gần đây:'}
                        </FormattedText>
                        <TouchableOpacity onPress={clearSearchHistory}>
                            <FormattedText style={[styles.clearHistoryText, { color: theme.colors.primary }]}>
                                {language === 'fr' ? 'Effacer' : 'Xóa'}
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
                        {language === 'fr'
                            ? 'Tapez votre question pour commencer la recherche'
                            : 'Nhập câu hỏi của bạn để bắt đầu tìm kiếm'}
                    </FormattedText>
                    <FormattedText style={[styles.searchHintText, { color: theme.colors.textMuted }]}>
                        {language === 'fr'
                            ? 'Utilisez la recherche avancée pour des filtres plus précis'
                            : 'Sử dụng tìm kiếm nâng cao để có bộ lọc chi tiết hơn'}
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
                                    {language === 'fr'
                                        ? `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`
                                        : `Tìm thấy ${searchResults.length} kết quả`}
                                </FormattedText>
                                <FormattedText style={[styles.sortedByText, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Trié par pertinence' : 'Sắp xếp theo độ liên quan'}
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
                                        language={language}
                                    />
                                </View>
                            ))}
                        </>
                    ) : (
                        <View style={styles.noResults}>
                            <Ionicons name="document-text-outline" size={64} color={theme.colors.textMuted} />
                            <FormattedText style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
                                {language === 'fr'
                                    ? 'Aucune question trouvée pour votre recherche'
                                    : 'Không tìm thấy câu hỏi nào cho tìm kiếm của bạn'}
                            </FormattedText>
                            <FormattedText style={[styles.searchHintText, { color: theme.colors.textMuted }]}>
                                {language === 'fr'
                                    ? 'Essayez d\'ajuster vos filtres ou d\'utiliser d\'autres mots-clés'
                                    : 'Hãy thử điều chỉnh bộ lọc hoặc sử dụng từ khóa khác'}
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
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageLabel: {
        marginHorizontal: 5,
        fontWeight: '600',
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