// Icon types
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

// Icon set information for UI display
export interface IconSetInfo {
    id: IconSetType;
    name: string;
    nameVi: string;
    description: string;
    descriptionVi: string;
    previewIcon: string;
}

