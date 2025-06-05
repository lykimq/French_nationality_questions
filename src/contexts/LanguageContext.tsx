import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// Import the data loading utilities
import { loadMainQuestionData, preloadAllData } from '../utils/dataUtils';
import { preloadImages } from '../utils/imageUtils';
import type {
    Language,
    HistoryCategory,
    HistorySubcategory,
    FrenchQuestion,
    FrenchCategory,
    FrenchQuestionsData,
    MultiLangText,
    MultiLangQuestion,
    MultiLangCategory,
    MultiLangQuestionsData,
    isFrenchQuestionsData,
    isMultiLangQuestionsData,
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

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');
    const [questionsData, setQuestionsData] = useState<FrenchQuestionsData | MultiLangQuestionsData>(
        { categories: [] } as FrenchQuestionsData
    );
    const [isTranslationLoaded, setIsTranslationLoaded] = useState(false);
    const [historyCategories, setHistoryCategories] = useState<HistoryCategory | null>(null);
    const [historySubcategories, setHistorySubcategories] = useState<{ [key: string]: HistorySubcategory }>({});
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

    // Load initial data from Firebase Storage
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsDataLoading(true);
                setDataLoadingError(null);

                const { mainData, historyData, subcategoryData } = await preloadAllData();

                if (mainData) {
                    setHistoryCategories(historyData as HistoryCategory);
                    setHistorySubcategories(subcategoryData);
                    setIsTranslationLoaded(false);

                    // Process main data based on current language
                    await processMainData(mainData, language);
                }

                setIsDataLoading(false);
            } catch (error) {
                setDataLoadingError(error instanceof Error ? error.message : 'Unknown error loading data');
                setIsDataLoading(false);
            }
        };

        loadInitialData();
    }, []); // Only run once on mount

    // Process main data when language changes
    useEffect(() => {
        const handleLanguageChange = async () => {
            if (isDataLoading) return; // Don't process if initial loading is still happening

            try {
                // Try to get cached data first
                const mainData = await loadMainQuestionData();
                if (mainData) {
                    await processMainData(mainData, language);
                }
            } catch (error) {
                // Silent error handling
            }
        };

        handleLanguageChange();
    }, [language, isDataLoading]);

    // Helper function to process main data
    const processMainData = async (mainData: any, currentLanguage: Language) => {
        try {
            if (currentLanguage === 'fr') {
                // Combine all French category data
                const frenchData: FrenchQuestionsData = {
                    categories: [
                        mainData.personal_fr_vi as unknown as FrenchCategory,
                        mainData.geography_fr_vi as unknown as FrenchCategory,
                    ]
                };
                setQuestionsData(frenchData);
                setIsTranslationLoaded(false);

                // Preload images when data changes
                try {
                    await preloadImages(frenchData);
                } catch (error) {
                    // Silent error handling
                }
            } else {
                // Safety casting our JSON data to ensure correct types
                const personalFr = mainData.personal_fr_vi as unknown as FrenchCategory;
                const geographyFr = mainData.geography_fr_vi as unknown as FrenchCategory;

                // Merge French and Vietnamese data
                const mergedData: MultiLangQuestionsData = {
                    categories: [
                        {
                            ...personalFr,
                            title_vi: personalFr.title_vi,
                            description_vi: personalFr.description_vi,
                            questions: personalFr.questions.map((question: any) => {
                                const multiLangQuestion: MultiLangQuestion = {
                                    ...question,
                                    question: {
                                        fr: question.question,
                                        vi: question.question_vi || ''
                                    },
                                    explanation: {
                                        fr: question.explanation,
                                        vi: question.explanation_vi || ''
                                    },
                                    image: question.image || null
                                };

                                return multiLangQuestion;
                            })
                        },
                        {
                            ...geographyFr,
                            title_vi: geographyFr.title_vi,
                            description_vi: geographyFr.description_vi,
                            questions: geographyFr.questions.map((question: any) => {
                                const multiLangQuestion: MultiLangQuestion = {
                                    ...question,
                                    question: {
                                        fr: question.question,
                                        vi: question.question_vi || ''
                                    },
                                    explanation: {
                                        fr: question.explanation,
                                        vi: question.explanation_vi || ''
                                    },
                                    image: question.image || null
                                };

                                return multiLangQuestion;
                            })
                        }
                    ]
                };

                setQuestionsData(mergedData);
                setIsTranslationLoaded(true);

                // Preload images when data changes
                try {
                    await preloadImages(mergedData);
                } catch (error) {
                    // Silent error handling
                }
            }
        } catch (error) {
            throw error;
        }
    };

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'fr' ? 'vi' : 'fr'));
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
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
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;