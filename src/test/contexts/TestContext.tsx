import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { useData } from '../../shared/contexts/DataContext';
import { processAllQuestions, loadAllTestData, generateRecommendations } from '../utils';
import { TestSessionProvider, useTestSession } from './TestSessionContext';
import { TestProgressProvider, useTestProgress } from './TestProgressContext';
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

export { serializeTestResult, deserializeTestResult } from '../utils';

interface TestContextType {
    currentSession: TestSession | null;
    isTestActive: boolean;
    currentQuestionIndex: number;
    testProgress: TestProgress;
    testStatistics: TestStatistics;
    startTest: (config: TestConfig) => Promise<void>;
    submitAnswer: (answer: TestAnswer, autoAdvance?: boolean) => Promise<void>;
    goToNextQuestion: () => void;
    finishTest: () => Promise<TestResult>;
    cancelTest: () => void;
    getCurrentQuestion: () => TestQuestion | null;
    getNextQuestion: () => TestQuestion | null;
    getPreviousQuestion: () => TestQuestion | null;
    getIncorrectQuestions: () => TestQuestion[];
    refreshProgress: () => Promise<void>;
    getWeakCategories: () => string[];
    getStrongCategories: () => string[];
    generateRecommendations: () => TestRecommendation[];
    isLoading: boolean;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

const TestContextInternal: React.FC<{ 
    children: ReactNode;
    allProcessedQuestions: ReturnType<typeof processAllQuestions>;
    part1TestSubcategories: Record<string, any>;
}> = ({ children, allProcessedQuestions, part1TestSubcategories }) => {
    const sessionContext = useTestSession();
    const progressContext = useTestProgress();

    const startTest = useCallback(async (config: TestConfig): Promise<void> => {
        await sessionContext.startTest(config, allProcessedQuestions, part1TestSubcategories);
    }, [sessionContext, allProcessedQuestions, part1TestSubcategories]);

    const finishTest = useCallback(async (): Promise<TestResult> => {
        const result = sessionContext.finishTest();
        if (sessionContext.currentSession) {
            await progressContext.updateProgressFromSession(
                sessionContext.currentSession,
                result.session.score,
                result.session.correctAnswers
            );
            return {
                ...result,
                statistics: progressContext.testStatistics,
                recommendations: generateRecommendations(progressContext.testProgress),
            };
        }
        return {
            ...result,
            statistics: progressContext.testStatistics,
            recommendations: generateRecommendations(progressContext.testProgress),
        };
    }, [sessionContext, progressContext]);

    const getIncorrectQuestions = useCallback((): TestQuestion[] => {
        return progressContext.getIncorrectQuestions(allProcessedQuestions);
    }, [progressContext, allProcessedQuestions]);

    const getRecommendations = useCallback((): TestRecommendation[] => {
        return generateRecommendations(progressContext.testProgress);
    }, [progressContext.testProgress]);

    const contextValue = useMemo((): TestContextType => ({
        currentSession: sessionContext.currentSession,
        isTestActive: sessionContext.isTestActive,
        currentQuestionIndex: sessionContext.currentQuestionIndex,
        testProgress: progressContext.testProgress,
        testStatistics: progressContext.testStatistics,
        startTest,
        submitAnswer: sessionContext.submitAnswer,
        goToNextQuestion: sessionContext.goToNextQuestion,
        finishTest,
        cancelTest: sessionContext.cancelTest,
        getCurrentQuestion: sessionContext.getCurrentQuestion,
        getNextQuestion: sessionContext.getNextQuestion,
        getPreviousQuestion: sessionContext.getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress: progressContext.refreshProgress,
        getWeakCategories: progressContext.getWeakCategories,
        getStrongCategories: progressContext.getStrongCategories,
        generateRecommendations: getRecommendations,
        isLoading: progressContext.isLoading,
    }), [
        sessionContext,
        progressContext,
        startTest,
        finishTest,
        getIncorrectQuestions,
        getRecommendations,
    ]);

    return (
        <TestContext.Provider value={contextValue}>
            {children}
        </TestContext.Provider>
    );
};

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { questionsData, historySubcategories } = useData();
    const [part1TestSubcategories, setPart1TestSubcategories] = useState<Record<string, any>>({});

    useEffect(() => {
        const loadPart1Data = async () => {
            try {
                const { part1Data } = await loadAllTestData();
                setPart1TestSubcategories(part1Data);
            } catch (error) {
                logger.error('Error loading Part 1 test data:', error);
            }
        };
        loadPart1Data();
    }, []);

    const allProcessedQuestions = useMemo(() => {
        return processAllQuestions(questionsData, historySubcategories);
    }, [questionsData, historySubcategories]);

    return (
        <TestProgressProvider>
            <TestSessionProvider 
                allProcessedQuestions={allProcessedQuestions}
                part1TestSubcategories={part1TestSubcategories}
            >
                <TestContextInternal 
                    allProcessedQuestions={allProcessedQuestions}
                    part1TestSubcategories={part1TestSubcategories}
                >
                    {children}
                </TestContextInternal>
            </TestSessionProvider>
        </TestProgressProvider>
    );
};

export const useTest = (): TestContextType => {
    const context = useContext(TestContext);
    if (!context) {
        throw new Error('useTest must be used within a TestProvider');
    }
    return context;
};