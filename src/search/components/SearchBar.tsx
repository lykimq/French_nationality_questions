import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onToggleAdvanced: () => void;
    showAdvanced: boolean;
    onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchChange,
    onToggleAdvanced,
    showAdvanced,
    onClear,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} />
            <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChangeText={onSearchChange}
                placeholderTextColor={theme.colors.textMuted}
                autoCorrect={false}
                autoCapitalize="none"
            />
            <TouchableOpacity
                onPress={onToggleAdvanced}
                style={[styles.advancedButton, showAdvanced && { backgroundColor: theme.colors.primary + '20' }]}
            >
                <Ionicons
                    name="options"
                    size={20}
                    color={showAdvanced ? theme.colors.primary : theme.colors.textMuted}
                />
            </TouchableOpacity>
            {searchQuery !== '' && (
                <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    advancedButton: {
        padding: 8,
        borderRadius: 15,
        marginHorizontal: 5,
    },
    clearButton: {
        padding: 5,
        marginLeft: 5,
    },
});

