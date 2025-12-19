/**
 * Data validation utilities for validating question and category data structures
 */

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

/**
 * Validates a single question structure
 */
const validateQuestion = (
    question: any,
    index: number,
    errors: string[],
    summary: ValidationResult['summary']
): void => {
    if (typeof question.id === 'number') {
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

/**
 * Validates the structure of loaded data
 */
export const validateDataStructure = (data: any, dataType: string): ValidationResult => {
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
        if (!data) {
            errors.push('Data is null or undefined');
            return { isValid: false, errors, summary };
        }

        if (data.id && data.title && data.subcategories && Array.isArray(data.subcategories)) {
            summary.categoryInfo = `Category Metadata: ${data.id} - ${data.title}`;
            data.subcategories.forEach((subcategory: any, index: number) => {
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
        } else if (data.questions && Array.isArray(data.questions)) {
            summary.totalQuestions = data.questions.length;
            data.questions.forEach((question: any, index: number) => 
                validateQuestion(question, index, errors, summary)
            );
        } else {
            errors.push(`Unknown data structure for ${dataType}`);
        }

        const requiresQuestions = !dataType.includes('categories');
        const isValid = errors.length === 0 && (!requiresQuestions || summary.totalQuestions > 0);
        return { isValid, errors, summary };
    } catch (error) {
        errors.push(`Exception during validation: ${error}`);
        return { isValid: false, errors, summary };
    }
};

