import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';
import PaywallModal from '../components/premium/PaywallModal';
import { createLogger } from '../utils/logger';
import {
    buildEntitlementFromResponse,
    EntitlementSyncPayload,
    fetchRemoteEntitlement,
    getAccountIdentity,
    loadLocalEntitlement,
    PremiumEntitlementState,
    saveLocalEntitlement,
    syncRemoteEntitlement,
} from '../services/premiumEntitlementService';

const logger = createLogger('PremiumAccessContext');

const PRODUCT_IDS = ['premium_unlock'];
const ACCOUNT_TOKEN_KEY = 'premium_app_account_token_v1';

interface PremiumAccessContextValue {
    readonly isPremium: boolean;
    readonly hasUsedFreeExam: boolean;
    readonly isLoading: boolean;
    readonly purchaseInProgress: boolean;
    readonly productPrice?: string;
    readonly openPaywall: () => void;
    readonly closePaywall: () => void;
    readonly paywallVisible: boolean;
    readonly purchasePremium: () => Promise<void>;
    readonly restorePurchases: () => Promise<void>;
    readonly markFreeExamUsed: () => Promise<void>;
    readonly refreshEntitlement: () => Promise<void>;
}

const PremiumAccessContext = createContext<PremiumAccessContextValue | undefined>(undefined);

const getStoredAccountToken = async (): Promise<string | null> => {
    try {
        const stored = await AsyncStorage.getItem(ACCOUNT_TOKEN_KEY);
        if (stored) {
            return stored;
        }
    } catch (error) {
        logger.warn('Failed to read app account token:', error);
    }
    return null;
};

const storeAccountToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(ACCOUNT_TOKEN_KEY, token);
    } catch (error) {
        logger.warn('Failed to persist app account token:', error);
    }
};

export const PremiumAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [entitlement, setEntitlement] = useState<PremiumEntitlementState>({
        isPremium: false,
        hasUsedFreeExam: false,
        updatedAt: new Date(0).toISOString(),
    });
    const [isLoading, setIsLoading] = useState(true);
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);
    const [productPrice, setProductPrice] = useState<string | undefined>();
    const [paywallVisible, setPaywallVisible] = useState(false);

    const purchaseUpdateSubscription = useRef<RNIap.EventSubscription | null>(null);
    const purchaseErrorSubscription = useRef<RNIap.EventSubscription | null>(null);
    const accountIdentityRef = useRef<{ accountHash: string } | null>(null);

    const loadAccountIdentity = useCallback(async () => {
        if (accountIdentityRef.current) {
            return accountIdentityRef.current;
        }
        const identity = await getAccountIdentity();
        accountIdentityRef.current = identity;
        return identity;
    }, []);

    const updateEntitlementState = useCallback(async (next: PremiumEntitlementState) => {
        setEntitlement(next);
        await saveLocalEntitlement(next);
    }, []);

    const refreshEntitlement = useCallback(async () => {
        setIsLoading(true);
        try {
            const identity = await loadAccountIdentity();
            const local = await loadLocalEntitlement();
            setEntitlement(local);

            const remote = await fetchRemoteEntitlement(identity.accountHash);
            const merged = buildEntitlementFromResponse(remote, local);
            await updateEntitlementState({
                ...merged,
                updatedAt: merged.updatedAt || new Date().toISOString(),
            });
        } catch (error) {
            logger.warn('Unable to refresh entitlement:', error);
        } finally {
            setIsLoading(false);
        }
    }, [loadAccountIdentity, updateEntitlementState]);

    const finalizePurchase = useCallback(async (purchase: RNIap.Purchase) => {
        if (!purchase.productId) {
            return;
        }
        if (!PRODUCT_IDS.includes(purchase.productId)) {
            return;
        }

        const identity = await loadAccountIdentity();
        
        const purchaseAny = purchase as any;
        const purchaseToken = purchaseAny.purchaseToken ?? null;
        const receipt = purchaseAny.transactionReceipt ?? purchaseAny.transactionId ?? null;
        
        const payload: EntitlementSyncPayload = {
            accountHash: identity.accountHash,
            platform: Platform.OS,
            isPremium: true,
            hasUsedFreeExam: entitlement.hasUsedFreeExam,
            purchaseToken,
            productId: purchase.productId,
            receipt,
        };

        const remote = await syncRemoteEntitlement(payload);
        const merged = buildEntitlementFromResponse(remote, {
            ...entitlement,
            isPremium: true,
            updatedAt: new Date().toISOString(),
        });
        await updateEntitlementState(merged);

        try {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
        } catch (error) {
            logger.warn('Failed to finish transaction:', error);
        }
        setPurchaseInProgress(false);
    }, [entitlement, loadAccountIdentity, updateEntitlementState]);

    useEffect(() => {
        let mounted = true;
        const initIap = async () => {
            try {
                await RNIap.initConnection();
                
                await new Promise((resolve) => setTimeout(resolve, 500));
                
                try {
                    const products = await RNIap.fetchProducts({ skus: PRODUCT_IDS, type: 'in-app' });
                    if (mounted && products !== null && products.length > 0) {
                        const firstProduct = products[0] as any;
                        const price = firstProduct?.localizedPrice ?? firstProduct?.price ?? undefined;
                        if (price) {
                            setProductPrice(price);
                        }
                    }
                } catch (productError: any) {
                    const errorMessage = productError?.message || String(productError);
                    if (errorMessage.includes('QueryProduct') || errorMessage.includes('NotPrepared')) {
                        logger.info('IAP products not available (expected in development if product not configured in store)');
                    } else {
                        logger.warn('Failed to fetch IAP products:', productError);
                    }
                }
            } catch (error) {
                logger.warn('Failed to initialize IAP connection:', error);
            } finally {
                if (mounted) {
                    refreshEntitlement();
                }
            }
        };
        initIap();

        purchaseUpdateSubscription.current = RNIap.purchaseUpdatedListener(async (purchase) => {
            await finalizePurchase(purchase);
        });
        purchaseErrorSubscription.current = RNIap.purchaseErrorListener((error: any) => {
            setPurchaseInProgress(false);
            const errorCode = error?.code || error?.message || '';
            const errorMessage = error?.message || String(error);
            
            if (errorCode === 'sku-not-found' || errorMessage.includes('SKU not found') || errorMessage.includes('not found')) {
                logger.info('Purchase product not configured in store (expected in development)');
            } else {
                logger.warn('Purchase error:', error);
            }
        });

        return () => {
            mounted = false;
            purchaseUpdateSubscription.current?.remove();
            purchaseErrorSubscription.current?.remove();
            RNIap.endConnection();
        };
    }, [finalizePurchase, refreshEntitlement]);

    const ensureAccountToken = useCallback(async () => {
        if (Platform.OS !== 'ios') {
            return null;
        }
        const existing = await getStoredAccountToken();
        if (existing) {
            return existing;
        }
        const generated = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await storeAccountToken(generated);
        return generated;
    }, []);

    const purchasePremium = useCallback(async () => {
        setPurchaseInProgress(true);
        try {
            const sku = PRODUCT_IDS[0];
            if (!sku) {
                throw new Error('Produit indisponible');
            }
            const identity = await loadAccountIdentity();
            const accountToken = await ensureAccountToken();
            const request: RNIap.RequestPurchaseProps = {
                type: 'in-app',
                request: {
                    apple: Platform.OS === 'ios' ? {
                        sku,
                        appAccountToken: accountToken,
                        andDangerouslyFinishTransactionAutomatically: false,
                    } : null,
                    google: Platform.OS === 'android' ? {
                        skus: [sku],
                        obfuscatedAccountIdAndroid: identity.accountHash,
                    } : null,
                },
            };
            await RNIap.requestPurchase(request);
        } catch (error: any) {
            const errorMessage = error?.message || String(error);
            const errorCode = error?.code || '';
            
            if (errorCode === 'sku-not-found' || errorMessage.includes('SKU not found') || errorMessage.includes('not found')) {
                logger.info('Purchase product not configured in store (expected in development). Configure "premium_unlock" in Google Play Console / App Store Connect for production.');
            } else {
                logger.warn('Purchase request failed:', error);
            }
            setPurchaseInProgress(false);
        }
    }, [ensureAccountToken, loadAccountIdentity]);

    const restorePurchases = useCallback(async () => {
        try {
            const purchases = await RNIap.getAvailablePurchases();
            if (!purchases.length) {
                Alert.alert(
                    'Aucun achat trouvé',
                    'Aucun achat précédent n\'a été trouvé sur ce compte. Si vous avez déjà acheté la version Premium, assurez-vous d\'être connecté avec le même compte que lors de l\'achat.'
                );
                return;
            }
            const latest = purchases.find((purchase) => PRODUCT_IDS.includes(purchase.productId));
            if (latest) {
                await finalizePurchase(latest);
                Alert.alert(
                    'Achat restauré',
                    'Votre achat a été restauré avec succès. Vous avez maintenant accès à toutes les fonctionnalités Premium.'
                );
            } else {
                Alert.alert(
                    'Aucun achat Premium trouvé',
                    'Aucun achat Premium n\'a été trouvé sur ce compte. Si vous avez déjà acheté la version Premium, assurez-vous d\'être connecté avec le même compte que lors de l\'achat.'
                );
            }
        } catch (error: any) {
            logger.warn('Restore purchase failed:', error);
            const errorMessage = error?.message || String(error);
            Alert.alert(
                'Erreur',
                `Impossible de restaurer les achats. ${errorMessage.includes('not configured') ? 'Le produit n\'est peut-être pas encore configuré dans le store.' : 'Veuillez réessayer plus tard.'}`
            );
        }
    }, [finalizePurchase]);

    const openPaywall = useCallback(() => {
        setPaywallVisible(true);
    }, []);

    const closePaywall = useCallback(() => {
        setPaywallVisible(false);
    }, []);

    const markFreeExamUsed = useCallback(async () => {
        if (entitlement.isPremium || entitlement.hasUsedFreeExam) {
            return;
        }
        const identity = await loadAccountIdentity();
        const updated: PremiumEntitlementState = {
            ...entitlement,
            hasUsedFreeExam: true,
            updatedAt: new Date().toISOString(),
        };
        await updateEntitlementState(updated);
        await syncRemoteEntitlement({
            accountHash: identity.accountHash,
            platform: Platform.OS,
            hasUsedFreeExam: true,
        });
    }, [entitlement, loadAccountIdentity, updateEntitlementState]);

    const value = useMemo<PremiumAccessContextValue>(() => ({
        isPremium: entitlement.isPremium,
        hasUsedFreeExam: entitlement.hasUsedFreeExam,
        isLoading,
        purchaseInProgress,
        productPrice,
        openPaywall,
        closePaywall,
        paywallVisible,
        purchasePremium,
        restorePurchases,
        markFreeExamUsed,
        refreshEntitlement,
    }), [
        entitlement,
        isLoading,
        purchaseInProgress,
        productPrice,
        openPaywall,
        closePaywall,
        paywallVisible,
        purchasePremium,
        restorePurchases,
        markFreeExamUsed,
        refreshEntitlement,
    ]);

    return (
        <PremiumAccessContext.Provider value={value}>
            {children}
            <PaywallModal />
        </PremiumAccessContext.Provider>
    );
};

export const usePremiumAccess = (): PremiumAccessContextValue => {
    const context = useContext(PremiumAccessContext);
    if (!context) {
        throw new Error('usePremiumAccess must be used within PremiumAccessProvider');
    }
    return context;
};

