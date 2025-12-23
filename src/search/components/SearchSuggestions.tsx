import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { FormattedText, Icon3D } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcon3D } from '../../shared/hooks';
import type { SearchSuggestion } from '../useSearch';

interface SearchSuggestionsProps {
    suggestions: SearchSuggestion[];
    onApplySuggestion: (suggestion: SearchSuggestion) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
    suggestions,
    onApplySuggestion,
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();

    const searchIcon = getIcon('search');
    const helpIcon = getIcon('helpCircle');
    const categoriesIcon = getIcon('categories');

    if (suggestions.length === 0) {
        return null;
    }

    const getIconForSuggestion = (type: string) => {
        switch (type) {
            case 'category':
                return categoriesIcon.name;
            case 'id':
                return helpIcon.name;
            default:
                return searchIcon.name;
        }
    };

    return (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
                    onPress={() => onApplySuggestion(suggestion)}
                >
                    <Icon3D
                        name={getIconForSuggestion(suggestion.type)}
                        size={14}
                        color={theme.colors.textMuted}
                        variant="default"
                    />
                    <FormattedText style={[styles.suggestionText, { color: theme.colors.text }]}>
                        {suggestion.text}
                    </FormattedText>
                    {suggestion.count && (
                        <FormattedText style={[styles.suggestionCount, { color: theme.colors.textMuted }]}>
                            {suggestion.count}
                        </FormattedText>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    suggestionsContainer: {
        marginTop: 10,
        borderRadius: 15,
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    suggestionText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    suggestionCount: {
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
});
