import type { Question } from '../../welcome/types';
import type { TestQuestion } from '../../welcome/types';
import type { FrenchQuestionsData } from '../../types/questionsData';
import type { RawQuestion, RawCategory, RawQuestionsData } from '../types';
import { createLogger } from './logger';
import { extractNumericId } from './idUtils';
import { ensureString } from './stringUtils';

const logger = createLogger('QuestionUtils');

export const getQuestionText = (question: string | null | undefined): string => question ?? '';

export const getExplanationText = (explanation: string | null | undefined): string => explanation ?? '';

export const formatExplanation = (text: string): string => {
    if (!text) return '';

    let formatted = text;
    
    // Don't add newlines after periods in numbered lists (like "1. ", "2. ")
    // Replace periods that are NOT part of numbered lists
    formatted = formatted.replace(/\. /g, (match, offset, string) => {
        // Check if this period is part of a numbered list (preceded by a digit)
        const before = string.substring(Math.max(0, offset - 3), offset);
        if (/\d$/.test(before)) {
            // This is part of a numbered list, don't add newline
            return match;
        }
        // Regular period, add newline
        return '. \n\n';
    });
    
    // Add newlines after exclamation and question marks
    formatted = formatted
        .replace(/\! /g, '! \n\n')
        .replace(/\? /g, '? \n\n')
        .replace(/\[(.*?)\]/g, '\n→ $1 ←\n')
        .replace(/\n\n+/g, '\n\n');
    
    // Clean up: remove any newlines that might have been added right after numbered items
    formatted = formatted.replace(/(\d+\.\s)\n\n+/g, '$1');
    
    return formatted.trim();
};

// ==================== QUESTION PROCESSING UTILITIES ====================

const getBaseQuestionNumber = (question: RawQuestion | null | undefined): number | undefined => {
    if (question && question.id !== undefined) {
        return extractNumericId(question.id);
    }
    return undefined;
};

export const isValidQuestionData = (question: RawQuestion | null | undefined): boolean => {
    if (!question) return false;
    const baseNumber = getBaseQuestionNumber(question);
    return typeof baseNumber === 'number' &&
        (typeof question.question === 'string' || typeof question.question === 'object');
};

// Helper function to safely process questions
export const processQuestionData = (
    question: RawQuestion,
    categoryId: string,
    categoryTitle: string,
    idOffset: number = 0
): TestQuestion => {
    const baseNumber = getBaseQuestionNumber(question);

    if (typeof baseNumber !== 'number') {
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

    const finalId = baseNumber + idOffset;

    const questionText = ensureString(question.question);
    const explanationText = ensureString(question.explanation, 'No explanation provided');

    return {
        id: finalId,
        question: questionText,
        explanation: explanationText,
        image: question.image,
        categoryId,
        categoryTitle: categoryTitle || categoryId,
    };
};

// Process all questions from different sources
export const processAllQuestions = (
    questionsData: RawQuestionsData | FrenchQuestionsData
): TestQuestion[] => {
    const questions: TestQuestion[] = [];
    const seenKeys = new Set<string>();

    // Safety check
    if (!questionsData?.categories) {
        logger.warn('questionsData.categories is not available');
        return questions;
    }

    // Process main categories
    questionsData.categories.forEach((category: RawCategory | { id: string; title: string; questions: readonly Question[] }, categoryIndex: number) => {
        if (!category?.questions) return;

        const idOffset = categoryIndex * 1000;
        const categoryId = category.id || 'unknown';
        const categoryTitle = ('title' in category && category.title) ? category.title : categoryId;

        category.questions.forEach((question: RawQuestion | Question) => {
            const baseNumber = getBaseQuestionNumber(question as RawQuestion);
            const questionId = 'id' in question ? question.id : baseNumber;
            const dedupeKey = `${categoryId}:${questionId ?? baseNumber ?? 'invalid'}`;

            if (seenKeys.has(dedupeKey)) {
                logger.warn(`Duplicate question ID: ${questionId} in category ${categoryId}`);
                return;
            }
            seenKeys.add(dedupeKey);

            questions.push(processQuestionData(question as RawQuestion, categoryId, categoryTitle || categoryId, idOffset));
        });
    });

    return questions;
};

// ==================== DATE UTILITIES ====================

// Helper function to safely parse dates
export const safeParseDate = (dateValue: unknown): Date | undefined => {
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

// ==================== ARRAY UTILITIES ====================

// Apply memory limits to arrays to prevent unbounded growth
export const applyMemoryLimits = <T>(array: T[], limit: number): T[] => {
    if (limit <= 0) return [];
    return array.slice(-limit);
};

