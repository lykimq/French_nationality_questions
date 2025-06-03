import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
    // Background colors
    background: string;
    surface: string;
    card: string;

    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;

    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // UI element colors
    border: string;
    divider: string;
    overlay: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Interactive elements
    buttonBackground: string;
    buttonText: string;
    switchTrack: string;
    switchThumb: string;

    // Question card specific
    questionCardBackground: string;
    questionCardBorder: string;
    questionIdBackground: string;

    // Header colors
    headerBackground: string;
    headerText: string;

    // Modal colors
    modalBackground: string;
    modalOverlay: string;
}

export interface ThemeIcons {
    // Navigation icons
    home: string;
    search: string;
    settings: string;
    categories: string;

    // Action icons
    chevronDown: string;
    chevronUp: string;
    chevronForward: string;
    chevronBack: string;
    close: string;

    // Feature icons
    language: string;
    textFormat: string;
    share: string;
    star: string;
    info: string;
    refresh: string;

    // Theme specific icons
    sun: string;
    moon: string;
    palette: string;

    // Question related icons
    image: string;
    expand: string;
    collapse: string;
}

export interface Theme {
    mode: ThemeMode;
    colors: ThemeColors;
    icons: ThemeIcons;
}

// Light theme configuration
const lightTheme: Theme = {
    mode: 'light',
    colors: {
        background: '#F5F5F5',
        surface: '#FFFFFF',
        card: '#FFFFFF',

        text: '#333333',
        textSecondary: '#666666',
        textMuted: '#999999',

        primary: '#3F51B5',
        primaryLight: '#7986CB',
        primaryDark: '#303F9F',

        border: '#E0E0E0',
        divider: '#F0F0F0',
        overlay: 'rgba(0, 0, 0, 0.5)',

        success: '#4CAF50',
        warning: '#FF9800',
        error: '#FF5722',
        info: '#2196F3',

        buttonBackground: '#3F51B5',
        buttonText: '#FFFFFF',
        switchTrack: '#CCCCCC',
        switchThumb: '#FFFFFF',

        questionCardBackground: '#FFFFFF',
        questionCardBorder: '#F0F0F0',
        questionIdBackground: '#F0F0F0',

        headerBackground: '#3F51B5',
        headerText: '#FFFFFF',

        modalBackground: '#FFFFFF',
        modalOverlay: 'rgba(0, 0, 0, 0.5)',
    },
    icons: {
        home: 'home',
        search: 'search',
        settings: 'settings',
        categories: 'grid',

        chevronDown: 'chevron-down',
        chevronUp: 'chevron-up',
        chevronForward: 'chevron-forward',
        chevronBack: 'chevron-back',
        close: 'close',

        language: 'language',
        textFormat: 'text',
        share: 'share-social',
        star: 'star',
        info: 'information-circle',
        refresh: 'refresh',

        sun: 'sunny',
        moon: 'moon',
        palette: 'color-palette',

        image: 'image',
        expand: 'expand',
        collapse: 'contract',
    },
};

// Dark theme configuration
const darkTheme: Theme = {
    mode: 'dark',
    colors: {
        background: '#121212',
        surface: '#1E1E1E',
        card: '#2D2D2D',

        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        textMuted: '#999999',

        primary: '#5C6BC0',
        primaryLight: '#8E99F3',
        primaryDark: '#3F4BA0',

        border: '#404040',
        divider: '#333333',
        overlay: 'rgba(0, 0, 0, 0.7)',

        success: '#66BB6A',
        warning: '#FFA726',
        error: '#EF5350',
        info: '#42A5F5',

        buttonBackground: '#5C6BC0',
        buttonText: '#FFFFFF',
        switchTrack: '#666666',
        switchThumb: '#FFFFFF',

        questionCardBackground: '#2D2D2D',
        questionCardBorder: '#404040',
        questionIdBackground: '#404040',

        headerBackground: '#1E1E1E',
        headerText: '#FFFFFF',

        modalBackground: '#2D2D2D',
        modalOverlay: 'rgba(0, 0, 0, 0.8)',
    },
    icons: {
        home: 'home-outline',
        search: 'search-outline',
        settings: 'settings-outline',
        categories: 'grid-outline',

        chevronDown: 'chevron-down-outline',
        chevronUp: 'chevron-up-outline',
        chevronForward: 'chevron-forward-outline',
        chevronBack: 'chevron-back-outline',
        close: 'close-outline',

        language: 'language-outline',
        textFormat: 'text-outline',
        share: 'share-social-outline',
        star: 'star-outline',
        info: 'information-circle-outline',
        refresh: 'refresh-outline',

        sun: 'sunny-outline',
        moon: 'moon-outline',
        palette: 'color-palette-outline',

        image: 'image-outline',
        expand: 'expand-outline',
        collapse: 'contract-outline',
    },
};

// Context interface
interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme provider component
interface ThemeProviderProps {
    children: ReactNode;
}

const THEME_STORAGE_KEY = '@french_app_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
    const [isLoading, setIsLoading] = useState(true);

    // Load theme from storage on app start
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    setThemeModeState(savedTheme);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, []);

    // Save theme to storage when it changes
    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme:', error);
            // Still update the state even if storage fails
            setThemeModeState(mode);
        }
    };

    const toggleTheme = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

    const value: ThemeContextType = {
        theme: currentTheme,
        themeMode,
        setThemeMode,
        toggleTheme,
    };

    // Don't render children until theme is loaded
    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;