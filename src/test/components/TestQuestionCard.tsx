import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { getCachedImageSource } from '../../shared/utils';
import { sharedStyles } from '../../shared/utils/sharedStyles';
import type { TestQuestion } from '../../types';

interface TestQuestionCardProps {
    currentQuestion: TestQuestion;
    currentQuestionIndex: number;
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
    currentQuestion,
    currentQuestionIndex,
}) => {
    const { theme } = useTheme();

    const getQuestionTextValue = (): string => {
        return typeof currentQuestion.question === 'string'
            ? currentQuestion.question
            : currentQuestion.question || '';
    };

    return (
        <View style={[sharedStyles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.questionHeader}>
                <FormattedText style={[styles.questionLabel, { color: theme.colors.textMuted }]}>
                    Question d'entretien {currentQuestionIndex + 1}
                </FormattedText>
                {currentQuestion.categoryTitle && (
                    <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryLight }]}>
                        <FormattedText
                            style={[styles.categoryBadgeText, { color: theme.colors.primary }]}
                        >
                            {currentQuestion.categoryTitle}
                        </FormattedText>
                    </View>
                )}
            </View>

            <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                {getQuestionTextValue()}
            </FormattedText>

            {currentQuestion.image && (
                <Image
                    source={getCachedImageSource(currentQuestion.image) || { uri: currentQuestion.image }}
                    style={styles.questionImage}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    questionHeader: {
        flexDirection: 'column',
        marginBottom: 16,
        gap: 8,
    },
    questionLabel: {
        fontSize: 14,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        flexShrink: 1,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        textAlign: 'center',
    },
    questionText: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '500',
    },
    questionImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 16,
        resizeMode: 'cover',
    },
});
