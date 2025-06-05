import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';
import { preloadAllPart1TestData } from '../utils/dataUtils';
import type { HistorySubcategory } from '../types';
import type {
    TestSession,
    TestProgress,
    TestStatistics,
    TestQuestion,
    TestAnswer,
    TestConfig,
    TestResult,
    TestRecommendation,
} from '../types';

interface TestContextType {
    // Current test session
    currentSession: TestSession | null;
    isTestActive: boolean;
    currentQuestionIndex: number;

    // Progress and statistics
    testProgress: TestProgress;
    testStatistics: TestStatistics;

    // Test management
    startTest: (config: TestConfig) => Promise<void>;
    submitAnswer: (answer: TestAnswer) => Promise<void>;
    finishTest: () => Promise<TestResult>;
    cancelTest: () => void;

    // Question management
    getCurrentQuestion: () => TestQuestion | null;
    getNextQuestion: () => TestQuestion | null;
    getPreviousQuestion: () => TestQuestion | null;
    getIncorrectQuestions: () => TestQuestion[];

    // Progress tracking
    refreshProgress: () => Promise<void>;
    getWeakCategories: () => string[];
    getStrongCategories: () => string[];

    // Utilities
    generateRecommendations: () => TestRecommendation[];
    isLoading: boolean;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

const STORAGE_KEYS = {
    TEST_PROGRESS: 'test_progress',
    TEST_SESSIONS: 'test_sessions',
    TEST_STATISTICS: 'test_statistics',
} as const;

// Constants for better maintainability
const DEFAULT_TEST_PROGRESS: TestProgress = {
    totalTestsTaken: 0,
    averageScore: 0,
    bestScore: 0,
    weakCategories: [],
    strongCategories: [],
    questionsAnswered: 0,
    correctAnswersTotal: 0,
    incorrectQuestions: [],
    recentScores: [],
};

const DEFAULT_TEST_STATISTICS: TestStatistics = {
    categoryPerformance: {},
    timeStats: {
        averageTimePerQuestion: 30,
        fastestTime: 5,
        slowestTime: 120,
    },
    improvementTrend: 'stable',
    masteredQuestions: [],
    strugglingQuestions: [],
};

// Part 1 test ID mapping for better maintainability
const PART1_ID_OFFSETS = {
    test_personal: 10000,
    test_opinions: 11000,
    test_general: 12000,
} as const;

// Re-export utility functions for backward compatibility
export { serializeTestResult, deserializeTestResult } from '../utils/testSerialization';

// Helper function to safely process questions - reduces duplicate code
const processQuestionData = (
    question: any,
    categoryId: string,
    categoryTitle: string,
    idOffset: number = 0
): TestQuestion => {
    const finalId = question.id + idOffset;

    return {
        id: finalId,
        question: typeof question.question === 'string'
            ? question.question
            : question.question?.fr || question.question || '',
        question_vi: question.question_vi ||
            (typeof question.question !== 'string' ? question.question?.vi : undefined),
        explanation: typeof question.explanation === 'string'
            ? question.explanation
            : question.explanation?.fr || question.explanation || 'No explanation provided',
        explanation_vi: question.explanation_vi ||
            (typeof question.explanation !== 'string' ? question.explanation?.vi : undefined) ||
            (typeof question.explanation === 'string' ? question.explanation : 'No explanation provided'),
        image: question.image,
        categoryId,
        categoryTitle: categoryTitle || categoryId,
    };
};

// Helper function to safely parse dates
const safeParseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;

    try {
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? undefined : dateValue;
        }

        if (typeof dateValue === 'string') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? undefined : parsed;
        }

        return undefined;
    } catch {
        return undefined;
    }
};

// Helper function to safely calculate averages
const safeAverage = (values: number[]): number => {
    if (!values.length) return 0;
    return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
};

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { questionsData, language, historySubcategories } = useLanguage();

    // State management with better initial values
    const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [part1TestSubcategories, setPart1TestSubcategories] = useState<Record<string, any>>({});
    const [testProgress, setTestProgress] = useState<TestProgress>(DEFAULT_TEST_PROGRESS);
    const [testStatistics, setTestStatistics] = useState<TestStatistics>(DEFAULT_TEST_STATISTICS);
    const [isLoading, setIsLoading] = useState(true);

    // Memoized question collections to avoid reprocessing
    const allProcessedQuestions = useMemo(() => {
        const questions: TestQuestion[] = [];
        const seenIds = new Set<number>();

        // Safety check
        if (!questionsData?.categories) {
            console.warn('questionsData.categories is not available');
            return questions;
        }

        // Process main categories
        questionsData.categories.forEach(category => {
            if (!category?.questions) return;

            category.questions.forEach(question => {
                if (seenIds.has(question.id)) {
                    console.warn(`Duplicate question ID: ${question.id} in category ${category.id}`);
                    return;
                }
                seenIds.add(question.id);

                questions.push(processQuestionData(question, category.id, category.title));
            });
        });

        // Process history subcategories with safety check
        if (historySubcategories) {
            Object.values(historySubcategories).forEach((subcategory: HistorySubcategory) => {
                if (!subcategory?.questions) return;

                subcategory.questions.forEach(question => {
                    if (seenIds.has(question.id)) {
                        console.warn(`Duplicate question ID: ${question.id} in history subcategory ${subcategory.id}`);
                        return;
                    }
                    seenIds.add(question.id);

                    questions.push(processQuestionData(question, subcategory.id, subcategory.title));
                });
            });
        }

        return questions;
    }, [questionsData, historySubcategories]);

    // Load saved data on mount with cleanup
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await loadTestData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const loadTestData = useCallback(async () => {
        try {
            console.log('📖 Loading test data...');
            setIsLoading(true);

            // Load progress with error handling
            try {
                const progressData = await AsyncStorage.getItem(STORAGE_KEYS.TEST_PROGRESS);
                if (progressData) {
                    const parsedProgress = JSON.parse(progressData);
                    // Validate and sanitize progress data
                    const validatedProgress = {
                        ...DEFAULT_TEST_PROGRESS,
                        ...parsedProgress,
                        // Ensure arrays exist and are valid
                        weakCategories: Array.isArray(parsedProgress.weakCategories) ? parsedProgress.weakCategories : [],
                        strongCategories: Array.isArray(parsedProgress.strongCategories) ? parsedProgress.strongCategories : [],
                        incorrectQuestions: Array.isArray(parsedProgress.incorrectQuestions) ? parsedProgress.incorrectQuestions : [],
                        recentScores: Array.isArray(parsedProgress.recentScores) ? parsedProgress.recentScores : [],
                    };
                    setTestProgress(validatedProgress);
                }
            } catch (error) {
                console.error('Error loading test progress:', error);
            }

            // Load statistics with better error handling
            try {
                const statisticsData = await AsyncStorage.getItem(STORAGE_KEYS.TEST_STATISTICS);
                if (statisticsData) {
                    const parsedStatistics = JSON.parse(statisticsData);

                    // Clean and validate category performance data
                    if (parsedStatistics.categoryPerformance) {
                        Object.keys(parsedStatistics.categoryPerformance).forEach(categoryId => {
                            const catPerf = parsedStatistics.categoryPerformance[categoryId];

                            // Clean up lastAttempted field safely
                            if (catPerf.lastAttempted) {
                                catPerf.lastAttempted = safeParseDate(catPerf.lastAttempted);
                            }
                        });
                    }

                    // Validate and set default values
                    const validatedStatistics = {
                        ...DEFAULT_TEST_STATISTICS,
                        ...parsedStatistics,
                        categoryPerformance: parsedStatistics.categoryPerformance || {},
                        masteredQuestions: Array.isArray(parsedStatistics.masteredQuestions) ? parsedStatistics.masteredQuestions : [],
                        strugglingQuestions: Array.isArray(parsedStatistics.strugglingQuestions) ? parsedStatistics.strugglingQuestions : [],
                    };

                    setTestStatistics(validatedStatistics);
                }
            } catch (error) {
                console.error('Error loading test statistics:', error);
            }

            // Load Part 1 test data
            await loadPart1TestData();

        } catch (error) {
            console.error('❌ Error loading test data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load Part 1 test data with better error handling
    const loadPart1TestData = useCallback(async () => {
        try {
            console.log('🔄 Loading Part 1 test data...');
            const { part1SubcategoryTestData } = await preloadAllPart1TestData();

            if (part1SubcategoryTestData) {
                setPart1TestSubcategories(part1SubcategoryTestData);
                console.log('✅ Part 1 test data loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading Part 1 test data:', error);
        }
    }, []);

    const saveTestData = useCallback(async (
        progressToSave?: TestProgress,
        statisticsToSave?: TestStatistics
    ) => {
        try {
            const progressData = progressToSave || testProgress;
            const statisticsData = statisticsToSave || testStatistics;

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.TEST_PROGRESS, JSON.stringify(progressData)),
                AsyncStorage.setItem(STORAGE_KEYS.TEST_STATISTICS, JSON.stringify(statisticsData))
            ]);

            console.log('✅ Test data saved successfully');
        } catch (error) {
            console.error('❌ Error saving test data:', error);
            throw error; // Re-throw to handle in calling code
        }
    }, [testProgress, testStatistics]);

    const generateTestQuestions = useCallback((config: TestConfig): TestQuestion[] => {
        console.log('Starting question generation for config:', config);

        // Handle Part 1 tests
        if (config.mode.startsWith('part1_')) {
            return generatePart1Questions(config);
        }

        // Handle regular tests
        return generateRegularQuestions(config);
    }, [allProcessedQuestions, part1TestSubcategories]);

    const generatePart1Questions = useCallback((config: TestConfig): TestQuestion[] => {
        const part1TestId = config.mode.replace('part1_', '');
        const questions: TestQuestion[] = [];

        Object.values(part1TestSubcategories).forEach((subcategory: any) => {
            if (subcategory?.questions && subcategory.id === part1TestId) {
                const offset = PART1_ID_OFFSETS[subcategory.id as keyof typeof PART1_ID_OFFSETS] || 10000;

                subcategory.questions.forEach((question: any) => {
                    questions.push(processQuestionData(
                        question,
                        subcategory.id,
                        subcategory.title || subcategory.id,
                        offset
                    ));
                });
            }
        });

        return questions;
    }, [part1TestSubcategories]);

    const generateRegularQuestions = useCallback((config: TestConfig): TestQuestion[] => {
        let selectedQuestions = [...allProcessedQuestions];

        // Apply filters based on mode
        if (config.mode === 'geography_only') {
            selectedQuestions = selectedQuestions.filter(q =>
                q.categoryId === 'geography' || q.categoryId.includes('geography')
            );
        } else if (config.mode === 'history_culture_comprehensive') {
            selectedQuestions = selectedQuestions.filter(q => q.categoryId !== 'personal');
        } else if (config.mode === 'mock_interview') {
            selectedQuestions = selectedQuestions.filter(q => q.categoryId !== 'personal');
        } else if (config.mode.startsWith('subcategory_')) {
            const subcategoryId = config.mode.replace('subcategory_', '');
            selectedQuestions = selectedQuestions.filter(q => q.categoryId === subcategoryId);
        }

        // Apply category filter if specified
        if (config.categoryIds?.length) {
            selectedQuestions = selectedQuestions.filter(q =>
                config.categoryIds!.includes(q.categoryId)
            );
        }

        // Shuffle if required
        if (config.shuffleQuestions) {
            selectedQuestions = [...selectedQuestions].sort(() => Math.random() - 0.5);
        }

        // Limit to requested count
        return selectedQuestions.slice(0, config.questionCount);
    }, [allProcessedQuestions]);

    const startTest = useCallback(async (config: TestConfig): Promise<void> => {
        const questions = generateTestQuestions(config);

        if (questions.length === 0) {
            throw new Error('No questions available for this test configuration');
        }

        const newSession: TestSession = {
            id: Date.now().toString(),
            mode: config.mode,
            questions,
            answers: [],
            startTime: new Date(),
            isCompleted: false,
            score: 0,
            totalQuestions: questions.length,
            correctAnswers: 0,
        };

        setCurrentSession(newSession);
        setCurrentQuestionIndex(0);
    }, [generateTestQuestions]);

    const submitAnswer = useCallback(async (answer: TestAnswer): Promise<void> => {
        if (!currentSession) {
            throw new Error('No active test session');
        }

        const currentQuestion = currentSession.questions[currentQuestionIndex];
        if (!currentQuestion) {
            throw new Error(`No current question found at index: ${currentQuestionIndex}`);
        }

        // Strict validation - throw error instead of just logging
        if (answer.questionId !== currentQuestion.id) {
            throw new Error(
                `Answer question ID mismatch! Expected ${currentQuestion.id}, got ${answer.questionId}`
            );
        }

        const updatedSession: TestSession = {
            ...currentSession,
            answers: [...currentSession.answers, answer],
        };

        setCurrentSession(updatedSession);

        // Move to next question
        if (currentQuestionIndex < currentSession.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentSession, currentQuestionIndex]);

    const finishTest = useCallback(async (): Promise<TestResult> => {
        if (!currentSession) {
            throw new Error('No active test session');
        }

        const correctAnswers = currentSession.answers.filter(a => a.isCorrect).length;
        const score = Math.round((correctAnswers / currentSession.totalQuestions) * 100);

        const finishedSession: TestSession = {
            ...currentSession,
            endTime: new Date(),
            isCompleted: true,
            score,
            correctAnswers,
        };

        // Calculate updated progress
        const updatedProgress = calculateUpdatedProgress(finishedSession, score, correctAnswers);
        const updatedStatistics = updateTestStatistics(finishedSession, updatedProgress);

        // Update weak/strong categories
        updatedProgress.weakCategories = Object.entries(updatedStatistics.categoryPerformance)
            .filter(([_, perf]) => (perf.accuracy || 0) < 60)
            .map(([catId, _]) => catId);

        updatedProgress.strongCategories = Object.entries(updatedStatistics.categoryPerformance)
            .filter(([_, perf]) => (perf.accuracy || 0) >= 80)
            .map(([catId, _]) => catId);

        // Update state
        setTestProgress(updatedProgress);
        setTestStatistics(updatedStatistics);
        setCurrentSession(null);
        setCurrentQuestionIndex(0);

        // Save to storage
        await saveTestData(updatedProgress, updatedStatistics);

        return {
            session: finishedSession,
            statistics: updatedStatistics,
            recommendations: generateRecommendations(),
        };
    }, [currentSession, testProgress, testStatistics, saveTestData]);

    const calculateUpdatedProgress = useCallback((
        finishedSession: TestSession,
        score: number,
        correctAnswers: number
    ): TestProgress => {
        const newTotalTests = testProgress.totalTestsTaken + 1;

        return {
            ...testProgress,
            totalTestsTaken: newTotalTests,
            questionsAnswered: testProgress.questionsAnswered + finishedSession.totalQuestions,
            correctAnswersTotal: testProgress.correctAnswersTotal + correctAnswers,
            averageScore: Math.round(
                ((testProgress.averageScore * testProgress.totalTestsTaken) + score) / newTotalTests
            ),
            bestScore: Math.max(testProgress.bestScore, score),
            recentScores: [...testProgress.recentScores.slice(-9), score],
            incorrectQuestions: [
                ...testProgress.incorrectQuestions,
                ...finishedSession.answers
                    .filter(a => !a.isCorrect)
                    .map(a => a.questionId)
            ].slice(-100), // Limit to last 100 to prevent memory issues
            weakCategories: [], // Will be updated after statistics calculation
            strongCategories: [], // Will be updated after statistics calculation
        };
    }, [testProgress]);

    const updateTestStatistics = useCallback((
        session: TestSession,
        updatedProgress: TestProgress
    ): TestStatistics => {
        const newStatistics = { ...testStatistics };

        // Update category performance
        session.questions.forEach((question) => {
            const answer = session.answers.find(a => a.questionId === question.id);
            if (!answer) return;

            if (!newStatistics.categoryPerformance[question.categoryId]) {
                newStatistics.categoryPerformance[question.categoryId] = {
                    categoryId: question.categoryId,
                    categoryTitle: question.categoryTitle,
                    questionsAttempted: 0,
                    correctAnswers: 0,
                    accuracy: 0,
                    averageTime: 0,
                };
            }

            const catPerf = newStatistics.categoryPerformance[question.categoryId];
            catPerf.questionsAttempted += 1;
            if (answer.isCorrect) catPerf.correctAnswers += 1;
            catPerf.accuracy = Math.round((catPerf.correctAnswers / catPerf.questionsAttempted) * 100);
            catPerf.averageTime = Math.round(
                safeAverage([...Array(catPerf.questionsAttempted - 1).fill(catPerf.averageTime), answer.timeSpent])
            );
            catPerf.lastAttempted = new Date();
        });

        // Update time statistics safely
        const allTimes = session.answers.map(a => a.timeSpent).filter(time => time > 0);
        if (allTimes.length > 0) {
            newStatistics.timeStats.averageTimePerQuestion = Math.round(safeAverage(allTimes));
            newStatistics.timeStats.fastestTime = Math.min(newStatistics.timeStats.fastestTime, ...allTimes);
            newStatistics.timeStats.slowestTime = Math.max(newStatistics.timeStats.slowestTime, ...allTimes);
        }

        // Update mastered/struggling questions with limits
        session.answers.forEach(answer => {
            if (answer.isCorrect) {
                if (!newStatistics.masteredQuestions.includes(answer.questionId)) {
                    newStatistics.masteredQuestions.push(answer.questionId);
                }
                // Remove from struggling
                const strugglingIndex = newStatistics.strugglingQuestions.indexOf(answer.questionId);
                if (strugglingIndex > -1) {
                    newStatistics.strugglingQuestions.splice(strugglingIndex, 1);
                }
            } else {
                if (!newStatistics.strugglingQuestions.includes(answer.questionId)) {
                    newStatistics.strugglingQuestions.push(answer.questionId);
                }
                // Remove from mastered
                const masteredIndex = newStatistics.masteredQuestions.indexOf(answer.questionId);
                if (masteredIndex > -1) {
                    newStatistics.masteredQuestions.splice(masteredIndex, 1);
                }
            }
        });

        // Limit array sizes to prevent memory issues
        newStatistics.masteredQuestions = newStatistics.masteredQuestions.slice(-500);
        newStatistics.strugglingQuestions = newStatistics.strugglingQuestions.slice(-200);

        // Update improvement trend
        newStatistics.improvementTrend = calculateImprovementTrend(updatedProgress.recentScores);

        return newStatistics;
    }, [testStatistics]);

    const calculateImprovementTrend = useCallback((recentScores: number[]) => {
        if (recentScores.length < 3) return 'stable';

        const recentAvg = safeAverage(recentScores.slice(-3));

        if (recentScores.length >= 6) {
            const olderAvg = safeAverage(recentScores.slice(-6, -3));
            const difference = recentAvg - olderAvg;

            if (difference > 5) return 'improving';
            if (difference < -5) return 'declining';
        }

        return 'stable';
    }, []);

    const cancelTest = useCallback(() => {
        console.log('🛑 Cancelling test session');
        setCurrentSession(null);
        setCurrentQuestionIndex(0);
    }, []);

    const getCurrentQuestion = useCallback((): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex];
    }, [currentSession, currentQuestionIndex]);

    const getNextQuestion = useCallback((): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex + 1 >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex + 1];
    }, [currentSession, currentQuestionIndex]);

    const getPreviousQuestion = useCallback((): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex <= 0) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex - 1];
    }, [currentSession, currentQuestionIndex]);

    const getIncorrectQuestions = useCallback((): TestQuestion[] => {
        if (testProgress.incorrectQuestions.length === 0) {
            return [];
        }

        return allProcessedQuestions.filter(q =>
            testProgress.incorrectQuestions.includes(q.id)
        );
    }, [allProcessedQuestions, testProgress.incorrectQuestions]);

    const refreshProgress = useCallback(async (): Promise<void> => {
        console.log('🔄 Refreshing progress...');
        await loadTestData();
    }, [loadTestData]);

    const getWeakCategories = useCallback((): string[] => {
        return testProgress.weakCategories;
    }, [testProgress.weakCategories]);

    const getStrongCategories = useCallback((): string[] => {
        return testProgress.strongCategories;
    }, [testProgress.strongCategories]);

    const generateRecommendations = useCallback((): TestRecommendation[] => {
        const recommendations: TestRecommendation[] = [];

        // Performance-based recommendations
        if (testProgress.averageScore >= 85) {
            recommendations.push({
                type: 'good_job',
                title_vi: 'Thành tích xuất sắc!',
                title_fr: 'Performance Excellente !',
                description_vi: 'Bạn đang thể hiện rất tốt. Hãy tiếp tục luyện tập để duy trì trình độ.',
                description_fr: 'Vous performez très bien. Continuez à pratiquer pour maintenir votre niveau.',
                actionText_vi: 'Làm bài phỏng vấn thử',
                actionText_fr: 'Passer un Entretien Fictif',
            });
        } else if (testProgress.averageScore < 60) {
            recommendations.push({
                type: 'practice_more',
                title_vi: 'Cần luyện tập thêm',
                title_fr: 'Besoin de Plus de Pratique',
                description_vi: 'Tập trung nghiên cứu tài liệu kỹ hơn trước khi làm thêm bài kiểm tra.',
                description_fr: 'Concentrez-vous sur l\'étude approfondie des matériaux avant de passer plus de tests.',
                actionText_vi: 'Học các chủ đề',
                actionText_fr: 'Étudier les Catégories',
            });
        }

        // Weak categories recommendation
        if (testProgress.weakCategories.length > 0) {
            recommendations.push({
                type: 'study_category',
                title_vi: 'Tập trung vào điểm yếu',
                title_fr: 'Se Concentrer sur les Points Faibles',
                description_vi: 'Bạn cần cải thiện ở một số chủ đề.',
                description_fr: 'Vous devez vous améliorer dans certaines catégories.',
                actionText_vi: 'Luyện tập điểm yếu',
                actionText_fr: 'Pratiquer les Points Faibles',
                categoryIds: testProgress.weakCategories,
            });
        }

        // Review incorrect questions
        if (testProgress.incorrectQuestions.length > 0) {
            recommendations.push({
                type: 'review_questions',
                title_vi: 'Xem lại câu hỏi sai',
                title_fr: 'Réviser les Questions Incorrectes',
                description_vi: 'Xem lại những câu hỏi bạn đã trả lời sai trước đây.',
                description_fr: 'Révisez les questions auxquelles vous avez répondu incorrectement précédemment.',
                actionText_vi: 'Xem lại câu hỏi',
                actionText_fr: 'Réviser les Questions',
                questionIds: testProgress.incorrectQuestions.slice(-20),
            });
        }

        return recommendations;
    }, [testProgress]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo((): TestContextType => ({
        currentSession,
        isTestActive: currentSession !== null,
        currentQuestionIndex,
        testProgress,
        testStatistics,
        startTest,
        submitAnswer,
        finishTest,
        cancelTest,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress,
        getWeakCategories,
        getStrongCategories,
        generateRecommendations,
        isLoading,
    }), [
        currentSession,
        currentQuestionIndex,
        testProgress,
        testStatistics,
        startTest,
        submitAnswer,
        finishTest,
        cancelTest,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress,
        getWeakCategories,
        getStrongCategories,
        generateRecommendations,
        isLoading,
    ]);

    return (
        <TestContext.Provider value={contextValue}>
            {children}
        </TestContext.Provider>
    );
};

export const useTest = (): TestContextType => {
    const context = useContext(TestContext);
    if (!context) {
        throw new Error('useTest must be used within a TestProvider');
    }
    return context;
};