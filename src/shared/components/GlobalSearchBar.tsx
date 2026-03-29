import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from './FormattedText';

interface GlobalSearchBarProps {
    onPress: () => void;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.container, 
                { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    shadowColor: theme.colors.text,
                }
            ]}
        >
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <FormattedText style={[styles.placeholder, { color: theme.colors.textMuted }]}>
                Rechercher une question...
            </FormattedText>
            <View style={[styles.shortcut, { backgroundColor: theme.colors.primary + '10' }]}>
                <Ionicons name="return-down-back" size={14} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        gap: 12,
    },
    placeholder: {
        flex: 1,
        fontSize: 16,
    },
    shortcut: {
        padding: 4,
        borderRadius: 4,
    },
});

export default GlobalSearchBar;
