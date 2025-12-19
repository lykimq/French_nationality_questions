import React, { useContext } from 'react';

export const DisplaySettingsContext = React.createContext({
    isSlideMode: true,
    toggleSlideMode: () => { },
});

export const useDisplaySettings = () => useContext(DisplaySettingsContext);

interface DisplaySettingsProviderProps {
    children: React.ReactNode;
}

export const DisplaySettingsProvider: React.FC<DisplaySettingsProviderProps> = ({ children }) => {
    const isSlideMode = true;
    const toggleSlideMode = () => { };

    return (
        <DisplaySettingsContext.Provider value={{ isSlideMode, toggleSlideMode }}>
            {children}
        </DisplaySettingsContext.Provider>
    );
};