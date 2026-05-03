import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import CategoryCard from "./CategoryCard";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList, FrenchCategory } from "../types";
import { useData } from "../shared/contexts/DataContext";
import { useTheme } from "../shared/contexts/ThemeContext";
import {
    FormattedText,
    AppHeader,
    Icon3D,
    StreakBadge,
    GlobalSearchBar,
} from "../shared/components";
import { sharedStyles } from "../shared/utils";
import { useMastery } from "../shared/contexts/MasteryContext";
import { getCategoryMasteryStats } from "../shared/utils/MasteryUtils";
import { RECOMMENDED_SESSION_QUESTION_COUNT } from "../shared/constants/learningSession";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { questionsData } = useData();
    const { masteryMap, totalStreak } = useMastery();
    const scrollRef = React.useRef<ScrollView>(null);
    const categoriesSectionOffsetY = React.useRef(0);

    const categories = React.useMemo(() => {
        const cats = questionsData?.categories || [];
        return [...cats].sort((a, b) => a.id.localeCompare(b.id));
    }, [questionsData?.categories]);

    const catalogQuestions = React.useMemo(
        () => categories.flatMap((c) => c.questions || []),
        [categories]
    );

    const catalogMastery = React.useMemo(
        () => getCategoryMasteryStats(catalogQuestions, masteryMap),
        [catalogQuestions, masteryMap]
    );

    const scrollToCategories = () => {
        if (categories.length === 0) return;
        const y = Math.max(0, categoriesSectionOffsetY.current - 12);
        scrollRef.current?.scrollTo({ y, animated: true });
    };

    const navigateToCategory = (categoryId: string) => {
        if (categoryId === "recommended") {
            navigation.navigate("FlashCard" as any, { categoryId });
        } else {
            // New navigation flow: Home -> Detail -> FlashCard
            navigation.navigate("CategoryDetail" as any, { categoryId });
        }
    };

    const navigateToSearch = () => {
        navigation.navigate("QuestionSearch" as any);
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <AppHeader
                title="Mon Parcours"
                subtitle="Préparez votre entretien de naturalisation"
                showTricolore={true}
                rightAction={
                    totalStreak > 0 ? (
                        <StreakBadge streak={totalStreak} />
                    ) : undefined
                }
            />

            <ScrollView
                ref={scrollRef}
                style={[
                    styles.scrollView,
                    { backgroundColor: theme.colors.background },
                ]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Global Search Bar */}
                <GlobalSearchBar onPress={navigateToSearch} />

                {/* Stats: programme scope vs. your progression (same model as category cards) */}
                <View
                    style={[
                        sharedStyles.premiumCard,
                        {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                            paddingVertical: 20,
                        },
                    ]}
                >
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View
                                style={[
                                    styles.statIconContainer,
                                    {
                                        backgroundColor:
                                            theme.colors.primary + "15",
                                    },
                                ]}
                            >
                                <Icon3D
                                    name="school"
                                    size={24}
                                    color={theme.colors.primary}
                                    variant="gradient"
                                />
                            </View>
                            <FormattedText
                                style={[
                                    styles.statValue,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {categories.length}
                            </FormattedText>
                            <FormattedText
                                style={[
                                    styles.statLabel,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                Thématiques
                            </FormattedText>
                            <FormattedText
                                style={[
                                    styles.statHint,
                                    { color: theme.colors.textMuted },
                                ]}
                            >
                                rubriques du livret
                            </FormattedText>
                        </View>
                        <View
                            style={[
                                styles.statDivider,
                                { backgroundColor: theme.colors.border },
                            ]}
                        />
                        <View style={styles.statItem}>
                            <View
                                style={[
                                    styles.statIconContainer,
                                    { backgroundColor: "#4CAF5015" },
                                ]}
                            >
                                <Icon3D
                                    name="document-text"
                                    size={24}
                                    color="#4CAF50"
                                    variant="gradient"
                                />
                            </View>
                            <FormattedText
                                style={[
                                    styles.statValue,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {catalogQuestions.length}
                            </FormattedText>
                            <FormattedText
                                style={[
                                    styles.statLabel,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                Questions
                            </FormattedText>
                            <FormattedText
                                style={[
                                    styles.statHint,
                                    { color: theme.colors.textMuted },
                                ]}
                            >
                                contenu du programme
                            </FormattedText>
                        </View>
                        <View
                            style={[
                                styles.statDivider,
                                { backgroundColor: theme.colors.border },
                            ]}
                        />
                        <View style={styles.statItem}>
                            <View
                                style={[
                                    styles.statIconContainer,
                                    { backgroundColor: "#FF980015" },
                                ]}
                            >
                                <Icon3D
                                    name="medal"
                                    size={24}
                                    color="#FF9800"
                                    variant="gradient"
                                />
                            </View>
                            <FormattedText
                                style={[
                                    styles.statValue,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {catalogMastery.percentage}%
                            </FormattedText>
                            <FormattedText
                                style={[
                                    styles.statLabel,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                Votre progression
                            </FormattedText>
                            <FormattedText
                                style={[
                                    styles.statHint,
                                    { color: theme.colors.textMuted },
                                ]}
                            >
                                sur tout le parcours
                            </FormattedText>
                        </View>
                    </View>
                </View>

                {/* Recommended for You */}
                <TouchableOpacity
                    style={[
                        sharedStyles.premiumCard,
                        {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.primary,
                            borderWidth: 1.5,
                            padding: 16,
                        },
                    ]}
                    onPress={() => navigateToCategory("recommended")}
                    activeOpacity={0.9}
                >
                    <View style={sharedStyles.row}>
                        <View
                            style={[
                                styles.iconContainer,
                                {
                                    backgroundColor:
                                        theme.colors.primary + "15",
                                },
                            ]}
                        >
                            <Ionicons
                                name="sparkles"
                                size={26}
                                color={theme.colors.primary}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <FormattedText
                                style={{
                                    fontWeight: "bold",
                                    fontSize: 17,
                                    color: theme.colors.text,
                                }}
                            >
                                Recommandé pour vous
                            </FormattedText>
                            <FormattedText
                                style={{
                                    color: theme.colors.textSecondary,
                                    fontSize: 14,
                                    marginTop: 2,
                                }}
                            >
                                Session de {RECOMMENDED_SESSION_QUESTION_COUNT}{" "}
                                questions personnalisées
                            </FormattedText>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={22}
                            color={theme.colors.primary}
                        />
                    </View>
                </TouchableOpacity>

                <View
                    style={[
                        sharedStyles.spaceBetween,
                        { marginTop: 25, marginBottom: 15 },
                    ]}
                    onLayout={(e) => {
                        categoriesSectionOffsetY.current =
                            e.nativeEvent.layout.y;
                    }}
                >
                    <FormattedText
                        style={[
                            sharedStyles.sectionTitle,
                            { color: theme.colors.text, marginBottom: 0 },
                        ]}
                    >
                        Catégories
                    </FormattedText>
                    {categories.length > 0 ? (
                        <TouchableOpacity
                            onPress={scrollToCategories}
                            accessibilityRole="button"
                            accessibilityLabel="Faire défiler jusqu'à la liste des catégories"
                        >
                            <FormattedText
                                style={{
                                    color: theme.colors.primary,
                                    fontWeight: "500",
                                }}
                            >
                                Voir tout
                            </FormattedText>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {categories.length > 0 ? (
                    <View style={styles.categoriesGrid}>
                        {categories.map((category: FrenchCategory) => {
                            const stats = getCategoryMasteryStats(
                                category.questions || [],
                                masteryMap
                            );
                            return (
                                <CategoryCard
                                    key={category.id}
                                    title={category.title}
                                    description={category.description}
                                    icon={category.icon}
                                    count={category.questions?.length || 0}
                                    progress={stats.percentage / 100}
                                    onPress={() =>
                                        navigateToCategory(category.id)
                                    }
                                />
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <FormattedText
                            style={[
                                styles.emptyText,
                                { color: theme.colors.textMuted },
                            ]}
                        >
                            Chargement des catégories...
                        </FormattedText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
        textAlign: "center",
    },
    statHint: {
        fontSize: 10,
        marginTop: 4,
        textAlign: "center",
        paddingHorizontal: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        alignSelf: "center",
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    categoriesGrid: {
        marginTop: 10,
        paddingBottom: 80, // Space for floating tab bar
    },
});

export default HomeScreen;
