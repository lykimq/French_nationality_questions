import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../shared/contexts/ThemeContext';
import CategoryCard from './CategoryCard';
import { CategorySelectionViewProps } from '../types';

const CategorySelectionView: React.FC<CategorySelectionViewProps> = ({
    categories,
    onSelectCategory
}) => {
    const { theme } = useTheme();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {categories.map((category, index) => (
                <CategoryCard
                    key={category.id}
                    title={category.title}
                    description={category.description || ''}
                    icon={category.icon || 'book'}
                    count={category.questions.length}
                    onPress={() => onSelectCategory(index)}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    }
});

export default CategorySelectionView;