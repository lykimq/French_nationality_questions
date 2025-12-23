import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { OptionButton } from './OptionButton';
import { isOptionCorrect } from '../utils/civicExamQuestionUtils';
import type { CivicExamQuestion } from '../types';

interface CivicExamOptionsProps {
    currentQuestion: CivicExamQuestion & { options?: string[]; correctAnswer?: number };
    selectedAnswer: number | null;
    answerSubmitted: boolean;
    isPracticeMode: boolean;
    onAnswerSelect: (index: number) => void;
}

export const CivicExamOptions: React.FC<CivicExamOptionsProps> = ({
    currentQuestion,
    selectedAnswer,
    answerSubmitted,
    isPracticeMode,
    onAnswerSelect,
}) => {
    const { theme } = useTheme();
    const options = currentQuestion.options || [];

    return (
        <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[styles.optionsTitle, { color: theme.colors.text }]}>
                Choisissez votre réponse:
            </FormattedText>
            {options.map((option, index) => (
                <OptionButton
                    key={index}
                    index={index}
                    option={option}
                    isSelected={selectedAnswer === index}
                    isCorrect={isOptionCorrect(currentQuestion, index)}
                    showResult={isPracticeMode && answerSubmitted}
                    onPress={onAnswerSelect}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    optionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
});
