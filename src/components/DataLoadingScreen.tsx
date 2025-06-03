import React from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from './FormattedText';

interface DataLoadingScreenProps {
    error?: string | null;
    onRetry?: () => void;
    isLoading?: boolean;
}

const DataLoadingScreen: React.FC<DataLoadingScreenProps> = ({ error, onRetry, isLoading }) => {
    const { theme } = useTheme();

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="warning" size={64} color={theme.colors.error} />
                <FormattedText style={[styles.errorTitle, { color: theme.colors.error }]}>Erreur de chargement</FormattedText>
                <FormattedText style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>{error}</FormattedText>
                <FormattedText style={[styles.errorSubtext, { color: theme.colors.textMuted }]}>
                    Veuillez vérifier votre connexion internet et réessayer.
                </FormattedText>
                <TouchableOpacity
                    style={[styles.retryButtonContainer, { backgroundColor: theme.colors.primary + '20' }]}
                    onPress={onRetry}
                >
                    <FormattedText style={[styles.retryButton, { color: theme.colors.primary }]}>
                        Réessayer
                    </FormattedText>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="cloud-download-outline" size={48} color={theme.colors.primary} />
                    <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
                    <FormattedText style={[styles.loadingTitle, { color: theme.colors.text }]}>Chargement des données</FormattedText>
                    <FormattedText style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>
                        Préparation des questions de naturalisation...
                    </FormattedText>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="cloud-download-outline" size={48} color={theme.colors.primary} />
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
                <FormattedText style={[styles.loadingTitle, { color: theme.colors.text }]}>Chargement des données</FormattedText>
                <FormattedText style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>
                    Téléchargement depuis Firebase Storage...
                </FormattedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minWidth: '80%',
    },
    spinner: {
        marginTop: 16,
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    errorSubtext: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
    retryButtonContainer: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        overflow: 'hidden',
    },
    retryButton: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default DataLoadingScreen;