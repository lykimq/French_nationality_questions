import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { createLogger } from '../../shared/utils/logger';
import {
    loadAllCivicExamData,
    saveCivicExamData,
    resetCivicExamData,
    DEFAULT_CIVIC_EXAM_PROGRESS,
    DEFAULT_CIVIC_EXAM_STATISTICS,
} from '../utils/civicExamStorage';
import {
    updateExamStatistics,
    calculateProgressUpdates,
} from '../utils/civicExamHelpers';
import {
    createDefaultCivicExamProgress,
    createDefaultCivicExamStatistics,
} from '../utils/civicExamDefaults';
import type {
    CivicExamSession,
    CivicExamProgress,
    CivicExamStatistics,
    CivicExamResult,
    CivicExamQuestion,
} from '../types';

const logger = createLogger('CivicExamProgressContext');

interface CivicExamProgressContextType {
    examProgress: CivicExamProgress;
    examStatistics: CivicExamStatistics;
    isLoading: boolean;

    updateProgressFromSession: (session: CivicExamSession, result: Omit<CivicExamResult, 'statistics'>) => Promise<CivicExamResult>;
    refreshProgress: () => Promise<void>;
    resetProgress: () => Promise<void>;
    getIncorrectQuestions: (allQuestions: any[]) => CivicExamQuestion[];
}

const CivicExamProgressContext = createContext<CivicExamProgressContextType | undefined>(undefined);

export const CivicExamProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [examProgress, setExamProgress] = useState<CivicExamProgress>(DEFAULT_CIVIC_EXAM_PROGRESS);
    const [examStatistics, setExamStatistics] = useState<CivicExamStatistics>(DEFAULT_CIVIC_EXAM_STATISTICS);
    const [isLoading, setIsLoading] = useState(true);

    // Memory leak prevention
    const isMountedRef = useRef(true);

    // Load data on mount with cleanup
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
            const { progress, statistics } = await loadAllCivicExamData();

            if (isMountedRef.current) {
                setExamProgress(progress);
                setExamStatistics(statistics);
            }
        } catch (error) {
            logger.error('Error loading civic exam data:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const updateProgressFromSession = useCallback(async (
        session: CivicExamSession,
        result: Omit<CivicExamResult, 'statistics'>
    ): Promise<CivicExamResult> => {
        const updatedProgress = calculateProgressUpdates(
            session,
            examProgress,
            result.score,
            result.correctAnswers
        );

        const updatedStatistics = updateExamStatistics(session, examStatistics, updatedProgress);

        // Update state
        setExamProgress(updatedProgress);
        setExamStatistics(updatedStatistics);

        // Save to storage
        await saveCivicExamData(updatedProgress, updatedStatistics);

        return {
            ...result,
            statistics: updatedStatistics,
        };
    }, [examProgress, examStatistics]);

    const refreshProgress = useCallback(async (): Promise<void> => {
        if (isMountedRef.current) {
            await loadProgressData();
        }
    }, [loadProgressData]);

    const resetProgress = useCallback(async (): Promise<void> => {
        if (!isMountedRef.current) {
            return;
        }

        try {
            await resetCivicExamData();

            if (isMountedRef.current) {
                const freshProgress = createDefaultCivicExamProgress();
                const freshStats = createDefaultCivicExamStatistics();

                setExamProgress(freshProgress);
                setExamStatistics(freshStats);
            }
        } catch (error) {
            logger.error('Error resetting progress:', error);
            if (isMountedRef.current) {
                const errorProgress = createDefaultCivicExamProgress();
                const errorStats = createDefaultCivicExamStatistics();

                setExamProgress(errorProgress);
                setExamStatistics(errorStats);
            }
            throw error;
        }
    }, []);

    const getIncorrectQuestions = useCallback((allQuestions: any[]): CivicExamQuestion[] => {
        if (examProgress.incorrectQuestions.length === 0) {
            return [];
        }

        return allQuestions
            .filter(q => examProgress.incorrectQuestions.includes(q.id))
            .map(q => ({
                ...q,
                theme: 'principles_values' as const,
                subTheme: 'devise_symboles' as const,
                questionType: 'knowledge' as const,
            })) as CivicExamQuestion[];
    }, [examProgress.incorrectQuestions]);

    const contextValue = useMemo((): CivicExamProgressContextType => ({
        examProgress,
        examStatistics,
        isLoading,
        updateProgressFromSession,
        refreshProgress,
        resetProgress,
        getIncorrectQuestions,
    }), [
        examProgress,
        examStatistics,
        isLoading,
        updateProgressFromSession,
        refreshProgress,
        resetProgress,
        getIncorrectQuestions,
    ]);

    return (
        <CivicExamProgressContext.Provider value={contextValue}>
            {children}
        </CivicExamProgressContext.Provider>
    );
};

export const useCivicExamProgress = (): CivicExamProgressContextType => {
    const context = useContext(CivicExamProgressContext);
    if (!context) {
        throw new Error('useCivicExamProgress must be used within a CivicExamProgressProvider');
    }
    return context;
};

