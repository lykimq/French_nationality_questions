import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface CivicExamFooterProps {
    selectedAnswer: number | null;
    answerSubmitted: boolean;
    isPracticeMode: boolean;
    currentQuestionIndex: number;
    totalQuestions: number;
    onNextQuestion: () => void;
    onSubmitAnswer: () => void;
}

export const CivicExamFooter: React.FC<CivicExamFooterProps> = ({
    selectedAnswer,
    answerSubmitted,
    isPracticeMode,
    currentQuestionIndex,
    totalQuestions,
    onNextQuestion,
    onSubmitAnswer,
}) => {
    const { theme } = useTheme();

    const isNextDisabled = selectedAnswer === null && !(isPracticeMode && answerSubmitted);
    const showNext = isPracticeMode && answerSubmitted;

    return (
        <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    {
                        backgroundColor: !isNextDisabled ? theme.colors.primary : theme.colors.textMuted,
                        opacity: !isNextDisabled ? 1 : 0.5,
                    }
                ]}
                onPress={showNext ? onNextQuestion : onSubmitAnswer}
                disabled={isNextDisabled}
                activeOpacity={0.8}
            >
                <FormattedText style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    {currentQuestionIndex < totalQuestions - 1
                        ? 'Question suivante'
                        : 'Voir les résultats'
                    }
                </FormattedText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    submitButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
