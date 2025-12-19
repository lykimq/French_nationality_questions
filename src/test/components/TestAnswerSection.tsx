import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import type { TestQuestion } from '../../types';

interface TestAnswerSectionProps {
    currentQuestion: TestQuestion;
    showAnswer: boolean;
    userFeedback: 'correct' | 'incorrect' | null;
    isSubmitting: boolean;
    onUserFeedback: (feedback: 'correct' | 'incorrect') => void;
}

export const TestAnswerSection: React.FC<TestAnswerSectionProps> = ({
    currentQuestion,
    showAnswer,
    userFeedback,
    isSubmitting,
    onUserFeedback,
}) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    const getExplanationTextValue = (): string => {
        return typeof currentQuestion.explanation === 'string'
            ? currentQuestion.explanation
            : currentQuestion.explanation || '';
    };

    return (
        <View>
            {/* Instructions */}
            {!showAnswer && (
                <View style={[styles.instructionCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.instructionHeader}>
                        <Ionicons name={getIconName('bulb') as any} size={20} color={theme.colors.warning} />
                        <FormattedText style={[styles.instructionTitle, { color: theme.colors.text }]}>
                            Instructions
                        </FormattedText>
                    </View>
                    <FormattedText style={[styles.instructionText, { color: theme.colors.textMuted }]}>
                        Réfléchissez à votre réponse, puis cliquez sur "Voir la réponse" pour découvrir la réponse attendue et comparer avec vos connaissances.
                    </FormattedText>
                </View>
            )}

            {/* Answer Section */}
            {showAnswer && currentQuestion.explanation && (
                <View style={[styles.answerCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.answerHeader}>
                        <Ionicons name={getIconName('checkmarkCircle') as any} size={20} color={theme.colors.success} />
                        <FormattedText style={[styles.answerTitle, { color: theme.colors.text }]}>
                            Réponse attendue
                        </FormattedText>
                    </View>
                    <FormattedText style={[styles.answerText, { color: theme.colors.textMuted }]}>
                        {getExplanationTextValue()}
                    </FormattedText>
                </View>
            )}

            {/* Self-Assessment */}
            {showAnswer && userFeedback === null && (
                <View style={[styles.assessmentCard, { backgroundColor: theme.colors.surface }]}>
                    <FormattedText style={[styles.assessmentQuestion, { color: theme.colors.text }]}>
                        Évaluez votre réponse:
                    </FormattedText>
                    <View style={styles.assessmentButtons}>
                        <TouchableOpacity
                            style={[styles.assessmentButton, { backgroundColor: theme.colors.success }]}
                            onPress={() => onUserFeedback('correct')}
                            disabled={isSubmitting}
                        >
                            <Ionicons name={getIconName('checkmark') as any} size={20} color="white" />
                            <FormattedText style={styles.assessmentButtonText}>
                                Je savais
                            </FormattedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.assessmentButton, { backgroundColor: theme.colors.error }]}
                            onPress={() => onUserFeedback('incorrect')}
                            disabled={isSubmitting}
                        >
                            <Ionicons name={getIconName('close') as any} size={20} color="white" />
                            <FormattedText style={styles.assessmentButtonText}>
                                Je ne savais pas
                            </FormattedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Feedback Message */}
            {userFeedback && (
                <View style={[
                    styles.feedbackCard,
                    {
                        backgroundColor: userFeedback === 'correct' ? theme.colors.primaryLight : theme.colors.accent,
                        borderColor: userFeedback === 'correct' ? theme.colors.success : theme.colors.error
                    }
                ]}>
                    <Ionicons
                        name={userFeedback === 'correct' ? "checkmark-circle" : "information-circle"}
                        size={20}
                        color={userFeedback === 'correct' ? theme.colors.success : theme.colors.error}
                    />
                    <FormattedText style={[styles.feedbackText, { color: theme.colors.text }]}>
                        {userFeedback === 'correct'
                            ? 'Excellent! Continuez ainsi.'
                            : 'Pas de problème, c\'est ainsi qu\'on apprend!'
                        }
                    </FormattedText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    instructionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    instructionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    answerCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    answerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    answerTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    answerText: {
        fontSize: 15,
        lineHeight: 22,
    },
    assessmentCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    assessmentQuestion: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    assessmentButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 12,
    },
    assessmentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    assessmentButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    feedbackCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        gap: 12,
    },
    feedbackText: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
});
