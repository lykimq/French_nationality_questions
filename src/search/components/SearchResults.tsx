import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, ListRenderItem } from "react-native";
import { QuestionCard, FormattedText, Icon3D } from "../../shared/components";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useIcon3D } from "../../shared/hooks";
import type { SearchResultQuestion } from "../../shared/utils/searchQuestions";

interface SearchResultsProps {
    results: SearchResultQuestion[];
    searchQuery: string;
    totalMatchCount?: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    searchQuery,
    totalMatchCount = 0,
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();

    const searchIcon = getIcon("search") || { name: "search" };
    const imageIcon = getIcon("image") || { name: "image" };
    const displayedCount = results.length;
    const hasMoreResults =
        totalMatchCount > 0 && totalMatchCount > displayedCount;

    const renderResult: ListRenderItem<SearchResultQuestion> = useCallback(
        ({ item: result }) => (
            <View style={styles.resultItem}>
                <View style={styles.categoryLabel}>
                    <FormattedText
                        style={[
                            styles.categoryLabelText,
                            { color: theme.colors.primary },
                        ]}
                    >
                        {result.categoryTitle ||
                            result.categoryId ||
                            "Sans catégorie"}
                    </FormattedText>
                    {result.hasImage && (
                        <Icon3D
                            name={imageIcon.name}
                            size={10}
                            color={theme.colors.primary}
                            variant="default"
                            containerStyle={styles.imageIcon}
                        />
                    )}
                </View>
                <QuestionCard
                    id={result.id}
                    question={result.question}
                    explanation={result.explanation}
                    image={result.image}
                />
            </View>
        ),
        [theme.colors.primary, imageIcon.name]
    );

    const keyExtractor = useCallback(
        (result: SearchResultQuestion) => result.questionKey,
        []
    );

    if (searchQuery === "") {
        return (
            <View style={styles.noResults}>
                <Icon3D
                    name={searchIcon.name}
                    size={52}
                    color={theme.colors.textMuted}
                    variant="glass"
                />
                <FormattedText
                    style={[
                        styles.noResultsText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    Tapez votre question pour commencer la recherche
                </FormattedText>
                <FormattedText
                    style={[
                        styles.searchHintText,
                        { color: theme.colors.textMuted },
                    ]}
                >
                    Utilisez la recherche avancée pour des filtres plus précis
                </FormattedText>
            </View>
        );
    }

    if (results.length === 0) {
        return (
            <View style={styles.noResults}>
                <Icon3D
                    name="document-text"
                    size={52}
                    color={theme.colors.textMuted}
                    variant="glass"
                />
                <FormattedText
                    style={[
                        styles.noResultsText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    Aucune question trouvée pour votre recherche
                </FormattedText>
                <FormattedText
                    style={[
                        styles.searchHintText,
                        { color: theme.colors.textMuted },
                    ]}
                >
                    Essayez d'ajuster vos filtres ou d'utiliser d'autres
                    mots-clés
                </FormattedText>
            </View>
        );
    }

    const listHeader = (
        <View style={styles.resultsHeader}>
            <FormattedText
                style={[styles.resultsTitle, { color: theme.colors.text }]}
            >
                {hasMoreResults
                    ? `${displayedCount} sur ${totalMatchCount} résultats`
                    : `${displayedCount} résultat${displayedCount > 1 ? "s" : ""} trouvé${displayedCount > 1 ? "s" : ""}`}
            </FormattedText>
            <FormattedText
                style={[
                    styles.sortedByText,
                    { color: theme.colors.textMuted },
                ]}
            >
                {hasMoreResults
                    ? "Affinez votre recherche pour voir plus de résultats"
                    : "Trié par pertinence"}
            </FormattedText>
        </View>
    );

    return (
        <FlatList
            style={[
                styles.scrollView,
                { backgroundColor: theme.colors.background },
            ]}
            contentContainerStyle={styles.contentContainer}
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderResult}
            ListHeaderComponent={listHeader}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={7}
            removeClippedSubviews
        />
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    resultsHeader: {
        marginBottom: 20,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    sortedByText: {
        fontSize: 13,
    },
    resultItem: {
        marginBottom: 16,
    },
    categoryLabel: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
    },
    categoryLabelText: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    imageIcon: {
        marginLeft: 4,
    },
    noResults: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 8,
    },
    searchHintText: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});
