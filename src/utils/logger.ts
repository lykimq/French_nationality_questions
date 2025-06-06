// Logger utility to replace console statements and allow easy production cleanup
const isDevelopment = __DEV__;

export const logger = {
    log: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.log(message, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.warn(message, ...args);
        }
    },

    error: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.error(message, ...args);
        }
    },

    info: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.info(message, ...args);
        }
    },

    debug: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.debug(message, ...args);
        }
    },
};

// For production, you can also implement remote logging here
export const logError = (error: Error, context?: string) => {
    if (isDevelopment) {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }
    // In production, you could send this to a crash reporting service
    // like Sentry, Crashlytics, etc.
};