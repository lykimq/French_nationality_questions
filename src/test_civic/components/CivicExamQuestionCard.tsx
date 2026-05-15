import React from "react";
import { View, StyleSheet } from "react-native";
import { FormattedText, SpeakButton } from "../../shared/components";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { TOPIC_DISPLAY_NAMES } from "../constants/civicExamConstants";
import { getTopicFromQuestion } from "../utils/civicExamUtils";
import { getCivicExamQuestionText } from "../utils/civicExamQuestionUtils";
import type { CivicExamQuestion } from "../types";

interface CivicExamQuestionCardProps {
    currentQuestion: CivicExamQuestion;
    currentQuestionIndex: number;
}

export const CivicExamQuestionCard: React.FC<CivicExamQuestionCardProps> = ({
    currentQuestion,
    currentQuestionIndex,
}) => {
    const { theme } = useTheme();
    const topic = getTopicFromQuestion(currentQuestion);
    const topicLabel = topic ? TOPIC_DISPLAY_NAMES[topic] : null;
    const questionText = getCivicExamQuestionText(currentQuestion);

    return (
        <View
            style={[
                styles.questionCard,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <View style={styles.questionHeader}>
                <View
                    style={[
                        styles.questionNumberBadge,
                        { backgroundColor: theme.colors.primary },
                    ]}
                >
                    <FormattedText
                        style={[
                            styles.questionNumber,
                            { color: theme.colors.buttonText },
                        ]}
                    >
                        {currentQuestionIndex + 1}
                    </FormattedText>
                </View>
                {topicLabel ? (
                    <View
                        style={[
                            styles.topicChip,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                            },
                        ]}
                    >
                        <FormattedText
                            style={[
                                styles.topicChipText,
                                { color: theme.colors.textSecondary },
                            ]}
                            numberOfLines={2}
                        >
                            {topicLabel}
                        </FormattedText>
                    </View>
                ) : null}
            </View>
            <View style={styles.questionTextRow}>
                <FormattedText
                    style={[
                        styles.questionText,
                        styles.questionTextFlex,
                        { color: theme.colors.text },
                    ]}
                >
                    {questionText}
                </FormattedText>
                <SpeakButton
                    text={questionText}
                    accessibilityLabel="Écouter la question"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    questionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    questionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 10,
    },
    questionNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: "bold",
    },
    topicChip: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: "center",
    },
    topicChipText: {
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    questionTextRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    questionText: {
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 26,
    },
    questionTextFlex: {
        flex: 1,
    },
});
