import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { preloadAllData, preloadImages } from '../utils';
import type {
    HistoryCategory,
    HistorySubcategory,
    FrenchCategory,
    FrenchQuestionsData,
    DataContextType,
    DataProviderProps,
} from '../../types';

const DataContext = createContext<DataContextType>({
    questionsData: { categories: [] } as FrenchQuestionsData,
    historyCategories: null,
    historySubcategories: {},
    isDataLoading: true,
    dataLoadingError: null,
});

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [questionsData, setQuestionsData] = useState<FrenchQuestionsData>(
        { categories: [] } as FrenchQuestionsData
    );
    const [historyCategories, setHistoryCategories] = useState<HistoryCategory | null>(null);
    const [historySubcategories, setHistorySubcategories] = useState<Record<string, HistorySubcategory>>({});
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

    const isMountedRef = useRef(true);

    const processMainData = useCallback(async (mainData: any) => {
        try {
            if (!mainData?.personal || !mainData?.geography) {
                throw new Error('Invalid data structure: missing required categories');
            }

            const personalCategory = mainData.personal as FrenchCategory;
            const geographyCategory = mainData.geography as FrenchCategory;

            const frenchData: FrenchQuestionsData = {
                categories: [personalCategory, geographyCategory]
            };

            if (isMountedRef.current) {
                setQuestionsData(frenchData);

                preloadImages(frenchData).catch(() => {
                    // Silent error handling for non-critical image preloading
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

                const { mainData, historyData, subcategoryData } = await preloadAllData();

                if (!isActive) return;

                if (mainData) {
                    setHistoryCategories(historyData as HistoryCategory);
                    setHistorySubcategories(subcategoryData);

                    await processMainData(mainData);
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
    }, [processMainData]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return (
        <DataContext.Provider value={{
            questionsData,
            historyCategories,
            historySubcategories,
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

