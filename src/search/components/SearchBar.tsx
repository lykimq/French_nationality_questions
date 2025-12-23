import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { Icon3D } from '../../shared/components';

export interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onToggleAdvanced: () => void;
    showAdvanced: boolean;
    onClear: () => void;
    isSearching?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchChange,
    onToggleAdvanced,
    showAdvanced,
    onClear,
    isSearching = false,
}) => {
    const { theme } = useTheme();
    const { getIconName, getIconVariant } = useIcons();

    const searchIconName = getIconName('search');
    const searchVariant = getIconVariant('search');
    const closeIconName = getIconName('close');
    const closeVariant = getIconVariant('close');

    return (
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Icon3D
                name={searchIconName}
                size={16}
                color={theme.colors.textMuted}
                variant="default"
            />
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
                <Icon3D
                    name="options"
                    size={16}
                    color={showAdvanced ? theme.colors.primary : theme.colors.textMuted}
                    variant="default"
                />
            </TouchableOpacity>
            {isSearching && searchQuery !== '' && (
                <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={styles.searchIndicator}
                />
            )}
            {searchQuery !== '' && (
                <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                    <Icon3D
                        name="close-circle"
                        size={16}
                        color={theme.colors.textMuted}
                        variant="default"
                    />
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 0,
    },
    advancedButton: {
        padding: 6,
        borderRadius: 15,
    },
    clearButton: {
        padding: 4,
    },
    searchIndicator: {
        marginHorizontal: 4,
    },
});
