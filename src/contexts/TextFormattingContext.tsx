import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TextFormattingSettings } from '../types';

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

// Helper function to validate loaded settings
const isValidSettings = (settings: any): settings is TextFormattingSettings => {
    return (
        typeof settings === 'object' &&
        settings !== null &&
        typeof settings.fontSize === 'number' &&
        typeof settings.fontFamily === 'string' &&
        typeof settings.lineHeight === 'number' &&
        typeof settings.letterSpacing === 'number'
    );
};

const TextFormattingContext = createContext<TextFormattingContextType | undefined>(undefined);

export const TextFormattingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<TextFormattingSettings>(defaultSettings);

    // Load settings from storage on mount
    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedSettings && isMounted) {
                    const parsedSettings = JSON.parse(storedSettings);
                    if (isValidSettings(parsedSettings)) {
                        setSettings(parsedSettings);
                    } else {
                        console.warn('Invalid settings format in storage, using defaults');
                    }
                }
            } catch (error) {
                console.error('Failed to load text formatting settings:', error);
            }
        };

        loadSettings();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []);

    const saveSettings = useCallback(async (newSettings: TextFormattingSettings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Failed to save text formatting settings:', error);
            // Still update the state even if storage fails
            setSettings(newSettings);
        }
    }, []);

    // Generic update function to eliminate code duplication
    const updateSetting = useCallback(<K extends keyof TextFormattingSettings>(
        key: K,
        value: TextFormattingSettings[K]
    ) => {
        const newSettings = { ...settings, [key]: value };
        saveSettings(newSettings);
    }, [settings, saveSettings]);

    const updateFontSize = useCallback((size: number) => {
        updateSetting('fontSize', size);
    }, [updateSetting]);

    const updateFontFamily = useCallback((family: string) => {
        updateSetting('fontFamily', family);
    }, [updateSetting]);

    const updateLineHeight = useCallback((height: number) => {
        updateSetting('lineHeight', height);
    }, [updateSetting]);

    const updateLetterSpacing = useCallback((spacing: number) => {
        updateSetting('letterSpacing', spacing);
    }, [updateSetting]);

    const resetToDefaults = useCallback(() => {
        saveSettings(defaultSettings);
    }, [saveSettings]);

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