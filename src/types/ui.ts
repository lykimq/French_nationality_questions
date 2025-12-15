import * as React from 'react';
import { StyleProp, TextStyle, ImageSourcePropType } from 'react-native';
import type { Language, MultiLangText, MultilingualEntity, VisualEntity } from './core';
import type { Question, MultilingualQuestion, CategoryType, HistoryCategory, HistorySubcategory } from '../features/welcome/types/domain';
import type { FrenchQuestionsData, MultiLangQuestionsData } from './language';
import type { NavigationQuestion } from '../features/welcome/types/navigation';

// ==================== COMPONENT BASE PATTERNS ====================

// Base props for all components that support language switching
export interface LanguageAwareProps {
    readonly language: Language;
}

// Base props for components with multilingual content
export interface MultilingualProps extends LanguageAwareProps {
    readonly title: string;
    readonly title_vi?: string;
    readonly description?: string;
    readonly description_vi?: string;
}

// Base props for interactive components
export interface InteractiveProps {
    readonly onPress?: () => void;
    readonly disabled?: boolean;
    readonly loading?: boolean;
}

// Base props for visual components
export interface VisualProps {
    readonly icon?: string;
    readonly image?: string | null;
    readonly color?: string;
}

// ==================== STATE MANAGEMENT PROPS ====================

// Props for components with loading states
export interface LoadingStateProps {
    readonly isLoading?: boolean;
    readonly loadingText?: string;
}

// Props for components with error states
export interface ErrorStateProps {
    readonly error?: string | null;
    readonly errorTitle?: string;
    readonly errorSubtext?: string;
}

// Props for components with retry functionality
export interface RetryableProps {
    readonly onRetry?: () => void;
}

// Combined async component props
export interface AsyncComponentProps extends LoadingStateProps, ErrorStateProps, RetryableProps { }

// ==================== FORM & INPUT COMPONENTS ====================

// Generic value component props - functional approach
export interface ValueComponentProps<T = string> extends LanguageAwareProps {
    readonly value: T;
    readonly onValueChange: (value: T) => void;
    readonly disabled?: boolean;
}

// Settings component props - extends value component
export interface SettingsComponentProps<T = string> extends ValueComponentProps<T>, MultilingualProps { }

// Settings component with value support - for icon selectors and similar components
export interface SettingsComponentWithValueProps<T = string> extends ValueComponentProps<T>, MultilingualProps { }

// Extended settings component with additional props
export type ExtendedSettingsComponent<T = string, P extends Record<string, any> = {}> =
    SettingsComponentProps<T> & Readonly<P>;

// ==================== TEXT & FORMATTING ====================

// Formatted text component props
export interface FormattedTextProps {
    readonly children: React.ReactNode;
    readonly style?: StyleProp<TextStyle>;
    readonly [key: string]: any; // Allow other Text props to be passed through
}

// Text formatting settings
export interface TextFormattingSettings {
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
}

// ==================== QUESTION & CATEGORY COMPONENTS ====================

// Question card component props
export interface QuestionCardProps extends LanguageAwareProps {
    readonly id: number;
    readonly question: string | MultiLangText;
    readonly explanation: string | MultiLangText;
    readonly image?: string | null;
    readonly alwaysExpanded?: boolean;
}

// Category card component props
export interface CategoryCardProps extends MultilingualProps, InteractiveProps, VisualProps {
    readonly count: number;
}

// Question slide view props
export interface QuestionSlideViewProps extends LanguageAwareProps {
    readonly questions: readonly Question[];
}

// Category slide view props
export interface CategorySlideViewProps extends LanguageAwareProps {
    readonly categories: readonly (MultilingualEntity & VisualEntity & {
        readonly questions: readonly (MultilingualQuestion | NavigationQuestion)[];
    })[];
}

// Category selection view props
export interface CategorySelectionViewProps extends CategorySlideViewProps {
    readonly onSelectCategory: (categoryIndex: number) => void;
}

// ==================== LOADING & DATA COMPONENTS ====================

// Data loading screen props
export interface DataLoadingScreenProps extends AsyncComponentProps {
    readonly title?: string;
    readonly subtitle?: string;
}

// ==================== FUNCTIONAL COMPONENT FACTORIES ====================

// Type for creating components with consistent prop patterns
export type ComponentFactory<P extends Record<string, any>> = (props: P) => React.ReactElement;

// HOC props pattern
export interface HOCProps<P extends Record<string, any> = {}> {
    readonly wrappedComponent: ComponentFactory<P>;
    readonly additionalProps?: Partial<P>;
}

// ==================== CONTEXT TYPES ====================

// Language context type (import from domain/language types for full typing)
export interface LanguageContextType {
    readonly language: Language;
    readonly setLanguage: (lang: Language) => void;
    readonly toggleLanguage: () => void;
    readonly questionsData: FrenchQuestionsData | MultiLangQuestionsData;
    readonly isTranslationLoaded: boolean;
    readonly historyCategories: HistoryCategory | null;
    readonly historySubcategories: Record<string, HistorySubcategory>;
    readonly isDataLoading: boolean;
    readonly dataLoadingError: string | null;
}

// Language provider props
export interface LanguageProviderProps {
    readonly children: React.ReactNode;
}

// Settings item props
export interface SettingItemProps {
    readonly title: string;
    readonly title_vi?: string;
    readonly icon: string;
    readonly iconColor: string;
    readonly isSwitch?: boolean;
    readonly value?: boolean;
    readonly onValueChange?: (value: boolean) => void;
    readonly onPress?: () => void;
    readonly language?: Language;
}

// Image modal props
export interface ImageModalProps {
    readonly visible: boolean;
    readonly imageSource: ImageSourcePropType;
    readonly onClose: () => void;
}

// ==================== UTILITY TYPES ====================

// Extract component props type
export type ComponentProps<T> = T extends ComponentFactory<infer P> ? P : never;

// Make all props optional except specified keys
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Make specific props required
export type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;