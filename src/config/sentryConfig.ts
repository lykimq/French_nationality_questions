import * as Sentry from '@sentry/react-native';
import { createLogger } from '../shared/utils/logger';

const logger = createLogger('SentryConfig');

export const initializeSentry = () => {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

    if (!dsn) {
        logger.warn(
            'Sentry DSN not configured. Crash reporting will be disabled.\n' +
            'To enable: Add EXPO_PUBLIC_SENTRY_DSN to your .env file'
        );
        return;
    }

    try {
        Sentry.init({
            dsn,
            enableInExpoDevelopment: false,
            debug: __DEV__,
            environment: __DEV__ ? 'development' : 'production',
            tracesSampleRate: __DEV__ ? 1.0 : 0.1,
            beforeSend(event, hint) {
                if (__DEV__) {
                    logger.debug('Sentry event captured:', event);
                }
                return event;
            },
        });

        logger.info('Sentry initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize Sentry:', error);
    }
};

export { Sentry };

