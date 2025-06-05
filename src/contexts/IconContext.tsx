import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IconSetType, IconMapping, JsonIconMapping, JsonIconColorMapping, IconSetInfo } from '../types';

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
        analytics: 'analytics-outline',
        helpCircle: 'help-circle-outline',
        time: 'time-outline',
        checkmark: 'checkmark-outline',
        checkmarkCircle: 'checkmark-circle-outline',
        play: 'play-outline',
        trophy: 'trophy-outline',
        eye: 'eye-outline',
        bulb: 'bulb-outline',
        alertCircle: 'alert-circle-outline',
        trendingUp: 'trending-up-outline',
        shuffle: 'shuffle-outline',
        bug: 'bug-outline',
        grid: 'grid-outline',
        flash: 'flash-outline',
        people: 'people-outline',
        chatbox: 'chatbox-outline',
        arrowBack: 'arrow-back-outline',
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
        people: 'people-circle',
        chatbox: 'chatbox',
        arrowBack: 'arrow-back',
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
        analytics: 'analytics-sharp',
        helpCircle: 'help-circle-sharp',
        time: 'time-sharp',
        checkmark: 'checkmark-sharp',
        checkmarkCircle: 'checkmark-circle-sharp',
        play: 'play-sharp',
        trophy: 'trophy-sharp',
        eye: 'eye-sharp',
        bulb: 'bulb-sharp',
        alertCircle: 'alert-circle-sharp',
        trendingUp: 'trending-up-sharp',
        shuffle: 'shuffle-sharp',
        bug: 'bug-sharp',
        grid: 'grid-sharp',
        flash: 'flash-sharp',
        people: 'people-sharp',
        chatbox: 'chatbox-sharp',
        arrowBack: 'arrow-back-sharp',
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

// Vibrant colors for JSON category icons - modern and Gen Z friendly
const jsonIconColors: JsonIconColorMapping = {
    map: '#00B4D8',        // Ocean blue for geography
    person: '#9D4EDD',     // Purple for personal
    book: '#F77F00',       // Orange for history/books
    business: '#06D6A0',   // Emerald for business/government
    star: '#FFD60A',       // Gold for monarchy/star
    flag: '#EF476F',       // Red/pink for revolution
    shield: '#118AB2',     // Navy blue for wars/shield
    people: '#F72585',     // Hot pink for democracy/people
    cash: '#43AA8B',       // Green for economy/money
    library: '#7209B7',    // Deep purple for culture/library
    brush: '#FF006E',      // Bright magenta for arts/creativity
    football: '#FB5607',   // Energetic orange for sports
    calendar: '#8338EC',   // Purple for holidays/events
    default: '#6C757D',    // Gray for fallback
};

// Icon set metadata for display - using imported type

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

    // Get vibrant color for JSON category icons
    const getJsonIconColor = (iconKey: keyof JsonIconMapping | string): string => {
        // If the iconKey exists in our color mapping, use it
        if (iconKey in jsonIconColors) {
            return jsonIconColors[iconKey as keyof JsonIconMapping];
        }
        // Otherwise, return the default fallback color
        return jsonIconColors.default;
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
        getJsonIconColor,
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