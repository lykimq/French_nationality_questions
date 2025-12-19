/**
 * Simple logger utility to manage console logs across the application.
 * Allows toggling logs based on the environment and provides a consistent interface.
 */

const IS_DEV = __DEV__; // Expo/React Native global for development mode

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private prefix: string;

    constructor(prefix: string = '') {
        this.prefix = prefix ? `[${prefix}] ` : '';
    }

    private formatMessage(message: string): string {
        return `${this.prefix}${message}`;
    }

    info(message: string, ...args: any[]): void {
        if (IS_DEV) {
            console.log(`ℹ️ ${this.formatMessage(message)}`, ...args);
        }
    }

    debug(message: string, ...args: any[]): void {
        if (IS_DEV) {
            console.debug(`🔍 ${this.formatMessage(message)}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (IS_DEV) {
            console.warn(`⚠️ ${this.formatMessage(message)}`, ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        // Errors should probably be logged even in production, 
        // or sent to an error reporting service like Sentry
        console.error(`❌ ${this.formatMessage(message)}`, ...args);
    }
}

export const createLogger = (prefix: string) => new Logger(prefix);

export default new Logger();
