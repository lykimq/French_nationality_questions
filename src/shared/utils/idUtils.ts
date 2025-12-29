import { Alert } from 'react-native';

// ==================== ID UTILITIES ====================

/**
 * Extracts numeric ID from number or string.
 */
export const extractNumericId = (rawId: unknown): number | undefined => {
    if (typeof rawId === 'number') {
        return Number.isFinite(rawId) ? rawId : undefined;
    }
    if (typeof rawId === 'string') {
        const match = rawId.match(/(\d+)/);
        if (match) {
            const value = Number(match[1]);
            return Number.isFinite(value) ? value : undefined;
        }
    }
    return undefined;
};

/**
 * Validates ID is positive finite number.
 */
export const isValidId = (id: unknown): id is number => {
    return typeof id === 'number' && Number.isFinite(id) && id > 0;
};

/**
 * Extracts and validates numeric ID.
 */
export const extractValidId = (rawId: unknown): number | undefined => {
    const id = extractNumericId(rawId);
    return id !== undefined && isValidId(id) ? id : undefined;
};

// ==================== ALERT UTILITIES ====================

interface ConfirmationAlertOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

export const showConfirmationAlert = ({
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    onConfirm,
    onCancel,
}: ConfirmationAlertOptions) => {
    Alert.alert(
        title,
        message,
        [
            {
                text: cancelText,
                style: 'cancel',
                onPress: onCancel,
            },
            {
                text: confirmText,
                style: 'destructive',
                onPress: async () => {
                    await onConfirm();
                },
            },
        ]
    );
};

interface SimpleAlertOptions {
    title: string;
    message: string;
    buttonText?: string;
    onPress?: () => void;
}

export const showSimpleAlert = ({
    title,
    message,
    buttonText = 'OK',
    onPress,
}: SimpleAlertOptions) => {
    Alert.alert(
        title,
        message,
        [
            {
                text: buttonText,
                style: 'default',
                onPress,
            },
        ]
    );
};

