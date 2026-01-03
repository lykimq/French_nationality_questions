// Light or dark mode selection
export type ThemeMode = 'light' | 'dark';

// Available color theme schemes
export type ColorTheme = 'classic' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'coral' | 'midnight' | 'neon';

// Complete color palette for UI components
// Used by ThemeContext to provide colors throughout the app
export interface ThemeColors {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    border: string;
    divider: string;
    overlay: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    buttonBackground: string;
    buttonText: string;
    switchTrack: string;
    switchThumb: string;
    questionCardBackground: string;
    questionCardBorder: string;
    questionIdBackground: string;
    headerBackground: string;
    headerText: string;
    modalBackground: string;
    modalOverlay: string;
    vibrant1: string;
    vibrant2: string;
    vibrant3: string;
    gradient1: string;
    gradient2: string;
}

// Metadata for color theme selection UI
// Contains display name, description, and preview colors for theme picker
export interface ColorThemeInfo {
    id: ColorTheme;
    name: string;
    description: string;
    primaryColor: string;
    accentColor: string;
    isGradient?: boolean;
}

// Complete theme configuration combining mode, color scheme, and color values
// Used by ThemeContext as the main theme object provided to components
export interface Theme {
    mode: ThemeMode;
    colorTheme: ColorTheme;
    colors: ThemeColors;
}

// Visual style variants for 3D icon rendering
// Used by Icon3D component to apply different visual effects
export type Icon3DVariant = 'default' | 'gradient' | 'elevated' | 'neon' | 'glass';

// Icon name mapping for UI elements (navigation, actions, features)
// Maps icon keys to Ionicons names, used by IconContext to provide icons throughout the app
export interface IconMapping {
    home: string;
    search: string;
    settings: string;
    categories: string;
    chevronDown: string;
    chevronUp: string;
    chevronForward: string;
    chevronBack: string;
    close: string;
    textFormat: string;
    share: string;
    star: string;
    info: string;
    refresh: string;
    sun: string;
    moon: string;
    palette: string;
    image: string;
    expand: string;
    collapse: string;
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

// Icon name mapping for question categories from JSON data files
// Maps category keys to Ionicons names, used to display category icons
export interface JsonIconMapping {
    map: string;
    person: string;
    book: string;
    business: string;
    star: string;
    flag: string;
    shield: string;
    people: string;
    cash: string;
    library: string;
    brush: string;
    football: string;
    calendar: string;
    default: string;
}

// Color values for JSON category icons
// Provides consistent colors for each category type in the UI
export interface JsonIconColorMapping {
    map: string;
    person: string;
    book: string;
    business: string;
    star: string;
    flag: string;
    shield: string;
    people: string;
    cash: string;
    library: string;
    brush: string;
    football: string;
    calendar: string;
    default: string;
}
