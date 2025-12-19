import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ReviewNavigationProps {
    showAnswer: boolean;
    currentIndex: number;
    totalQuestions: number;
    onRevealAnswer: () => void;
    onNextQuestion: () => void;
    onPreviousQuestion: () => void;
    onFinish: () => void;
}

export const ReviewNavigation: React.FC<ReviewNavigationProps> = ({
    showAnswer,
    currentIndex,
    totalQuestions,
    onRevealAnswer,
    onNextQuestion,
    onPreviousQuestion,
    onFinish,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            {!showAnswer ? (
                <TouchableOpacity
                    style={[styles.actionButton, styles.revealButton, { backgroundColor: theme.colors.primary }]}
                    onPress={onRevealAnswer}
                >
                    <Ionicons name="eye" size={20} color="white" />
                    <FormattedText style={styles.actionButtonText}>
                        Voir la réponse
                    </FormattedText>
                </TouchableOpacity>
            ) : (
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            { backgroundColor: theme.colors.border },
                            currentIndex === 0 && styles.navButtonDisabled
                        ]}
                        onPress={onPreviousQuestion}
                        disabled={currentIndex === 0}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={currentIndex === 0 ? theme.colors.textMuted : theme.colors.text}
                        />
                        <FormattedText style={[
                            styles.navButtonText,
                            { color: currentIndex === 0 ? theme.colors.textMuted : theme.colors.text }
                        ]}>
                            Précédent
                        </FormattedText>
                    </TouchableOpacity>

                    {currentIndex < totalQuestions - 1 ? (
                        <TouchableOpacity
                            style={[styles.navButton, { backgroundColor: theme.colors.primary }]}
                            onPress={onNextQuestion}
                        >
                            <FormattedText style={[styles.navButtonText, { color: 'white' }]}>
                                Suivant
                            </FormattedText>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.navButton, { backgroundColor: theme.colors.success }]}
                            onPress={onFinish}
                        >
                            <Ionicons name="checkmark" size={20} color="white" />
                            <FormattedText style={[styles.navButtonText, { color: 'white' }]}>
                                Terminé
                            </FormattedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    revealButton: {
        marginBottom: 0,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 4,
    },
});

