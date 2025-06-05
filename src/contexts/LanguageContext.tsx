import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// Import the data loading utilities
import { loadMainQuestionData, preloadAllData } from '../utils/dataUtils';
import { preloadImages } from '../utils/imageUtils';
import type {
    Language,
    HistoryCategory,
    HistorySubcategory,
    FrenchCategory,
    FrenchQuestionsData,
    MultiLangQuestion,
    MultiLangQuestionsData,
    LanguageContextType,
    LanguageProviderProps,
} from '../types';

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => { },
    toggleLanguage: () => { },
    questionsData: { categories: [] } as FrenchQuestionsData,
    isTranslationLoaded: false,
    historyCategories: null,
    historySubcategories: {},
    isDataLoading: true,
    dataLoadingError: null,
});

// Helper function to transform a French question to multilingual format
const transformToMultiLangQuestion = (question: any): MultiLangQuestion => ({
    ...question,
    question: {
        fr: question.question || '',
        vi: question.question_vi || ''
    },
    explanation: {
        fr: question.explanation || '',
        vi: question.explanation_vi || ''
    },
    image: question.image || null
});

// Helper function to transform a French category to multilingual format
const transformToMultiLangCategory = (category: FrenchCategory) => ({
    ...category,
    title_vi: category.title_vi,
    description_vi: category.description_vi,
    questions: category.questions.map(transformToMultiLangQuestion)
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');
    const [questionsData, setQuestionsData] = useState<FrenchQuestionsData | MultiLangQuestionsData>(
        { categories: [] } as FrenchQuestionsData
    );
    const [isTranslationLoaded, setIsTranslationLoaded] = useState(false);
    const [historyCategories, setHistoryCategories] = useState<HistoryCategory | null>(null);
    const [historySubcategories, setHistorySubcategories] = useState<Record<string, HistorySubcategory>>({});
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

    // Use ref to track if component is mounted to prevent memory leaks
    const isMountedRef = useRef(true);

    // Memoized function to process main data
    const processMainData = useCallback(async (mainData: any, currentLanguage: Language) => {
        try {
            // Validate data structure
            if (!mainData?.personal_fr_vi || !mainData?.geography_fr_vi) {
                throw new Error('Invalid data structure: missing required categories');
            }

            const personalCategory = mainData.personal_fr_vi as FrenchCategory;
            const geographyCategory = mainData.geography_fr_vi as FrenchCategory;

            if (currentLanguage === 'fr') {
                const frenchData: FrenchQuestionsData = {
                    categories: [personalCategory, geographyCategory]
                };

                if (isMountedRef.current) {
                    setQuestionsData(frenchData);
                    setIsTranslationLoaded(false);

                    // Preload images asynchronously without blocking
                    preloadImages(frenchData).catch(() => {
                        // Silent error handling for non-critical image preloading
                    });
                }
            } else {
                // Transform categories to multilingual format
                const mergedData: MultiLangQuestionsData = {
                    categories: [
                        transformToMultiLangCategory(personalCategory),
                        transformToMultiLangCategory(geographyCategory)
                    ]
                };

                if (isMountedRef.current) {
                    setQuestionsData(mergedData);
                    setIsTranslationLoaded(true);

                    // Preload images asynchronously without blocking
                    preloadImages(mergedData).catch(() => {
                        // Silent error handling for non-critical image preloading
                    });
                }
            }
        } catch (error) {
            if (isMountedRef.current) {
                throw error;
            }
        }
    }, []);

    // Load initial data from Firebase Storage
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

                    await processMainData(mainData, language);
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
    }, []); // Only run once on mount

    // Process main data when language changes
    useEffect(() => {
        if (isDataLoading) return; // Don't process if initial loading is still happening

        let isActive = true;

        const handleLanguageChange = async () => {
            try {
                const mainData = await loadMainQuestionData();
                if (isActive && mainData) {
                    await processMainData(mainData, language);
                }
            } catch (error) {
                // Silent error handling for language change failures
                if (isActive) {
                    console.warn('Failed to reload data on language change:', error);
                }
            }
        };

        handleLanguageChange();

        return () => {
            isActive = false;
        };
    }, [language, isDataLoading, processMainData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => (prev === 'fr' ? 'vi' : 'fr'));
    }, []);

    const handleSetLanguage = useCallback((lang: Language) => {
        setLanguage(lang);
    }, []);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: handleSetLanguage,
            toggleLanguage,
            questionsData,
            isTranslationLoaded,
            historyCategories,
            historySubcategories,
            isDataLoading,
            dataLoadingError,
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Create a custom hook to use the language context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;