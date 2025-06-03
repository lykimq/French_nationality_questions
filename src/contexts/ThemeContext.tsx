import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIcons } from './IconContext';

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

// Color theme configurations
const colorThemes: Record<ColorTheme, { light: ThemeColors; dark: ThemeColors }> = {
    classic: {
        light: {
            background: '#F5F5F5',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#333333',
            textSecondary: '#666666',
            textMuted: '#999999',
            primary: '#3F51B5',
            primaryLight: '#7986CB',
            primaryDark: '#303F9F',
            accent: '#FF4081',
            accentLight: '#FF79B0',
            border: '#E0E0E0',
            divider: '#F0F0F0',
            overlay: 'rgba(0, 0, 0, 0.5)',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#FF5722',
            info: '#2196F3',
            buttonBackground: '#3F51B5',
            buttonText: '#FFFFFF',
            switchTrack: '#CCCCCC',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#F0F0F0',
            questionIdBackground: '#F0F0F0',
            headerBackground: '#3F51B5',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(0, 0, 0, 0.5)',
            vibrant1: '#E91E63',
            vibrant2: '#9C27B0',
            vibrant3: '#3F51B5',
            gradient1: '#3F51B5',
            gradient2: '#E91E63',
        },
        dark: {
            background: '#121212',
            surface: '#1E1E1E',
            card: '#2D2D2D',
            text: '#FFFFFF',
            textSecondary: '#CCCCCC',
            textMuted: '#999999',
            primary: '#5C6BC0',
            primaryLight: '#8E99F3',
            primaryDark: '#3F4BA0',
            accent: '#FF4081',
            accentLight: '#FF79B0',
            border: '#404040',
            divider: '#333333',
            overlay: 'rgba(0, 0, 0, 0.7)',
            success: '#66BB6A',
            warning: '#FFA726',
            error: '#EF5350',
            info: '#42A5F5',
            buttonBackground: '#5C6BC0',
            buttonText: '#FFFFFF',
            switchTrack: '#666666',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#2D2D2D',
            questionCardBorder: '#404040',
            questionIdBackground: '#404040',
            headerBackground: '#1E1E1E',
            headerText: '#FFFFFF',
            modalBackground: '#2D2D2D',
            modalOverlay: 'rgba(0, 0, 0, 0.8)',
            vibrant1: '#F06292',
            vibrant2: '#BA68C8',
            vibrant3: '#7986CB',
            gradient1: '#5C6BC0',
            gradient2: '#F06292',
        },
    },
    ocean: {
        light: {
            background: '#F0F8FF',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#1A365D',
            textSecondary: '#2D3748',
            textMuted: '#718096',
            primary: '#0080FF',
            primaryLight: '#42A5F5',
            primaryDark: '#0056B3',
            accent: '#00D4AA',
            accentLight: '#4FD1C7',
            border: '#E2E8F0',
            divider: '#EDF2F7',
            overlay: 'rgba(26, 54, 93, 0.5)',
            success: '#48BB78',
            warning: '#ED8936',
            error: '#F56565',
            info: '#4299E1',
            buttonBackground: '#0080FF',
            buttonText: '#FFFFFF',
            switchTrack: '#CBD5E0',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#E2E8F0',
            questionIdBackground: '#EBF8FF',
            headerBackground: '#0080FF',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(26, 54, 93, 0.5)',
            vibrant1: '#00D4AA',
            vibrant2: '#0080FF',
            vibrant3: '#38B2AC',
            gradient1: '#0080FF',
            gradient2: '#00D4AA',
        },
        dark: {
            background: '#0F1419',
            surface: '#1A202C',
            card: '#2D3748',
            text: '#F7FAFC',
            textSecondary: '#E2E8F0',
            textMuted: '#A0AEC0',
            primary: '#42A5F5',
            primaryLight: '#64B5F6',
            primaryDark: '#1E88E5',
            accent: '#4FD1C7',
            accentLight: '#81E6D9',
            border: '#4A5568',
            divider: '#2D3748',
            overlay: 'rgba(15, 20, 25, 0.8)',
            success: '#68D391',
            warning: '#F6AD55',
            error: '#FC8181',
            info: '#63B3ED',
            buttonBackground: '#42A5F5',
            buttonText: '#FFFFFF',
            switchTrack: '#4A5568',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#2D3748',
            questionCardBorder: '#4A5568',
            questionIdBackground: '#1A365D',
            headerBackground: '#1A202C',
            headerText: '#F7FAFC',
            modalBackground: '#2D3748',
            modalOverlay: 'rgba(15, 20, 25, 0.9)',
            vibrant1: '#4FD1C7',
            vibrant2: '#42A5F5',
            vibrant3: '#68D391',
            gradient1: '#42A5F5',
            gradient2: '#4FD1C7',
        },
    },
    sunset: {
        light: {
            background: '#FFF8F0',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#7C2D12',
            textSecondary: '#9A3412',
            textMuted: '#A16207',
            primary: '#FF6B35',
            primaryLight: '#FF8A65',
            primaryDark: '#E64A19',
            accent: '#FFD60A',
            accentLight: '#FFF176',
            border: '#FED7AA',
            divider: '#FEF3C7',
            overlay: 'rgba(124, 45, 18, 0.5)',
            success: '#65A30D',
            warning: '#F59E0B',
            error: '#DC2626',
            info: '#3B82F6',
            buttonBackground: '#FF6B35',
            buttonText: '#FFFFFF',
            switchTrack: '#FED7AA',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#FED7AA',
            questionIdBackground: '#FEF3C7',
            headerBackground: '#FF6B35',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(124, 45, 18, 0.5)',
            vibrant1: '#FFD60A',
            vibrant2: '#FF6B35',
            vibrant3: '#F97316',
            gradient1: '#FF6B35',
            gradient2: '#FFD60A',
        },
        dark: {
            background: '#1C0F0A',
            surface: '#2D1B14',
            card: '#44281D',
            text: '#FFF8F0',
            textSecondary: '#FED7AA',
            textMuted: '#D97706',
            primary: '#FF8A65',
            primaryLight: '#FFAB91',
            primaryDark: '#FF5722',
            accent: '#FFF176',
            accentLight: '#FFF59D',
            border: '#78350F',
            divider: '#44281D',
            overlay: 'rgba(28, 15, 10, 0.8)',
            success: '#84CC16',
            warning: '#FBBF24',
            error: '#EF4444',
            info: '#60A5FA',
            buttonBackground: '#FF8A65',
            buttonText: '#FFFFFF',
            switchTrack: '#78350F',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#44281D',
            questionCardBorder: '#78350F',
            questionIdBackground: '#2D1B14',
            headerBackground: '#2D1B14',
            headerText: '#FFF8F0',
            modalBackground: '#44281D',
            modalOverlay: 'rgba(28, 15, 10, 0.9)',
            vibrant1: '#FFF176',
            vibrant2: '#FF8A65',
            vibrant3: '#FBBF24',
            gradient1: '#FF8A65',
            gradient2: '#FFF176',
        },
    },
    forest: {
        light: {
            background: '#F0FDF4',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#14532D',
            textSecondary: '#166534',
            textMuted: '#15803D',
            primary: '#16A34A',
            primaryLight: '#4ADE80',
            primaryDark: '#15803D',
            accent: '#84CC16',
            accentLight: '#A3E635',
            border: '#BBF7D0',
            divider: '#DCFCE7',
            overlay: 'rgba(20, 83, 45, 0.5)',
            success: '#22C55E',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
            buttonBackground: '#16A34A',
            buttonText: '#FFFFFF',
            switchTrack: '#BBF7D0',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#BBF7D0',
            questionIdBackground: '#DCFCE7',
            headerBackground: '#16A34A',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(20, 83, 45, 0.5)',
            vibrant1: '#84CC16',
            vibrant2: '#16A34A',
            vibrant3: '#22C55E',
            gradient1: '#16A34A',
            gradient2: '#84CC16',
        },
        dark: {
            background: '#0C1C0E',
            surface: '#14532D',
            card: '#166534',
            text: '#F0FDF4',
            textSecondary: '#BBF7D0',
            textMuted: '#86EFAC',
            primary: '#4ADE80',
            primaryLight: '#6EE7B7',
            primaryDark: '#22C55E',
            accent: '#A3E635',
            accentLight: '#BEF264',
            border: '#15803D',
            divider: '#14532D',
            overlay: 'rgba(12, 28, 14, 0.8)',
            success: '#22D3EE',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#60A5FA',
            buttonBackground: '#4ADE80',
            buttonText: '#14532D',
            switchTrack: '#15803D',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#166534',
            questionCardBorder: '#15803D',
            questionIdBackground: '#14532D',
            headerBackground: '#14532D',
            headerText: '#F0FDF4',
            modalBackground: '#166534',
            modalOverlay: 'rgba(12, 28, 14, 0.9)',
            vibrant1: '#A3E635',
            vibrant2: '#4ADE80',
            vibrant3: '#22D3EE',
            gradient1: '#4ADE80',
            gradient2: '#A3E635',
        },
    },
    lavender: {
        light: {
            background: '#FAF5FF',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#581C87',
            textSecondary: '#7C3AED',
            textMuted: '#A855F7',
            primary: '#A855F7',
            primaryLight: '#C084FC',
            primaryDark: '#9333EA',
            accent: '#EC4899',
            accentLight: '#F472B6',
            border: '#E9D5FF',
            divider: '#F3E8FF',
            overlay: 'rgba(88, 28, 135, 0.5)',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
            buttonBackground: '#A855F7',
            buttonText: '#FFFFFF',
            switchTrack: '#E9D5FF',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#E9D5FF',
            questionIdBackground: '#F3E8FF',
            headerBackground: '#A855F7',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(88, 28, 135, 0.5)',
            vibrant1: '#EC4899',
            vibrant2: '#A855F7',
            vibrant3: '#8B5CF6',
            gradient1: '#A855F7',
            gradient2: '#EC4899',
        },
        dark: {
            background: '#1E0A2E',
            surface: '#2E1065',
            card: '#3730A3',
            text: '#FAF5FF',
            textSecondary: '#E9D5FF',
            textMuted: '#C4B5FD',
            primary: '#C084FC',
            primaryLight: '#DDD6FE',
            primaryDark: '#A855F7',
            accent: '#F472B6',
            accentLight: '#F9A8D4',
            border: '#6D28D9',
            divider: '#3730A3',
            overlay: 'rgba(30, 10, 46, 0.8)',
            success: '#34D399',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#60A5FA',
            buttonBackground: '#C084FC',
            buttonText: '#1E0A2E',
            switchTrack: '#6D28D9',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#3730A3',
            questionCardBorder: '#6D28D9',
            questionIdBackground: '#2E1065',
            headerBackground: '#2E1065',
            headerText: '#FAF5FF',
            modalBackground: '#3730A3',
            modalOverlay: 'rgba(30, 10, 46, 0.9)',
            vibrant1: '#F472B6',
            vibrant2: '#C084FC',
            vibrant3: '#8B5CF6',
            gradient1: '#C084FC',
            gradient2: '#F472B6',
        },
    },
    coral: {
        light: {
            background: '#FEF7ED',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#9A3412',
            textSecondary: '#C2410C',
            textMuted: '#F97316',
            primary: '#FF6B6B',
            primaryLight: '#FF8E8E',
            primaryDark: '#E55353',
            accent: '#4ECDC4',
            accentLight: '#81E6D9',
            border: '#FED7AA',
            divider: '#FEF3C7',
            overlay: 'rgba(154, 52, 18, 0.5)',
            success: '#06D6A0',
            warning: '#FFD93D',
            error: '#EF476F',
            info: '#118AB2',
            buttonBackground: '#FF6B6B',
            buttonText: '#FFFFFF',
            switchTrack: '#FED7AA',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#FED7AA',
            questionIdBackground: '#FEF3C7',
            headerBackground: '#FF6B6B',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(154, 52, 18, 0.5)',
            vibrant1: '#4ECDC4',
            vibrant2: '#FF6B6B',
            vibrant3: '#FFD93D',
            gradient1: '#FF6B6B',
            gradient2: '#4ECDC4',
        },
        dark: {
            background: '#2C1810',
            surface: '#3D2817',
            card: '#4A2C17',
            text: '#FEF7ED',
            textSecondary: '#FED7AA',
            textMuted: '#FDBA74',
            primary: '#FF8E8E',
            primaryLight: '#FFA8A8',
            primaryDark: '#FF6B6B',
            accent: '#81E6D9',
            accentLight: '#B2F5EA',
            border: '#78350F',
            divider: '#4A2C17',
            overlay: 'rgba(44, 24, 16, 0.8)',
            success: '#34D399',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#60A5FA',
            buttonBackground: '#FF8E8E',
            buttonText: '#2C1810',
            switchTrack: '#78350F',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#4A2C17',
            questionCardBorder: '#78350F',
            questionIdBackground: '#3D2817',
            headerBackground: '#3D2817',
            headerText: '#FEF7ED',
            modalBackground: '#4A2C17',
            modalOverlay: 'rgba(44, 24, 16, 0.9)',
            vibrant1: '#81E6D9',
            vibrant2: '#FF8E8E',
            vibrant3: '#FBBF24',
            gradient1: '#FF8E8E',
            gradient2: '#81E6D9',
        },
    },
    midnight: {
        light: {
            background: '#F8FAFC',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#1E293B',
            textSecondary: '#334155',
            textMuted: '#64748B',
            primary: '#6366F1',
            primaryLight: '#818CF8',
            primaryDark: '#4F46E5',
            accent: '#EC4899',
            accentLight: '#F472B6',
            border: '#E2E8F0',
            divider: '#F1F5F9',
            overlay: 'rgba(30, 41, 59, 0.5)',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#06B6D4',
            buttonBackground: '#6366F1',
            buttonText: '#FFFFFF',
            switchTrack: '#CBD5E0',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#E2E8F0',
            questionIdBackground: '#F1F5F9',
            headerBackground: '#6366F1',
            headerText: '#FFFFFF',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(30, 41, 59, 0.5)',
            vibrant1: '#EC4899',
            vibrant2: '#6366F1',
            vibrant3: '#06B6D4',
            gradient1: '#6366F1',
            gradient2: '#EC4899',
        },
        dark: {
            background: '#0F0F23',
            surface: '#1E1E3F',
            card: '#2A2A54',
            text: '#F8FAFC',
            textSecondary: '#CBD5E0',
            textMuted: '#94A3B8',
            primary: '#818CF8',
            primaryLight: '#A5B4FC',
            primaryDark: '#6366F1',
            accent: '#F472B6',
            accentLight: '#F9A8D4',
            border: '#3C3C69',
            divider: '#2A2A54',
            overlay: 'rgba(15, 15, 35, 0.8)',
            success: '#34D399',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#22D3EE',
            buttonBackground: '#818CF8',
            buttonText: '#0F0F23',
            switchTrack: '#3C3C69',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#2A2A54',
            questionCardBorder: '#3C3C69',
            questionIdBackground: '#1E1E3F',
            headerBackground: '#1E1E3F',
            headerText: '#F8FAFC',
            modalBackground: '#2A2A54',
            modalOverlay: 'rgba(15, 15, 35, 0.9)',
            vibrant1: '#F472B6',
            vibrant2: '#818CF8',
            vibrant3: '#22D3EE',
            gradient1: '#818CF8',
            gradient2: '#F472B6',
        },
    },
    neon: {
        light: {
            background: '#FAFAFA',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            text: '#0A0A0A',
            textSecondary: '#333333',
            textMuted: '#666666',
            primary: '#00FF88',
            primaryLight: '#66FFA8',
            primaryDark: '#00CC6A',
            accent: '#FF0080',
            accentLight: '#FF66B0',
            border: '#E0E0E0',
            divider: '#F0F0F0',
            overlay: 'rgba(10, 10, 10, 0.5)',
            success: '#00FF88',
            warning: '#FFFF00',
            error: '#FF0040',
            info: '#00BFFF',
            buttonBackground: '#00FF88',
            buttonText: '#0A0A0A',
            switchTrack: '#E0E0E0',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#FFFFFF',
            questionCardBorder: '#E0E0E0',
            questionIdBackground: '#F0F0F0',
            headerBackground: '#00FF88',
            headerText: '#0A0A0A',
            modalBackground: '#FFFFFF',
            modalOverlay: 'rgba(10, 10, 10, 0.5)',
            vibrant1: '#FF0080',
            vibrant2: '#00FF88',
            vibrant3: '#00BFFF',
            gradient1: '#00FF88',
            gradient2: '#FF0080',
        },
        dark: {
            background: '#0A0A0A',
            surface: '#1A1A1A',
            card: '#2A2A2A',
            text: '#FFFFFF',
            textSecondary: '#CCCCCC',
            textMuted: '#999999',
            primary: '#00FF88',
            primaryLight: '#66FFA8',
            primaryDark: '#00CC6A',
            accent: '#FF0080',
            accentLight: '#FF66B0',
            border: '#333333',
            divider: '#2A2A2A',
            overlay: 'rgba(10, 10, 10, 0.8)',
            success: '#00FF88',
            warning: '#FFFF00',
            error: '#FF0040',
            info: '#00BFFF',
            buttonBackground: '#00FF88',
            buttonText: '#0A0A0A',
            switchTrack: '#333333',
            switchThumb: '#FFFFFF',
            questionCardBackground: '#2A2A2A',
            questionCardBorder: '#333333',
            questionIdBackground: '#1A1A1A',
            headerBackground: '#1A1A1A',
            headerText: '#FFFFFF',
            modalBackground: '#2A2A2A',
            modalOverlay: 'rgba(10, 10, 10, 0.9)',
            vibrant1: '#FF0080',
            vibrant2: '#00FF88',
            vibrant3: '#00BFFF',
            gradient1: '#00FF88',
            gradient2: '#FF0080',
        },
    },
};

// Color theme information for UI display
export const colorThemeInfo: Record<ColorTheme, ColorThemeInfo> = {
    classic: {
        id: 'classic',
        name: 'Classic Blue',
        nameVi: 'Xanh Cổ Điển',
        description: 'Traditional and professional',
        descriptionVi: 'Truyền thống và chuyên nghiệp',
        primaryColor: '#3F51B5',
        accentColor: '#FF4081',
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean Breeze',
        nameVi: 'Gió Biển',
        description: 'Calm and refreshing',
        descriptionVi: 'Bình tĩnh và sảng khoái',
        primaryColor: '#0080FF',
        accentColor: '#00D4AA',
        isGradient: true,
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Glow',
        nameVi: 'Hoàng Hôn',
        description: 'Warm and energetic',
        descriptionVi: 'Ấm áp và năng động',
        primaryColor: '#FF6B35',
        accentColor: '#FFD60A',
        isGradient: true,
    },
    forest: {
        id: 'forest',
        name: 'Forest Fresh',
        nameVi: 'Rừng Xanh',
        description: 'Natural and peaceful',
        descriptionVi: 'Tự nhiên và yên bình',
        primaryColor: '#16A34A',
        accentColor: '#84CC16',
    },
    lavender: {
        id: 'lavender',
        name: 'Lavender Dream',
        nameVi: 'Giấc Mơ Lavender',
        description: 'Elegant and dreamy',
        descriptionVi: 'Thanh lịch và mơ mộng',
        primaryColor: '#A855F7',
        accentColor: '#EC4899',
        isGradient: true,
    },
    coral: {
        id: 'coral',
        name: 'Coral Reef',
        nameVi: 'San Hô',
        description: 'Vibrant and playful',
        descriptionVi: 'Sống động và vui tươi',
        primaryColor: '#FF6B6B',
        accentColor: '#4ECDC4',
        isGradient: true,
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight Sky',
        nameVi: 'Bầu Trời Đêm',
        description: 'Mysterious and modern',
        descriptionVi: 'Bí ẩn và hiện đại',
        primaryColor: '#6366F1',
        accentColor: '#EC4899',
        isGradient: true,
    },
    neon: {
        id: 'neon',
        name: 'Neon Lights',
        nameVi: 'Đèn Neon',
        description: 'Bold and futuristic',
        descriptionVi: 'Táo bạo và tương lai',
        primaryColor: '#00FF88',
        accentColor: '#FF0080',
        isGradient: true,
    },
};

// Context interface
interface ThemeContextType {
    theme: Theme & { icons: any }; // Include icons from IconContext
    themeMode: ThemeMode;
    colorTheme: ColorTheme;
    setThemeMode: (mode: ThemeMode) => void;
    setColorTheme: (colorTheme: ColorTheme) => void;
    toggleTheme: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme provider component
interface ThemeProviderProps {
    children: ReactNode;
}

const THEME_STORAGE_KEY = '@french_app_theme';
const COLOR_THEME_STORAGE_KEY = '@french_app_color_theme';

// Internal theme provider that requires IconContext
const ThemeProviderInternal: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
    const [colorTheme, setColorThemeState] = useState<ColorTheme>('classic');
    const [isLoading, setIsLoading] = useState(true);
    const { icons } = useIcons(); // Get icons from IconContext

    // Load theme from storage on app start
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                const savedColorTheme = await AsyncStorage.getItem(COLOR_THEME_STORAGE_KEY);

                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    setThemeModeState(savedTheme);
                }

                if (savedColorTheme && Object.keys(colorThemes).includes(savedColorTheme)) {
                    setColorThemeState(savedColorTheme as ColorTheme);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, []);

    // Save theme to storage when it changes
    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme:', error);
            setThemeModeState(mode);
        }
    };

    // Save color theme to storage when it changes
    const setColorTheme = async (theme: ColorTheme) => {
        try {
            await AsyncStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
            setColorThemeState(theme);
        } catch (error) {
            console.error('Error saving color theme:', error);
            setColorThemeState(theme);
        }
    };

    const toggleTheme = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    const currentColors = colorThemes[colorTheme][themeMode];
    const currentTheme: Theme = {
        mode: themeMode,
        colorTheme,
        colors: currentColors,
    };

    const value: ThemeContextType = {
        theme: {
            ...currentTheme,
            icons, // Include icons from IconContext
        },
        themeMode,
        colorTheme,
        setThemeMode,
        setColorTheme,
        toggleTheme,
    };

    // Don't render children until theme is loaded
    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            {children}
        </ThemeContext.Provider>
    );
};

// Wrapper that ensures IconContext is available
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    return (
        <ThemeProviderInternal>
            {children}
        </ThemeProviderInternal>
    );
};

export default ThemeProvider;