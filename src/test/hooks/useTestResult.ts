import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTest, deserializeTestResult } from '../contexts/TestContext';
import { TestResult, TestStackParamList } from '../../types';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('useTestResult');

type TestResultScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;
type TestResultScreenRouteProp = RouteProp<TestStackParamList, 'TestResult'>;

export const useTestResult = () => {
    const navigation = useNavigation<TestResultScreenNavigationProp>();
    const route = useRoute<TestResultScreenRouteProp>();
    const { testProgress, testStatistics, generateRecommendations, cancelTest, currentSession } = useTest();

    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const cleanupCalledRef = useRef(false);

    // Initialize test result data
    useEffect(() => {
        const initializeTestResult = () => {
            const resultFromParams = route.params?.testResult;

            if (resultFromParams) {
                // Deserialize the test result from navigation params
                const deserializedResult = deserializeTestResult(resultFromParams as any);
                setTestResult(deserializedResult);
            } else {
                // Fallback: create result from current test context data
                const currentSessionData = currentSession;

                if (currentSessionData && currentSessionData.isCompleted) {
                    // Use the completed session data
                    const fallbackResult: TestResult = {
                        session: currentSessionData,
                        statistics: testStatistics,
                        recommendations: generateRecommendations(),
                    };
                    setTestResult(fallbackResult);
                } else {
                    // Create a minimal fallback if no session data is available
                    logger.warn('TestResultScreen: No test result provided and no completed session found');

                    const fallbackResult: TestResult = {
                        session: {
                            id: Date.now().toString(),
                            mode: 'mock_interview',
                            questions: [],
                            answers: [],
                            startTime: new Date(),
                            endTime: new Date(),
                            isCompleted: true,
                            score: testProgress.averageScore || 0,
                            totalQuestions: testProgress.totalTestsTaken > 0 ?
                                Math.round(testProgress.questionsAnswered / testProgress.totalTestsTaken) : 0,
                            correctAnswers: testProgress.totalTestsTaken > 0 ?
                                Math.round((testProgress.averageScore || 0) * testProgress.questionsAnswered / (testProgress.totalTestsTaken * 100)) : 0,
                        },
                        statistics: testStatistics,
                        recommendations: generateRecommendations(),
                    };
                    setTestResult(fallbackResult);
                }
            }

            setIsLoading(false);
        };

        initializeTestResult();
    }, [route.params, testProgress, testStatistics, generateRecommendations, currentSession]);

    // Navigation handlers
    const handleRetakeTest = useCallback(() => {
        navigation.navigate('Test', undefined);
    }, [navigation]);

    const handleViewProgress = useCallback(() => {
        navigation.navigate('Progress', undefined);
    }, [navigation]);

    const handleCloseTest = useCallback(() => {
        navigation.navigate('Test', undefined);
    }, [navigation]);

    useEffect(() => {
        return () => {
            if (!cleanupCalledRef.current && currentSession && !currentSession.isCompleted) {
                cleanupCalledRef.current = true;
                cancelTest();
            }
        };
    }, []);

    return {
        testResult,
        isLoading,
        handlers: {
            handleRetakeTest,
            handleViewProgress,
            handleCloseTest,
        },
        testProgress,
    };
};