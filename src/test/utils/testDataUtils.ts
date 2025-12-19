import type { TestQuestion } from '../../types';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('TestDataUtils');

// Type validation helpers
export const isValidQuestionData = (question: any): boolean => {
    return question &&
        typeof question.id === 'number' &&
        (typeof question.question === 'string' || typeof question.question === 'object');
};

// Helper function to safely process questions
export const processQuestionData = (
    question: any,
    categoryId: string,
    categoryTitle: string,
    idOffset: number = 0
): TestQuestion => {
    if (!isValidQuestionData(question)) {
        logger.warn(`Invalid question data for question ID: ${question?.id}`);
        // Return a fallback question instead of throwing
        return {
            id: question?.id || 0,
            question: 'Invalid question data',
            explanation: 'No explanation available',
            categoryId,
            categoryTitle,
        };
    }

    const finalId = question.id + idOffset;

    return {
        id: finalId,
        question: typeof question.question === 'string'
            ? question.question
            : question.question || '',
        explanation: typeof question.explanation === 'string'
            ? question.explanation
            : question.explanation || 'No explanation provided',
        image: question.image,
        categoryId,
        categoryTitle: categoryTitle || categoryId,
    };
};

// Helper function to safely parse dates
export const safeParseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;

    try {
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? undefined : dateValue;
        }

        if (typeof dateValue === 'string') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? undefined : parsed;
        }

        return undefined;
    } catch {
        return undefined;
    }
};

// Helper function to safely calculate averages
export const safeAverage = (values: number[]): number => {
    if (!values.length) return 0;
    const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
    if (!validValues.length) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
};

// Process all questions from different sources
export const processAllQuestions = (
    questionsData: any,
    historySubcategories: any
): TestQuestion[] => {
    const questions: TestQuestion[] = [];
    const seenIds = new Set<number>();

    // Safety check
    if (!questionsData?.categories) {
        logger.warn('questionsData.categories is not available');
        return questions;
    }

    // Process main categories
    questionsData.categories.forEach((category: any) => {
        if (!category?.questions) return;

        category.questions.forEach((question: any) => {
            if (seenIds.has(question.id)) {
                logger.warn(`Duplicate question ID: ${question.id} in category ${category.id}`);
                return;
            }
            seenIds.add(question.id);

            questions.push(processQuestionData(question, category.id, category.title));
        });
    });

    // Process history subcategories with safety check
    if (historySubcategories) {
        Object.values(historySubcategories).forEach((subcategory: any) => {
            if (!subcategory?.questions) return;

            subcategory.questions.forEach((question: any) => {
                if (seenIds.has(question.id)) {
                    logger.warn(`Duplicate question ID: ${question.id} in history subcategory ${subcategory.id}`);
                    return;
                }
                seenIds.add(question.id);

                questions.push(processQuestionData(question, subcategory.id, subcategory.title));
            });
        });
    }

    return questions;
};

// Apply memory limits to arrays to prevent unbounded growth
export const applyMemoryLimits = <T>(array: T[], limit: number): T[] => {
    return array.slice(-limit);
};