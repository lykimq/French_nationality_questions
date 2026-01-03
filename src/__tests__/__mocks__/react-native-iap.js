const noop = () => {};

export const purchaseUpdatedListener = () => ({ remove: noop });
export const purchaseErrorListener = () => ({ remove: noop });
export const initConnection = jest.fn().mockResolvedValue(true);
export const endConnection = jest.fn().mockResolvedValue(true);
export const fetchProducts = jest.fn().mockResolvedValue([]);
export const requestPurchase = jest.fn().mockResolvedValue(null);
export const getAvailablePurchases = jest.fn().mockResolvedValue([]);
export const finishTransaction = jest.fn().mockResolvedValue(undefined);
export const flushFailedPurchasesCachedAsPendingAndroid = jest.fn().mockResolvedValue(undefined);
export const PurchaseErrorCode = {};

export default {
    purchaseUpdatedListener,
    purchaseErrorListener,
    initConnection,
    endConnection,
    fetchProducts,
    requestPurchase,
    getAvailablePurchases,
    finishTransaction,
    flushFailedPurchasesCachedAsPendingAndroid,
};

