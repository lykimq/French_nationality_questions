import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface Category {
    id: string;
    title: string;
    count: number;
}

interface SearchFilters {
    categories: string[];
    hasImage: 'all' | 'with' | 'without';
    questionRange: { min: number; max: number };
    searchIn: ('question' | 'explanation' | 'both')[];
}

interface AdvancedSearchPanelProps {
    filters: SearchFilters;
    availableCategories: Category[];
    onFilterChange: (filters: SearchFilters) => void;
    onResetFilters: () => void;
}

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
    filters,
    availableCategories,
    onFilterChange,
    onResetFilters,
}) => {
    const { theme } = useTheme();

    const toggleCategoryFilter = (categoryId: string) => {
        onFilterChange({
            ...filters,
            categories: filters.categories.includes(categoryId)
                ? filters.categories.filter(id => id !== categoryId)
                : [...filters.categories, categoryId]
        });
    };

    const handleImageFilterChange = (option: 'all' | 'with' | 'without') => {
        onFilterChange({ ...filters, hasImage: option });
    };

    const handleSearchScopeChange = (scope: 'question' | 'explanation' | 'both') => {
        if (scope === 'both') {
            onFilterChange({ ...filters, searchIn: ['both'] });
        } else {
            onFilterChange({
                ...filters,
                searchIn: filters.searchIn.includes('both')
                    ? [scope]
                    : filters.searchIn.includes(scope)
                        ? filters.searchIn.filter(s => s !== scope)
                        : [...filters.searchIn.filter(s => s !== 'both'), scope]
            });
        }
    };

    return (
        <View style={[styles.advancedPanel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.advancedHeader}>
                <FormattedText style={[styles.advancedTitle, { color: theme.colors.text }]}>
                    Recherche avancée
                </FormattedText>
                <TouchableOpacity onPress={onResetFilters}>
                    <FormattedText style={[styles.resetButton, { color: theme.colors.primary }]}>
                        Réinitialiser
                    </FormattedText>
                </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
                <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                    Catégories:
                </FormattedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTags}>
                    {availableCategories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryTag,
                                { borderColor: theme.colors.border },
                                filters.categories.includes(category.id) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => toggleCategoryFilter(category.id)}
                        >
                            <FormattedText style={[
                                styles.categoryTagText,
                                { color: filters.categories.includes(category.id) ? theme.colors.buttonText : theme.colors.text }
                            ]}>
                                {category.title} ({category.count})
                            </FormattedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.filterSection}>
                <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                    Questions avec images:
                </FormattedText>
                <View style={styles.imageFilterButtons}>
                    {(['all', 'with', 'without'] as const).map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.imageFilterButton,
                                { borderColor: theme.colors.border },
                                filters.hasImage === option && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => handleImageFilterChange(option)}
                        >
                            <FormattedText style={[
                                styles.imageFilterText,
                                { color: filters.hasImage === option ? theme.colors.buttonText : theme.colors.text }
                            ]}>
                                {option === 'all' ? 'Toutes' : option === 'with' ? 'Avec' : 'Sans'}
                            </FormattedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.filterSection}>
                <FormattedText style={[styles.filterLabel, { color: theme.colors.text }]}>
                    Rechercher dans:
                </FormattedText>
                <View style={styles.scopeButtons}>
                    {(['question', 'explanation', 'both'] as const).map(scope => (
                        <TouchableOpacity
                            key={scope}
                            style={[
                                styles.scopeButton,
                                { borderColor: theme.colors.border },
                                filters.searchIn.includes(scope) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => handleSearchScopeChange(scope)}
                        >
                            <FormattedText style={[
                                styles.scopeButtonText,
                                { color: filters.searchIn.includes(scope) ? theme.colors.buttonText : theme.colors.text }
                            ]}>
                                {scope === 'question' ? 'Questions' : scope === 'explanation' ? 'Explications' : 'Les deux'}
                            </FormattedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    advancedPanel: {
        marginTop: 10,
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    advancedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    advancedTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    resetButton: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterSection: {
        marginBottom: 15,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    categoryTags: {
        marginHorizontal: -5,
    },
    categoryTag: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 20,
        marginHorizontal: 5,
        marginVertical: 3,
    },
    categoryTagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    imageFilterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    imageFilterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    imageFilterText: {
        fontSize: 13,
        fontWeight: '500',
    },
    scopeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    scopeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    scopeButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
});

