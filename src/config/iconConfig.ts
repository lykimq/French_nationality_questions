import type { IconSetType, IconMapping, JsonIconMapping, JsonIconColorMapping, IconSetInfo } from '../types';

// Base icon names - avoids duplication by programmatically generating variants
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
} as const;

// Function to generate icon sets programmatically to reduce duplication
const generateOutlinedIcons = (base: typeof baseIcons): IconMapping => {
    return Object.entries(base).reduce((acc, [key, value]) => {
        acc[key as keyof IconMapping] = `${value}-outline`;
        return acc;
    }, {} as IconMapping);
};

const generateSharpIcons = (base: typeof baseIcons): IconMapping => {
    return Object.entries(base).reduce((acc, [key, value]) => {
        acc[key as keyof IconMapping] = `${value}-sharp`;
        return acc;
    }, {} as IconMapping);
};

// Icon set configurations for UI elements
export const iconSets: Record<IconSetType, IconMapping> = {
    filled: baseIcons,
    outlined: generateOutlinedIcons(baseIcons),
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
    sharp: generateSharpIcons(baseIcons),
};

// Base JSON category icons
const baseJsonIcons = {
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
} as const;

// Function to generate JSON icon sets programmatically
const generateJsonOutlinedIcons = (base: typeof baseJsonIcons): JsonIconMapping => {
    return Object.entries(base).reduce((acc, [key, value]) => {
        acc[key as keyof JsonIconMapping] = key === 'default' && value === 'help-circle'
            ? 'help-circle-outline'
            : `${value}-outline`;
        return acc;
    }, {} as JsonIconMapping);
};

const generateJsonSharpIcons = (base: typeof baseJsonIcons): JsonIconMapping => {
    return Object.entries(base).reduce((acc, [key, value]) => {
        acc[key as keyof JsonIconMapping] = key === 'default' && value === 'help-circle'
            ? 'help-circle-sharp'
            : `${value}-sharp`;
        return acc;
    }, {} as JsonIconMapping);
};

// JSON Category icon set configurations
export const jsonIconSets: Record<IconSetType, JsonIconMapping> = {
    filled: baseJsonIcons,
    outlined: generateJsonOutlinedIcons(baseJsonIcons),
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
    sharp: generateJsonSharpIcons(baseJsonIcons),
};

// Vibrant colors for JSON category icons - modern and Gen Z friendly
export const jsonIconColors: JsonIconColorMapping = {
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

// Icon set metadata for display
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