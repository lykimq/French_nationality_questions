import * as React from "react";
import { TextProps, ImageSourcePropType } from "react-native";
import type { Question } from "../welcome/types";
import type { FrenchQuestionsData } from "./questionsData";
// Base props for components with title and description
export interface TitleProps {
    readonly title: string;
    readonly description?: string;
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
// Generic value component props - functional approach
export interface ValueComponentProps<T = string> {
    readonly value: T;
    readonly onValueChange: (value: T) => void;
    readonly disabled?: boolean;
}

// Settings component props - extends value component
export interface SettingsComponentProps<T = string>
    extends ValueComponentProps<T>, TitleProps {}

// Extended settings component with additional props
export type ExtendedSettingsComponent<
    T = string,
    P extends object = {},
> = SettingsComponentProps<T> & Readonly<P>;
// Formatted text component props - extends TextProps for full type safety
export interface FormattedTextProps extends TextProps {
    readonly children: React.ReactNode;
}

// Text formatting settings
export interface TextFormattingSettings {
    readonly fontSize: number;
}
// Question card component props
export interface QuestionCardProps {
    readonly id: number | string;
    readonly question: string;
    readonly explanation: string;
    readonly image?: string | null;
    readonly alwaysExpanded?: boolean;
}

// Category card component props
export interface CategoryCardProps
    extends TitleProps, InteractiveProps, VisualProps {
    readonly count: number;
    readonly progress?: number;
}

// Question slide view props
export interface QuestionSlideViewProps {
    readonly questions: readonly Question[];
    readonly initialIndex?: number;
}
// Data context type (provides questions data, not language switching)
export interface DataContextType {
    readonly questionsData: FrenchQuestionsData;
    readonly isDataLoading: boolean;
    readonly dataLoadingError: string | null;
}

// Data provider props
export interface DataProviderProps {
    readonly children: React.ReactNode;
}

// Settings item props
export interface SettingItemProps {
    readonly title: string;
    readonly icon: string;
    readonly iconColor: string;
    readonly subtitle?: string;
    readonly isSwitch?: boolean;
    readonly value?: boolean;
    readonly onValueChange?: (value: boolean) => void;
    readonly onPress?: () => void;
}

// Image modal props
export interface ImageModalProps {
    readonly visible: boolean;
    readonly imageSource: ImageSourcePropType | null;
    readonly onClose: () => void;
}
