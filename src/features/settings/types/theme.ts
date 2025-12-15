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
    nameVi: string;
    description: string;
    descriptionVi: string;
    primaryColor: string;
    accentColor: string;
    isGradient?: boolean;
}

export interface Theme {
    mode: ThemeMode;
    colorTheme: ColorTheme;
    colors: ThemeColors;
}

