import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../shared/contexts/ThemeContext';
import { CategorySlideViewProps } from '../types';
import SlideQuestionView from './SlideQuestionView';
import { FormattedText } from '../shared/components';

const CategorySlideView: React.FC<CategorySlideViewProps> = ({ categories }) => {
    const { theme } = useTheme();
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const currentCategory = useMemo(() => {
        if (currentCategoryIndex >= 0 && currentCategoryIndex < categories.length) {
            return categories[currentCategoryIndex];
        }
        return null;
    }, [categories, currentCategoryIndex]);

    const currentQuestion = useMemo(() => {
        if (!currentCategory?.questions) return null;
        if (currentQuestionIndex >= 0 && currentQuestionIndex < currentCategory.questions.length) {
            return currentCategory.questions[currentQuestionIndex];
        }
        return null;
    }, [currentCategory, currentQuestionIndex]);

    const totalQuestions = currentCategory?.questions?.length || 0;

    const handleNext = useCallback(() => {
        if (!currentCategory) return;

        const totalQ = currentCategory.questions.length;

        if (currentQuestionIndex < totalQ - 1) {
            // Next question in same category
            console.log('[CategorySlideView] Next question');
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (currentCategoryIndex < categories.length - 1) {
            // Next category
            console.log('[CategorySlideView] Next category');
            setCurrentCategoryIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        }
    }, [currentCategory, currentQuestionIndex, currentCategoryIndex, categories.length]);

    const handlePrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            // Previous question in same category
            console.log('[CategorySlideView] Previous question');
            setCurrentQuestionIndex(prev => prev - 1);
        } else if (currentCategoryIndex > 0) {
            // Previous category
            console.log('[CategorySlideView] Previous category');
            const newCategoryIndex = currentCategoryIndex - 1;
            const newCategory = categories[newCategoryIndex];
            setCurrentCategoryIndex(newCategoryIndex);
            // Go to last question of previous category
            setCurrentQuestionIndex(newCategory.questions.length > 0 ? newCategory.questions.length - 1 : 0);
        }
    }, [currentQuestionIndex, currentCategoryIndex, categories]);

    if (!currentCategory || !currentQuestion) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <FormattedText style={{ color: theme.colors.text }}>No content available</FormattedText>
            </View>
        );
    }

    const hasNext = currentQuestionIndex < totalQuestions - 1 || currentCategoryIndex < categories.length - 1;
    const hasPrevious = currentQuestionIndex > 0 || currentCategoryIndex > 0;

    return (
        <SlideQuestionView
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalCount={totalQuestions}
            title={currentCategory.title}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategorySlideView;