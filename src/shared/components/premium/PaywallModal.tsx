import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import FormattedText from '../FormattedText';
import Icon3D from '../Icon3D';
import { usePremiumAccess } from '../../contexts/PremiumAccessContext';

const BENEFITS = [
    'Toutes les catégories du livret',
    'Cartes flash complètes',
    'Examens et pratiques illimités',
    'Suivi de progression sur tous vos appareils',
];

const PaywallModal: React.FC = () => {
    const { theme } = useTheme();
    const {
        paywallVisible,
        closePaywall,
        purchasePremium,
        restorePurchases,
        purchaseInProgress,
        isPremium,
        productPrice,
    } = usePremiumAccess();

    return (
        <Modal animationType="slide" visible={paywallVisible} transparent onRequestClose={closePaywall}>
            <View style={styles.backdrop}>
                <View style={[styles.sheet, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.header}>
                        <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                            Version complète
                        </FormattedText>
                        <TouchableOpacity onPress={closePaywall} style={styles.closeButton} hitSlop={16}>
                            <Icon3D name="close" size={20} color={theme.colors.text} variant="flat" />
                        </TouchableOpacity>
                    </View>
                    <FormattedText style={[styles.price, { color: theme.colors.primary }]}>
                        {isPremium ? 'Déjà activé' : (productPrice || 'Tarif affiché sur la boutique')}
                    </FormattedText>
                    <FormattedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Payement unique, accès illimité à toutes les fonctionnalités.
                    </FormattedText>

                    <ScrollView style={styles.benefitList} contentContainerStyle={styles.benefitContent}>
                        {BENEFITS.map((benefit) => (
                            <View key={benefit} style={[styles.benefitItem, { borderColor: theme.colors.border }]}>
                                <Icon3D
                                    name="check-circle"
                                    size={20}
                                    color={theme.colors.primary}
                                    variant="flat"
                                />
                                <FormattedText style={[styles.benefitText, { color: theme.colors.text }]}>
                                    {benefit}
                                </FormattedText>
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={purchasePremium}
                        disabled={purchaseInProgress || isPremium}
                        activeOpacity={0.85}
                    >
                        <FormattedText style={styles.primaryButtonText}>
                            {isPremium ? 'Merci pour votre soutien' : purchaseInProgress ? 'Connexion à la boutique...' : 'Débloquer maintenant'}
                        </FormattedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                        onPress={restorePurchases}
                        activeOpacity={0.85}
                    >
                        <FormattedText style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                            Restaurer un achat existant
                        </FormattedText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PaywallModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    closeButton: {
        padding: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    price: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 12,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 6,
    },
    benefitList: {
        marginTop: 20,
        maxHeight: 220,
    },
    benefitContent: {
        paddingBottom: 12,
        gap: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    benefitText: {
        fontSize: 15,
        flex: 1,
    },
    primaryButton: {
        marginTop: 20,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    secondaryButton: {
        marginTop: 12,
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

