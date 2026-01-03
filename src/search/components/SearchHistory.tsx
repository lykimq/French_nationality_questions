import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface SearchHistoryProps {
    history: string[];
    onSelectQuery: (query: string) => void;
    onClearHistory: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
    history,
    onSelectQuery,
    onClearHistory,
}) => {
    const { theme } = useTheme();

    if (history.length === 0) {
        return null;
    }

    return (
        <View style={[styles.historyContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.historyHeader}>
                <FormattedText style={[styles.historyTitle, { color: theme.colors.text }]}>
                    Recherches récentes:
                </FormattedText>
                <TouchableOpacity onPress={onClearHistory}>
                    <FormattedText style={[styles.clearHistoryText, { color: theme.colors.primary }]}>
                        Effacer
                    </FormattedText>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {history.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.historyItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={() => onSelectQuery(item)}
                    >
                        <FormattedText style={[styles.historyText, { color: theme.colors.text }]}>
                            {item}
                        </FormattedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    historyContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    historyItem: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginRight: 10,
    },
    historyText: {
        fontSize: 13,
    },
    clearHistoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

