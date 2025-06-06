import React, { useContext } from 'react';

// Remove the DisplaySettingsContext since we'll only use slide mode
export const DisplaySettingsContext = React.createContext({
    isSlideMode: true, // Always true now
    toggleSlideMode: () => { },
});

export const useDisplaySettings = () => useContext(DisplaySettingsContext);

interface DisplaySettingsProviderProps {
    children: React.ReactNode;
}

export const DisplaySettingsProvider: React.FC<DisplaySettingsProviderProps> = ({ children }) => {
    // Always use slide mode
    const isSlideMode = true;
    const toggleSlideMode = () => { }; // No-op since we always use slide mode

    return (
        <DisplaySettingsContext.Provider value={{ isSlideMode, toggleSlideMode }}>
            {children}
        </DisplaySettingsContext.Provider>
    );
};