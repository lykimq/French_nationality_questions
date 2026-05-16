import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList, Question } from "../types";
import { useData } from "../shared/contexts/DataContext";
import { useTheme } from "../shared/contexts/ThemeContext";
import { sortQuestionsById } from "../shared/utils/questionUtils";
import {
    FormattedText,
    AppHeader,
    QuestionListRow,
} from "../shared/components";
import { sharedStyles, navigateToFlashCardCategory } from "../shared/utils";

type CategoryDetailRouteProp = RouteProp<HomeStackParamList, "CategoryDetail">;
type CategoryDetailNavigationProp =
    NativeStackNavigationProp<HomeStackParamList>;

const CategoryDetailScreen = () => {
    const route = useRoute<CategoryDetailRouteProp>();
    const navigation = useNavigation<CategoryDetailNavigationProp>();
    const { theme } = useTheme();
    const { categoryId } = route.params;
    const { questionsData } = useData();

    const category = useMemo(
        () => questionsData.categories.find((c) => c.id === categoryId),
        [questionsData.categories, categoryId]
    );

    const sortedQuestions = useMemo(
        () => sortQuestionsById(category?.questions || []),
        [category?.questions]
    );


    if (!category) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <FormattedText style={{ color: theme.colors.text }}>
                    Catégorie non trouvée
                </FormattedText>
            </View>
        );
    }

    const startTraining = () => {
        navigateToFlashCardCategory(navigation, categoryId);
    };

    const renderQuestionItem = ({
        item,
        index,
    }: {
        item: Question;
        index: number;
    }) => {
        const questionNumber = index + 1;

        return (
            <QuestionListRow
                number={questionNumber}
                question={item.question}
                borderBottomColor={theme.colors.divider}
                onPress={() =>
                    navigation.navigate("CategoryQuestions", {
                        categoryId,
                        initialIndex: index,
                        questionId: item.id,
                    })
                }
            />
        );
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <AppHeader
                title={category.title}
                subtitle={`${category.questions?.length || 0} questions`}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.content}>

                {/* Primary Action */}
                <TouchableOpacity
                    style={[
                        sharedStyles.primaryButton,
                        {
                            backgroundColor: theme.colors.primary,
                            marginBottom: 20,
                        },
                    ]}
                    onPress={startTraining}
                >
                    <Ionicons
                        name="play"
                        size={20}
                        color="#FFF"
                        style={{ marginRight: 8 }}
                    />
                    <FormattedText
                        style={{
                            color: "#FFF",
                            fontWeight: "bold",
                            fontSize: 16,
                        }}
                    >
                        Démarrer l'entraînement
                    </FormattedText>
                </TouchableOpacity>

                <FormattedText
                    style={[
                        sharedStyles.sectionTitle,
                        { color: theme.colors.text, marginBottom: 8 },
                    ]}
                >
                    Liste des questions
                </FormattedText>

                <FlatList
                    data={sortedQuestions}
                    renderItem={renderQuestionItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
});

export default CategoryDetailScreen;
