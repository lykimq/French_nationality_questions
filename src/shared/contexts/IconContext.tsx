import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { IconSetType, IconMapping, JsonIconMapping } from '../../types';
import { iconSets, jsonIconSets, jsonIconColors } from '../../config/iconConfig';

const DEFAULT_ICON_SET: IconSetType = 'filled';

// Context interface
interface IconContextType {
    iconSet: IconSetType;
    icons: IconMapping;
    jsonIconSet: IconSetType;
    jsonIcons: JsonIconMapping;
    getIconName: (iconKey: keyof IconMapping) => string;
    getJsonIconName: (iconKey: keyof JsonIconMapping | string) => string;
    getJsonIconColor: (iconKey: keyof JsonIconMapping | string) => string;
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

// Icon provider component
interface IconProviderProps {
    children: ReactNode;
}

export const IconProvider: React.FC<IconProviderProps> = ({ children }) => {
    const iconSet = DEFAULT_ICON_SET;
    const jsonIconSet = DEFAULT_ICON_SET;

    const getIconName = useCallback((iconKey: keyof IconMapping): string => {
        return iconSets[iconSet][iconKey];
    }, []);

    const getJsonIconName = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        if (iconKey in jsonIconSets[jsonIconSet]) {
            return jsonIconSets[jsonIconSet][iconKey as keyof JsonIconMapping];
        }
        return jsonIconSets[jsonIconSet].default;
    }, []);

    const getJsonIconColor = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        if (iconKey in jsonIconColors) {
            return jsonIconColors[iconKey as keyof JsonIconMapping];
        }
        return jsonIconColors.default;
    }, []);

    const value = useMemo<IconContextType>(() => ({
        iconSet,
        icons: iconSets[iconSet],
        jsonIconSet,
        jsonIcons: jsonIconSets[jsonIconSet],
        getIconName,
        getJsonIconName,
        getJsonIconColor,
    }), [
        getIconName,
        getJsonIconName,
        getJsonIconColor,
    ]);

    return (
        <IconContext.Provider value={value}>
            {children}
        </IconContext.Provider>
    );
};

export default IconProvider;