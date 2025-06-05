import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IconSetType, IconMapping, JsonIconMapping } from '../types';
import { iconSets, jsonIconSets, jsonIconColors, iconSetOptions } from '../config/iconConfig';

// Storage keys
const STORAGE_KEYS = {
    ICON_SET: '@french_app_iconset',
    JSON_ICON_SET: '@french_app_json_iconset',
} as const;

// Context interface
interface IconContextType {
    iconSet: IconSetType;
    icons: IconMapping;
    jsonIconSet: IconSetType;
    jsonIcons: JsonIconMapping;
    setIconSet: (iconSet: IconSetType) => void;
    setJsonIconSet: (iconSet: IconSetType) => void;
    getIconName: (iconKey: keyof IconMapping) => string;
    getJsonIconName: (iconKey: keyof JsonIconMapping | string) => string;
    getJsonIconColor: (iconKey: keyof JsonIconMapping | string) => string;
    isLoading: boolean;
}

// Create context
const IconContext = createContext<IconContextType | undefined>(undefined);

// Custom hook to use icons
export const useIcons = (): IconContextType => {
    const context = useContext(IconContext);
    if (!context) {
        throw new Error('useIcons must be used within an IconProvider');
    }
    return context;
};

// Storage utility functions
const storageUtils = {
    async loadIconSets(): Promise<{ iconSet: IconSetType; jsonIconSet: IconSetType }> {
        try {
            const [savedIconSet, savedJsonIconSet] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.ICON_SET),
                AsyncStorage.getItem(STORAGE_KEYS.JSON_ICON_SET)
            ]);

            const isValidIconSet = (set: string | null): set is IconSetType =>
                set !== null && Object.keys(iconSets).includes(set);

            return {
                iconSet: isValidIconSet(savedIconSet) ? savedIconSet : 'filled',
                jsonIconSet: isValidIconSet(savedJsonIconSet) ? savedJsonIconSet : 'filled'
            };
        } catch (error) {
            console.error('Error loading icon sets:', error);
            return { iconSet: 'filled', jsonIconSet: 'filled' };
        }
    },

    async saveIconSet(key: keyof typeof STORAGE_KEYS, iconSet: IconSetType): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS[key], iconSet);
        } catch (error) {
            console.error(`Error saving ${key.toLowerCase()}:`, error);
            // Non-critical error, app continues to function
        }
    }
};

// Icon provider component
interface IconProviderProps {
    children: ReactNode;
}

export const IconProvider: React.FC<IconProviderProps> = ({ children }) => {
    const [iconSet, setIconSetState] = useState<IconSetType>('filled');
    const [jsonIconSet, setJsonIconSetState] = useState<IconSetType>('filled');
    const [isLoading, setIsLoading] = useState(true);

    // Use ref to track if component is mounted to prevent state updates after unmount
    const isMountedRef = useRef(true);

    // Load icon sets from storage on mount
    useEffect(() => {
        const loadIconSets = async () => {
            try {
                const { iconSet: savedIconSet, jsonIconSet: savedJsonIconSet } =
                    await storageUtils.loadIconSets();

                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    setIconSetState(savedIconSet);
                    setJsonIconSetState(savedJsonIconSet);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error in loadIconSets:', error);
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        };

        loadIconSets();

        // Cleanup function to prevent memory leaks
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Memoized setters to prevent unnecessary re-renders
    const setIconSet = useCallback(async (newIconSet: IconSetType) => {
        setIconSetState(newIconSet);
        await storageUtils.saveIconSet('ICON_SET', newIconSet);
    }, []);

    const setJsonIconSet = useCallback(async (newIconSet: IconSetType) => {
        setJsonIconSetState(newIconSet);
        await storageUtils.saveIconSet('JSON_ICON_SET', newIconSet);
    }, []);

    // Memoized getter functions
    const getIconName = useCallback((iconKey: keyof IconMapping): string => {
        return iconSets[iconSet][iconKey];
    }, [iconSet]);

    const getJsonIconName = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        if (iconKey in jsonIconSets[jsonIconSet]) {
            return jsonIconSets[jsonIconSet][iconKey as keyof JsonIconMapping];
        }
        return jsonIconSets[jsonIconSet].default;
    }, [jsonIconSet]);

    const getJsonIconColor = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        if (iconKey in jsonIconColors) {
            return jsonIconColors[iconKey as keyof JsonIconMapping];
        }
        return jsonIconColors.default;
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo<IconContextType>(() => ({
        iconSet,
        icons: iconSets[iconSet],
        jsonIconSet,
        jsonIcons: jsonIconSets[jsonIconSet],
        setIconSet,
        setJsonIconSet,
        getIconName,
        getJsonIconName,
        getJsonIconColor,
        isLoading,
    }), [
        iconSet,
        jsonIconSet,
        setIconSet,
        setJsonIconSet,
        getIconName,
        getJsonIconName,
        getJsonIconColor,
        isLoading,
    ]);

    return (
        <IconContext.Provider value={value}>
            {children}
        </IconContext.Provider>
    );
};

export default IconProvider;
export { iconSetOptions };