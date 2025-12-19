import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { getExplanationText } from '../../../shared/utils';
import type { TestQuestion } from '../../../types';

interface ReviewAnswerCardProps {
    question: TestQuestion;
}

export const ReviewAnswerCard: React.FC<ReviewAnswerCardProps> = ({
    question,
}) => {
    const { theme } = useTheme();

    if (!question.explanation) {
        return null;
    }

    return (
        <View style={[styles.answerCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.answerHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <FormattedText style={[styles.answerTitle, { color: theme.colors.text }]}>
                    Réponse correcte
                </FormattedText>
            </View>
            <FormattedText style={[styles.answerText, { color: theme.colors.textMuted }]}>
                {getExplanationText(question.explanation)}
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    answerCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
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
        fontSize: 16,
        lineHeight: 24,
    },
});

