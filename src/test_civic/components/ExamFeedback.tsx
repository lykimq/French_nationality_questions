import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface ExamFeedbackProps {
    isCorrect: boolean;
    explanation?: string | null;
}

export const ExamFeedback: React.FC<ExamFeedbackProps> = ({
    isCorrect,
    explanation
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.feedbackContainer, { backgroundColor: theme.colors.card }]}>
            {isCorrect ? (
                <View style={[styles.feedbackMessage, { backgroundColor: '#4CAF50' + '20', borderColor: '#4CAF50' }]}>
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                    <FormattedText style={[styles.feedbackText, { color: '#4CAF50' }]}>
                        Bonne réponse !
                    </FormattedText>
                </View>
            ) : (
                <View style={[styles.feedbackMessage, { backgroundColor: '#F44336' + '20', borderColor: '#F44336' }]}>
                    <Ionicons name="close-circle" size={32} color="#F44336" />
                    <FormattedText style={[styles.feedbackText, { color: '#F44336' }]}>
                        Mauvaise réponse
                    </FormattedText>
                </View>
            )}

            {explanation && (
                <View style={styles.explanationTextContainer}>
                    <FormattedText style={[styles.explanationTitle, { color: theme.colors.text }]}>
                        Explication:
                    </FormattedText>
                    <FormattedText style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                        {explanation}
                    </FormattedText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    feedbackContainer: {
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    feedbackMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 16,
        gap: 12,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    explanationTextContainer: {
        marginTop: 8,
    },
    explanationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    explanationText: {
        fontSize: 15,
        lineHeight: 22,
    },
});
