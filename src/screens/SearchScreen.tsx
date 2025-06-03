import React, { useState, useEffect } from 'react';
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
    image?: string | null;
}

const SearchScreen = () => {
    const { language, toggleLanguage, questionsData, isTranslationLoaded, historyCategories, historySubcategories } = useLanguage();
    const { theme, themeMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>([]);

    // Flatten all questions from all categories and add categoryId
    const allQuestions = questionsData.categories.flatMap(category =>
        category.questions.map(question => ({
            ...question,
            categoryId: category.id,
        }))
    );

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const normalizedQuery = searchQuery.toLowerCase().trim();

        const results = allQuestions.filter(item => {
            // Handle both French-only and multilingual question formats
            if (isTranslationLoaded) {
                const q = item.question as MultiLangText;
                const e = item.explanation as MultiLangText;

                return (
                    q.fr.toLowerCase().includes(normalizedQuery) ||
                    q.vi.toLowerCase().includes(normalizedQuery) ||
                    e.fr.toLowerCase().includes(normalizedQuery) ||
                    e.vi.toLowerCase().includes(normalizedQuery) ||
                    item.id.toString() === normalizedQuery
                );
            } else {
                const q = item.question as string;
                const e = item.explanation as string;

                return (
                    q.toLowerCase().includes(normalizedQuery) ||
                    e.toLowerCase().includes(normalizedQuery) ||
                    item.id.toString() === normalizedQuery
                );
            }
        });

        setSearchResults(results);
    }, [searchQuery, questionsData, isTranslationLoaded]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

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
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
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
                </View>
            ) : (
                <ScrollView
                    style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {searchResults.length > 0 ? (
                        <>
                            <FormattedText style={[styles.resultsTitle, { color: theme.colors.text }]}>
                                {language === 'fr'
                                    ? `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`
                                    : `Tìm thấy ${searchResults.length} kết quả`}
                            </FormattedText>
                            {searchResults.map((result) => (
                                <QuestionCard
                                    key={result.id}
                                    id={result.id}
                                    question={result.question}
                                    explanation={result.explanation}
                                    image={result.image}
                                    language={language}
                                />
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
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
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
});

export default SearchScreen;