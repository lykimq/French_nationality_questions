import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FormattedText } from "../components";
import type { Theme } from "../../types";

interface PrivacyPolicyProps {
    theme: Theme;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ theme }) => {
    const textColor = theme.colors.text;
    const primaryColor = theme.colors.primary;

    return (
        <View>
            <FormattedText style={[styles.h1, { color: textColor }]}>
                Politique de Confidentialité
            </FormattedText>

            <FormattedText
                style={[styles.meta, { color: theme.colors.textMuted }]}
            >
                Dernière mise à jour : 29 mars 2026
            </FormattedText>

            <FormattedText
                style={[styles.h2, { color: textColor, marginTop: 24 }]}
            >
                Confidentialité Totale
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Naturalisation Test Civique respecte votre vie privée.
                L'application est conçue pour fonctionner de manière anonyme.
            </FormattedText>

            <FormattedText
                style={[styles.h2, { color: textColor, marginTop: 20 }]}
            >
                Données Locales
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Toutes vos données (scores, progression, préférences) sont
                stockées exclusivement sur votre appareil. Aucune donnée
                personnelle n'est collectée ou transmise à nos serveurs.
            </FormattedText>

            <FormattedText
                style={[styles.h2, { color: textColor, marginTop: 20 }]}
            >
                Services Tiers
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'application utilise Firebase (Google) pour le contenu des
                questions et Sentry pour le suivi technique des erreurs (données
                anonymes uniquement).
            </FormattedText>

            <FormattedText
                style={[styles.h2, { color: textColor, marginTop: 20 }]}
            >
                Vos Droits
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Vous restez maître de vos données. Pour supprimer toute trace
                d'utilisation, il vous suffit de désinstaller l'application.
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontSize: 24,
        fontWeight: "bold",
        lineHeight: 32,
        marginBottom: 8,
    },
    h2: {
        fontSize: 20,
        fontWeight: "bold",
        lineHeight: 28,
        marginBottom: 10,
    },
    meta: {
        fontSize: 14,
        fontStyle: "italic",
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
        flexDirection: "row",
        marginBottom: 8,
    },
    bullet: {
        fontSize: 15,
        marginRight: 8,
        fontWeight: "bold",
    },
    listText: {
        fontSize: 15,
        lineHeight: 24,
        flex: 1,
    },
});
