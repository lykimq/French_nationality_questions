import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';
import { preloadAllPart1TestData } from '../utils/dataUtils';
import { serializeTestResult, deserializeTestResult } from '../utils/testSerialization';
import type { HistorySubcategory } from '../types';
import type {
    TestSession,
    TestProgress,
    TestStatistics,
    TestQuestion,
    TestAnswer,
    TestMode,
    TestConfig,
    TestResult,
    TestRecommendation,
    SerializableTestResult,
} from '../types/test';

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
};

// Serializable versions for navigation - using imported type

// Re-export utility functions for backward compatibility
export { serializeTestResult, deserializeTestResult } from '../utils/testSerialization';

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { questionsData, language, historySubcategories } = useLanguage();

    // State management
    const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [part1TestSubcategories, setPart1TestSubcategories] = useState<{ [key: string]: any }>({});
    const [testProgress, setTestProgress] = useState<TestProgress>({
        totalTestsTaken: 0,
        averageScore: 0,
        bestScore: 0,
        weakCategories: [],
        strongCategories: [],
        questionsAnswered: 0,
        correctAnswersTotal: 0,
        incorrectQuestions: [],
        recentScores: [],
    });
    const [testStatistics, setTestStatistics] = useState<TestStatistics>({
        categoryPerformance: {},
        timeStats: {
            averageTimePerQuestion: 30,
            fastestTime: 5,
            slowestTime: 120,
        },
        improvementTrend: 'stable',
        masteredQuestions: [],
        strugglingQuestions: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load saved data on mount
    useEffect(() => {
        loadTestData();
    }, []);

    const loadTestData = useCallback(async () => {
        try {
            console.log('📖 Loading test data...');
            setIsLoading(true);

            // Load progress
            const progressData = await AsyncStorage.getItem(STORAGE_KEYS.TEST_PROGRESS);
            if (progressData) {
                const parsedProgress = JSON.parse(progressData);
                console.log('📖 Loading test progress:', {
                    totalTestsTaken: parsedProgress.totalTestsTaken,
                    averageScore: parsedProgress.averageScore,
                    bestScore: parsedProgress.bestScore
                });
                setTestProgress(parsedProgress);
            }

            // Load statistics
            const statisticsData = await AsyncStorage.getItem(STORAGE_KEYS.TEST_STATISTICS);
            if (statisticsData) {
                const parsedStatistics = JSON.parse(statisticsData);
                console.log('📊 Loading test statistics');

                // Validate and clean up category performance data
                if (parsedStatistics.categoryPerformance) {
                    Object.keys(parsedStatistics.categoryPerformance).forEach(categoryId => {
                        const catPerf = parsedStatistics.categoryPerformance[categoryId];

                        // Clean up lastAttempted field if it's not a valid date
                        if (catPerf.lastAttempted) {
                            try {
                                // If it's a string, try to convert it to a Date
                                if (typeof catPerf.lastAttempted === 'string') {
                                    catPerf.lastAttempted = new Date(catPerf.lastAttempted);
                                }

                                // Validate that it's a valid Date
                                if (!(catPerf.lastAttempted instanceof Date) || isNaN(catPerf.lastAttempted.getTime())) {
                                    console.warn(`Invalid lastAttempted date for category ${categoryId}, removing...`);
                                    delete catPerf.lastAttempted;
                                }
                            } catch (error) {
                                console.warn(`Error parsing lastAttempted for category ${categoryId}:`, error);
                                delete catPerf.lastAttempted;
                            }
                        }
                    });
                }

                setTestStatistics(parsedStatistics);
            }

            // Load Part 1 test data as part of main loading
            await loadPart1TestData();

        } catch (error) {
            console.error('❌ Error loading test data:', error);
        } finally {
            console.log('✅ Finished loading test data');
            setIsLoading(false);
        }
    }, []);

    // Load Part 1 test data
    const loadPart1TestData = async () => {
        try {
            console.log('🔄 Loading Part 1 test data in TestContext...');
            const { part1SubcategoryTestData } = await preloadAllPart1TestData();
            console.log('📊 Part 1 test data loaded:', {
                subcategoryKeys: Object.keys(part1SubcategoryTestData),
                totalQuestions: Object.values(part1SubcategoryTestData).reduce((total, subcategory: any) => {
                    return total + (subcategory?.questions?.length || 0);
                }, 0)
            });
            setPart1TestSubcategories(part1SubcategoryTestData);
        } catch (error) {
            console.error('❌ Error loading Part 1 test data:', error);
        }
    };

    const saveTestData = async (
        progressToSave?: TestProgress,
        statisticsToSave?: TestStatistics
    ) => {
        try {
            const progressData = progressToSave || testProgress;
            const statisticsData = statisticsToSave || testStatistics;

            console.log('💾 Saving test data:', {
                totalTestsTaken: progressData.totalTestsTaken,
                averageScore: progressData.averageScore,
                bestScore: progressData.bestScore
            });

            await AsyncStorage.setItem(STORAGE_KEYS.TEST_PROGRESS, JSON.stringify(progressData));
            await AsyncStorage.setItem(STORAGE_KEYS.TEST_STATISTICS, JSON.stringify(statisticsData));

            console.log('✅ Test data saved successfully');
        } catch (error) {
            console.error('❌ Error saving test data:', error);
        }
    };

    const generateTestQuestions = (config: TestConfig): TestQuestion[] => {
        const allQuestions: TestQuestion[] = [];
        const seenQuestionIds = new Set<number>();

        console.log('Starting question generation for config:', config);

        // Handle Part 1 tests separately to avoid ID conflicts
        if (config.mode.startsWith('part1_')) {
            const part1TestId = config.mode.replace('part1_', '');
            console.log(`🎯 Part 1 test mode detected: ${part1TestId}`);

            // Only collect questions from Part 1 test subcategories for Part 1 tests
            console.log('📊 Part 1 test subcategories state:', {
                keys: Object.keys(part1TestSubcategories),
                totalQuestions: Object.values(part1TestSubcategories).reduce((total, subcategory: any) => {
                    return total + (subcategory?.questions?.length || 0);
                }, 0)
            });

            Object.values(part1TestSubcategories).forEach((subcategory: any) => {
                if (subcategory.questions && subcategory.id === part1TestId) {
                    console.log(`Processing Part 1 test subcategory: ${subcategory.id}, ${subcategory.questions.length} questions`);

                    subcategory.questions.forEach((question: any, index: number) => {
                        // Create unique IDs for Part 1 questions by adding offset
                        const uniqueId = question.id + 10000 + (subcategory.id === 'test_personal' ? 0 :
                            subcategory.id === 'test_opinions' ? 1000 : 2000);

                        const processedQuestion = {
                            id: uniqueId,
                            question: question.question,
                            question_vi: question.question_vi,
                            explanation: question.explanation || 'No explanation provided',
                            explanation_vi: question.explanation_vi || question.explanation || 'No explanation provided',
                            image: question.image,
                            categoryId: subcategory.id,
                            categoryTitle: subcategory.title || subcategory.id,
                        };

                        console.log(`Added Part 1 test question ${uniqueId} (original: ${question.id}): ${processedQuestion.question.substring(0, 50)}...`);
                        allQuestions.push(processedQuestion);
                    });
                }
            });

            console.log(`Generated ${allQuestions.length} questions for Part 1 test: ${part1TestId}`);
            return allQuestions;
        }

        // For non-Part 1 tests, collect questions from main categories and history subcategories
        // Collect questions from main categories (geography and personal)
        questionsData.categories.forEach(category => {
            if (config.categoryIds && !config.categoryIds.includes(category.id)) {
                return;
            }

            console.log(`Processing category: ${category.id}, ${category.questions.length} questions`);

            category.questions.forEach(question => {
                // Check for duplicates and log them
                if (seenQuestionIds.has(question.id)) {
                    console.warn(`Duplicate question ID found: ${question.id} in category ${category.id}`);
                    return;
                }
                seenQuestionIds.add(question.id);

                const processedQuestion = {
                    id: question.id,
                    question: typeof question.question === 'string' ? question.question : question.question.fr,
                    question_vi: (question as any).question_vi || (typeof question.question !== 'string' ? question.question.vi : undefined),
                    explanation: typeof question.explanation === 'string' ? question.explanation : question.explanation?.fr || '',
                    explanation_vi: (question as any).explanation_vi || (typeof question.explanation !== 'string' ? question.explanation?.vi : undefined),
                    image: question.image,
                    categoryId: category.id,
                    categoryTitle: category.title,
                };

                console.log(`Added question ${question.id}: ${processedQuestion.question.substring(0, 50)}...`);
                allQuestions.push(processedQuestion);
            });
        });

        // Collect questions from history subcategories
        Object.values(historySubcategories).forEach((subcategory: HistorySubcategory) => {
            if (subcategory.questions) {
                console.log(`Processing history subcategory: ${subcategory.id}, ${subcategory.questions.length} questions`);

                subcategory.questions.forEach(question => {
                    // Check for duplicates and log them
                    if (seenQuestionIds.has(question.id)) {
                        console.warn(`Duplicate question ID found: ${question.id} in history subcategory ${subcategory.id}`);
                        return;
                    }
                    seenQuestionIds.add(question.id);

                    const processedQuestion = {
                        id: question.id,
                        question: question.question,
                        question_vi: question.question_vi,
                        explanation: question.explanation,
                        explanation_vi: question.explanation_vi,
                        image: question.image,
                        categoryId: subcategory.id,
                        categoryTitle: subcategory.title,
                    };

                    console.log(`Added history question ${question.id}: ${processedQuestion.question.substring(0, 50)}...`);
                    allQuestions.push(processedQuestion);
                });
            }
        });

        // Filter based on test mode (for non-Part 1 tests)
        let selectedQuestions = [...allQuestions];

        if (config.mode === 'geography_only') {
            // Only geography questions
            selectedQuestions = allQuestions.filter(q => q.categoryId === 'geography' || q.categoryId.includes('geography'));
        } else if (config.mode === 'history_culture_comprehensive') {
            // Exclude personal info questions, include geography, history, and culture
            selectedQuestions = allQuestions.filter(q => q.categoryId !== 'personal');
        } else if (config.mode === 'mock_interview') {
            // Mix of all categories except personal
            selectedQuestions = allQuestions.filter(q => q.categoryId !== 'personal');
        } else if (config.mode.startsWith('subcategory_')) {
            // Handle subcategory-specific tests
            const subcategoryId = config.mode.replace('subcategory_', '');
            selectedQuestions = allQuestions.filter(q => q.categoryId === subcategoryId);
            console.log(`Filtering for subcategory: ${subcategoryId}, found ${selectedQuestions.length} questions`);
        }

        // Shuffle if required
        if (config.shuffleQuestions) {
            selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
        }

        // Limit to requested count and ensure we don't have duplicates
        const finalQuestions = selectedQuestions.slice(0, config.questionCount);

        // Log for debugging
        console.log(`Generated ${finalQuestions.length} questions for ${config.mode} mode`);
        console.log('Final Question IDs and titles:');
        finalQuestions.forEach((q, index) => {
            console.log(`${index}: ID=${q.id}, Title="${q.question.substring(0, 50)}...", Category=${q.categoryId}`);
        });

        return finalQuestions;
    };

    const startTest = async (config: TestConfig): Promise<void> => {
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
    };

    const submitAnswer = async (answer: TestAnswer): Promise<void> => {
        if (!currentSession) return;

        // Validate that the answer matches the current question
        const currentQuestion = currentSession.questions[currentQuestionIndex];
        if (!currentQuestion) {
            console.error('No current question found at index:', currentQuestionIndex);
            return;
        }

        if (answer.questionId !== currentQuestion.id) {
            console.error('Answer question ID mismatch!', {
                answerQuestionId: answer.questionId,
                currentQuestionId: currentQuestion.id,
                currentQuestionIndex,
                questionTitle: currentQuestion.question.substring(0, 50)
            });
            // Still submit but log the error for debugging
        }

        console.log('Submitting answer:', {
            questionId: answer.questionId,
            currentQuestionIndex,
            isCorrect: answer.isCorrect,
            questionText: currentQuestion.question.substring(0, 50)
        });

        const updatedSession = {
            ...currentSession,
            answers: [...currentSession.answers, answer],
        };

        setCurrentSession(updatedSession);

        // Move to next question
        if (currentQuestionIndex < currentSession.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const finishTest = async (): Promise<TestResult> => {
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

        // Update progress
        const updatedProgress: TestProgress = {
            ...testProgress,
            totalTestsTaken: testProgress.totalTestsTaken + 1,
            questionsAnswered: testProgress.questionsAnswered + finishedSession.totalQuestions,
            correctAnswersTotal: testProgress.correctAnswersTotal + correctAnswers,
            averageScore: Math.round(
                ((testProgress.averageScore * testProgress.totalTestsTaken) + score) /
                (testProgress.totalTestsTaken + 1)
            ),
            bestScore: Math.max(testProgress.bestScore, score),
            recentScores: [...testProgress.recentScores.slice(-9), score],
            incorrectQuestions: [
                ...testProgress.incorrectQuestions,
                ...finishedSession.answers
                    .filter(a => !a.isCorrect)
                    .map(a => a.questionId)
            ],
            lastTestDate: new Date(),
        };

        console.log('📊 Test Progress Update:', {
            previousTotalTests: testProgress.totalTestsTaken,
            newTotalTests: updatedProgress.totalTestsTaken,
            previousAverageScore: testProgress.averageScore,
            newAverageScore: updatedProgress.averageScore,
            currentScore: score,
            correctAnswers,
            totalQuestions: finishedSession.totalQuestions
        });

        // Update statistics
        const updatedStatistics = updateTestStatistics(finishedSession, updatedProgress);

        // Update weak/strong categories
        updatedProgress.weakCategories = Object.entries(updatedStatistics.categoryPerformance)
            .filter(([_, perf]) => perf.accuracy < 60)
            .map(([catId, _]) => catId);

        updatedProgress.strongCategories = Object.entries(updatedStatistics.categoryPerformance)
            .filter(([_, perf]) => perf.accuracy >= 80)
            .map(([catId, _]) => catId);

        setTestProgress(updatedProgress);
        setTestStatistics(updatedStatistics);
        setCurrentSession(null);
        setCurrentQuestionIndex(0);

        // Save to storage with the updated values
        await saveTestData(updatedProgress, updatedStatistics);

        const result: TestResult = {
            session: finishedSession,
            statistics: updatedStatistics,
            recommendations: generateRecommendations(),
        };

        return result;
    };

    const updateTestStatistics = (session: TestSession, updatedProgress: TestProgress): TestStatistics => {
        const newStatistics = { ...testStatistics };

        // Update category performance - match answers to questions by ID
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
                ((catPerf.averageTime * (catPerf.questionsAttempted - 1)) + answer.timeSpent) /
                catPerf.questionsAttempted
            );
            catPerf.lastAttempted = new Date();
        });

        // Update time statistics
        const allTimes = session.answers.map(a => a.timeSpent);
        newStatistics.timeStats.averageTimePerQuestion = Math.round(
            allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
        );
        newStatistics.timeStats.fastestTime = Math.min(newStatistics.timeStats.fastestTime, ...allTimes);
        newStatistics.timeStats.slowestTime = Math.max(newStatistics.timeStats.slowestTime, ...allTimes);

        // Update mastered/struggling questions
        session.answers.forEach(answer => {
            if (answer.isCorrect) {
                if (!newStatistics.masteredQuestions.includes(answer.questionId)) {
                    newStatistics.masteredQuestions.push(answer.questionId);
                }
                // Remove from struggling if it was there
                const strugglingIndex = newStatistics.strugglingQuestions.indexOf(answer.questionId);
                if (strugglingIndex > -1) {
                    newStatistics.strugglingQuestions.splice(strugglingIndex, 1);
                }
            } else {
                if (!newStatistics.strugglingQuestions.includes(answer.questionId)) {
                    newStatistics.strugglingQuestions.push(answer.questionId);
                }
                // Remove from mastered if it was there
                const masteredIndex = newStatistics.masteredQuestions.indexOf(answer.questionId);
                if (masteredIndex > -1) {
                    newStatistics.masteredQuestions.splice(masteredIndex, 1);
                }
            }
        });

        // Update improvement trend using the updated progress data
        if (updatedProgress.recentScores.length >= 3) {
            const recentAvg = updatedProgress.recentScores.slice(-3).reduce((sum, score) => sum + score, 0) / 3;

            if (updatedProgress.recentScores.length >= 6) {
                const olderAvg = updatedProgress.recentScores.slice(-6, -3).reduce((sum, score) => sum + score, 0) / 3;

                if (recentAvg > olderAvg + 5) {
                    newStatistics.improvementTrend = 'improving';
                } else if (recentAvg < olderAvg - 5) {
                    newStatistics.improvementTrend = 'declining';
                } else {
                    newStatistics.improvementTrend = 'stable';
                }
            } else {
                // Not enough data for trend comparison, default to stable
                newStatistics.improvementTrend = 'stable';
            }
        } else {
            // Not enough recent scores to determine trend
            newStatistics.improvementTrend = 'stable';
        }

        return newStatistics;
    };

    const cancelTest = useCallback(() => {
        console.log('🛑 Cancelling test session');
        setCurrentSession(null);
        setCurrentQuestionIndex(0);
    }, []);

    const getCurrentQuestion = (): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex];
    };

    const getNextQuestion = (): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex + 1 >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex + 1];
    };

    const getPreviousQuestion = (): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex <= 0) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex - 1];
    };

    const getIncorrectQuestions = (): TestQuestion[] => {
        if (testProgress.incorrectQuestions.length === 0) {
            return [];
        }

        const allQuestions: TestQuestion[] = [];
        const seenQuestionIds = new Set<number>();

        // Collect questions from main categories (geography and personal)
        questionsData.categories.forEach(category => {
            category.questions.forEach(question => {
                if (seenQuestionIds.has(question.id)) {
                    return;
                }
                seenQuestionIds.add(question.id);

                const processedQuestion = {
                    id: question.id,
                    question: typeof question.question === 'string' ? question.question : question.question.fr,
                    question_vi: (question as any).question_vi || (typeof question.question !== 'string' ? question.question.vi : undefined),
                    explanation: typeof question.explanation === 'string' ? question.explanation : question.explanation?.fr || '',
                    explanation_vi: (question as any).explanation_vi || (typeof question.explanation !== 'string' ? question.explanation?.vi : undefined),
                    image: question.image,
                    categoryId: category.id,
                    categoryTitle: category.title,
                };

                allQuestions.push(processedQuestion);
            });
        });

        // Collect questions from history subcategories
        Object.values(historySubcategories).forEach((subcategory: HistorySubcategory) => {
            if (subcategory.questions) {
                subcategory.questions.forEach(question => {
                    if (seenQuestionIds.has(question.id)) {
                        return;
                    }
                    seenQuestionIds.add(question.id);

                    const processedQuestion = {
                        id: question.id,
                        question: question.question,
                        question_vi: question.question_vi,
                        explanation: question.explanation,
                        explanation_vi: question.explanation_vi,
                        image: question.image,
                        categoryId: subcategory.id,
                        categoryTitle: subcategory.title,
                    };

                    allQuestions.push(processedQuestion);
                });
            }
        });

        // Filter to only include questions that were answered incorrectly
        return allQuestions.filter(q => testProgress.incorrectQuestions.includes(q.id));
    };

    const refreshProgress = useCallback(async (): Promise<void> => {
        console.log('🔄 Refreshing progress...');
        await loadTestData();
    }, [loadTestData]);

    const getWeakCategories = (): string[] => {
        return testProgress.weakCategories;
    };

    const getStrongCategories = (): string[] => {
        return testProgress.strongCategories;
    };

    const generateRecommendations = (): TestRecommendation[] => {
        const recommendations: TestRecommendation[] = [];

        // Check performance level
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

        // Weak categories
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
                questionIds: testProgress.incorrectQuestions.slice(-20), // Last 20 incorrect
            });
        }

        return recommendations;
    };

    const contextValue: TestContextType = {
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
    };

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