import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// Import the split JSON files
import history_fr from '../data/history_fr.json';
import history_vi from '../data/history_vi.json';
import geography_fr from '../data/geography_fr.json';
import geography_vi from '../data/geography_vi.json';
import personal_fr from '../data/personal_fr.json';
import personal_vi from '../data/personal_vi.json';

// Define the language type and context type
export type Language = 'fr' | 'vi';

// Interfaces for the actual structure of our JSON files
interface JsonQuestion {
    id: number;
    question: string;
    answer?: string;
    explanation: string;
    image?: string | null;
}

interface JsonCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    questions: JsonQuestion[];
}

// Types for French questions data
export type FrenchQuestion = {
    id: number;
    question: string;
    answer?: string;
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
    answer?: MultiLangText;
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
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => { },
    toggleLanguage: () => { },
    questionsData: { categories: [] } as FrenchQuestionsData,
    isTranslationLoaded: false,
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
                    personal_fr as unknown as FrenchCategory,
                    history_fr as unknown as FrenchCategory,
                    geography_fr as unknown as FrenchCategory,
                ]
            };
            setQuestionsData(frenchData);
            setIsTranslationLoaded(false);
        } else {
            // Safety casting our JSON data to ensure correct types
            const personalFr = personal_fr as unknown as JsonCategory;
            const personalVi = personal_vi as unknown as JsonCategory;
            const historyFr = history_fr as unknown as JsonCategory;
            const historyVi = history_vi as unknown as JsonCategory;
            const geographyFr = geography_fr as unknown as JsonCategory;
            const geographyVi = geography_vi as unknown as JsonCategory;

            // Merge French and Vietnamese data
            const mergedData: MultiLangQuestionsData = {
                categories: [
                    {
                        ...personalFr,
                        title_vi: personalVi.title,
                        description_vi: personalVi.description,
                        questions: personalFr.questions.map((frQuestion, qIndex) => {
                            const viQuestion = personalVi.questions[qIndex];
                            const multiLangQuestion: MultiLangQuestion = {
                                id: frQuestion.id,
                                question: {
                                    fr: frQuestion.question,
                                    vi: viQuestion.question
                                },
                                explanation: {
                                    fr: frQuestion.explanation,
                                    vi: viQuestion.explanation
                                }
                            };

                            // Conditionally add optional properties
                            if (frQuestion.answer && viQuestion.answer) {
                                multiLangQuestion.answer = {
                                    fr: frQuestion.answer,
                                    vi: viQuestion.answer
                                };
                            }

                            if (frQuestion.image !== undefined) {
                                multiLangQuestion.image = frQuestion.image;
                            }

                            return multiLangQuestion;
                        })
                    },
                    {
                        ...historyFr,
                        title_vi: historyVi.title,
                        description_vi: historyVi.description,
                        questions: historyFr.questions.map((frQuestion, qIndex) => {
                            const viQuestion = historyVi.questions[qIndex];
                            const multiLangQuestion: MultiLangQuestion = {
                                id: frQuestion.id,
                                question: {
                                    fr: frQuestion.question,
                                    vi: viQuestion.question
                                },
                                explanation: {
                                    fr: frQuestion.explanation,
                                    vi: viQuestion.explanation
                                }
                            };

                            // Conditionally add optional properties
                            if (frQuestion.answer && viQuestion.answer) {
                                multiLangQuestion.answer = {
                                    fr: frQuestion.answer,
                                    vi: viQuestion.answer
                                };
                            }

                            if (frQuestion.image !== undefined) {
                                multiLangQuestion.image = frQuestion.image;
                            }

                            return multiLangQuestion;
                        })
                    },
                    {
                        ...geographyFr,
                        title_vi: geographyVi.title,
                        description_vi: geographyVi.description,
                        questions: geographyFr.questions.map((frQuestion, qIndex) => {
                            const viQuestion = geographyVi.questions[qIndex];
                            const multiLangQuestion: MultiLangQuestion = {
                                id: frQuestion.id,
                                question: {
                                    fr: frQuestion.question,
                                    vi: viQuestion.question
                                },
                                explanation: {
                                    fr: frQuestion.explanation,
                                    vi: viQuestion.explanation
                                }
                            };

                            // Conditionally add optional properties
                            if (frQuestion.answer && viQuestion.answer) {
                                multiLangQuestion.answer = {
                                    fr: frQuestion.answer,
                                    vi: viQuestion.answer
                                };
                            }

                            if (frQuestion.image !== undefined) {
                                multiLangQuestion.image = frQuestion.image;
                            }

                            return multiLangQuestion;
                        })
                    }
                ]
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