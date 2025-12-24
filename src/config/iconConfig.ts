import type { IconMapping, JsonIconMapping, JsonIconColorMapping, Icon3DVariant } from '../types';

// Modern 3D icon variants for the application
export const icon3DVariants: Record<string, Icon3DVariant> = {
    navigation: 'gradient',
    category: 'elevated',
    action: 'glass',
    feature: 'glass',
    status: 'neon',
};

// Base icon names with modern Ionicons
const baseIcons = {
    home: 'home',
    search: 'search',
    settings: 'settings',
    categories: 'grid',
    chevronDown: 'chevron-down',
    chevronUp: 'chevron-up',
    chevronForward: 'chevron-forward',
    chevronBack: 'chevron-back',
    close: 'close',
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
} as const;

// Modern icon configurations
export const iconSets: IconMapping = baseIcons;

// JSON category icons with modern design
export const jsonIconSets: JsonIconMapping = {
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
};

// Modern vibrant colors with 3D-friendly palettes
export const jsonIconColors: JsonIconColorMapping = {
    map: '#00B4D8',
    person: '#9D4EDD',
    book: '#F77F00',
    business: '#06D6A0',
    star: '#FFD60A',
    flag: '#EF476F',
    shield: '#118AB2',
    people: '#F72585',
    cash: '#43AA8B',
    library: '#7209B7',
    brush: '#FF006E',
    football: '#FB5607',
    calendar: '#8338EC',
    default: '#6C757D',
};

// 3D variant assignments for different icon types
export const iconVariantMap: Record<keyof IconMapping, Icon3DVariant> = {
    home: 'gradient',
    search: 'glass',
    settings: 'elevated',
    categories: 'elevated',
    chevronDown: 'default',
    chevronUp: 'default',
    chevronForward: 'default',
    chevronBack: 'default',
    close: 'glass',
    textFormat: 'glass',
    share: 'elevated',
    star: 'neon',
    info: 'glass',
    refresh: 'glass',
    sun: 'neon',
    moon: 'neon',
    palette: 'gradient',
    image: 'glass',
    expand: 'default',
    collapse: 'default',
    analytics: 'gradient',
    helpCircle: 'glass',
    time: 'glass',
    checkmark: 'elevated',
    checkmarkCircle: 'elevated',
    play: 'gradient',
    trophy: 'neon',
    eye: 'glass',
    bulb: 'neon',
    alertCircle: 'elevated',
    trendingUp: 'gradient',
    shuffle: 'glass',
    bug: 'glass',
    grid: 'elevated',
    flash: 'neon',
    people: 'elevated',
    chatbox: 'glass',
    arrowBack: 'default',
};

// 3D variant assignments for JSON category icons
export const jsonIconVariantMap: Record<keyof JsonIconMapping, Icon3DVariant> = {
    map: 'elevated',
    person: 'elevated',
    book: 'elevated',
    business: 'elevated',
    star: 'elevated',
    flag: 'elevated',
    shield: 'elevated',
    people: 'elevated',
    cash: 'elevated',
    library: 'elevated',
    brush: 'elevated',
    football: 'elevated',
    calendar: 'elevated',
    default: 'glass',
};

// 3D icon style metadata
export const icon3DStyleOptions: Array<{ id: Icon3DVariant; name: string; description: string }> = [
    {
        id: 'default',
        name: 'Simple',
        description: 'Style moderne et épuré',
    },
    {
        id: 'gradient',
        name: 'Dégradé',
        description: 'Effet de dégradé 3D vibrant',
    },
    {
        id: 'elevated',
        name: 'Élevé',
        description: 'Effet de profondeur et d\'ombre',
    },
    {
        id: 'neon',
        name: 'Néon',
        description: 'Effet lumineux néon moderne',
    },
    {
        id: 'glass',
        name: 'Verre',
        description: 'Effet glassmorphism transparent',
    },
];