import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { deserializeTestResult } from '../contexts/TestContext';
import { TestResult, TestStackParamList } from '../../types';
import { createLogger } from '../../shared/utils/logger';
import { useTest } from '../contexts/TestContext';

const logger = createLogger('useTestResult');

type TestResultScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;
type TestResultScreenRouteProp = RouteProp<TestStackParamList, 'TestResult'>;

export const useTestResult = () => {
    const navigation = useNavigation<TestResultScreenNavigationProp>();
    const route = useRoute<TestResultScreenRouteProp>();
    const { cancelTest } = useTest();

    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const cleanupCalledRef = useRef(false);

    // Initialize test result data
    useEffect(() => {
        const initializeTestResult = () => {
            const resultFromParams = route.params?.testResult;

            if (resultFromParams) {
                const deserializedResult = deserializeTestResult(resultFromParams as any);
                setTestResult(deserializedResult);
            } else {
                logger.warn('TestResultScreen: No test result provided in navigation params');
            }

            setIsLoading(false);
        };

        initializeTestResult();
    }, [route.params]);

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
            if (!cleanupCalledRef.current) {
                cleanupCalledRef.current = true;
                cancelTest();
            }
        };
    }, [cancelTest]);

    return {
        testResult,
        isLoading,
        handlers: {
            handleRetakeTest,
            handleViewProgress,
            handleCloseTest,
        },
    };
};