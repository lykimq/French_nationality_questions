import { normalizeForSearch } from './textNormalization';

// Split text into tokens with a minimum length
export const tokenize = (text: string, minLength: number = 3): string[] => {
    if (!text) return [];
    return normalizeForSearch(text)
        .split(/\s+/)
        .filter(token => token.length >= minLength);
};

// Build a reusable token index for questions to avoid repeated string work
export const buildQuestionTokens = (
    questions: Array<{
        id: number;
        question: string;
        explanation?: string | null;
        categoryTitle?: string;
    }>,
    minLength: number = 3
): Map<number, string[]> => {
    const map = new Map<number, string[]>();
    questions.forEach(q => {
        const tokens = tokenize(`${q.question} ${q.explanation || ''} ${q.categoryTitle || ''}`, minLength);
        map.set(q.id, tokens);
    });
    return map;
};

// Basic scoring helper: counts matching tokens
export const scoreTokens = (
    queryTokens: string[],
    targetTokens: string[]
): number => {
    if (!queryTokens.length || !targetTokens.length) return 0;
    let score = 0;
    queryTokens.forEach(token => {
        if (targetTokens.some(t => t.includes(token))) {
            score += 1;
        }
    });
    return score;
};

