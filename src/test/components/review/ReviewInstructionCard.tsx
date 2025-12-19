import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';

export const ReviewInstructionCard: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View style={[styles.instructionCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.instructionHeader}>
                <Ionicons name="bulb" size={20} color={theme.colors.warning} />
                <FormattedText style={[styles.instructionTitle, { color: theme.colors.text }]}>
                    Instructions
                </FormattedText>
            </View>
            <FormattedText style={[styles.instructionText, { color: theme.colors.textMuted }]}>
                Réfléchissez à votre réponse, puis cliquez sur "Voir la réponse" pour découvrir la réponse correcte et améliorer vos connaissances.
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    instructionCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    instructionText: {
        fontSize: 14,
        lineHeight: 20,
    },
});

