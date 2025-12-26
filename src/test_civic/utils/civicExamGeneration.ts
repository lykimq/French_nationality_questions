import type { TestQuestion } from '../../types';
import type { CivicExamTopic, CivicExamSubTopic, CivicExamQuestion, CivicExamConfig } from '../types';
import { extractNumericId } from '../../shared/utils/idUtils';
import { createLogger } from '../../shared/utils/logger';
import {
    CIVIC_EXAM_DISTRIBUTION,
    CIVIC_EXAM_CONFIG,
} from '../constants/civicExamConstants';
import {
    getQuestionsByTopic,
    getQuestionsBySubTopic,
    filterKnowledgeQuestions,
    filterSituationalQuestions,
    filterQuestionsWithOptions,
    getQuestionsByTopics,
    enrichQuestionsWithMetadata,
    getTopicFromQuestion,
    getSubTopicFromQuestion,
} from './civicExamUtils';
import { shuffleQuestionOptions } from './civicExamQuestionUtils';
import type { CivicExamQuestionWithOptions } from './civicExamQuestionUtils';

const logger = createLogger('CivicExamGeneration');

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

const isSituationalSubTopic = (subTopic: CivicExamSubTopic): boolean => {
    return subTopic === 'situational_principles' || subTopic === 'situational_rights';
};

const selectQuestionsForSubTopic = (
    subTopic: CivicExamSubTopic,
    count: number,
    availableQuestions: TestQuestion[],
    isPracticeMode: boolean,
    usedIds?: Set<number>
): TestQuestion[] => {
    let candidates = getQuestionsBySubTopic(availableQuestions, subTopic);
    
    if (candidates.length === 0) {
        return [];
    }
    
    if (usedIds) {
        candidates = filterUnusedQuestions(candidates, usedIds);
    }
    
    const isSituational = isSituationalSubTopic(subTopic);
    
    if (isPracticeMode) {
        candidates = filterKnowledgeQuestions(candidates);
    } else if (isSituational) {
        const situationalCandidates = filterSituationalQuestions(candidates);
        if (situationalCandidates.length >= count) {
            candidates = situationalCandidates;
        } else {
            const knowledgeCandidates = filterKnowledgeQuestions(candidates);
            const combined = [...situationalCandidates, ...knowledgeCandidates];
            if (combined.length > 0) {
                candidates = combined;
                if (situationalCandidates.length < count) {
                    logger.warn(
                        `SubTopic ${subTopic}: Only ${situationalCandidates.length} situational question(s) available, ` +
                        `falling back to knowledge questions to meet requirement of ${count} questions.`
                    );
                }
            } else {
                candidates = situationalCandidates;
            }
        }
    } else {
        candidates = filterKnowledgeQuestions(candidates);
    }
    
    return selectRandomQuestions(candidates, count);
};

const selectQuestionsForTopic = (
    topic: CivicExamTopic,
    distribution: typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTopic],
    availableQuestions: TestQuestion[],
    isPracticeMode: boolean,
    globalUsedIds?: Set<number>
): TestQuestion[] => {
    const selectedQuestions: TestQuestion[] = [];
    const localUsedIds = new Set<number>();
    const topicQuestions = getQuestionsByTopic(availableQuestions, topic);
    
    // Select questions for each sub-topic
    (Object.entries(distribution.subTopics) as [CivicExamSubTopic, number][]).forEach(
        ([subTopic, count]) => {
            if (count > 0) {
                // Combine local and global used IDs to prevent duplicates
                const combinedUsedIds = new Set([...localUsedIds, ...(globalUsedIds || [])]);
                const subTopicQuestions = selectQuestionsForSubTopic(
                    subTopic,
                    count,
                    topicQuestions,
                    isPracticeMode,
                    combinedUsedIds
                );
                // Track locally used IDs
                trackUsedQuestionIds(subTopicQuestions, localUsedIds, ...(globalUsedIds ? [globalUsedIds] : []));
                selectedQuestions.push(...subTopicQuestions);
            }
        }
    );
    
    // If we don't have enough questions from sub-topics, fill from topic
    if (selectedQuestions.length < distribution.total) {
        const remaining = distribution.total - selectedQuestions.length;
        // Combine local and global used IDs
        const combinedUsedIds = new Set([...localUsedIds, ...(globalUsedIds || [])]);
        const available = filterUnusedQuestions(topicQuestions, combinedUsedIds);
        
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
    
    const civicExamQuestions = allQuestions.filter(q => {
        return q.categoryId === 'civic_exam';
    });
    
    if (civicExamQuestions.length === 0) {
        logger.error('No civic exam questions found. Only questions with categoryId="civic_exam" can be used.');
        throw new Error('No civic exam questions available. Please ensure civic exam questions are loaded correctly.');
    }
    
    if (civicExamQuestions.length < allQuestions.length) {
        const skippedCount = allQuestions.length - civicExamQuestions.length;
        logger.warn(
            `Filtered out ${skippedCount} non-civic question(s). ` +
            `Civic exams only use questions with categoryId="civic_exam".`
        );
    }
    
    const questionsWithMetadata = civicExamQuestions.filter(q => {
        const topic = getTopicFromQuestion(q);
        const subTopic = getSubTopicFromQuestion(q);
        return topic !== null && subTopic !== null;
    });
    
    if (questionsWithMetadata.length === 0) {
        logger.error('No civic exam questions with required topic/subTopic metadata found');
        throw new Error('No valid civic exam questions available. All civic exam questions must have topic and subTopic metadata.');
    }
    
    if (questionsWithMetadata.length < civicExamQuestions.length) {
        const skippedCount = civicExamQuestions.length - questionsWithMetadata.length;
        logger.warn(
            `Filtered out ${skippedCount} civic exam question(s) missing required topic/subTopic metadata. ` +
            `These questions should be fixed in the JSON data files.`
        );
    }
    
    let availableQuestions = shuffleArray([...questionsWithMetadata]);
    
    if (isPracticeMode && config.selectedTopics && config.selectedTopics.length > 0) {
        availableQuestions = getQuestionsByTopics(availableQuestions, config.selectedTopics);
    }
    
    const selectedQuestions: TestQuestion[] = [];
    const usedQuestionIds = new Set<number>();
    
    (Object.entries(CIVIC_EXAM_DISTRIBUTION) as [CivicExamTopic, typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTopic]][]).forEach(
        ([topic, distribution]) => {
            if (isPracticeMode && config.selectedTopics && config.selectedTopics.length > 0) {
                if (!config.selectedTopics.includes(topic)) {
                    return;
                }
            }
            
            const topicQuestions = filterUnusedQuestions(
                getQuestionsByTopic(availableQuestions, topic),
                usedQuestionIds
            );
            
            if (topicQuestions.length === 0) {
                return;
            }
            
            const selected = selectQuestionsForTopic(
                topic,
                distribution,
                topicQuestions,
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
    
    const enriched = enrichQuestionsWithMetadata(shuffled);
    
    let processedQuestions: CivicExamQuestion[];
    
    if (config.shuffleOptions) {
        processedQuestions = enriched.map((q) => {
            if ('options' in q && 'correctAnswer' in q && Array.isArray(q.options) && q.options.length > 0) {
                return shuffleQuestionOptions(q as CivicExamQuestionWithOptions) as CivicExamQuestion;
            }
            return q;
        });
    } else {
        processedQuestions = enriched;
    }
    
    if (isPracticeMode) {
        return filterQuestionsWithOptions(processedQuestions) as CivicExamQuestion[];
    }
    
    return processedQuestions;
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
    
    // Count questions per topic
    const topicCounts: Record<CivicExamTopic, number> = {
        principles_values: 0,
        institutional_political: 0,
        rights_duties: 0,
        history_geography_culture: 0,
        living_society: 0,
    };
    
    questions.forEach(q => {
        if (q.topic) {
            topicCounts[q.topic]++;
        }
    });
    
    // Validate topic distribution
    (Object.entries(CIVIC_EXAM_DISTRIBUTION) as [CivicExamTopic, typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTopic]][]).forEach(
        ([topic, distribution]) => {
            if (topicCounts[topic] !== distribution.total) {
                errors.push(
                    `Topic ${topic}: expected ${distribution.total} questions, got ${topicCounts[topic]}`
                );
            }
        }
    );
    
    // Count questions per subtopic
    const subTopicCounts: Record<CivicExamSubTopic, number> = {
        devise_symboles: 0,
        laicite: 0,
        situational_principles: 0,
        democracy_vote: 0,
        organization_republic: 0,
        european_institutions: 0,
        fundamental_rights: 0,
        obligations_duties: 0,
        situational_rights: 0,
        historical_periods: 0,
        territories_geography: 0,
        heritage: 0,
        residence: 0,
        healthcare: 0,
        work: 0,
        parental_authority_education: 0,
    };
    
    questions.forEach(q => {
        if (q.subTopic) {
            subTopicCounts[q.subTopic]++;
        }
    });
    
    // Validate subtopic distribution
    (Object.entries(CIVIC_EXAM_DISTRIBUTION) as [CivicExamTopic, typeof CIVIC_EXAM_DISTRIBUTION[CivicExamTopic]][]).forEach(
        ([topic, distribution]) => {
            (Object.entries(distribution.subTopics) as [CivicExamSubTopic, number][]).forEach(
                ([subTopic, expectedCount]) => {
                    if (expectedCount > 0 && subTopicCounts[subTopic] !== expectedCount) {
                        errors.push(
                            `SubTopic ${subTopic} (topic ${topic}): expected ${expectedCount} question(s), got ${subTopicCounts[subTopic]}`
                        );
                    }
                }
            );
        }
    );
    
    return {
        valid: errors.length === 0,
        errors,
    };
};


