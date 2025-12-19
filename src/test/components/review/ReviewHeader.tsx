import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackButton } from '../../../shared/components';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ReviewHeaderProps {
    currentIndex: number;
    totalQuestions: number;
    currentQuestionId?: number;
    onGoBack: () => void;
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({
    currentIndex,
    totalQuestions,
    currentQuestionId,
    onGoBack,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
            <View style={styles.headerTop}>
                <BackButton onPress={onGoBack} />

                <View style={styles.questionCounter}>
                    <FormattedText style={[styles.questionCounterText, { color: theme.colors.headerText }]}>
                        {currentIndex + 1} / {totalQuestions}
                    </FormattedText>
                    {currentQuestionId && (
                        <FormattedText style={[styles.questionIdText, { color: theme.colors.textMuted }]}>
                            ID: {currentQuestionId}
                        </FormattedText>
                    )}
                </View>
            </View>

            <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={[styles.progressBar, { width: `${((currentIndex + 1) / totalQuestions) * 100}%` }]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionCounter: {
        alignItems: 'center',
    },
    questionCounterText: {
        fontSize: 18,
        fontWeight: '600',
    },
    questionIdText: {
        fontSize: 12,
        marginTop: 2,
    },
    progressContainer: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
});

