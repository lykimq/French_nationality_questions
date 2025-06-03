import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DataLoadingScreenProps {
    error?: string | null;
    onRetry?: () => void;
}

const DataLoadingScreen: React.FC<DataLoadingScreenProps> = ({ error, onRetry }) => {
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="cloud-offline-outline" size={64} color="#FF6B6B" />
                    <Text style={styles.errorTitle}>Erreur de chargement</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <Text style={styles.errorSubtext}>
                        Vérifiez votre connexion internet et réessayez.
                    </Text>
                    {onRetry && (
                        <Text style={styles.retryButton} onPress={onRetry}>
                            Réessayer
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.loadingContainer}>
                <Ionicons name="cloud-download-outline" size={48} color="#3F51B5" />
                <ActivityIndicator size="large" color="#3F51B5" style={styles.spinner} />
                <Text style={styles.loadingTitle}>Chargement des données</Text>
                <Text style={styles.loadingSubtext}>
                    Téléchargement depuis Firebase Storage...
                </Text>
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
    errorContainer: {
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
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
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
    retryButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3F51B5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#E8EAF6',
        borderRadius: 8,
        textAlign: 'center',
        overflow: 'hidden',
    },
});

export default DataLoadingScreen;