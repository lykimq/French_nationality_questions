import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface SearchStatsProps {
    totalQuestions: number;
    mainQuestions: number;
    historyQuestions: number;
    hasActiveFilters: boolean;
}

export const SearchStats: React.FC<SearchStatsProps> = ({
    totalQuestions,
    mainQuestions,
    historyQuestions,
    hasActiveFilters,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.statsContainer}>
            <FormattedText style={[styles.statsText, { color: theme.colors.textMuted }]}>
                {`${totalQuestions} questions disponibles (${mainQuestions} principales + ${historyQuestions} histoire)`}
            </FormattedText>
            {hasActiveFilters && (
                <FormattedText style={[styles.filterStatus, { color: theme.colors.primary }]}>
                    Filtres actifs
                </FormattedText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        marginTop: 8,
        paddingHorizontal: 5,
    },
    statsText: {
        fontSize: 12,
        textAlign: 'center',
    },
    filterStatus: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 3,
        fontWeight: '600',
    },
});

