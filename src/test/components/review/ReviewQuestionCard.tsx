import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { getCachedImageSource, getQuestionText } from '../../../shared/utils';
import type { TestQuestion } from '../../../types';

interface ReviewQuestionCardProps {
    question: TestQuestion;
    questionIndex: number;
}

export const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = ({
    question,
    questionIndex,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.questionHeader}>
                <FormattedText style={[styles.questionLabel, { color: theme.colors.textMuted }]}>
                    Question à réviser {questionIndex + 1}
                </FormattedText>
                {question.categoryTitle && (
                    <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryLight }]}>
                        <FormattedText style={[styles.categoryBadgeText, { color: theme.colors.primary }]}>
                            {question.categoryTitle}
                        </FormattedText>
                    </View>
                )}
            </View>

            <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                {getQuestionText(question.question)}
            </FormattedText>

            {question.image && (
                <Image
                    source={getCachedImageSource(question.image) || { uri: question.image }}
                    style={styles.questionImage}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    questionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    questionLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    questionText: {
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 16,
    },
    questionImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'contain',
    },
});

