import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the language type and context type
type Language = 'fr' | 'vi';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => { },
    toggleLanguage: () => { },
});

// Create a provider component that will wrap the app
type LanguageProviderProps = {
    children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'fr' ? 'vi' : 'fr'));
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Create a custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;