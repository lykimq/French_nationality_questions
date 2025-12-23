import type { TestQuestion } from '../../types';
import type { CivicExamTheme, CivicExamSubTheme, CivicExamQuestion, CivicExamConfig } from '../types';
import { extractNumericId } from '../../shared/utils/idUtils';
import {
    CIVIC_EXAM_DISTRIBUTION,
    CIVIC_EXAM_CONFIG,
} from '../constants/civicExamConstants';
import {
    getQuestionsByTheme,
    getQuestionsBySubTheme,
    filterKnowledgeQuestions,
    filterSituationalQuestions,
    filterQuestionsWithOptions,
    getQuestionsByThemes,
    enrichQuestionsWithMetadata,
} from './civicExamUtils';

// ==================== QUESTION SELECTION ====================

/**
 * Gets the numeric ID from a question if it exists and is valid.
 */
const getQuestionNumericId = (question: TestQuestion): number | undefined => {
    return extractNumericId(question.id);
};

/**
 * Filters questions to exclude those with IDs already in the used set.
 */
const filterUnusedQuestions = (questions: TestQuestion[], usedIds: Set<number>): TestQuestion[] => {
    return questions.filter(q => {
        const numericId = getQuestionNumericId(q);
        return numericId === undefined || !usedIds.has(numericId);
    });
};

/**
 * Adds question IDs to one or more Sets, tracking which questions have been used.
 */
const trackUsedQuestionIds = (
    questions: TestQuestion[],
    ...usedIdSets: Set<number>[]
): void => {
    questions.forEach(q => {
        const numericId = getQuestionNumericId(q);
        if (numericId !== undefined) {
            usedIdSets.forEach(usedIds => usedIds.add(numericId));
        }
    });
};

/**
 * Creates a unique map of questions by their numeric ID, removing duplicates.
 */
const createUniqueQuestionMap = (questions: TestQuestion[]): Map<number, TestQuestion> => {
    const uniqueMap = new Map<number, TestQuestion>();
    questions.forEach(q => {
        const numericId = getQuestionNumericId(q);
        if (numericId !== undefined && !uniqueMap.has(numericId)) {
            uniqueMap.set(numericId, q);
        }
    });
    return uniqueMap;
};

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

const isSituationalSubTheme = (subTheme: CivicExamSubTheme): boolean => {
    return subTheme === 'situational_principles' || subTheme === 'situational_rights';
};

const selectQuestionsForSubTheme = (
    subTheme: CivicExamSubTheme,
    count: number,
    availableQuestions: TestQuestion[],
    isPracticeMode: boolean,
    usedIds?: Set<number>
): TestQuestion[] => {
    let candidates = getQuestionsBySubTheme(availableQuestions, subTheme);
    
    if (candidates.length === 0) {
        return [];
    }
    
    if (usedIds) {
        candidates = filterUnusedQuestions(candidates, usedIds);
    }
    
    const isSituational = isSituationalSubTheme(subTheme);
    
    if (isPracticeMode) {
        candidates = filterKnowledgeQuestions(candidates);
    } else if (isSituational) {
        candidates = filterSituationalQuestions(candidates);
    } else {
        candidates = filterKnowledgeQuestions(candidates);
    }
    
    return selectRandomQuestions(candidates, count);
};

const selectQuestionsForTheme = (
    theme: CivicExamTheme,
    distribution: typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTheme],
    availableQuestions: TestQuestion[],
    isPracticeMode: boolean,
    globalUsedIds?: Set<number>
): TestQuestion[] => {
    const selectedQuestions: TestQuestion[] = [];
    const localUsedIds = new Set<number>();
    const themeQuestions = getQuestionsByTheme(availableQuestions, theme);
    
    // Select questions for each sub-theme
    (Object.entries(distribution.subThemes) as [CivicExamSubTheme, number][]).forEach(
        ([subTheme, count]) => {
            if (count > 0) {
                // Combine local and global used IDs to prevent duplicates
                const combinedUsedIds = new Set([...localUsedIds, ...(globalUsedIds || [])]);
                const subThemeQuestions = selectQuestionsForSubTheme(
                    subTheme,
                    count,
                    themeQuestions,
                    isPracticeMode,
                    combinedUsedIds
                );
                // Track locally used IDs
                trackUsedQuestionIds(subThemeQuestions, localUsedIds, ...(globalUsedIds ? [globalUsedIds] : []));
                selectedQuestions.push(...subThemeQuestions);
            }
        }
    );
    
    // If we don't have enough questions from sub-themes, fill from theme
    if (selectedQuestions.length < distribution.total) {
        const remaining = distribution.total - selectedQuestions.length;
        // Combine local and global used IDs
        const combinedUsedIds = new Set([...localUsedIds, ...(globalUsedIds || [])]);
        const available = filterUnusedQuestions(themeQuestions, combinedUsedIds);
        
        // Filter by question type in practice mode
        const filtered = isPracticeMode 
            ? filterKnowledgeQuestions(available)
            : available;
        
        const additional = selectRandomQuestions(filtered, remaining);
        // Track additional questions
        trackUsedQuestionIds(additional, localUsedIds, ...(globalUsedIds ? [globalUsedIds] : []));
        selectedQuestions.push(...additional);
    }
    
    // Remove duplicates using unique map
    const uniqueMap = createUniqueQuestionMap(selectedQuestions);
    return Array.from(uniqueMap.values()).slice(0, distribution.total);
};

// ==================== MAIN GENERATION FUNCTION ====================

export const generateCivicExamQuestions = (
    allQuestions: TestQuestion[],
    config: CivicExamConfig
): CivicExamQuestion[] => {
    const isPracticeMode = config.mode === 'civic_exam_practice';
    let availableQuestions = shuffleArray([...allQuestions]);
    
    if (isPracticeMode && config.selectedThemes && config.selectedThemes.length > 0) {
        availableQuestions = getQuestionsByThemes(availableQuestions, config.selectedThemes);
    }
    
    const selectedQuestions: TestQuestion[] = [];
    const usedQuestionIds = new Set<number>();
    
    (Object.entries(CIVIC_EXAM_DISTRIBUTION) as [CivicExamTheme, typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTheme]][]).forEach(
        ([theme, distribution]) => {
            if (isPracticeMode && config.selectedThemes && config.selectedThemes.length > 0) {
                if (!config.selectedThemes.includes(theme)) {
                    return;
                }
            }
            
            const themeQuestions = filterUnusedQuestions(
                getQuestionsByTheme(availableQuestions, theme),
                usedQuestionIds
            );
            
            if (themeQuestions.length === 0) {
                return;
            }
            
            const selected = selectQuestionsForTheme(
                theme,
                distribution,
                themeQuestions,
                isPracticeMode,
                usedQuestionIds
            );
            
            trackUsedQuestionIds(selected, usedQuestionIds);
            selectedQuestions.push(...selected);
        }
    );
    
    if (selectedQuestions.length < CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        const remaining = CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS - selectedQuestions.length;
        const unusedQuestions = filterUnusedQuestions(availableQuestions, usedQuestionIds);
        
        let filtered = unusedQuestions;
        if (isPracticeMode) {
            filtered = filterKnowledgeQuestions(unusedQuestions);
            if (filtered.length === 0) {
                filtered = filterQuestionsWithOptions(unusedQuestions);
            }
        }
        
        if (filtered.length > 0) {
            const additional = selectRandomQuestions(filtered, remaining);
            additional.forEach(q => {
                const numericId = getQuestionNumericId(q);
                if (numericId !== undefined && !usedQuestionIds.has(numericId)) {
                    trackUsedQuestionIds([q], usedQuestionIds);
                    selectedQuestions.push(q);
                }
            });
        }
    }
    
    let finalQuestions = isPracticeMode
        ? filterQuestionsWithOptions(selectedQuestions)
        : selectedQuestions;
    
    if (isPracticeMode && finalQuestions.length < CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        const remaining = CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS - finalQuestions.length;
        const finalUsedIds = new Set<number>();
        trackUsedQuestionIds(finalQuestions, finalUsedIds);
        
        const available = availableQuestions.filter(q => {
            const numericId = getQuestionNumericId(q);
            return numericId !== undefined && 
                   !finalUsedIds.has(numericId) && 
                   'options' in q && 
                   Array.isArray(q.options) && 
                   q.options.length > 0;
        });
        const additional = selectRandomQuestions(available, remaining);
        additional.forEach(q => {
            const numericId = getQuestionNumericId(q);
            if (numericId !== undefined && !finalUsedIds.has(numericId)) {
                trackUsedQuestionIds([q], finalUsedIds);
                finalQuestions.push(q);
            }
        });
    }
    
    const uniqueMap = createUniqueQuestionMap(finalQuestions);
    const uniqueQuestions = Array.from(uniqueMap.values());
    const targetCount = Math.min(uniqueQuestions.length, CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS);
    const shuffled = shuffleArray(uniqueQuestions).slice(0, targetCount);
    
    return enrichQuestionsWithMetadata(shuffled);
};

// ==================== VALIDATION ====================

export const validateQuestionDistribution = (
    questions: CivicExamQuestion[]
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (questions.length !== CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        errors.push(`Expected ${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions, got ${questions.length}`);
    }
    
    // Check for duplicate questions by ID
    const questionIds = new Set<number>();
    const duplicateIds: number[] = [];
    questions.forEach(q => {
        const numericId = getQuestionNumericId(q);
        if (numericId !== undefined) {
            if (questionIds.has(numericId)) {
                duplicateIds.push(numericId);
            } else {
                questionIds.add(numericId);
            }
        }
    });
    
    if (duplicateIds.length > 0) {
        errors.push(
            `Found ${duplicateIds.length} duplicate question(s) with IDs: ${duplicateIds.join(', ')}`
        );
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


