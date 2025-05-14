import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QuestionCard from '../components/QuestionCard';
import questionsData from '../data/questions.json';

interface Question {
    id: number;
    question: string;
    translation: string;
    answer?: string;
    explanation: string;
    categoryId: string;
}

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Question[]>([]);

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

        const results = allQuestions.filter(
            item =>
                item.question.toLowerCase().includes(normalizedQuery) ||
                item.translation.toLowerCase().includes(normalizedQuery) ||
                (item.answer && item.answer.toLowerCase().includes(normalizedQuery)) ||
                item.explanation.toLowerCase().includes(normalizedQuery) ||
                item.id.toString() === normalizedQuery
        );

        setSearchResults(results);
    }, [searchQuery]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rechercher</Text>
                </View>
            </SafeAreaView>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Rechercher une question..."
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
                            {searchResults.length} {searchResults.length === 1 ? 'résultat' : 'résultats'}
                        </Text>
                        {searchResults.map(question => (
                            <QuestionCard
                                key={question.id}
                                id={question.id}
                                question={question.question}
                                translation={question.translation}
                                answer={question.answer}
                                explanation={question.explanation}
                            />
                        ))}
                    </>
                ) : searchQuery !== '' ? (
                    <View style={styles.noResults}>
                        <Ionicons name="search-outline" size={50} color="#ccc" />
                        <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
                    </View>
                ) : (
                    <View style={styles.noResults}>
                        <Ionicons name="search" size={50} color="#ccc" />
                        <Text style={styles.noResultsText}>
                            Entrez un terme de recherche pour trouver des questions
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