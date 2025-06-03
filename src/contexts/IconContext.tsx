import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Icon set types
export type IconSetType = 'filled' | 'outlined' | 'rounded' | 'sharp';

// Icon mapping interface for UI elements
export interface IconMapping {
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

// JSON Category icon mapping interface - for Firebase JSON file icons
export interface JsonIconMapping {
    // Category icons from JSON files
    map: string;           // geography
    person: string;        // personal
    book: string;          // history main category
    business: string;      // local_gov, republic
    star: string;          // monarchy
    flag: string;          // revolution
    shield: string;        // wars
    people: string;        // democracy, celebrities
    cash: string;          // economy
    library: string;       // culture
    brush: string;         // arts
    football: string;      // sports
    calendar: string;      // holidays
    default: string;       // fallback icon
}

// Icon set configurations for UI elements
const iconSets: Record<IconSetType, IconMapping> = {
    filled: {
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
    outlined: {
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
    rounded: {
        home: 'home',
        search: 'search-circle',
        settings: 'settings',
        categories: 'apps',
        chevronDown: 'chevron-down-circle',
        chevronUp: 'chevron-up-circle',
        chevronForward: 'chevron-forward-circle',
        chevronBack: 'chevron-back-circle',
        close: 'close-circle',
        language: 'globe',
        textFormat: 'document-text',
        share: 'share',
        star: 'star',
        info: 'help-circle',
        refresh: 'refresh-circle',
        sun: 'sunny',
        moon: 'moon',
        palette: 'color-palette',
        image: 'camera',
        expand: 'resize',
        collapse: 'contract',
    },
    sharp: {
        home: 'home-sharp',
        search: 'search-sharp',
        settings: 'settings-sharp',
        categories: 'grid-sharp',
        chevronDown: 'chevron-down-sharp',
        chevronUp: 'chevron-up-sharp',
        chevronForward: 'chevron-forward-sharp',
        chevronBack: 'chevron-back-sharp',
        close: 'close-sharp',
        language: 'language-sharp',
        textFormat: 'text-sharp',
        share: 'share-social-sharp',
        star: 'star-sharp',
        info: 'information-circle-sharp',
        refresh: 'refresh-sharp',
        sun: 'sunny-sharp',
        moon: 'moon-sharp',
        palette: 'color-palette-sharp',
        image: 'image-sharp',
        expand: 'expand-sharp',
        collapse: 'contract-sharp',
    },
};

// JSON Category icon set configurations
const jsonIconSets: Record<IconSetType, JsonIconMapping> = {
    filled: {
        map: 'map',
        person: 'person',
        book: 'book',
        business: 'business',
        star: 'star',
        flag: 'flag',
        shield: 'shield',
        people: 'people',
        cash: 'cash',
        library: 'library',
        brush: 'brush',
        football: 'football',
        calendar: 'calendar',
        default: 'help-circle',
    },
    outlined: {
        map: 'map-outline',
        person: 'person-outline',
        book: 'book-outline',
        business: 'business-outline',
        star: 'star-outline',
        flag: 'flag-outline',
        shield: 'shield-outline',
        people: 'people-outline',
        cash: 'cash-outline',
        library: 'library-outline',
        brush: 'brush-outline',
        football: 'football-outline',
        calendar: 'calendar-outline',
        default: 'help-circle-outline',
    },
    rounded: {
        map: 'location',
        person: 'person-circle',
        book: 'library',
        business: 'storefront',
        star: 'star',
        flag: 'flag',
        shield: 'medal',
        people: 'people-circle',
        cash: 'card',
        library: 'albums',
        brush: 'color-wand',
        football: 'fitness',
        calendar: 'time',
        default: 'information-circle',
    },
    sharp: {
        map: 'map-sharp',
        person: 'person-sharp',
        book: 'book-sharp',
        business: 'business-sharp',
        star: 'star-sharp',
        flag: 'flag-sharp',
        shield: 'shield-sharp',
        people: 'people-sharp',
        cash: 'cash-sharp',
        library: 'library-sharp',
        brush: 'brush-sharp',
        football: 'football-sharp',
        calendar: 'calendar-sharp',
        default: 'help-circle-sharp',
    },
};

// Icon set metadata for display
export interface IconSetInfo {
    id: IconSetType;
    name: string;
    nameVi: string;
    description: string;
    descriptionVi: string;
    previewIcon: string;
}

export const iconSetOptions: IconSetInfo[] = [
    {
        id: 'filled',
        name: 'Rempli',
        nameVi: 'Đặc',
        description: 'Icônes pleines et audacieuses',
        descriptionVi: 'Biểu tượng đặc và đậm',
        previewIcon: 'star',
    },
    {
        id: 'outlined',
        name: 'Esquissé',
        nameVi: 'Viền',
        description: 'Icônes avec contours simples',
        descriptionVi: 'Biểu tượng có viền đơn giản',
        previewIcon: 'star-outline',
    },
    {
        id: 'rounded',
        name: 'Arrondi',
        nameVi: 'Bo tròn',
        description: 'Icônes avec des coins arrondis',
        descriptionVi: 'Biểu tượng có góc bo tròn',
        previewIcon: 'star',
    },
    {
        id: 'sharp',
        name: 'Angulaire',
        nameVi: 'Góc cạnh',
        description: 'Icônes avec des bords nets',
        descriptionVi: 'Biểu tượng có cạnh sắc nét',
        previewIcon: 'star-sharp',
    },
];

// Extended Context interface
interface IconContextType {
    iconSet: IconSetType;
    icons: IconMapping;
    jsonIconSet: IconSetType;
    jsonIcons: JsonIconMapping;
    setIconSet: (iconSet: IconSetType) => void;
    setJsonIconSet: (iconSet: IconSetType) => void;
    getIconName: (iconKey: keyof IconMapping) => string;
    getJsonIconName: (iconKey: keyof JsonIconMapping | string) => string;
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

const ICON_SET_STORAGE_KEY = '@french_app_iconset';
const JSON_ICON_SET_STORAGE_KEY = '@french_app_json_iconset';

export const IconProvider: React.FC<IconProviderProps> = ({ children }) => {
    const [iconSet, setIconSetState] = useState<IconSetType>('filled');
    const [jsonIconSet, setJsonIconSetState] = useState<IconSetType>('filled');
    const [isLoading, setIsLoading] = useState(true);

    // Load both icon sets from storage on app start
    useEffect(() => {
        const loadIconSets = async () => {
            try {
                const [savedIconSet, savedJsonIconSet] = await Promise.all([
                    AsyncStorage.getItem(ICON_SET_STORAGE_KEY),
                    AsyncStorage.getItem(JSON_ICON_SET_STORAGE_KEY)
                ]);

                if (savedIconSet && Object.keys(iconSets).includes(savedIconSet)) {
                    setIconSetState(savedIconSet as IconSetType);
                }

                if (savedJsonIconSet && Object.keys(jsonIconSets).includes(savedJsonIconSet)) {
                    setJsonIconSetState(savedJsonIconSet as IconSetType);
                }
            } catch (error) {
                console.error('Error loading icon sets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadIconSets();
    }, []);

    // Save UI icon set to storage when it changes
    const setIconSet = async (newIconSet: IconSetType) => {
        try {
            await AsyncStorage.setItem(ICON_SET_STORAGE_KEY, newIconSet);
            setIconSetState(newIconSet);
        } catch (error) {
            console.error('Error saving icon set:', error);
            setIconSetState(newIconSet);
        }
    };

    // Save JSON icon set to storage when it changes
    const setJsonIconSet = async (newIconSet: IconSetType) => {
        try {
            await AsyncStorage.setItem(JSON_ICON_SET_STORAGE_KEY, newIconSet);
            setJsonIconSetState(newIconSet);
        } catch (error) {
            console.error('Error saving JSON icon set:', error);
            setJsonIconSetState(newIconSet);
        }
    };

    // Get specific icon name from current UI icon set
    const getIconName = (iconKey: keyof IconMapping): string => {
        return iconSets[iconSet][iconKey];
    };

    // Get specific JSON icon name from current JSON icon set
    const getJsonIconName = (iconKey: keyof JsonIconMapping | string): string => {
        // If the iconKey exists in our mapping, use it
        if (iconKey in jsonIconSets[jsonIconSet]) {
            return jsonIconSets[jsonIconSet][iconKey as keyof JsonIconMapping];
        }
        // Otherwise, return the default fallback
        return jsonIconSets[jsonIconSet].default;
    };

    const value: IconContextType = {
        iconSet,
        icons: iconSets[iconSet],
        jsonIconSet,
        jsonIcons: jsonIconSets[jsonIconSet],
        setIconSet,
        setJsonIconSet,
        getIconName,
        getJsonIconName,
    };

    // Don't render children until icon sets are loaded
    if (isLoading) {
        return null;
    }

    return (
        <IconContext.Provider value={value}>
            {children}
        </IconContext.Provider>
    );
};

export default IconProvider;