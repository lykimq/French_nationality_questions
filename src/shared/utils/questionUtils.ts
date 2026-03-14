import type { Question } from '../../welcome/types';
import type { TestQuestion } from '../../welcome/types';
import type { FrenchQuestionsData, FrenchQuestion } from '../../types/questionsData';
import type { RawQuestion, RawQuestionsData } from '../types';
import { createLogger } from './logger';
import { extractNumericId } from './idUtils';
import { ensureString } from './stringUtils';
import { isProcessableCategory, isRawQuestion, isQuestion, isFrenchCategory } from './typeGuards';

const logger = createLogger('QuestionUtils');

/**
 * Sorts questions by their numeric ID in ascending order.
 * Handles both string IDs (e.g., "formation_1", "livret_1") and numeric IDs.
 * 
 * @param questions - Array of questions to sort
 * @returns New sorted array (does not mutate original)
 * 
 * @example
 * const sorted = sortQuestionsById(questions);
 */
export const sortQuestionsById = <T extends { id: number | string }>(questions: readonly T[]): T[] => {
    return [...questions].sort((a, b) => {
        const aNum = typeof a.id === 'number' ? a.id : (extractNumericId(a.id) ?? 0);
        const bNum = typeof b.id === 'number' ? b.id : (extractNumericId(b.id) ?? 0);
        return aNum - bNum;
    });
};

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
    
    // Add newlines after exclamation and question marks (combined for efficiency)
    formatted = formatted.replace(/([!?]) /g, '$1 \n\n');
    
    // Format bracketed content
    formatted = formatted.replace(/\[(.*?)\]/g, '\n→ $1 ←\n');
    
    // Clean up multiple newlines and numbered list formatting in one pass
    formatted = formatted
        .replace(/(\d+\.\s)\n\n+/g, '$1')
        .replace(/\n\n+/g, '\n\n');
    
    return formatted.trim();
};

// ==================== QUESTION PROCESSING UTILITIES ====================

const getBaseQuestionNumber = (question: RawQuestion | null | undefined): number | undefined => {
    if (question && question.id !== undefined) {
        return extractNumericId(question.id);
    }
    return undefined;
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
    questionsData.categories.forEach((category: unknown, categoryIndex: number) => {
        if (!isProcessableCategory(category)) {
            logger.warn(`Invalid category at index ${categoryIndex}`);
            return;
        }

        const categoryQuestions = category.questions;
        if (!categoryQuestions || categoryQuestions.length === 0) {
            return;
        }

        const idOffset = categoryIndex * 1000;
        const categoryId = category.id || 'unknown';
        const categoryTitle = isFrenchCategory(category) 
            ? category.title 
            : (category.title || categoryId);

        categoryQuestions.forEach((question: unknown) => {
            // Convert to RawQuestion format for processing
            let rawQuestion: RawQuestion | null = null;
            
            if (isRawQuestion(question)) {
                rawQuestion = question;
            } else if (isQuestion(question)) {
                // Convert Question/FrenchQuestion to RawQuestion format
                const q = question as Question | FrenchQuestion;
                rawQuestion = {
                    id: q.id,
                    question: q.question,
                    explanation: 'explanation' in q ? q.explanation : undefined,
                    image: 'image' in q ? q.image : undefined,
                };
            } else {
                logger.warn(`Invalid question in category ${categoryId}`);
                return;
            }

            if (!rawQuestion) {
                logger.warn(`Failed to process question in category ${categoryId}`);
                return;
            }

            const baseNumber = getBaseQuestionNumber(rawQuestion);
            const questionId = rawQuestion.id ?? baseNumber;
            const dedupeKey = `${categoryId}:${questionId ?? baseNumber ?? 'invalid'}`;

            if (seenKeys.has(dedupeKey)) {
                logger.warn(`Duplicate question ID: ${questionId} in category ${categoryId}`);
                return;
            }
            seenKeys.add(dedupeKey);

            questions.push(processQuestionData(rawQuestion, categoryId, categoryTitle || categoryId, idOffset));
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

/**
 * Limits array to last N items to prevent unbounded growth.
 */
export const applyMemoryLimits = <T>(array: T[], limit: number): T[] => {
    if (limit <= 0) return [];
    return array.slice(-limit);
};

