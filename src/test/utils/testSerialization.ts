import { createLogger } from '../../shared/utils/logger';
import type { TestResult, SerializableTestResult } from '../types';

const logger = createLogger('TestSerialization');

// Utility functions for test result serialization
export const serializeTestResult = (result: TestResult): SerializableTestResult => {
    // Serialize category performance with Date conversion
    const serializedCategoryPerformance: any = {};
    Object.entries(result.statistics.categoryPerformance).forEach(([key, perf]) => {
        let lastAttemptedISO: string | undefined = undefined;

        // Safely convert lastAccessed to ISO string (using lastAccessed from TimestampedEntity)
        if ((perf as any).lastAccessed) {
            try {
                const lastAccessed = (perf as any).lastAccessed;
                // Check if it's already a Date object
                if (lastAccessed instanceof Date) {
                    lastAttemptedISO = lastAccessed.toISOString();
                } else if (typeof lastAccessed === 'string') {
                    // If it's a string, try to parse it as a date
                    lastAttemptedISO = new Date(lastAccessed).toISOString();
                } else {
                    logger.warn(`Invalid lastAccessed format for category ${key}:`, lastAccessed);
                }
            } catch (error) {
                logger.error(`Error serializing lastAccessed for category ${key}:`, error);
            }
        }

        serializedCategoryPerformance[key] = {
            ...perf,
            lastAttempted: lastAttemptedISO
        };
    });

    return {
        session: {
            ...result.session,
            answers: result.session.answers.map(answer => ({
                ...answer,
                timestamp: answer.timestamp.toISOString()
            })),
            startTime: result.session.startTime.toISOString(),
            endTime: result.session.endTime?.toISOString()
        },
        statistics: {
            ...result.statistics,
            categoryPerformance: serializedCategoryPerformance
        },
        recommendations: result.recommendations
    };
};

export const deserializeTestResult = (serialized: SerializableTestResult): TestResult => {
    // Deserialize category performance with Date conversion
    const deserializedCategoryPerformance: any = {};
    Object.entries(serialized.statistics.categoryPerformance).forEach(([key, perf]) => {
        deserializedCategoryPerformance[key] = {
            ...perf,
            lastAccessed: (perf as any).lastAttempted ? new Date((perf as any).lastAttempted) : undefined
        };
    });

    return {
        session: {
            ...serialized.session,
            answers: serialized.session.answers.map(answer => ({
                ...answer,
                timestamp: new Date(answer.timestamp)
            })),
            startTime: new Date(serialized.session.startTime),
            endTime: serialized.session.endTime ? new Date(serialized.session.endTime) : undefined
        },
        statistics: {
            ...serialized.statistics,
            categoryPerformance: deserializedCategoryPerformance
        },
        recommendations: serialized.recommendations
    };
};