import { PART1_ID_OFFSETS } from '../constants/testConstants';
import { processQuestionData } from './testDataUtils';
import type { TestConfig } from '../types';
import type { TestQuestion } from '../../../types';

// Generate Part 1 test questions
export const generatePart1Questions = (
    config: TestConfig,
    part1TestSubcategories: Record<string, any>
): TestQuestion[] => {
    const part1TestId = config.mode.replace('part1_', '');
    const questions: TestQuestion[] = [];

    Object.values(part1TestSubcategories).forEach((subcategory: any) => {
        if (subcategory?.questions && subcategory.id === part1TestId) {
            const offset = PART1_ID_OFFSETS[subcategory.id as keyof typeof PART1_ID_OFFSETS] || 10000;

            subcategory.questions.forEach((question: any) => {
                try {
                    questions.push(processQuestionData(
                        question,
                        subcategory.id,
                        subcategory.title || subcategory.id,
                        offset
                    ));
                } catch (error) {
                    console.error(`Error processing Part 1 question ${question?.id}:`, error);
                }
            });
        }
    });

    return questions;
};

// Generate regular test questions with filtering
export const generateRegularQuestions = (
    config: TestConfig,
    allProcessedQuestions: TestQuestion[]
): TestQuestion[] => {
    let selectedQuestions = [...allProcessedQuestions];

    // Apply filters based on mode
    switch (config.mode) {
        case 'geography_only':
            selectedQuestions = selectedQuestions.filter(q =>
                q.categoryId === 'geography' || q.categoryId.includes('geography')
            );
            break;
        case 'history_culture_comprehensive':
        case 'mock_interview':
            selectedQuestions = selectedQuestions.filter(q => q.categoryId !== 'personal');
            break;
        default:
            if (config.mode.startsWith('subcategory_')) {
                const subcategoryId = config.mode.replace('subcategory_', '');
                selectedQuestions = selectedQuestions.filter(q => q.categoryId === subcategoryId);
            }
            break;
    }

    // Apply category filter if specified
    if (config.categoryIds?.length) {
        selectedQuestions = selectedQuestions.filter(q =>
            config.categoryIds!.includes(q.categoryId)
        );
    }

    // Shuffle if required
    if (config.shuffleQuestions) {
        selectedQuestions = shuffleArray([...selectedQuestions]);
    }

    // Limit to requested count
    return selectedQuestions.slice(0, config.questionCount);
};

// Main test question generation function
export const generateTestQuestions = (
    config: TestConfig,
    allProcessedQuestions: TestQuestion[],
    part1TestSubcategories: Record<string, any>
): TestQuestion[] => {
    // Handle Part 1 tests
    if (config.mode.startsWith('part1_')) {
        return generatePart1Questions(config, part1TestSubcategories);
    }

    // Handle regular tests
    return generateRegularQuestions(config, allProcessedQuestions);
};

// Utility function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Get questions for specific categories
export const getQuestionsByCategories = (
    questions: TestQuestion[],
    categoryIds: string[]
): TestQuestion[] => {
    return questions.filter(q => categoryIds.includes(q.categoryId));
};

// Get questions by IDs
export const getQuestionsByIds = (
    questions: TestQuestion[],
    questionIds: number[]
): TestQuestion[] => {
    return questions.filter(q => questionIds.includes(q.id));
};