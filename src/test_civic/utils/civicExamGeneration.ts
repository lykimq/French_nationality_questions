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
    isPracticeMode: boolean,
    usedIds?: Set<number>
): TestQuestion[] => {
    let candidates = getQuestionsBySubTheme(availableQuestions, subTheme);
    
    // If no questions found by subTheme, try to infer from category
    if (candidates.length === 0) {
        // This would require additional mapping logic
        // For now, return empty if no direct match
        return [];
    }
    
    // Filter out already used questions if provided
    if (usedIds) {
        candidates = candidates.filter(q => !usedIds.has(q.id));
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
                subThemeQuestions.forEach(q => {
                    localUsedIds.add(q.id);
                    if (globalUsedIds) {
                        globalUsedIds.add(q.id);
                    }
                });
                selectedQuestions.push(...subThemeQuestions);
            }
        }
    );
    
    // If we don't have enough questions from sub-themes, fill from theme
    if (selectedQuestions.length < distribution.total) {
        const remaining = distribution.total - selectedQuestions.length;
        // Combine local and global used IDs
        const combinedUsedIds = new Set([...localUsedIds, ...(globalUsedIds || [])]);
        const available = themeQuestions.filter(q => !combinedUsedIds.has(q.id));
        
        // Filter by question type in practice mode
        const filtered = isPracticeMode 
            ? filterKnowledgeQuestions(available)
            : available;
        
        const additional = selectRandomQuestions(filtered, remaining);
        // Track additional questions
        additional.forEach(q => {
            localUsedIds.add(q.id);
            if (globalUsedIds) {
                globalUsedIds.add(q.id);
            }
        });
        selectedQuestions.push(...additional);
    }
    
    // Remove duplicates using Set (more efficient than findIndex)
    const uniqueMap = new Map<number, TestQuestion>();
    selectedQuestions.forEach(q => {
        if (!uniqueMap.has(q.id)) {
            uniqueMap.set(q.id, q);
        }
    });
    
    return Array.from(uniqueMap.values()).slice(0, distribution.total);
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
                isPracticeMode,
                usedQuestionIds
            );
            
            selected.forEach(q => usedQuestionIds.add(q.id));
            selectedQuestions.push(...selected);
        }
    );
    
    // Fill remaining questions if needed
    if (selectedQuestions.length < CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        const remaining = CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS - selectedQuestions.length;
        const unusedQuestions = availableQuestions.filter(q => !usedQuestionIds.has(q.id));
        const filtered = isPracticeMode
            ? filterKnowledgeQuestions(unusedQuestions)
            : unusedQuestions;
        
        if (filtered.length > 0) {
            const additional = selectRandomQuestions(filtered, remaining);
            additional.forEach(q => {
                if (!usedQuestionIds.has(q.id)) {
                    usedQuestionIds.add(q.id);
                    selectedQuestions.push(q);
                }
            });
        } else {
            console.warn(
                `Cannot fill remaining ${remaining} questions: no more questions available. ` +
                `Current count: ${selectedQuestions.length}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS}`
            );
        }
    }
    
    // In practice mode, ensure all questions have options
    let finalQuestions = isPracticeMode
        ? filterQuestionsWithOptions(selectedQuestions)
        : selectedQuestions;
    
    // Fill gaps if questions were filtered out in practice mode
    if (isPracticeMode && finalQuestions.length < CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
        const remaining = CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS - finalQuestions.length;
        const finalUsedIds = new Set(finalQuestions.map(q => q.id));
        const available = availableQuestions.filter(
            q => !finalUsedIds.has(q.id) && 
                 'options' in q && 
                 Array.isArray(q.options) && 
                 q.options.length > 0
        );
        const additional = selectRandomQuestions(available, remaining);
        additional.forEach(q => {
            if (!finalUsedIds.has(q.id)) {
                finalUsedIds.add(q.id);
                finalQuestions.push(q);
            }
        });
    }
    
    // Remove duplicates and limit to target count (single pass)
    const uniqueMap = new Map<number, TestQuestion>();
    finalQuestions.forEach(q => {
        if (!uniqueMap.has(q.id)) {
            uniqueMap.set(q.id, q);
        }
    });
    
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
        if (questionIds.has(q.id)) {
            duplicateIds.push(q.id);
        } else {
            questionIds.add(q.id);
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


