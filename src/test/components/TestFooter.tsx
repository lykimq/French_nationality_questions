import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';

interface TestFooterProps {
    showAnswer: boolean;
    userFeedback: 'correct' | 'incorrect' | null;
    currentQuestionIndex: number;
    totalQuestions: number;
    onRevealAnswer: () => void;
    onNextQuestion: () => void;
    onFinishTest: () => void;
}

export const TestFooter: React.FC<TestFooterProps> = ({
    showAnswer,
    userFeedback,
    currentQuestionIndex,
    totalQuestions,
    onRevealAnswer,
    onNextQuestion,
    onFinishTest,
}) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    return (
        <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            {!showAnswer ? (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={onRevealAnswer}
                >
                    <FormattedText style={styles.actionButtonText}>
                        Voir la réponse
                    </FormattedText>
                    <Ionicons name={getIconName('eye') as any} size={20} color="white" />
                </TouchableOpacity>
            ) : userFeedback ? (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={isLastQuestion ? onFinishTest : onNextQuestion}
                >
                    <FormattedText style={styles.actionButtonText}>
                        {isLastQuestion ? 'Terminer le test' : 'Question suivante'}
                    </FormattedText>
                    <Ionicons
                        name={isLastQuestion ? "checkmark-done" : "arrow-forward"}
                        size={20}
                        color="white"
                    />
                </TouchableOpacity>
            ) : (
                <View style={[styles.actionButton, { backgroundColor: theme.colors.textMuted, opacity: 0.6 }]}>
                    <FormattedText style={styles.actionButtonText}>
                        Évaluez votre réponse ci-dessus
                    </FormattedText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    actionContainer: {
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
