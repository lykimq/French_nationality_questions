import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import FormattedText from '../FormattedText';
import Icon3D from '../Icon3D';
import { usePremiumAccess } from '../../contexts/PremiumAccessContext';

interface PremiumGateProps {
    readonly isLocked: boolean;
    readonly children: React.ReactNode;
    readonly hint?: string;
    readonly onUnlockRequest?: () => void;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ isLocked, children, hint, onUnlockRequest }) => {
    const { theme } = useTheme();
    const { openPaywall } = usePremiumAccess();

    if (!isLocked) {
        return <>{children}</>;
    }

    const handleUnlock = () => {
        if (onUnlockRequest) {
            onUnlockRequest();
            return;
        }
        openPaywall();
    };

    return (
        <View style={styles.lockWrapper}>
            <View pointerEvents="none" style={[styles.dimmed, { borderColor: theme.colors.border }]}>
                {children}
            </View>
            <TouchableOpacity
                style={[styles.overlay, { backgroundColor: theme.colors.card + 'F2', borderColor: theme.colors.border }]}
                activeOpacity={0.85}
                onPress={handleUnlock}
            >
                <View style={styles.overlayContent}>
                    <Icon3D
                        name="lock-closed"
                        size={20}
                        color={theme.colors.primary}
                        variant="elevated"
                    />
                    <FormattedText style={[styles.overlayText, { color: theme.colors.primary }]}>
                        Débloquez cette fonctionnalité
                    </FormattedText>
                </View>
                {hint ? (
                    <FormattedText style={[styles.hintText, { color: theme.colors.textSecondary }]}>
                        {hint}
                    </FormattedText>
                ) : null}
            </TouchableOpacity>
        </View>
    );
};

export default PremiumGate;

const styles = StyleSheet.create({
    lockWrapper: {
        position: 'relative',
    },
    dimmed: {
        opacity: 0.4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    overlayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    overlayText: {
        fontWeight: '600',
    },
    hintText: {
        fontSize: 13,
        textAlign: 'center',
    },
});

