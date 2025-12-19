import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCard } from '../../shared/components';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import type { SearchResultQuestion } from '../useSearch';

interface SearchResultsProps {
    results: SearchResultQuestion[];
    searchQuery: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    searchQuery,
}) => {
    const { theme } = useTheme();

    if (searchQuery === '') {
        return (
            <View style={styles.noResults}>
                <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
                <FormattedText style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
                    Tapez votre question pour commencer la recherche
                </FormattedText>
                <FormattedText style={[styles.searchHintText, { color: theme.colors.textMuted }]}>
                    Utilisez la recherche avancée pour des filtres plus précis
                </FormattedText>
            </View>
        );
    }

    if (results.length === 0) {
        return (
            <View style={styles.noResults}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.textMuted} />
                <FormattedText style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
                    Aucune question trouvée pour votre recherche
                </FormattedText>
                <FormattedText style={[styles.searchHintText, { color: theme.colors.textMuted }]}>
                    Essayez d'ajuster vos filtres ou d'utiliser d'autres mots-clés
                </FormattedText>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.resultsHeader}>
                <FormattedText style={[styles.resultsTitle, { color: theme.colors.text }]}>
                    {`${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`}
                </FormattedText>
                <FormattedText style={[styles.sortedByText, { color: theme.colors.textMuted }]}>
                    Trié par pertinence
                </FormattedText>
            </View>
            {results.map((result) => (
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
});

