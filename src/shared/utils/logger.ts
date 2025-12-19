const IS_DEV = __DEV__;

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

let globalLogLevel: LogLevel = IS_DEV ? LogLevel.DEBUG : LogLevel.WARN;

class Logger {
    private prefix: string;

    constructor(prefix: string = '') {
        this.prefix = prefix ? `[${prefix}] ` : '';
    }

    private formatMessage(message: string): string {
        return `${this.prefix}${message}`;
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= globalLogLevel;
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log(`ℹ️ ${this.formatMessage(message)}`, ...args);
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(`🔍 ${this.formatMessage(message)}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(`⚠️ ${this.formatMessage(message)}`, ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(`❌ ${this.formatMessage(message)}`, ...args);
        }
    }
}

export const createLogger = (prefix: string) => new Logger(prefix);

export default new Logger();
