import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TextFormattingSettings {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    letterSpacing: number;
}

interface TextFormattingContextType {
    settings: TextFormattingSettings;
    updateFontSize: (size: number) => void;
    updateFontFamily: (family: string) => void;
    updateLineHeight: (height: number) => void;
    updateLetterSpacing: (spacing: number) => void;
    resetToDefaults: () => void;
}

const defaultSettings: TextFormattingSettings = {
    fontSize: 16,
    fontFamily: 'System',
    lineHeight: 1.4,
    letterSpacing: 0,
};

const STORAGE_KEY = '@text_formatting_settings';

const TextFormattingContext = createContext<TextFormattingContextType | undefined>(undefined);

export const TextFormattingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<TextFormattingSettings>(defaultSettings);

    // Load settings from storage on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                setSettings(parsedSettings);
            }
        } catch (error) {
            console.error('Failed to load text formatting settings:', error);
        }
    };

    const saveSettings = async (newSettings: TextFormattingSettings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Failed to save text formatting settings:', error);
            // Still update the state even if storage fails
            setSettings(newSettings);
        }
    };

    const updateFontSize = (size: number) => {
        const newSettings = { ...settings, fontSize: size };
        saveSettings(newSettings);
    };

    const updateFontFamily = (family: string) => {
        const newSettings = { ...settings, fontFamily: family };
        saveSettings(newSettings);
    };

    const updateLineHeight = (height: number) => {
        const newSettings = { ...settings, lineHeight: height };
        saveSettings(newSettings);
    };

    const updateLetterSpacing = (spacing: number) => {
        const newSettings = { ...settings, letterSpacing: spacing };
        saveSettings(newSettings);
    };

    const resetToDefaults = () => {
        saveSettings(defaultSettings);
    };

    const value: TextFormattingContextType = {
        settings,
        updateFontSize,
        updateFontFamily,
        updateLineHeight,
        updateLetterSpacing,
        resetToDefaults,
    };

    return (
        <TextFormattingContext.Provider value={value}>
            {children}
        </TextFormattingContext.Provider>
    );
};

export const useTextFormatting = () => {
    const context = useContext(TextFormattingContext);
    if (!context) {
        throw new Error('useTextFormatting must be used within a TextFormattingProvider');
    }
    return context;
};

export const getTextStyles = (settings: TextFormattingSettings) => {
    const styles = {
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily === 'System' ? undefined : settings.fontFamily,
        lineHeight: settings.fontSize * settings.lineHeight,
        letterSpacing: settings.letterSpacing,
    };

    return styles;
};