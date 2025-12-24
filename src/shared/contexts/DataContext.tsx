import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { preloadAllData, preloadImages } from '../utils';
import { createLogger } from '../utils/logger';
import type {
    FrenchCategory,
    FrenchQuestionsData,
    DataContextType,
    DataProviderProps,
} from '../../types';

const logger = createLogger('DataContext');

const DataContext = createContext<DataContextType>({
    questionsData: { categories: [] } as FrenchQuestionsData,
    isDataLoading: true,
    dataLoadingError: null,
});

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [questionsData, setQuestionsData] = useState<FrenchQuestionsData>(
        { categories: [] } as FrenchQuestionsData
    );
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

    const isMountedRef = useRef(true);

    const isFrenchCategory = (obj: unknown): obj is FrenchCategory => {
        if (!obj || typeof obj !== 'object') return false;
        const category = obj as Record<string, unknown>;
        return (
            typeof category.id === 'string' &&
            typeof category.title === 'string' &&
            typeof category.icon === 'string' &&
            typeof category.description === 'string' &&
            Array.isArray(category.questions)
        );
    };

    const processLivretData = useCallback(async (subcategoryData: Record<string, FrenchCategory>) => {
        try {
            const categories = Object.values(subcategoryData) as FrenchCategory[];

            if (!categories.length) {
                throw new Error('Invalid data structure: no categories available');
            }

            const frenchData: FrenchQuestionsData = { categories };

            if (isMountedRef.current) {
                setQuestionsData(frenchData);

                preloadImages(frenchData).catch((error) => {
                    logger.warn('Unexpected error during image preloading (non-critical):', error);
                });
            }
        } catch (error) {
            if (isMountedRef.current) {
                throw error;
            }
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadInitialData = async () => {
            try {
                if (!isActive) return;

                setIsDataLoading(true);
                setDataLoadingError(null);

                const { subcategoryData } = await preloadAllData();

                if (!isActive) return;

                if (subcategoryData && Object.keys(subcategoryData).length > 0) {
                    const validatedData: Record<string, FrenchCategory> = {};
                    for (const [key, value] of Object.entries(subcategoryData)) {
                        if (isFrenchCategory(value)) {
                            validatedData[key] = value;
                        }
                    }
                    
                    if (Object.keys(validatedData).length > 0) {
                        await processLivretData(validatedData);
                    } else {
                        setDataLoadingError('Failed to load question data. Invalid data structure.');
                    }
                } else {
                    setDataLoadingError('Failed to load question data. Please check your connection or Firebase configuration.');
                }

                if (isActive) {
                    setIsDataLoading(false);
                }
            } catch (error) {
                if (isActive) {
                    setDataLoadingError(error instanceof Error ? error.message : 'Unknown error loading data');
                    setIsDataLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isActive = false;
        };
    }, [processLivretData]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return (
        <DataContext.Provider value={{
            questionsData,
            isDataLoading,
            dataLoadingError,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export default DataContext;

