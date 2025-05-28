import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CategoryCard from './CategoryCard';

interface CategorySelectionViewProps {
    categories: Array<{
        id: string;
        title: string;
        icon?: string;
        description?: string;
        questions: Array<{
            id: number;
            question: string;
            explanation?: string;
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
    return (
        <ScrollView
            style={styles.container}
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
                    language={language}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    contentContainer: {
        padding: 20,
    }
});

export default CategorySelectionView;