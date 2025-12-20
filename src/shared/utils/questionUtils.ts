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

