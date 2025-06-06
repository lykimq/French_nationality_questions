import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from './FormattedText';
import { sharedStyles } from '../utils/sharedStyles';

interface DataLoadingScreenProps {
    error?: string | null;
    onRetry?: () => void;
    isLoading?: boolean;
}

const DataLoadingScreen: React.FC<DataLoadingScreenProps> = ({ error, onRetry, isLoading }) => {
    const { theme } = useTheme();

    return (
        <View style={[sharedStyles.centeredContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[
                styles.loadingContainer,
                sharedStyles.mediumShadow,
                { backgroundColor: theme.colors.card }
            ]}>
                {error ? (
                    <>
                        <FormattedText style={[styles.errorTitle, { color: theme.colors.error }]}>
                            Erreur de chargement
                        </FormattedText>
                        <FormattedText style={[styles.errorMessage, { color: theme.colors.text }]}>
                            {error}
                        </FormattedText>
                        <FormattedText style={[styles.errorSubtext, { color: theme.colors.textMuted }]}>
                            Vérifiez votre connexion internet et réessayez.
                        </FormattedText>
                        {onRetry && (
                            <TouchableOpacity
                                style={[
                                    styles.retryButtonContainer,
                                    { backgroundColor: theme.colors.primary }
                                ]}
                                onPress={onRetry}
                            >
                                <FormattedText style={[styles.retryButton, { color: theme.colors.buttonText }]}>
                                    Réessayer
                                </FormattedText>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <>
                        <FormattedText style={[styles.loadingTitle, { color: theme.colors.text }]}>
                            Chargement des données
                        </FormattedText>
                        <FormattedText style={[styles.loadingSubtext, { color: theme.colors.textMuted }]}>
                            Téléchargement des questions depuis Firebase Storage...
                        </FormattedText>
                        {isLoading && (
                            <ActivityIndicator
                                size="large"
                                color={theme.colors.primary}
                                style={styles.spinner}
                            />
                        )}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 16,
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