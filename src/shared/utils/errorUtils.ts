/**
 * Error handling utilities for consistent error processing.
 */

/**
 * Extracts error message from unknown error type.
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    return 'Unknown error';
};

/**
 * Extracts error stack trace if available.
 */
export const getErrorStack = (error: unknown): string | undefined => {
    if (error instanceof Error) return error.stack;
    return undefined;
};

/**
 * Creates a standardized error object from unknown error.
 */
export const normalizeError = (error: unknown): { message: string; stack?: string } => {
    return {
        message: getErrorMessage(error),
        stack: getErrorStack(error),
    };
};

