import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormattedText, Icon3D } from '../../shared/components';
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
                <View style={[styles.feedbackMessage, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}>
                    <Icon3D
                        name="checkmark-circle"
                        size={28}
                        color={theme.colors.success}
                        variant="elevated"
                    />
                    <FormattedText style={[styles.feedbackText, { color: theme.colors.success }]}>
                        Bonne réponse !
                    </FormattedText>
                </View>
            ) : (
                <View style={[styles.feedbackMessage, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
                    <Icon3D
                        name="close-circle"
                        size={28}
                        color={theme.colors.error}
                        variant="elevated"
                    />
                    <FormattedText style={[styles.feedbackText, { color: theme.colors.error }]}>
                        Mauvaise réponse
                    </FormattedText>
                </View>
            )}

            {explanation ? (
                <View style={styles.explanationTextContainer}>
                    <FormattedText style={[styles.explanationTitle, { color: theme.colors.text }]}>
                        {isCorrect ? 'Pour aller plus loin' : 'Explication'}
                    </FormattedText>
                    <FormattedText style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                        {explanation}
                    </FormattedText>
                </View>
            ) : null}
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
