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
                En téléchargeant, installant ou utilisant cette application ("l'Application"), vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application et demander un remboursement conformément aux politiques des stores d'applications.
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
                Achat et Paiement
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application est disponible à l'achat via Google Play Store et Apple App Store. Le prix est indiqué sur chaque plateforme. Le paiement est géré par ces stores conformément à leurs conditions générales. Nous n'avons pas accès à vos informations de paiement.
            </FormattedText>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Remboursements
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Les demandes de remboursement sont gérées par Google Play Store ou Apple App Store selon leurs politiques respectives. Conformément au droit français et européen, vous disposez d'un droit de rétractation de 14 jours à compter de l'achat, sauf si vous avez expressément renoncé à ce droit lors de l'achat d'un contenu numérique.
            </FormattedText>

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
                        Préparer votre entretien de naturalisation française
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
                        Utiliser toutes les fonctionnalités éducatives disponibles à des fins personnelles
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h3, { color: textColor, marginTop: 16 }]}>
                Utilisation Interdite
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Il est strictement interdit de :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Utiliser l'Application à des fins commerciales, de revente ou de redistribution sans autorisation écrite
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Copier, reproduire, modifier, adapter, traduire ou distribuer le contenu de l'Application
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Effectuer de l'ingénierie inverse, décompiler ou désassembler l'Application
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Tenter de contourner les mesures de sécurité ou d'accéder à des fonctionnalités non autorisées
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Utiliser l'Application de manière à violer les lois françaises, européennes ou internationales
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Propriété Intellectuelle
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'Application et tous ses contenus (textes, questions, réponses, images, code source, conception, marques, logos) sont protégés par les lois françaises et internationales sur la propriété intellectuelle, notamment le Code de la propriété intellectuelle et les conventions internationales (Berne, OMPI).
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'achat de l'Application vous accorde une licence d'utilisation personnelle, non exclusive, non transférable et révocable pour utiliser l'Application sur vos appareils personnels. Cette licence ne vous confère aucun droit de propriété sur l'Application ou son contenu.
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
                Conformément à la législation française et européenne, notre responsabilité est limitée aux dommages directs et prévisibles résultant d'un manquement à nos obligations. Nous ne pourrons être tenus responsables :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des dommages indirects, accessoires ou consécutifs
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        De la perte de données ou de profits
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des échecs à l'entretien de naturalisation (l'Application est un outil d'aide, non une garantie)
                    </FormattedText>
                </View>
            </View>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Cette limitation ne s'applique pas en cas de faute lourde ou de dol, ni aux dommages corporels, conformément à la législation française.
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
                Droit Applicable et Règlement des Litiges
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Ces conditions sont régies par le droit français. Conformément à la législation européenne, les consommateurs résidant dans l'UE bénéficient des protections prévues par la directive 2011/83/UE et peuvent saisir les juridictions de leur pays de résidence.
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Conformément à l'article L.612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en cas de litige. La plateforme européenne de règlement en ligne des litiges est accessible à : https://ec.europa.eu/consumers/odr/
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                À défaut d'accord amiable, tout litige relèvera de la compétence des tribunaux français, sous réserve des règles impératives de compétence applicables aux consommateurs.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Contact et Support
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Pour toute question concernant ces conditions d'utilisation, pour signaler un problème ou exercer vos droits, vous pouvez nous contacter à l'adresse suivante : lykimq@gmail.com
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

