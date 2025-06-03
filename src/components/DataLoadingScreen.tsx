import React from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormattedText from './FormattedText';

interface DataLoadingScreenProps {
    error?: string | null;
    onRetry?: () => void;
    isLoading?: boolean;
}

const DataLoadingScreen: React.FC<DataLoadingScreenProps> = ({ error, onRetry, isLoading }) => {
    if (error) {
        return (
            <View style={styles.container}>
                <Ionicons name="warning" size={64} color="#FF5722" />
                <FormattedText style={styles.errorTitle}>Erreur de chargement</FormattedText>
                <FormattedText style={styles.errorMessage}>{error}</FormattedText>
                <FormattedText style={styles.errorSubtext}>
                    Veuillez vérifier votre connexion internet et réessayer.
                </FormattedText>
                <TouchableOpacity style={styles.retryButtonContainer} onPress={onRetry}>
                    <FormattedText style={styles.retryButton}>
                        Réessayer
                    </FormattedText>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="cloud-download-outline" size={48} color="#3F51B5" />
                    <ActivityIndicator size="large" color="#3F51B5" style={styles.spinner} />
                    <FormattedText style={styles.loadingTitle}>Chargement des données</FormattedText>
                    <FormattedText style={styles.loadingSubtext}>
                        Préparation des questions de naturalisation...
                    </FormattedText>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.loadingContainer}>
                <Ionicons name="cloud-download-outline" size={48} color="#3F51B5" />
                <ActivityIndicator size="large" color="#3F51B5" style={styles.spinner} />
                <FormattedText style={styles.loadingTitle}>Chargement des données</FormattedText>
                <FormattedText style={styles.loadingSubtext}>
                    Téléchargement depuis Firebase Storage...
                </FormattedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
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
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF6B6B',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    errorSubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
    retryButtonContainer: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#E8EAF6',
        borderRadius: 8,
        overflow: 'hidden',
    },
    retryButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3F51B5',
        textAlign: 'center',
    },
});

export default DataLoadingScreen;