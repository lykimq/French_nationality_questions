import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QuestionCard from '../components/QuestionCard';
import { useLanguage, MultiLangText } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from '../components/FormattedText';

// Define the search result question type
interface SearchResultQuestion {
    id: number;
    question: string | MultiLangText;
    explanation: string | MultiLangText;
    categoryId: string;
    categoryTitle?: string;
    image?: string | null;
    matchScore?: number;
}

const SearchScreen = () => {
    const { language, toggleLanguage, questionsData, isTranslationLoaded, historyCategories, historySubcategories } = useLanguage();
    const { theme, themeMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>([]);

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
                        };

                        if (isTranslationLoaded) {
                            searchQuestion.question = {
                                fr: question.question,
                                vi: question.question_vi || question.question
                            };
                            searchQuestion.explanation = {
                                fr: question.explanation,
                                vi: question.explanation_vi || question.explanation
                            };
                        } else {
                            searchQuestion.question = question.question;
                            searchQuestion.explanation = question.explanation;
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

    // Enhanced search function with better matching
    const performSearch = (query: string) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();

        const results = allQuestions.map(item => {
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

                // Exact phrase match (highest score)
                if (questionTextFr.includes(normalizedQuery) || questionTextVi.includes(normalizedQuery)) {
                    matchScore += 100;
                    matches.push('question_exact');
                }
                if (explanationTextFr.includes(normalizedQuery) || explanationTextVi.includes(normalizedQuery)) {
                    matchScore += 80;
                    matches.push('explanation_exact');
                }

                // Word-based matching
                const queryWords = normalizedQuery.split(/\s+/);
                queryWords.forEach(word => {
                    if (word.length > 2) { // Only search for words longer than 2 characters
                        if (questionTextFr.includes(word) || questionTextVi.includes(word)) {
                            matchScore += 50;
                            matches.push('question_word');
                        }
                        if (explanationTextFr.includes(word) || explanationTextVi.includes(word)) {
                            matchScore += 30;
                            matches.push('explanation_word');
                        }
                    }
                });
            } else {
                questionText = (item.question as string).toLowerCase();
                explanationText = (item.explanation as string).toLowerCase();

                // Exact phrase match
                if (questionText.includes(normalizedQuery)) {
                    matchScore += 100;
                    matches.push('question_exact');
                }
                if (explanationText.includes(normalizedQuery)) {
                    matchScore += 80;
                    matches.push('explanation_exact');
                }

                // Word-based matching
                const queryWords = normalizedQuery.split(/\s+/);
                queryWords.forEach(word => {
                    if (word.length > 2) {
                        if (questionText.includes(word)) {
                            matchScore += 50;
                            matches.push('question_word');
                        }
                        if (explanationText.includes(word)) {
                            matchScore += 30;
                            matches.push('explanation_word');
                        }
                    }
                });
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
    };

    useEffect(() => {
        // Debounce search to avoid too many operations
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, allQuestions, isTranslationLoaded, language]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
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
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Statistics */}
                <View style={styles.statsContainer}>
                    <FormattedText style={[styles.statsText, { color: theme.colors.textMuted }]}>
                        {language === 'fr'
                            ? `${totalQuestions} questions disponibles (${mainQuestions} principales + ${historyQuestions} histoire)`
                            : `${totalQuestions} câu hỏi có sẵn (${mainQuestions} chính + ${historyQuestions} lịch sử)`
                        }
                    </FormattedText>
                </View>
            </View>

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
                            ? 'Vous pouvez rechercher par mots-clés, numéro de question, ou contenu'
                            : 'Bạn có thể tìm kiếm theo từ khóa, số câu hỏi, hoặc nội dung'}
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
                                    ? 'Essayez avec d\'autres mots-clés ou vérifiez l\'orthographe'
                                    : 'Hãy thử với các từ khóa khác hoặc kiểm tra chính tả'}
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
    statsContainer: {
        marginTop: 8,
        paddingHorizontal: 5,
    },
    statsText: {
        fontSize: 12,
        textAlign: 'center',
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
        marginBottom: 5,
    },
    categoryLabelText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
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
});

export default SearchScreen;