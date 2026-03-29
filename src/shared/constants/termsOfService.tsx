import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormattedText } from '../components';
import type { Theme } from '../../types';

interface TermsOfServiceProps {
    theme: Theme;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ theme }) => {
    const textColor = theme.colors.text;
    const primaryColor = theme.colors.primary;

    return (
        <View>
            <FormattedText style={[styles.h1, { color: textColor }]}>
                Conditions d'Utilisation
            </FormattedText>

            <FormattedText style={[styles.meta, { color: theme.colors.textMuted }]}>
                Dernière mise à jour : 29 mars 2026
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 24 }]}>
                Acceptation
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                En utilisant cette application, vous acceptez les présentes conditions.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Usage Personnel
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'application est destinée à un usage strictement personnel et éducatif pour aider à la préparation de l'entretien de naturalisation française.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Contenu et Responsabilité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Le contenu est basé sur des sources publiques. Bien que nous fassions de notre mieux pour le garder à jour, il est fourni sans garantie de succès à l'entretien réel.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Propriété Intellectuelle
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Le design et le contenu de l'application sont protégés. Toute reproduction ou redistribution est interdite.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Droit Applicable
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Ces conditions sont régies par le droit français.
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
        marginBottom: 8,
    },
    h2: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 28,
        marginBottom: 10,
    },
    meta: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    p: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    list: {
        marginBottom: 12,
        marginLeft: 4,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 15,
        marginRight: 8,
        fontWeight: 'bold',
    },
    listText: {
        fontSize: 15,
        lineHeight: 24,
        flex: 1,
    },
});
