import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { getCivicExamQuestionText } from '../utils/civicExamQuestionUtils';
import type { CivicExamQuestion } from '../types';

interface CivicExamQuestionCardProps {
    currentQuestion: CivicExamQuestion;
    currentQuestionIndex: number;
}

export const CivicExamQuestionCard: React.FC<CivicExamQuestionCardProps> = ({
    currentQuestion,
    currentQuestionIndex,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.questionHeader}>
                <View style={[styles.questionNumberBadge, { backgroundColor: theme.colors.primary }]}>
                    <FormattedText style={[styles.questionNumber, { color: '#FFFFFF' }]}>
                        {currentQuestionIndex + 1}
                    </FormattedText>
                </View>
            </View>
            <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                {getCivicExamQuestionText(currentQuestion)}
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    questionCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    questionHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    questionNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 26,
    },
});
