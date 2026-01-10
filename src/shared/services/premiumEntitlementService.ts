import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { createLogger } from '../utils/logger';

const logger = createLogger('PremiumEntitlementService');

const ENTITLEMENT_STORAGE_KEY = 'premium_entitlement_state_v1';
const ACCOUNT_STORAGE_KEY = 'premium_account_identity_v1';

export interface PremiumEntitlementState {
    readonly isPremium: boolean;
    readonly hasUsedFreeExam: boolean;
    readonly updatedAt: string;
}

export interface RemoteEntitlementResponse {
    readonly isPremium: boolean;
    readonly hasUsedFreeExam: boolean;
    readonly updatedAt?: string;
}

export interface EntitlementSyncPayload {
    readonly accountHash: string;
    readonly platform: string;
    readonly isPremium?: boolean;
    readonly hasUsedFreeExam?: boolean;
    readonly purchaseToken?: string | null;
    readonly productId?: string | null;
    readonly receipt?: string | null;
}

const DEFAULT_ENTITLEMENT: PremiumEntitlementState = {
    isPremium: false,
    hasUsedFreeExam: false,
    updatedAt: new Date(0).toISOString(),
};

const hashString = (value: string): string => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return `h${Math.abs(hash)}`;
};

const getDeviceSeed = (): string => {
    const constants = Constants || {};
    const candidates = [
        (constants as any).installationId,
        (constants as any).expoRuntimeId,
        (constants as any).sessionId,
        `${Platform.OS}-${Date.now()}-${Math.random()}`,
    ];
    const seed = candidates.find(Boolean);
    return typeof seed === 'string' ? seed : `${Platform.OS}-fallback`;
};

export const loadLocalEntitlement = async (): Promise<PremiumEntitlementState> => {
    try {
        const stored = await AsyncStorage.getItem(ENTITLEMENT_STORAGE_KEY);
        if (!stored) {
            return DEFAULT_ENTITLEMENT;
        }
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            return {
                isPremium: Boolean(parsed.isPremium),
                hasUsedFreeExam: Boolean(parsed.hasUsedFreeExam),
                updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
            };
        }
    } catch (error) {
        logger.warn('Failed to load local entitlement:', error);
    }
    return DEFAULT_ENTITLEMENT;
};

export const saveLocalEntitlement = async (entitlement: PremiumEntitlementState): Promise<void> => {
    try {
        await AsyncStorage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(entitlement));
    } catch (error) {
        logger.warn('Failed to save local entitlement:', error);
    }
};

interface AccountIdentity {
    readonly accountHash: string;
    readonly createdAt: string;
}

export const getAccountIdentity = async (): Promise<AccountIdentity> => {
    try {
        const stored = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.accountHash) {
                return parsed as AccountIdentity;
            }
        }
    } catch (error) {
        logger.warn('Failed to load stored account identity:', error);
    }

    const deviceSeed = getDeviceSeed();
    const accountHash = hashString(`${Platform.OS}:${deviceSeed}`);
    const identity: AccountIdentity = {
        accountHash,
        createdAt: new Date().toISOString(),
    };
    try {
        await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(identity));
    } catch (error) {
        logger.warn('Failed to persist account identity:', error);
    }
    return identity;
};

const getEntitlementBaseUrl = (): string | null => {
    const url = process.env.EXPO_PUBLIC_ENTITLEMENT_URL;
    if (!url) {
        return null;
    }
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        logger.warn('EXPO_PUBLIC_ENTITLEMENT_URL is missing protocol (http:// or https://), adding https://');
        normalizedUrl = `https://${normalizedUrl}`;
    }
    return normalizedUrl.endsWith('/') ? normalizedUrl.slice(0, -1) : normalizedUrl;
};

const callEntitlementApi = async <T>(path: string, payload: Record<string, unknown>): Promise<T | null> => {
    const baseUrl = getEntitlementBaseUrl();
    if (!baseUrl) {
        logger.info('Entitlement API base URL missing, skipping remote sync');
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
                if (errorData.hint) {
                    errorDetails += ` (${errorData.hint})`;
                }
            } catch {
                const text = await response.text();
                errorDetails = text || `HTTP ${response.status}`;
            }
            throw new Error(`Entitlement API error ${response.status}: ${errorDetails}`);
        }
        const data = await response.json();
        return data as T;
    } catch (error) {
        logger.warn('Entitlement API call failed:', error);
        return null;
    }
};

export const fetchRemoteEntitlement = async (accountHash: string): Promise<RemoteEntitlementResponse | null> => {
    return callEntitlementApi<RemoteEntitlementResponse>('/entitlement/fetch', {
        accountHash,
        platform: Platform.OS,
    });
};

export const syncRemoteEntitlement = async (payload: EntitlementSyncPayload): Promise<RemoteEntitlementResponse | null> => {
    return callEntitlementApi<RemoteEntitlementResponse>('/entitlement/sync', {
        ...payload,
        platform: Platform.OS,
    });
};

export const buildEntitlementFromResponse = (response: RemoteEntitlementResponse | null, fallback: PremiumEntitlementState): PremiumEntitlementState => {
    if (!response) {
        return fallback;
    }
    return {
        isPremium: Boolean(response.isPremium),
        hasUsedFreeExam: Boolean(response.hasUsedFreeExam),
        updatedAt: response.updatedAt || new Date().toISOString(),
    };
};

