import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FormattedText } from "../../shared/components";
import { useTheme } from "../../shared/contexts/ThemeContext";

interface CivicExamFooterProps {
    selectedAnswer: number | null;
    answerSubmitted: boolean;
    isPracticeMode: boolean;
    currentQuestionIndex: number;
    totalQuestions: number;
    onNextQuestion: () => void;
    onSubmitAnswer: () => void;
    tabBarOverlapPad?: number;
}

export const CivicExamFooter: React.FC<CivicExamFooterProps> = ({
    selectedAnswer,
    answerSubmitted,
    isPracticeMode,
    currentQuestionIndex,
    totalQuestions,
    onNextQuestion,
    onSubmitAnswer,
    tabBarOverlapPad = 0,
}) => {
    const { theme } = useTheme();

    const isNextDisabled =
        selectedAnswer === null && !(isPracticeMode && answerSubmitted);
    const showNext = isPracticeMode && answerSubmitted;
    const isLast = currentQuestionIndex >= totalQuestions - 1;

    const primaryLabel = (() => {
        if (isPracticeMode) {
            if (answerSubmitted) {
                return isLast ? "Voir les résultats" : "Question suivante";
            }
            return "Choisissez une réponse";
        }
        if (selectedAnswer === null) {
            return "Choisissez une réponse";
        }
        return isLast ? "Voir la révision" : "Valider et continuer";
    })();

    return (
        <View
            style={[
                styles.footer,
                {
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                    paddingBottom: 12 + tabBarOverlapPad,
                },
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    {
                        backgroundColor: !isNextDisabled
                            ? theme.colors.primary
                            : theme.colors.textMuted,
                        opacity: !isNextDisabled ? 1 : 0.5,
                    },
                ]}
                onPress={showNext ? onNextQuestion : onSubmitAnswer}
                disabled={isNextDisabled}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ disabled: isNextDisabled }}
                accessibilityLabel={primaryLabel}
            >
                <FormattedText
                    style={[
                        styles.submitButtonText,
                        { color: theme.colors.buttonText },
                    ]}
                >
                    {primaryLabel}
                </FormattedText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderTopWidth: 1,
    },
    submitButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        minHeight: 52,
        justifyContent: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
