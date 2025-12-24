// Theme types
export type ThemeMode = 'light' | 'dark';
export type ColorTheme = 'classic' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'coral' | 'midnight' | 'neon';

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
    accent: string;
    accentLight: string;

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

    // New vibrant colors for Gen Z appeal
    vibrant1: string;
    vibrant2: string;
    vibrant3: string;
    gradient1: string;
    gradient2: string;
}

export interface ColorThemeInfo {
    id: ColorTheme;
    name: string;
    description: string;
    primaryColor: string;
    accentColor: string;
    isGradient?: boolean;
}

export interface Theme {
    mode: ThemeMode;
    colorTheme: ColorTheme;
    colors: ThemeColors;
}

// 3D Icon variant types
export type Icon3DVariant = 'default' | 'gradient' | 'elevated' | 'neon' | 'glass';

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

    // Test screen specific icons
    analytics: string;
    helpCircle: string;
    time: string;
    checkmark: string;
    checkmarkCircle: string;
    play: string;
    trophy: string;
    eye: string;
    bulb: string;
    alertCircle: string;
    trendingUp: string;
    shuffle: string;
    bug: string;
    grid: string;
    flash: string;
    people: string;
    chatbox: string;
    arrowBack: string;
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

// Vibrant color mapping for JSON category icons
export interface JsonIconColorMapping {
    map: string;           // geography - blue/teal
    person: string;        // personal - purple/pink
    book: string;          // history - amber/orange
    business: string;      // local_gov, republic - green
    star: string;          // monarchy - gold/yellow
    flag: string;          // revolution - red
    shield: string;        // wars - dark blue/navy
    people: string;        // democracy, celebrities - pink/magenta
    cash: string;          // economy - green/emerald
    library: string;       // culture - purple
    brush: string;         // arts - rainbow/creative colors
    football: string;      // sports - energetic orange/red
    calendar: string;      // holidays - festive colors
    default: string;       // fallback color
}

// 3D Icon style information for UI display
export interface Icon3DStyleInfo {
    id: Icon3DVariant;
    name: string;
    description: string;
}

