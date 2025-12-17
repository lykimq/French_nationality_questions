import type { TestQuestion } from '../../types';
import type { CivicExamTheme, CivicExamSubTheme, CivicExamQuestion, CivicExamConfig } from '../types';
import {
    CIVIC_EXAM_DISTRIBUTION,
    CIVIC_EXAM_CONFIG,
} from '../constants/civicExamConstants';
import {
    getQuestionsByTheme,
    getQuestionsBySubTheme,
    filterKnowledgeQuestions,
    filterQuestionsWithOptions,
    getQuestionsByThemes,
    enrichQuestionsWithMetadata,
} from './civicExamUtils';

// ==================== QUESTION SELECTION ====================

const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const selectRandomQuestions = (
    questions: TestQuestion[],
    count: number
): TestQuestion[] => {
    if (questions.length <= count) {
        return shuffleArray([...questions]);
    }
    
    const shuffled = shuffleArray([...questions]);
    return shuffled.slice(0, count);
};

const selectQuestionsForSubTheme = (
    subTheme: CivicExamSubTheme,
    count: number,
    availableQuestions: TestQuestion[],
    isPracticeMode: boolean
): TestQuestion[] => {
    let candidates = getQuestionsBySubTheme(availableQuestions, subTheme);
    
    // If no questions found by subTheme, try to infer from category
    if (candidates.length === 0) {
        // This would require additional mapping logic
        // For now, return empty if no direct match
        return [];
    }
    
    // Filter by question type based on mode
    if (isPracticeMode) {
        candidates = filterKnowledgeQuestions(candidates);
    }
    // In exam mode, include both knowledge and situational
    
    return selectRandomQuestions(candidates, count);
};

const selectQuestionsForTheme = (
    theme: CivicExamTheme,
    distribution: typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTheme],
    availableQuestions: TestQuestion[],
    isPracticeMode: boolean
): TestQuestion[] => {
    const selectedQuestions: TestQuestion[] = [];
    const themeQuestions = getQuestionsByTheme(availableQuestions, theme);
    
    // Select questions for each sub-theme
    (Object.entries(distribution.subThemes) as [CivicExamSubTheme, number][]).forEach(
        ([subTheme, count]) => {
            if (count > 0) {
                const subThemeQuestions = selectQuestionsForSubTheme(
                    subTheme,
                    count,
                    themeQuestions,
                    isPracticeMode
                );
                selectedQuestions.push(...subThemeQuestions);
            }
        }
    );
    
    // If we don't have enough questions from sub-themes, fill from theme
    if (selectedQuestions.length < distribution.total) {
        const remaining = distribution.total - selectedQuestions.length;
        const usedIds = new Set(selectedQuestions.map(q => q.id));
        const available = themeQuestions.filter(q => !usedIds.has(q.id));
        
        // Filter by question type in practice mode
        const filtered = isPracticeMode 
            ? filterKnowledgeQuestions(available)
            : available;
        
        const additional = selectRandomQuestions(filtered, remaining);
        selectedQuestions.push(...additional);
    }
    
    return selectedQuestions.slice(0, distribution.total);
};

// ==================== MAIN GENERATION FUNCTION ====================

export const generateCivicExamQuestions = (
    allQuestions: TestQuestion[],
    config: CivicExamConfig
): CivicExamQuestion[] => {
    const isPracticeMode = config.mode === 'civic_exam_practice';
    let availableQuestions = [...allQuestions];
    
    // Filter by selected themes if in practice mode
    if (isPracticeMode && config.selectedThemes && config.selectedThemes.length > 0) {
        availableQuestions = getQuestionsByThemes(availableQuestions, config.selectedThemes);
    }
    
    // Filter by question type in practice mode
    if (isPracticeMode) {
        availableQuestions = filterKnowledgeQuestions(availableQuestions);
    }
    
    const selectedQuestions: TestQuestion[] = [];
    const usedQuestionIds = new Set<number>();
    
    // Select questions for each theme according to distribution
    (Object.entries(CIVIC_EXAM_DISTRIBUTION) as [CivicExamTheme, typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTheme]][]).forEach(
        ([theme, distribution]) => {
            // Skip themes not selected in practice mode
            if (isPracticeMode && config.selectedThemes && config.selectedThemes.length > 0) {
                if (!config.selectedThemes.includes(theme)) {
                    return;
                }
            }
            
            const themeQuestions = getQuestionsByTheme(availableQuestions, theme)
                .filter(q => !usedQuestionIds.has(q.id));
            
            if (themeQuestions.length === 0) {
                console.warn(`No questions available for theme: ${theme}`);
                return;
            }
            
            const selected = selectQuestionsForTheme(
                theme,
                distribution,
                themeQuestions,
                isPracticeMode
            );
            
            selected.forEach(q => usedQuestionIds.add(q.id));
            selectedQuestions.push(...selected);
        }
    );
    
    // Ensure we have exactly 40 questions
    if (selectedQuestions.length < CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        const remaining = CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS - selectedQuestions.length;
        const unusedQuestions = availableQuestions.filter(
            q => !usedQuestionIds.has(q.id)
        );
        
        const filtered = isPracticeMode
            ? filterKnowledgeQuestions(unusedQuestions)
            : unusedQuestions;
        
        const additional = selectRandomQuestions(filtered, remaining);
        selectedQuestions.push(...additional);
    }
    
    // Shuffle final set and limit to 40
    const shuffled = shuffleArray(selectedQuestions);
    let finalQuestions = shuffled.slice(0, CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS);
    
    // In practice mode, ensure all questions have options
    if (isPracticeMode) {
        finalQuestions = filterQuestionsWithOptions(finalQuestions);
        
        // If we lost questions, try to fill from available pool
        if (finalQuestions.length < CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
            const remaining = CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS - finalQuestions.length;
            const usedIds = new Set(finalQuestions.map(q => q.id));
            const available = availableQuestions.filter(
                q => !usedIds.has(q.id) && 'options' in q && Array.isArray(q.options) && q.options.length > 0
            );
            const additional = selectRandomQuestions(available, remaining);
            finalQuestions = [...finalQuestions, ...additional].slice(0, CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS);
        }
    }
    
    // Enrich with metadata
    return enrichQuestionsWithMetadata(finalQuestions);
};

// ==================== VALIDATION ====================

export const validateQuestionDistribution = (
    questions: CivicExamQuestion[]
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (questions.length !== CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        errors.push(`Expected ${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions, got ${questions.length}`);
    }
    
    // Count questions per theme
    const themeCounts: Record<CivicExamTheme, number> = {
        principles_values: 0,
        institutional_political: 0,
        rights_duties: 0,
        history_geography_culture: 0,
        living_society: 0,
    };
    
    questions.forEach(q => {
        if (q.theme) {
            themeCounts[q.theme]++;
        }
    });
    
    // Validate theme distribution
    (Object.entries(CIVIC_EXAM_DISTRIBUTION) as [CivicExamTheme, typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTheme]][]).forEach(
        ([theme, distribution]) => {
            if (themeCounts[theme] !== distribution.total) {
                errors.push(
                    `Theme ${theme}: expected ${distribution.total} questions, got ${themeCounts[theme]}`
                );
            }
        }
    );
    
    return {
        valid: errors.length === 0,
        errors,
    };
};

