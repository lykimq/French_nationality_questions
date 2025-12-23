import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { IconSetType, IconMapping, JsonIconMapping } from '../../types';
import { iconSets, jsonIconSets, jsonIconColors } from '../../config/iconConfig';

const DEFAULT_ICON_SET: IconSetType = 'filled';

// Mapping from JSON file icon names to JsonIconMapping keys
// Each category gets a unique icon to avoid duplicates
const iconNameToKeyMap: Record<string, keyof JsonIconMapping> = {
    'office-building': 'business',      // administration_locale - local administration
    'scale': 'shield',                  // ddhc - rights declaration
    'user': 'person',                   // vie_personnelle_integration - personal
    'government': 'library',            // democratie_politique - democracy/political institutions
    'history': 'book',                  // reperes_historiques - history
    'music-note': 'brush',              // arts_culture_sports - arts/culture
    'balance': 'people',                // droits_devoirs - citizen rights/duties (changed from shield)
    'globe': 'star',                    // france_europe_monde - France in the world (changed from map)
    'map': 'map',                       // geographie_sites - geography
    'flag': 'flag',                     // principes_valeurs - republic values
};

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
        // Map icon name from JSON file to JsonIconMapping key if needed
        const mappedKey = iconNameToKeyMap[iconKey] || iconKey;
        
        if (mappedKey in jsonIconSets[jsonIconSet]) {
            return jsonIconSets[jsonIconSet][mappedKey as keyof JsonIconMapping];
        }
        return jsonIconSets[jsonIconSet].default;
    }, []);

    const getJsonIconColor = useCallback((iconKey: keyof JsonIconMapping | string): string => {
        // Map icon name from JSON file to JsonIconMapping key if needed
        const mappedKey = iconNameToKeyMap[iconKey] || iconKey;
        
        if (mappedKey in jsonIconColors) {
            return jsonIconColors[mappedKey as keyof JsonIconMapping];
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