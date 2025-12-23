import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { IconMapping, JsonIconMapping, Icon3DVariant } from '../../types';
import { iconSets, jsonIconSets, jsonIconColors, iconVariantMap, jsonIconVariantMap } from '../../config/iconConfig';

const iconNameToKeyMap: Record<string, keyof JsonIconMapping> = {
    'office-building': 'business',
    'scale': 'shield',
    'user': 'person',
    'government': 'library',
    'history': 'book',
    'music-note': 'brush',
    'balance': 'people',
    'globe': 'star',
    'map': 'map',
    'flag': 'flag',
};

interface IconContextType {
    icons: IconMapping;
    jsonIcons: JsonIconMapping;
    getIconName: (iconKey: keyof IconMapping) => string;
    getJsonIconName: (iconKey: keyof JsonIconMapping | string) => string;
    getJsonIconColor: (iconKey: keyof JsonIconMapping | string) => string;
    getIconVariant: (iconKey: keyof IconMapping) => Icon3DVariant;
    getJsonIconVariant: (iconKey: keyof JsonIconMapping | string) => Icon3DVariant;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export const useIcons = (): IconContextType => {
    const context = useContext(IconContext);
    if (!context) {
        throw new Error('useIcons must be used within an IconProvider');
    }
    return context;
};

interface IconProviderProps {
    children: ReactNode;
}

export const IconProvider: React.FC<IconProviderProps> = ({ children }) => {
    const getIconName = useCallback((iconKey: keyof IconMapping): string => {
        return iconSets[iconKey];
    }, []);

    const getJsonIconName = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        const mappedKey = iconNameToKeyMap[iconKey] || iconKey;
        
        if (mappedKey in jsonIconSets) {
            return jsonIconSets[mappedKey as keyof JsonIconMapping];
        }
        return jsonIconSets.default;
    }, []);

    const getJsonIconColor = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        const mappedKey = iconNameToKeyMap[iconKey] || iconKey;
        
        if (mappedKey in jsonIconColors) {
            return jsonIconColors[mappedKey as keyof JsonIconMapping];
        }
        return jsonIconColors.default;
    }, []);

    const getIconVariant = useCallback((iconKey: keyof IconMapping): Icon3DVariant => {
        return iconVariantMap[iconKey] || 'default';
    }, []);

    const getJsonIconVariant = useCallback((iconKey: keyof JsonIconMapping | string): Icon3DVariant => {
        const mappedKey = iconNameToKeyMap[iconKey] || iconKey;
        
        if (mappedKey in jsonIconVariantMap) {
            return jsonIconVariantMap[mappedKey as keyof JsonIconMapping];
        }
        return jsonIconVariantMap.default;
    }, []);

    const value = useMemo<IconContextType>(() => ({
        icons: iconSets,
        jsonIcons: jsonIconSets,
        getIconName,
        getJsonIconName,
        getJsonIconColor,
        getIconVariant,
        getJsonIconVariant,
    }), [
        getIconName,
        getJsonIconName,
        getJsonIconColor,
        getIconVariant,
        getJsonIconVariant,
    ]);

    return (
        <IconContext.Provider value={value}>
            {children}
        </IconContext.Provider>
    );
};

export default IconProvider;
