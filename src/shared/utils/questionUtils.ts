import type { Question } from '../../welcome/types';

/**
 * Extracts question text
 */
export const getQuestionText = (
    question: string | null | undefined
): string => {
    if (!question) return '';
    return question;
};

/**
 * Extracts explanation text
 */
export const getExplanationText = (
    explanation: string | null | undefined
): string => {
    if (!explanation) return '';
    return explanation;
};

/**
 * Formats explanation text with line breaks for better readability
 * Adds line breaks after sentences and formats special markers
 */
export const formatExplanation = (text: string): string => {
    if (!text) return '';

    let formatted = text
        .replace(/\. /g, '. \n\n')
        .replace(/\! /g, '! \n\n')
        .replace(/\? /g, '? \n\n')
        .replace(/\[(.*?)\]/g, '\n→ $1 ←\n')
        .replace(/\n\n+/g, '\n\n')
        .trim();

    return formatted;
};

