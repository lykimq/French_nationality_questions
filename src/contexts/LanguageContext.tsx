import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import frenchQuestionsData from '../data/questions-fr.json';
import vietnameseQuestionsData from '../data/questions-vi.json';

// Define the language type and context type
export type Language = 'fr' | 'vi';

// Types for French questions data
export type FrenchQuestion = {
    id: number;
    question: string;
    answer?: string;
    explanation: string;
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
    answer?: MultiLangText;
    explanation: MultiLangText;
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
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => { },
    toggleLanguage: () => { },
    questionsData: frenchQuestionsData as FrenchQuestionsData,
    isTranslationLoaded: false,
});

// Create a provider component that will wrap the app
type LanguageProviderProps = {
    children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');
    const [questionsData, setQuestionsData] = useState<FrenchQuestionsData | MultiLangQuestionsData>(
        frenchQuestionsData as FrenchQuestionsData
    );
    const [isTranslationLoaded, setIsTranslationLoaded] = useState(false);

    // When language changes, update the questions data
    useEffect(() => {
        if (language === 'fr') {
            setQuestionsData(frenchQuestionsData as FrenchQuestionsData);
            setIsTranslationLoaded(false);
        } else {
            // Merge French and Vietnamese data when Vietnamese is selected
            const frData = frenchQuestionsData as FrenchQuestionsData;
            const viData = vietnameseQuestionsData as FrenchQuestionsData;

            const mergedData: MultiLangQuestionsData = {
                categories: frData.categories.map((frCategory, index) => {
                    const viCategory = viData.categories[index];
                    return {
                        ...frCategory,
                        title_vi: viCategory.title,
                        description_vi: viCategory.description,
                        questions: frCategory.questions.map((frQuestion, qIndex) => {
                            const viQuestion = viCategory.questions[qIndex];
                            return {
                                id: frQuestion.id,
                                question: {
                                    fr: frQuestion.question,
                                    vi: viQuestion.question
                                },
                                answer: frQuestion.answer && viQuestion.answer ? {
                                    fr: frQuestion.answer,
                                    vi: viQuestion.answer
                                } : undefined,
                                explanation: {
                                    fr: frQuestion.explanation,
                                    vi: viQuestion.explanation
                                }
                            };
                        })
                    };
                })
            };

            setQuestionsData(mergedData);
            setIsTranslationLoaded(true);
        }
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'fr' ? 'vi' : 'fr'));
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, questionsData, isTranslationLoaded }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Create a custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;