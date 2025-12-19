import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ReviewEmptyStateProps {
    onGoBack: () => void;
}

export const ReviewEmptyState: React.FC<ReviewEmptyStateProps> = ({
    onGoBack,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.emptyStateContainer}>
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
            <FormattedText style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                Excellent travail !
            </FormattedText>
            <FormattedText style={[styles.emptyStateDescription, { color: theme.colors.textMuted }]}>
                Vous n'avez aucune question incorrecte à réviser pour le moment.
            </FormattedText>

            <TouchableOpacity
                style={[styles.takeTestButton, { backgroundColor: theme.colors.primary }]}
                onPress={onGoBack}
            >
                <Ionicons name="arrow-back" size={20} color="white" />
                <FormattedText style={styles.takeTestButtonText}>
                    Retour aux tests
                </FormattedText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateDescription: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
    },
    takeTestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
    },
    takeTestButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

