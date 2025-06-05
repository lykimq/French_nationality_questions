import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

// Common component prop interfaces

/**
 * Props for the FormattedText component
 * Extends React Native Text component with custom formatting support
 */
export interface FormattedTextProps {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
    [key: string]: any; // Allow other Text props to be passed through
}

/**
 * Props for loading screen components
 */
export interface DataLoadingScreenProps {
    error?: string | null;
    onRetry?: () => void;
    isLoading?: boolean;
}

/**
 * Base props for components that support retry functionality
 */
export interface RetryableComponentProps {
    onRetry?: () => void;
    isLoading?: boolean;
}

/**
 * Base props for components with error states
 */
export interface ErrorStateProps {
    error?: string | null;
    errorTitle?: string;
    errorSubtext?: string;
}

/**
 * Combined props for components that handle loading, error, and retry states
 */
export interface AsyncComponentProps extends RetryableComponentProps, ErrorStateProps { }