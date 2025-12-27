import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormattedText } from '../components';
import type { Theme } from '../../types';

interface TermsOfServiceProps {
    theme: Theme & { icons: any };
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
                Dernière mise à jour : 27 janvier 2025
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 24 }]}>
                Acceptation des Conditions
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                En utilisant cette application ("l'Application"), vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Description du Service
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application est un outil éducatif conçu pour vous aider à préparer votre entretien de naturalisation française. Elle fournit :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des questions et réponses sur la culture, l'histoire et les valeurs françaises
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des exercices pratiques pour l'examen civique
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des cartes flash pour la révision
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des fonctionnalités de recherche et de navigation
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Utilisation de l'Application
            </FormattedText>
            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Utilisation Autorisée
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Vous pouvez utiliser l'Application pour :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Préparer votre entretien de naturalisation
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Étudier les questions et réponses fournies
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Utiliser toutes les fonctionnalités éducatives disponibles
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Utilisation Interdite
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Il est interdit de :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Utiliser l'Application à des fins commerciales sans autorisation
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Copier, modifier ou distribuer le contenu de l'Application sans autorisation
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Tenter de contourner les mesures de sécurité
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Utiliser l'Application de manière à violer les lois applicables
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Propriété Intellectuelle
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Tous les contenus de l'Application, y compris mais sans s'y limiter :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Les textes, questions et réponses
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Les images et graphiques
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Le code source et la conception
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Les marques et logos
                    </FormattedText>
                </View>
            </View>
            <FormattedText style={[styles.p, { color: textColor }]}>
                sont protégés par les lois sur la propriété intellectuelle et appartiennent à leurs propriétaires respectifs.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Exactitude du Contenu
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Bien que nous nous efforcions de fournir des informations exactes et à jour, nous ne garantissons pas :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        L'exactitude complète de toutes les informations
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Que le contenu est toujours à jour avec les dernières réglementations
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Que les questions correspondent exactement à celles de l'entretien réel
                    </FormattedText>
                </View>
            </View>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application est fournie à titre informatif et éducatif uniquement.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Avis de Non-Responsabilité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application est fournie "en l'état" sans garantie d'aucune sorte. Nous ne garantissons pas que :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        L'Application fonctionnera sans interruption ou erreur
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Les résultats obtenus garantiront la réussite de votre entretien
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Toutes les fonctionnalités seront disponibles en permanence
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Limitation de Responsabilité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Dans la mesure permise par la loi, nous ne serons pas responsables des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser l'Application.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Modifications du Service
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous nous réservons le droit de :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Modifier ou interrompre l'Application à tout moment
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Ajouter ou supprimer des fonctionnalités
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Mettre à jour le contenu
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Résiliation
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous nous réservons le droit de suspendre ou de résilier votre accès à l'Application à tout moment, sans préavis, pour violation de ces conditions.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Modifications des Conditions
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous pouvons modifier ces conditions d'utilisation à tout moment. Les modifications entreront en vigueur dès leur publication. Votre utilisation continue de l'Application après les modifications constitue votre acceptation des nouvelles conditions.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Droit Applicable
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Ces conditions sont régies par les lois françaises. Tout litige sera soumis à la juridiction exclusive des tribunaux français.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Contact
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via les canaux de support de l'application.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Acceptation
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                En utilisant cette Application, vous reconnaissez avoir lu, compris et accepté ces conditions d'utilisation.
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

