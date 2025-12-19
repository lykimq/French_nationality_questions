import type { Question } from '../../welcome/types';

export const getQuestionText = (
    question: string | null | undefined
): string => {
    if (!question) return '';
    return question;
};

export const getExplanationText = (
    explanation: string | null | undefined
): string => {
    if (!explanation) return '';
    return explanation;
};

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

