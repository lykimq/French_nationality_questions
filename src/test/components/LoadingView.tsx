import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';

interface LoadingViewProps {
    message?: string;
}

const LoadingView: React.FC<LoadingViewProps> = ({ message }) => {
    const { theme } = useTheme();

    const defaultMessage = 'Chargement des résultats...';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                {message || defaultMessage}
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
});

export default LoadingView;