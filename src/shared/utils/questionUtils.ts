import { Language, MultiLangText, getTextFromMultiLang } from '../../types/core';
import type { Question } from '../../welcome/types';

/**
 * Extracts question text with dual language support for Vietnamese mode
 * Shows both French and Vietnamese with flags when in Vietnamese mode
 */
export const getQuestionTextWithDualLanguage = (
    question: Question | null | undefined,
    language: Language,
    fallbackFr: string = 'Question non disponible',
    fallbackVi: string = 'Question non disponible'
): string => {
    if (!question) return fallbackFr;

    const questionText = typeof question.question === 'string'
        ? question.question
        : getTextFromMultiLang(question.question || '', 'fr');

    if (language === 'fr') {
        return questionText || fallbackFr;
    } else {
        // For Vietnamese, show both French and Vietnamese if available
        if (question.question_vi) {
            return `🇫🇷 ${questionText}\n\n🇻🇳 ${question.question_vi}`;
        } else {
            return questionText || fallbackVi;
        }
    }
};

/**
 * Extracts explanation text with dual language support for Vietnamese mode
 * Shows both French and Vietnamese with flags when in Vietnamese mode
 */
export const getExplanationTextWithDualLanguage = (
    question: Question | null | undefined,
    language: Language,
    fallbackFr: string = 'Explication non disponible',
    fallbackVi: string = 'Explication non disponible'
): string => {
    if (!question) return fallbackFr;

    const explanationText = typeof question.explanation === 'string'
        ? question.explanation
        : getTextFromMultiLang(question.explanation || '', 'fr');

    if (language === 'fr') {
        return explanationText || fallbackFr;
    } else {
        // For Vietnamese, show both French and Vietnamese if available
        if (question.explanation_vi) {
            return `🇫🇷 ${explanationText}\n\n🇻🇳 ${question.explanation_vi}`;
        } else {
            return explanationText || fallbackVi;
        }
    }
};

/**
 * Extracts question text for a specific language
 * Simple version without dual language display
 */
export const getQuestionText = (
    question: string | MultiLangText | null | undefined,
    language: Language = 'fr'
): string => {
    if (!question) return '';
    if (typeof question === 'string') {
        return question;
    }
    return question[language] || '';
};

/**
 * Extracts explanation text for a specific language
 * Simple version without dual language display
 */
export const getExplanationText = (
    explanation: string | MultiLangText | null | undefined,
    language: Language = 'fr'
): string => {
    if (!explanation) return '';
    if (typeof explanation === 'string') {
        return explanation;
    }
    return explanation[language] || '';
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

