import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormattedText } from '../components';
import type { Theme } from '../../types';

interface PrivacyPolicyProps {
    theme: Theme & { icons: any };
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
                Dernière mise à jour : 27 janvier 2025
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 24 }]}>
                Introduction
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Cette application ("l'Application") est conçue pour vous aider à préparer votre entretien de naturalisation française. Nous nous engageons à protéger votre vie privée et vos données personnelles.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Données Collectées
            </FormattedText>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Données Stockées Localement
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application stocke les données suivantes uniquement sur votre appareil :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Vos préférences d'affichage (thème, formatage du texte)
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Vos statistiques de progression (scores, questions répondues)
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Votre historique de recherche (optionnel)
                    </FormattedText>
                </View>
            </View>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Ces données sont stockées localement sur votre appareil et ne sont jamais transmises à nos serveurs.
            </FormattedText>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Données Non Collectées
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous ne collectons <Text style={styles.bold}>PAS</Text> :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Votre nom ou identité
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Votre adresse email
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Votre numéro de téléphone
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Votre localisation
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Toute autre information personnelle identifiable
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Utilisation des Données
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Les données stockées localement sont utilisées uniquement pour :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Personnaliser votre expérience dans l'application
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Suivre votre progression dans les exercices
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Améliorer la fonctionnalité de l'application
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Services Tiers
            </FormattedText>
            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Firebase Storage
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application utilise Firebase Storage pour charger du contenu (questions, images) depuis le cloud. Firebase est un service fourni par Google et est soumis à leur politique de confidentialité. Aucune donnée personnelle n'est transmise à Firebase.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Sécurité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données stockées localement. Cependant, aucune méthode de transmission ou de stockage n'est totalement sécurisée.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Vos Droits
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit de :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Accéder à vos données
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Supprimer vos données (via les paramètres de l'application)
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Exporter vos données
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Modifications de cette Politique
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Contact
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via les canaux de support de l'application.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Conformité RGPD
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Cette application est conforme au Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne. Nous ne collectons pas de données personnelles et toutes les données sont stockées localement sur votre appareil.
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
    h3: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        marginBottom: 8,
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
    bold: {
        fontWeight: 'bold',
    },
});

