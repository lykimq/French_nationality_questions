import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { useData } from '../../shared/contexts/DataContext';

// Import constants
import { DEFAULT_TEST_PROGRESS, DEFAULT_TEST_STATISTICS } from '../constants/testConstants';

// Import utilities
import {
    calculateTestScore,
    calculateUpdatedProgress,
    generateRecommendations,
    generateTestQuestions,
    getQuestionsByIds,
    loadAllTestData,
    processAllQuestions,
    saveTestData,
    updateTestStatistics,
    updateWeakStrongCategories,
} from '../utils';

// Import types
import type {
    TestSession,
    TestProgress,
    TestStatistics,
    TestQuestion,
    TestAnswer,
    TestConfig,
    TestResult,
    TestRecommendation,
} from '../../types';

const logger = createLogger('TestContext');

// Re-export utility functions for backward compatibility
export { serializeTestResult, deserializeTestResult } from '../utils';

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
    submitAnswer: (answer: TestAnswer, autoAdvance?: boolean) => Promise<void>;
    goToNextQuestion: () => void;
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

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { questionsData, historySubcategories } = useData();

    // State management
    const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [part1TestSubcategories, setPart1TestSubcategories] = useState<Record<string, any>>({});
    const [testProgress, setTestProgress] = useState<TestProgress>(DEFAULT_TEST_PROGRESS);
    const [testStatistics, setTestStatistics] = useState<TestStatistics>(DEFAULT_TEST_STATISTICS);
    const [isLoading, setIsLoading] = useState(true);

    // Memory leak prevention
    const isMountedRef = useRef(true);

    // Memoized question collections to avoid reprocessing
    const allProcessedQuestions = useMemo(() => {
        return processAllQuestions(questionsData, historySubcategories);
    }, [questionsData, historySubcategories]);

    // Load data on mount with cleanup
    useEffect(() => {
        isMountedRef.current = true;

        const loadData = async () => {
            if (isMountedRef.current) {
                await loadTestData();
            }
        };

        loadData();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Cleanup effect to prevent memory leaks
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadTestData = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            setIsLoading(true);
            const { progress, statistics, part1Data } = await loadAllTestData();

            if (isMountedRef.current) {
                setTestProgress(progress);
                setTestStatistics(statistics);
                setPart1TestSubcategories(part1Data);
            }
        } catch (error) {
            logger.error('Error loading test data:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const startTest = useCallback(async (config: TestConfig): Promise<void> => {
        const questions = generateTestQuestions(config, allProcessedQuestions, part1TestSubcategories);

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
    }, [allProcessedQuestions, part1TestSubcategories]);

    const submitAnswer = useCallback(async (answer: TestAnswer, autoAdvance: boolean = true): Promise<void> => {
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

        // Move to next question only if autoAdvance is true
        if (autoAdvance && currentQuestionIndex < currentSession.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentSession, currentQuestionIndex]);

    const goToNextQuestion = useCallback((): void => {
        if (!currentSession) {
            return;
        }
        if (currentQuestionIndex < currentSession.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentSession, currentQuestionIndex]);

    const finishTest = useCallback(async (): Promise<TestResult> => {
        if (!currentSession) {
            throw new Error('No active test session');
        }

        const correctAnswers = currentSession.answers.filter((answer: TestAnswer) => answer.isCorrect).length;
        const score = calculateTestScore(correctAnswers, currentSession.totalQuestions);

        const finishedSession: TestSession = {
            ...currentSession,
            endTime: new Date(),
            isCompleted: true,
            score,
            correctAnswers,
        };

        // Calculate updated progress and statistics
        const updatedProgress = calculateUpdatedProgress(finishedSession, testProgress, score, correctAnswers);
        const updatedStatistics = updateTestStatistics(finishedSession, testStatistics, updatedProgress);

        // Update weak/strong categories
        const { weakCategories, strongCategories } = updateWeakStrongCategories(updatedStatistics);
        updatedProgress.weakCategories = weakCategories;
        updatedProgress.strongCategories = strongCategories;

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
            recommendations: generateRecommendations(updatedProgress),
        };
    }, [currentSession, testProgress, testStatistics]);

    const cancelTest = useCallback(() => {
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

        return getQuestionsByIds(allProcessedQuestions, testProgress.incorrectQuestions);
    }, [allProcessedQuestions, testProgress.incorrectQuestions]);

    const refreshProgress = useCallback(async (): Promise<void> => {
        if (isMountedRef.current) {
            await loadTestData();
        }
    }, [loadTestData]);

    const getWeakCategories = useCallback((): string[] => {
        return testProgress.weakCategories;
    }, [testProgress.weakCategories]);

    const getStrongCategories = useCallback((): string[] => {
        return testProgress.strongCategories;
    }, [testProgress.strongCategories]);

    const getRecommendations = useCallback((): TestRecommendation[] => {
        return generateRecommendations(testProgress);
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
        goToNextQuestion,
        finishTest,
        cancelTest,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress,
        getWeakCategories,
        getStrongCategories,
        generateRecommendations: getRecommendations,
        isLoading,
    }), [
        currentSession,
        currentQuestionIndex,
        testProgress,
        testStatistics,
        startTest,
        submitAnswer,
        goToNextQuestion,
        finishTest,
        cancelTest,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress,
        getWeakCategories,
        getStrongCategories,
        getRecommendations,
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