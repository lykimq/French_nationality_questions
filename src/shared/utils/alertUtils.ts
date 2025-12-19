import { Alert } from 'react-native';

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

