import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Linking, Platform, Alert } from 'react-native';
import { createLogger } from './logger';

const logger = createLogger('RatingUtils');

const STORAGE_KEYS = {
    RATING_DATA: 'app_rating_data',
    APP_LAUNCH_COUNT: 'app_launch_count',
    LAST_RATING_PROMPT: 'last_rating_prompt_date',
    HAS_RATED: 'has_rated_app',
    RATING_VALUE: 'app_rating_value',
} as const;

export interface RatingData {
    rating: number;
    timestamp: number;
    hasLeftStoreReview: boolean;
}

export interface AppRatingState {
    launchCount: number;
    lastPromptDate: number | null;
    hasRated: boolean;
    ratingValue: number | null;
}

const APP_STORE_IDS = {
    ios: 'com.lykimq-uyen.naturalisation-france',
    android: 'com.lykimq_uyen.naturalisation_france',
} as const;

const STORE_URLS = {
    ios: (bundleId: string) => `https://apps.apple.com/app/${bundleId}`,
    android: (packageName: string) => `https://play.google.com/store/apps/details?id=${packageName}`,
} as const;

export const saveRating = async (rating: number): Promise<void> => {
    try {
        const ratingData: RatingData = {
            rating,
            timestamp: Date.now(),
            hasLeftStoreReview: false,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.RATING_DATA, JSON.stringify(ratingData));
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.RATING_VALUE, String(rating));
        logger.debug(`Rating saved: ${rating} stars`);
    } catch (error) {
        logger.error('Failed to save rating:', error);
        throw error;
    }
};

export const getRatingData = async (): Promise<RatingData | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.RATING_DATA);
        if (data) {
            return JSON.parse(data) as RatingData;
        }
        return null;
    } catch (error) {
        logger.error('Failed to get rating data:', error);
        return null;
    }
};

export const hasUserRated = async (): Promise<boolean> => {
    try {
        const hasRated = await AsyncStorage.getItem(STORAGE_KEYS.HAS_RATED);
        return hasRated === 'true';
    } catch (error) {
        logger.error('Failed to check if user has rated:', error);
        return false;
    }
};

export const getUserRating = async (): Promise<number | null> => {
    try {
        const rating = await AsyncStorage.getItem(STORAGE_KEYS.RATING_VALUE);
        return rating ? parseInt(rating, 10) : null;
    } catch (error) {
        logger.error('Failed to get user rating:', error);
        return null;
    }
};

export const incrementLaunchCount = async (): Promise<number> => {
    try {
        const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCH_COUNT);
        const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 1;
        await AsyncStorage.setItem(STORAGE_KEYS.APP_LAUNCH_COUNT, String(newCount));
        return newCount;
    } catch (error) {
        logger.error('Failed to increment launch count:', error);
        return 1;
    }
};

export const getLaunchCount = async (): Promise<number> => {
    try {
        const count = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCH_COUNT);
        return count ? parseInt(count, 10) : 0;
    } catch (error) {
        logger.error('Failed to get launch count:', error);
        return 0;
    }
};

export const shouldPromptForRating = async (): Promise<boolean> => {
    try {
        const hasRated = await hasUserRated();
        if (hasRated) {
            return false;
        }

        const launchCount = await getLaunchCount();
        const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RATING_PROMPT);
        
        if (lastPromptDate) {
            const daysSinceLastPrompt = (Date.now() - parseInt(lastPromptDate, 10)) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPrompt < 7) {
                return false;
            }
        }

        return launchCount >= 5;
    } catch (error) {
        logger.error('Failed to check if should prompt for rating:', error);
        return false;
    }
};

export const markRatingPromptShown = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RATING_PROMPT, String(Date.now()));
    } catch (error) {
        logger.error('Failed to mark rating prompt as shown:', error);
    }
};

export const openStoreReview = async (): Promise<boolean> => {
    try {
        const isAvailable = await StoreReview.isAvailableAsync();
        
        if (isAvailable) {
            try {
                await StoreReview.requestReview();
                logger.debug('Store review requested successfully');
                await markStoreReviewAsLeft();
                return true;
            } catch (reviewError) {
                logger.warn('Store review API failed (app may not be published yet):', reviewError);
                return await openStoreFallback();
            }
        }

        logger.debug('Store review not available, using fallback');
        return await openStoreFallback();
    } catch (error) {
        logger.error('Failed to open store review:', error);
        return await openStoreFallback();
    }
};

const openStoreFallback = async (): Promise<boolean> => {
    try {
        let url: string;
        
        if (Platform.OS === 'ios') {
            url = STORE_URLS.ios(APP_STORE_IDS.ios);
        } else if (Platform.OS === 'android') {
            url = STORE_URLS.android(APP_STORE_IDS.android);
        } else {
            logger.warn('Unsupported platform for store review');
            return false;
        }

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
            await markStoreReviewAsLeft();
            logger.info('Store opened via fallback URL');
            return true;
        }
        
        logger.warn('Cannot open store URL');
        return false;
    } catch (error) {
        logger.error('Failed to open store fallback:', error);
        return false;
    }
};

const markStoreReviewAsLeft = async (): Promise<void> => {
    try {
        const ratingData = await getRatingData();
        if (ratingData) {
            ratingData.hasLeftStoreReview = true;
            await AsyncStorage.setItem(STORAGE_KEYS.RATING_DATA, JSON.stringify(ratingData));
        }
    } catch (error) {
        logger.error('Failed to mark store review as left:', error);
    }
};

export const getAppRatingState = async (): Promise<AppRatingState> => {
    try {
        const [launchCount, lastPromptDate, hasRated, ratingValue] = await Promise.all([
            getLaunchCount(),
            AsyncStorage.getItem(STORAGE_KEYS.LAST_RATING_PROMPT),
            hasUserRated(),
            getUserRating(),
        ]);

        return {
            launchCount,
            lastPromptDate: lastPromptDate ? parseInt(lastPromptDate, 10) : null,
            hasRated,
            ratingValue,
        };
    } catch (error) {
        logger.error('Failed to get app rating state:', error);
        return {
            launchCount: 0,
            lastPromptDate: null,
            hasRated: false,
            ratingValue: null,
        };
    }
};

