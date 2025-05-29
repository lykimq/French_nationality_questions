import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// Import the split JSON files
import geography_fr_vi from '../data/geography_fr_vi.json';
import personal_fr_vi from '../data/personal_fr_vi.json';
import historyData from '../data/history_categories.json';

// Import all subcategory data
import localGovData from '../data/subcategories/local_gov.json';
import monarchyData from '../data/subcategories/monarchy.json';
import revolutionData from '../data/subcategories/revolution.json';
import warsData from '../data/subcategories/wars.json';
import republicData from '../data/subcategories/republic.json';
import democracyData from '../data/subcategories/democracy.json';
import economyData from '../data/subcategories/economy.json';
import cultureData from '../data/subcategories/culture.json';
import artsData from '../data/subcategories/arts.json';
import celebritiesData from '../data/subcategories/celebrities.json';
import sportsData from '../data/subcategories/sports.json';
import holidaysData from '../data/subcategories/holidays.json';
import { preloadImages } from '../utils/imageUtils';

// Define types for history categories
export interface HistoryCategory {
    id: string;
    title: string;
    title_vi: string;
    icon: string;
    description: string;
    description_vi: string;
    subcategories: Array<{
        id: string;
        title: string;
        title_vi: string;
        icon: string;
        description: string;
        description_vi: string;
    }>;
}

export interface HistorySubcategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    questions?: Array<{
        id: number;
        question: string;
        explanation: string;
        question_vi: string;
        explanation_vi: string;
        image: string | null;
    }>;
}

// Map of subcategory data
const subcategoryDataMap: { [key: string]: HistorySubcategory } = {
    local_gov: localGovData,
    monarchy: monarchyData,
    revolution: revolutionData,
    wars: warsData,
    republic: republicData,
    democracy: democracyData,
    economy: economyData,
    culture: cultureData,
    arts: artsData,
    celebrities: celebritiesData,
    sports: sportsData,
    holidays: holidaysData,
};

// Define the language type and context type
export type Language = 'fr' | 'vi';

// Interfaces for the actual structure of our JSON files
interface JsonQuestion {
    id: number;
    question: string;
    question_vi?: string;
    explanation: string;
    explanation_vi?: string;
    image?: string | null;
}

interface JsonCategory {
    id: string;
    title: string;
    title_vi: string;
    icon: string;
    description: string;
    description_vi: string;
    questions: JsonQuestion[];
}

// Types for French questions data
export type FrenchQuestion = {
    id: number;
    question: string;
    explanation: string;
    image?: string | null;
};

export type FrenchCategory = {
    id: string;
    title: string;
    icon: string;
    description: string;
    questions: FrenchQuestion[];
};

export type FrenchQuestionsData = {
    categories: FrenchCategory[];
};

// Types for multilingual questions data
export type MultiLangText = {
    fr: string;
    vi: string;
};

export type MultiLangQuestion = {
    id: number;
    question: MultiLangText;
    explanation: MultiLangText;
    image?: string | null;
};

export type MultiLangCategory = {
    id: string;
    title: string;
    title_vi: string;
    icon: string;
    description: string;
    description_vi: string;
    questions: MultiLangQuestion[];
};

export type MultiLangQuestionsData = {
    categories: MultiLangCategory[];
};

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    questionsData: FrenchQuestionsData | MultiLangQuestionsData;
    isTranslationLoaded: boolean;
    historyCategories: HistoryCategory;
    historySubcategories: { [key: string]: HistorySubcategory };
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => { },
    toggleLanguage: () => { },
    questionsData: { categories: [] } as FrenchQuestionsData,
    isTranslationLoaded: false,
    historyCategories: historyData as HistoryCategory,
    historySubcategories: subcategoryDataMap,
});

// Create a provider component that will wrap the app
type LanguageProviderProps = {
    children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');
    const [questionsData, setQuestionsData] = useState<FrenchQuestionsData | MultiLangQuestionsData>(
        { categories: [] } as FrenchQuestionsData
    );
    const [isTranslationLoaded, setIsTranslationLoaded] = useState(false);

    // When language changes, update the questions data
    useEffect(() => {
        if (language === 'fr') {
            // Combine all French category data
            const frenchData: FrenchQuestionsData = {
                categories: [
                    personal_fr_vi as unknown as FrenchCategory,
                    geography_fr_vi as unknown as FrenchCategory,
                ]
            };
            setQuestionsData(frenchData);
            setIsTranslationLoaded(false);

            // Preload images when data changes
            preloadImages(frenchData);
        } else {
            // Safety casting our JSON data to ensure correct types
            const personalFr = personal_fr_vi as unknown as JsonCategory;
            const geographyFr = geography_fr_vi as unknown as JsonCategory;

            // Merge French and Vietnamese data
            const mergedData: MultiLangQuestionsData = {
                categories: [
                    {
                        ...personalFr,
                        title_vi: personalFr.title_vi,
                        description_vi: personalFr.description_vi,
                        questions: personalFr.questions.map((question) => {
                            const multiLangQuestion: MultiLangQuestion = {
                                id: question.id,
                                question: {
                                    fr: question.question,
                                    vi: question.question_vi || ''
                                },
                                explanation: {
                                    fr: question.explanation,
                                    vi: question.explanation_vi || ''
                                }
                            };

                            if (question.image !== undefined) {
                                multiLangQuestion.image = question.image;
                            }

                            return multiLangQuestion;
                        })
                    },
                    {
                        ...geographyFr,
                        title_vi: geographyFr.title_vi,
                        description_vi: geographyFr.description_vi,
                        questions: geographyFr.questions.map((question) => {
                            const multiLangQuestion: MultiLangQuestion = {
                                id: question.id,
                                question: {
                                    fr: question.question,
                                    vi: question.question_vi || ''
                                },
                                explanation: {
                                    fr: question.explanation,
                                    vi: question.explanation_vi || ''
                                }
                            };

                            if (question.image !== undefined) {
                                multiLangQuestion.image = question.image;
                            }

                            return multiLangQuestion;
                        })
                    }
                ]
            };

            setQuestionsData(mergedData);
            setIsTranslationLoaded(true);

            // Preload images when data changes
            preloadImages(mergedData);
        }
    }, [language]);

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
            historyCategories: historyData as HistoryCategory,
            historySubcategories: subcategoryDataMap
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Create a custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;