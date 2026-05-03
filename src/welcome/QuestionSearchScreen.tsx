import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList, Question } from "../types";
import { useData } from "../shared/contexts/DataContext";
import { useTheme } from "../shared/contexts/ThemeContext";
import { useMastery } from "../shared/contexts/MasteryContext";
import {
    getMasteryForQuestionId,
    MasteryLevel,
} from "../shared/utils/MasteryUtils";
import { sortQuestionsById } from "../shared/utils/questionUtils";
import { FormattedText, AppHeader } from "../shared/components";
import { sharedStyles } from "../shared/utils";

type QuestionSearchNavigationProp =
    NativeStackNavigationProp<HomeStackParamList>;

interface SearchResult extends Question {
    categoryTitle: string;
    categoryId: string;
}

const QuestionSearchScreen = () => {
    const navigation = useNavigation<QuestionSearchNavigationProp>();
    const { theme } = useTheme();
    const { questionsData, isDataLoading } = useData();
    const { masteryMap } = useMastery();

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const allQuestions = useMemo(() => {
        if (!questionsData?.categories) return [];

        const results: SearchResult[] = [];
        questionsData.categories.forEach((cat) => {
            if (cat.questions) {
                cat.questions.forEach((q) => {
                    results.push({
                        ...q,
                        categoryId: cat.id,
                        categoryTitle: cat.title,
                    });
                });
            }
        });
        return results;
    }, [questionsData]);

    const filteredQuestions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return [];

        return allQuestions
            .filter(
                (q) =>
                    q.question.toLowerCase().includes(query) ||
                    (q.explanation &&
                        q.explanation.toLowerCase().includes(query))
            )
            .slice(0, 50); // Limit results for performance
    }, [allQuestions, searchQuery]);

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => setIsSearching(false), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const renderItem = ({ item }: { item: SearchResult }) => {
        const mastery = getMasteryForQuestionId(masteryMap, item.id);
        const isMastered = mastery?.level === MasteryLevel.MASTERED;

        const openQuestion = () => {
            const cat = questionsData.categories.find(
                (c) => c.id === item.categoryId
            );
            const sorted = sortQuestionsById(cat?.questions || []);
            const idx = sorted.findIndex(
                (q) => String(q.id) === String(item.id)
            );
            navigation.navigate("CategoryQuestions", {
                categoryId: item.categoryId,
                initialIndex: idx >= 0 ? idx : 0,
            });
        };

        return (
            <TouchableOpacity
                style={[
                    styles.resultItem,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
                onPress={openQuestion}
            >
                <View style={styles.resultHeader}>
                    <FormattedText
                        style={[
                            styles.categoryTag,
                            {
                                color: theme.colors.primary,
                                backgroundColor: theme.colors.primary + "15",
                            },
                        ]}
                    >
                        {item.categoryTitle}
                    </FormattedText>
                    {isMastered && (
                        <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#4CAF50"
                        />
                    )}
                </View>
                <FormattedText
                    style={[styles.questionText, { color: theme.colors.text }]}
                    numberOfLines={3}
                >
                    {item.question}
                </FormattedText>
            </TouchableOpacity>
        );
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <SafeAreaView
                edges={["top"]}
                style={{ backgroundColor: theme.colors.headerBackground }}
            >
                <View
                    style={[
                        styles.searchHeader,
                        { backgroundColor: theme.colors.headerBackground },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme.colors.headerText}
                        />
                    </TouchableOpacity>
                    <View
                        style={[
                            styles.inputContainer,
                            { backgroundColor: theme.colors.card + "30" },
                        ]}
                    >
                        <Ionicons
                            name="search"
                            size={20}
                            color={theme.colors.headerText + "B3"}
                        />
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.colors.headerText },
                            ]}
                            placeholder="Rechercher une question..."
                            placeholderTextColor={
                                theme.colors.headerText + "80"
                            }
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={true}
                            clearButtonMode="while-editing"
                        />
                    </View>
                </View>
            </SafeAreaView>

            {isDataLoading || (isSearching && searchQuery) ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                    />
                </View>
            ) : filteredQuestions.length > 0 ? (
                <FlatList
                    data={filteredQuestions}
                    renderItem={renderItem}
                    keyExtractor={(item) => `${item.categoryId}-${item.id}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : searchQuery.trim() !== "" ? (
                <View style={styles.centerContainer}>
                    <Ionicons
                        name="search-outline"
                        size={64}
                        color={theme.colors.textMuted}
                    />
                    <FormattedText
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textMuted },
                        ]}
                    >
                        Aucun résultat pour "{searchQuery}"
                    </FormattedText>
                </View>
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons
                        name="bulb-outline"
                        size={64}
                        color={theme.colors.textMuted}
                    />
                    <FormattedText
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textMuted },
                        ]}
                    >
                        Saisissez un mot-clé pour rechercher
                    </FormattedText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    inputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 22,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    resultItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resultHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    categoryTag: {
        fontSize: 11,
        fontWeight: "bold",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: "hidden",
    },
    questionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
    },
});

export default QuestionSearchScreen;
