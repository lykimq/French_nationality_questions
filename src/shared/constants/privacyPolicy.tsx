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
                Dernière mise à jour : 2 janvier 2026
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 24 }]}>
                Responsable du Traitement
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Cette application ("l'Application") est développée et exploitée par un développeur indépendant basé en France. Conformément au Règlement Général sur la Protection des Données (RGPD), nous sommes responsables du traitement de vos données personnelles.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Introduction
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Cette application est conçue pour vous aider à préparer votre entretien de naturalisation française. Nous nous engageons à protéger votre vie privée et vos données personnelles conformément au RGPD et à la législation française en vigueur.
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
                Base Légale et Utilisation des Données
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Les données stockées localement sont traitées sur la base de votre consentement et de l'exécution du contrat (utilisation de l'Application). Elles sont utilisées uniquement pour :
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
                        Améliorer la fonctionnalité et la stabilité de l'application
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Conservation des Données
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Les données stockées localement sont conservées sur votre appareil jusqu'à ce que vous supprimiez l'Application ou réinitialisiez les données via les paramètres. Les données de crash collectées par Sentry sont conservées conformément à leur politique de rétention (généralement 90 jours).
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Services Tiers
            </FormattedText>
            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Firebase Storage
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application utilise Firebase Storage (Google) pour charger du contenu (questions, images) depuis le cloud. Aucune donnée personnelle n'est transmise à Firebase. Pour plus d'informations, consultez la politique de confidentialité de Google : https://policies.google.com/privacy
            </FormattedText>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Sentry
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application utilise Sentry pour collecter des rapports d'erreurs et améliorer la stabilité. Sentry peut collecter des informations techniques anonymes (type d'appareil, version du système d'exploitation, traces d'erreurs) mais aucune donnée personnelle identifiable. Pour plus d'informations, consultez : https://sentry.io/privacy/
            </FormattedText>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Stores d'Applications
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Lors de l'achat de l'Application via Google Play Store ou Apple App Store, ces plateformes peuvent collecter certaines informations conformément à leurs propres politiques de confidentialité. Nous n'avons pas accès aux informations de paiement ou aux coordonnées de votre compte de magasin.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Sécurité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données stockées localement. Cependant, aucune méthode de transmission ou de stockage n'est totalement sécurisée.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Vos Droits (RGPD)
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Conformément au RGPD, vous disposez des droits suivants :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Droit d'accès : consulter vos données stockées localement
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Droit de rectification : modifier vos préférences dans l'application
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Droit à l'effacement : supprimer vos données via les paramètres ou la désinstallation
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Droit à la portabilité : exporter vos données (fonctionnalité disponible dans les paramètres)
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Droit d'opposition : vous pouvez refuser le traitement de vos données en désinstallant l'application
                    </FormattedText>
                </View>
            </View>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Pour exercer ces droits ou déposer une réclamation, vous pouvez nous contacter ou saisir la Commission Nationale de l'Informatique et des Libertés (CNIL) : https://www.cnil.fr
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Modifications de cette Politique
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Transfert de Données
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Les données stockées localement ne quittent pas votre appareil. Les services tiers (Firebase, Sentry) peuvent transférer des données techniques anonymes vers des serveurs situés en dehors de l'UE, conformément aux garanties appropriées (clauses contractuelles types approuvées par la Commission européenne).
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Contact
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter à l'adresse suivante : lykimq@gmail.com
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Conformité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Cette application est conforme au Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne et à la loi Informatique et Libertés française. Nous minimisons la collecte de données et privilégions le stockage local sur votre appareil.
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

