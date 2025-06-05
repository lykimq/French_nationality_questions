import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIcons } from './IconContext';
import type { ThemeMode, ColorTheme, Theme } from '../types';
import type { IconMapping } from '../types/icons';
import { colorThemes, colorThemeInfo } from '../utils/colorThemes';

// Context interface
interface ThemeContextType {
    theme: Theme & { icons: IconMapping };
    themeMode: ThemeMode;
    colorTheme: ColorTheme;
    setThemeMode: (mode: ThemeMode) => void;
    setColorTheme: (colorTheme: ColorTheme) => void;
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
const COLOR_THEME_STORAGE_KEY = '@french_app_color_theme';

// Internal theme provider that requires IconContext
const ThemeProviderInternal: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
    const [colorTheme, setColorThemeState] = useState<ColorTheme>('classic');
    const [isLoading, setIsLoading] = useState(true);

    // Get icons from IconContext with error handling
    let icons: IconMapping;
    try {
        const iconContext = useIcons();
        icons = iconContext.icons;
    } catch (error) {
        console.error('IconContext not available in ThemeProvider:', error);
        // Provide fallback icons to prevent runtime errors
        icons = {
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
            analytics: 'analytics',
            helpCircle: 'help-circle',
            time: 'time',
            checkmark: 'checkmark',
            checkmarkCircle: 'checkmark-circle',
            play: 'play',
            trophy: 'trophy',
            eye: 'eye',
            bulb: 'bulb',
            alertCircle: 'alert-circle',
            trendingUp: 'trending-up',
            shuffle: 'shuffle',
            bug: 'bug',
            grid: 'grid',
            flash: 'flash',
            people: 'people',
            chatbox: 'chatbox',
            arrowBack: 'arrow-back',
        };
    }

    // Load theme from storage on app start
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                const savedColorTheme = await AsyncStorage.getItem(COLOR_THEME_STORAGE_KEY);

                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    setThemeModeState(savedTheme);
                }

                if (savedColorTheme && Object.keys(colorThemes).includes(savedColorTheme)) {
                    setColorThemeState(savedColorTheme as ColorTheme);
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
            setThemeModeState(mode);
        }
    };

    // Save color theme to storage when it changes
    const setColorTheme = async (theme: ColorTheme) => {
        try {
            await AsyncStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
            setColorThemeState(theme);
        } catch (error) {
            console.error('Error saving color theme:', error);
            setColorThemeState(theme);
        }
    };

    const toggleTheme = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    const currentColors = colorThemes[colorTheme][themeMode];
    const currentTheme: Theme = {
        mode: themeMode,
        colorTheme,
        colors: currentColors,
    };

    const value: ThemeContextType = {
        theme: {
            ...currentTheme,
            icons, // Include icons from IconContext
        },
        themeMode,
        colorTheme,
        setThemeMode,
        setColorTheme,
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

// Wrapper that ensures IconContext is available
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    return (
        <ThemeProviderInternal>
            {children}
        </ThemeProviderInternal>
    );
};

// Export the colorThemeInfo for use in other components
export { colorThemeInfo };

export default ThemeProvider;