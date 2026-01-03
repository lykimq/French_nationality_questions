import type { RawQuestion, RawCategory, RawDataStructure } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    summary: {
        totalQuestions: number;
        questionsWithIds: number;
        questionsWithFrench: number;
        questionsWithExplanations: number;
        questionsWithImages: number;
        categoryInfo?: string;
    };
}

const validateQuestion = (
    question: RawQuestion,
    index: number,
    errors: string[],
    summary: ValidationResult['summary']
): void => {
    if (typeof question.id === 'string' && question.id.trim()) {
        summary.questionsWithIds++;
    } else {
        errors.push(`Question at index ${index} missing or invalid ID`);
    }

    if (question.question && typeof question.question === 'string' && question.question.trim()) {
        summary.questionsWithFrench++;
    } else {
        errors.push(`Question ${question.id || index} missing question text`);
    }

    if (question.explanation && typeof question.explanation === 'string' && question.explanation.trim()) {
        summary.questionsWithExplanations++;
    } else {
        errors.push(`Question ${question.id || index} missing explanation`);
    }

    if (question.image && question.image !== null) {
        summary.questionsWithImages++;
    }
};

export const validateDataStructure = (data: unknown, dataType: string): ValidationResult => {
    const errors: string[] = [];
    const summary: ValidationResult['summary'] = {
        totalQuestions: 0,
        questionsWithIds: 0,
        questionsWithFrench: 0,
        questionsWithExplanations: 0,
        questionsWithImages: 0,
        categoryInfo: undefined,
    };

    try {
        if (!data || typeof data !== 'object') {
            errors.push('Data is null or undefined');
            return { isValid: false, errors, summary };
        }

        const typedData = data as RawDataStructure;

        if (typedData.id && typedData.title && typedData.subcategories && Array.isArray(typedData.subcategories)) {
            summary.categoryInfo = `Category Metadata: ${typedData.id} - ${typedData.title}`;
            typedData.subcategories.forEach((subcategory: RawCategory, index: number) => {
                if (!subcategory.id || typeof subcategory.id !== 'string') {
                    errors.push(`Subcategory at index ${index} missing ID`);
                }
                if (!subcategory.title || typeof subcategory.title !== 'string') {
                    errors.push(`Subcategory at index ${index} missing title`);
                }
                if (!subcategory.icon || typeof subcategory.icon !== 'string') {
                    errors.push(`Subcategory at index ${index} missing icon`);
                }
            });
            return { isValid: errors.length === 0, errors, summary };
        } else if (Array.isArray(data)) {
            // Handle arrays of questions directly (e.g., hist_geo_part1.json)
            summary.totalQuestions = data.length;
            data.forEach((question: RawQuestion, index: number) =>
                validateQuestion(question, index, errors, summary)
            );
        } else if (typedData.questions && Array.isArray(typedData.questions)) {
            summary.totalQuestions = typedData.questions.length;
            typedData.questions.forEach((question: RawQuestion, index: number) =>
                validateQuestion(question, index, errors, summary)
            );
        } else {
            errors.push(`Unknown data structure for ${dataType}`);
        }

        const requiresQuestions = !dataType.includes('categories');
        const isValid = errors.length === 0 && (!requiresQuestions || summary.totalQuestions > 0);
        return { isValid, errors, summary };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Exception during validation: ${errorMessage}`);
        return { isValid: false, errors, summary };
    }
};

