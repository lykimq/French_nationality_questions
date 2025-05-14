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

// Define the search result question type
interface SearchResultQuestion {
    id: number;
    question: string | MultiLangText;
    answer?: string | MultiLangText;
    explanation: string | MultiLangText;
    categoryId: string;
}

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>([]);
    const { language, toggleLanguage, questionsData, isTranslationLoaded } = useLanguage();

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
                const a = item.answer as MultiLangText | undefined;
                const e = item.explanation as MultiLangText;

                return (
                    q.fr.toLowerCase().includes(normalizedQuery) ||
                    q.vi.toLowerCase().includes(normalizedQuery) ||
                    (a && a.fr.toLowerCase().includes(normalizedQuery)) ||
                    (a && a.vi.toLowerCase().includes(normalizedQuery)) ||
                    e.fr.toLowerCase().includes(normalizedQuery) ||
                    e.vi.toLowerCase().includes(normalizedQuery) ||
                    item.id.toString() === normalizedQuery
                );
            } else {
                const q = item.question as string;
                const a = item.answer as string | undefined;
                const e = item.explanation as string;

                return (
                    q.toLowerCase().includes(normalizedQuery) ||
                    (a && a.toLowerCase().includes(normalizedQuery)) ||
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {language === 'fr' ? 'Rechercher' : 'Tìm kiếm'}
                    </Text>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageLabel}>FR</Text>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor="#fff"
                            trackColor={{ false: '#7986CB', true: '#7986CB' }}
                        />
                        <Text style={styles.languageLabel}>VI</Text>
                    </View>
                </View>
            </SafeAreaView>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder={language === 'fr' ? "Rechercher une question..." : "Tìm kiếm câu hỏi..."}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {searchResults.length > 0 ? (
                    <>
                        <Text style={styles.resultsTitle}>
                            {searchResults.length} {language === 'fr' ?
                                (searchResults.length === 1 ? 'résultat' : 'résultats') :
                                'kết quả'}
                        </Text>
                        {searchResults.map(question => (
                            <QuestionCard
                                key={question.id}
                                id={question.id}
                                question={question.question}
                                answer={question.answer}
                                explanation={question.explanation}
                                language={language}
                            />
                        ))}
                    </>
                ) : searchQuery !== '' ? (
                    <View style={styles.noResults}>
                        <Ionicons name="search-outline" size={50} color="#ccc" />
                        <Text style={styles.noResultsText}>
                            {language === 'fr' ? 'Aucun résultat trouvé' : 'Không tìm thấy kết quả nào'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.noResults}>
                        <Ionicons name="search" size={50} color="#ccc" />
                        <Text style={styles.noResultsText}>
                            {language === 'fr'
                                ? 'Entrez un terme de recherche pour trouver des questions'
                                : 'Nhập từ khóa tìm kiếm để tìm câu hỏi'
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        backgroundColor: '#3F51B5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3F51B5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageLabel: {
        color: '#fff',
        marginHorizontal: 5,
        fontWeight: '600',
    },
    searchContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 50,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 15,
    },
    noResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    noResultsText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
});

export default SearchScreen;