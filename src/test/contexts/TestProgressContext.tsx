import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { createLogger } from '../../shared/utils/logger';
import {
    loadAllTestData,
    saveTestData,
} from '../utils/testStorageUtils';
import {
    DEFAULT_TEST_PROGRESS,
    DEFAULT_TEST_STATISTICS,
} from '../constants/testConstants';
import {
    calculateUpdatedProgress,
    updateTestStatistics,
    updateWeakStrongCategories,
} from '../utils';
import {
    getQuestionsByIds,
} from '../utils';
import type {
    TestSession,
    TestProgress,
    TestStatistics,
    TestQuestion,
    TestResult,
} from '../../types';

const logger = createLogger('TestProgressContext');

interface TestProgressContextType {
    testProgress: TestProgress;
    testStatistics: TestStatistics;
    isLoading: boolean;

    updateProgressFromSession: (session: TestSession, score: number, correctAnswers: number) => Promise<void>;
    refreshProgress: () => Promise<void>;
    getIncorrectQuestions: (allQuestions: TestQuestion[]) => TestQuestion[];
    getWeakCategories: () => string[];
    getStrongCategories: () => string[];
}

const TestProgressContext = createContext<TestProgressContextType | undefined>(undefined);

export const TestProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [testProgress, setTestProgress] = useState<TestProgress>(DEFAULT_TEST_PROGRESS);
    const [testStatistics, setTestStatistics] = useState<TestStatistics>(DEFAULT_TEST_STATISTICS);
    const [isLoading, setIsLoading] = useState(true);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const loadData = async () => {
            if (isMountedRef.current) {
                await loadProgressData();
            }
        };

        loadData();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadProgressData = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            setIsLoading(true);
            const { progress, statistics } = await loadAllTestData();

            if (isMountedRef.current) {
                setTestProgress(progress);
                setTestStatistics(statistics);
            }
        } catch (error) {
            logger.error('Error loading test data:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const updateProgressFromSession = useCallback(async (
        session: TestSession,
        score: number,
        correctAnswers: number
    ): Promise<void> => {
        const updatedProgress = calculateUpdatedProgress(session, testProgress, score, correctAnswers);
        const updatedStatistics = updateTestStatistics(session, testStatistics, updatedProgress);

        const { weakCategories, strongCategories } = updateWeakStrongCategories(updatedStatistics);
        updatedProgress.weakCategories = weakCategories;
        updatedProgress.strongCategories = strongCategories;

        setTestProgress(updatedProgress);
        setTestStatistics(updatedStatistics);

        await saveTestData(updatedProgress, updatedStatistics);
    }, [testProgress, testStatistics]);

    const refreshProgress = useCallback(async (): Promise<void> => {
        if (isMountedRef.current) {
            await loadProgressData();
        }
    }, [loadProgressData]);

    const getIncorrectQuestions = useCallback((allQuestions: TestQuestion[]): TestQuestion[] => {
        if (testProgress.incorrectQuestions.length === 0) {
            return [];
        }

        return getQuestionsByIds(allQuestions, testProgress.incorrectQuestions);
    }, [testProgress.incorrectQuestions]);

    const getWeakCategories = useCallback((): string[] => {
        return testProgress.weakCategories;
    }, [testProgress.weakCategories]);

    const getStrongCategories = useCallback((): string[] => {
        return testProgress.strongCategories;
    }, [testProgress.strongCategories]);

    const contextValue = useMemo((): TestProgressContextType => ({
        testProgress,
        testStatistics,
        isLoading,
        updateProgressFromSession,
        refreshProgress,
        getIncorrectQuestions,
        getWeakCategories,
        getStrongCategories,
    }), [
        testProgress,
        testStatistics,
        isLoading,
        updateProgressFromSession,
        refreshProgress,
        getIncorrectQuestions,
        getWeakCategories,
        getStrongCategories,
    ]);

    return (
        <TestProgressContext.Provider value={contextValue}>
            {children}
        </TestProgressContext.Provider>
    );
};

export const useTestProgress = (): TestProgressContextType => {
    const context = useContext(TestProgressContext);
    if (!context) {
        throw new Error('useTestProgress must be used within a TestProgressProvider');
    }
    return context;
};

