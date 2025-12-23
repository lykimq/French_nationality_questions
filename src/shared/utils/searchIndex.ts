import { normalizeForSearch } from './textNormalization';

// Split text into tokens with a minimum length
export const tokenize = (text: string, minLength: number = 2): string[] => {
    if (!text) return [];
    const normalized = normalizeForSearch(text);
    return normalized
        .split(/[\s\-'"]+/)
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
    minLength: number = 2
): Map<number, string[]> => {
    const map = new Map<number, string[]>();
    questions.forEach(q => {
        const tokens = tokenize(`${q.question} ${q.explanation || ''} ${q.categoryTitle || ''}`, minLength);
        map.set(q.id, tokens);
    });
    return map;
};

// Check if a query token matches a target token (exact, prefix, or contains)
export const tokenMatches = (queryToken: string, targetToken: string): { matched: boolean; score: number } => {
    if (!queryToken || !targetToken) return { matched: false, score: 0 };
    
    // Exact match - highest score
    if (targetToken === queryToken) {
        return { matched: true, score: 10 };
    }
    
    // Prefix match - high score (e.g., "franc" matches "francais")
    if (targetToken.startsWith(queryToken)) {
        return { matched: true, score: 8 };
    }
    
    // Contains match - medium score (e.g., "repub" matches "republicain")
    if (targetToken.includes(queryToken)) {
        return { matched: true, score: 5 };
    }
    
    // Reverse: query is prefix of target (e.g., "francais" matches "franc")
    if (queryToken.startsWith(targetToken)) {
        return { matched: true, score: 6 };
    }
    
    // Reverse: query contains target (e.g., "republicain" matches "repub")
    if (queryToken.includes(targetToken)) {
        return { matched: true, score: 4 };
    }
    
    return { matched: false, score: 0 };
};

// Enhanced scoring helper: counts matching tokens with relevance scoring
export const scoreTokens = (
    queryTokens: string[],
    targetTokens: string[]
): number => {
    if (!queryTokens.length || !targetTokens.length) return 0;
    
    let totalScore = 0;
    const matchedTargets = new Set<string>();
    
    queryTokens.forEach(queryToken => {
        let bestMatch = { matched: false, score: 0 };
        let bestTarget = '';
        
        targetTokens.forEach(targetToken => {
            if (!matchedTargets.has(targetToken)) {
                const match = tokenMatches(queryToken, targetToken);
                if (match.matched && match.score > bestMatch.score) {
                    bestMatch = match;
                    bestTarget = targetToken;
                }
            }
        });
        
        if (bestMatch.matched) {
            totalScore += bestMatch.score;
            matchedTargets.add(bestTarget);
        }
    });
    
    // Bonus for matching all query tokens
    if (matchedTargets.size === queryTokens.length && queryTokens.length > 1) {
        totalScore += 5;
    }
    
    return totalScore;
};

// Check if text contains query with better matching
export const textContainsQuery = (text: string, query: string): { matched: boolean; score: number } => {
    if (!text || !query) return { matched: false, score: 0 };
    
    const normalizedText = normalizeForSearch(text);
    const normalizedQuery = normalizeForSearch(query);
    
    // Exact phrase match - highest score
    if (normalizedText === normalizedQuery) {
        return { matched: true, score: 100 };
    }
    
    // Phrase contains query - high score
    if (normalizedText.includes(normalizedQuery)) {
        const position = normalizedText.indexOf(normalizedQuery);
        // Higher score if match is at the beginning
        const positionScore = position === 0 ? 50 : 30;
        return { matched: true, score: positionScore };
    }
    
    // Check if all query tokens are present
    const queryTokens = tokenize(normalizedQuery);
    const textTokens = tokenize(normalizedText);
    const tokenScore = scoreTokens(queryTokens, textTokens);
    
    if (tokenScore > 0) {
        return { matched: true, score: tokenScore };
    }
    
    return { matched: false, score: 0 };
};

