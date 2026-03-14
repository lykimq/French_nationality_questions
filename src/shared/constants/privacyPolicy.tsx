import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormattedText } from '../components';
import type { Theme } from '../../types';

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

            <FormattedText style={[styles.meta, { color: theme.colors.textMuted }]}>
                Dernière mise à jour : 14 mars 2026
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 24 }]}>
                Introduction
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Naturalisation Test Civique est une application gratuite de préparation à l'entretien de naturalisation française, développée par un développeur indépendant basé en France. Nous respectons votre vie privée conformément au RGPD et à la loi Informatique et Libertés.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Données stockées sur votre appareil
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Toutes vos données restent sur votre téléphone. Rien n'est envoyé à nos serveurs.
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Préférences d'affichage (thème, taille du texte)
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Progression et scores des exercices
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Historique de recherche
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Ce que nous ne collectons pas
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous ne collectons aucune donnée personnelle : ni nom, ni email, ni téléphone, ni localisation.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Services tiers
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'application utilise deux services externes :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Firebase Storage (Google) — pour charger les questions et images. Aucune donnée personnelle n'est transmise.
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Sentry — pour détecter les bugs. Seules des informations techniques anonymes sont collectées (type d'appareil, version du système).
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Vos droits (RGPD)
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Vous pouvez à tout moment :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Consulter vos données dans les paramètres de l'application
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Supprimer vos données en désinstallant l'application
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Contacter la CNIL (cnil.fr) pour toute réclamation
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Contact
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Pour toute question : lykimq@gmail.com
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
