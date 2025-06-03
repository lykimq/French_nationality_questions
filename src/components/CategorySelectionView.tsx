import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import CategoryCard from './CategoryCard';

interface CategorySelectionViewProps {
    categories: Array<{
        id: string;
        title: string;
        title_vi?: string;
        icon?: string;
        description?: string;
        description_vi?: string;
        questions: Array<{
            id: number;
            question: string;
            question_vi: string;
            explanation?: string;
            explanation_vi?: string;
            image?: string | null;
        }>;
    }>;
    language: 'fr' | 'vi';
    onSelectCategory: (categoryIndex: number) => void;
}

const CategorySelectionView: React.FC<CategorySelectionViewProps> = ({
    categories,
    language,
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
                    title_vi={category.title_vi}
                    description={category.description || ''}
                    description_vi={category.description_vi}
                    icon={category.icon || 'book'}
                    count={category.questions.length}
                    onPress={() => onSelectCategory(index)}
                    language={language}
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