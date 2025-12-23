/**
 * Database Integration Test Utility
 * This file contains utilities to test and verify that the database is properly integrated
 */

import { preloadAllData, validateDataStructure } from '../../shared/utils';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('DatabaseIntegration');

interface DatabaseTestResult {
    success: boolean;
    totalQuestions: number;
    categoriesLoaded: string[];
    subcategoriesLoaded: string[];
    issues: string[];
    recommendations: string[];
    questionSamples: Array<{
        id: number;
        category: string;
        hasFrench: boolean;
        hasExplanation: boolean;
    }>;
}

/**
 * Comprehensive test of the database integration
 */
export const testDatabaseIntegration = async (): Promise<DatabaseTestResult> => {
    const result: DatabaseTestResult = {
        success: false,
        totalQuestions: 0,
        categoriesLoaded: [],
        subcategoriesLoaded: [],
        issues: [],
        recommendations: [],
        questionSamples: []
    };

    try {
        // Load Livret data
        const { subcategoryData } = await preloadAllData();

        // Test subcategory data
        Object.entries(subcategoryData).forEach(([key, data]) => {
            if (data && typeof data === 'object' && 'questions' in data && Array.isArray(data.questions)) {
                const validation = validateDataStructure(data, key);
                result.subcategoriesLoaded.push(key);
                result.totalQuestions += validation.summary.totalQuestions;

                if (!validation.isValid) {
                    result.issues.push(`Subcategory ${key} validation failed: ${validation.errors.join(', ')}`);
                }

                // Add sample questions from first few subcategories
                if (result.subcategoriesLoaded.length <= 3 && data.questions.length > 0) {
                    const q = data.questions[0];
                    result.questionSamples.push({
                        id: q.id,
                        category: key,
                        hasFrench: !!q.question,
                        hasExplanation: !!q.explanation
                    });
                }
            } else {
                result.issues.push(`Subcategory ${key} has no questions or failed to load`);
            }
        });

        // Generate recommendations
        result.recommendations = generateRecommendations(result);

        // Determine success
        result.success = result.issues.length === 0 && result.totalQuestions > 0;

    } catch (error) {
        logger.error('Database integration test failed:', error);
        result.issues.push(`Test execution failed: ${error}`);
        result.success = false;
    }

    return result;
};

/**
 * Generate recommendations based on test results
 */
const generateRecommendations = (result: DatabaseTestResult): string[] => {
    const recommendations: string[] = [];

    if (result.totalQuestions === 0) {
        recommendations.push('Critical: No questions loaded. Check Firebase Storage configuration and data files.');
    }

    if (result.subcategoriesLoaded.length < 10) {
        recommendations.push('Warning: Some subcategories may not have loaded. Check subcategories folder in Firebase Storage.');
    }

    // Check for missing explanations
    const questionsWithoutExplanations = result.questionSamples.filter(q => !q.hasExplanation);
    if (questionsWithoutExplanations.length > 0) {
        recommendations.push(`Warning: ${questionsWithoutExplanations.length} sample questions missing explanations.`);
    }

    if (result.issues.length === 0) {
        recommendations.push('✅ All database integration tests passed successfully!');
    }

    return recommendations;
};

/**
 * Test question ID uniqueness across all categories
 */
export const testQuestionIdUniqueness = async (): Promise<{
    success: boolean;
    totalQuestions: number;
    uniqueIds: number;
    duplicateIds: number[];
    issues: string[];
}> => {
    const result = {
        success: false,
        totalQuestions: 0,
        uniqueIds: 0,
        duplicateIds: [] as number[],
        issues: [] as string[]
    };

    try {
        const { subcategoryData } = await preloadAllData();
        const allIds: number[] = [];

        // Collect IDs from subcategories
        Object.values(subcategoryData).forEach((subcategory: any) => {
            if (subcategory && typeof subcategory === 'object' && 'questions' in subcategory && Array.isArray(subcategory.questions)) {
                subcategory.questions.forEach((q: any) => {
                    if (typeof q.id === 'number') {
                        allIds.push(q.id);
                    }
                });
            }
        });

        result.totalQuestions = allIds.length;
        const uniqueIdsSet = new Set(allIds);
        result.uniqueIds = uniqueIdsSet.size;

        // Find duplicates
        const idCounts = new Map<number, number>();
        allIds.forEach(id => {
            idCounts.set(id, (idCounts.get(id) || 0) + 1);
        });

        result.duplicateIds = Array.from(idCounts.entries())
            .filter(([id, count]) => count > 1)
            .map(([id]) => id);

        if (result.duplicateIds.length > 0) {
            result.issues.push(`Found ${result.duplicateIds.length} duplicate question IDs: ${result.duplicateIds.join(', ')}`);
        }

        result.success = result.duplicateIds.length === 0 && result.totalQuestions > 0;

    } catch (error) {
        logger.error('ID uniqueness test failed:', error);
        result.issues.push(`Test failed: ${error}`);
    }

    return result;
};

/**
 * Log comprehensive database statistics
 */
export const logDatabaseStatistics = async (): Promise<void> => {
    try {
        const { subcategoryData } = await preloadAllData();

        let totalQuestions = 0;
        let questionsWithImages = 0;

        const categoryStats: { [key: string]: number } = {};

        // Process Livret subcategories
        Object.entries(subcategoryData).forEach(([key, subcategory]) => {
            if (subcategory && typeof subcategory === 'object' && 'questions' in subcategory && Array.isArray((subcategory as any).questions)) {
                const count = (subcategory as any).questions.length;
                totalQuestions += count;
                categoryStats[key] = count;

                (subcategory as any).questions.forEach((q: any) => {
                    if (q.image) questionsWithImages++;
                });
            }
        });

    } catch (error) {
        logger.error('Failed to generate database statistics:', error);
    }
};