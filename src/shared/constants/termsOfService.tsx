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
                Dernière mise à jour : 14 mars 2026
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 24 }]}>
                Acceptation
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                En utilisant cette application, vous acceptez les présentes conditions. Si vous ne les acceptez pas, veuillez ne pas utiliser l'application.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Description de l'application
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Naturalisation Test Civique est une application gratuite d'aide à la préparation de l'entretien de naturalisation française. Elle propose :
            </FormattedText>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des questions-réponses sur la culture, l'histoire et les valeurs françaises
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des simulations d'examen civique
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Des cartes flash pour réviser
                    </FormattedText>
                </View>
                <View style={styles.listItem}>
                    <Text style={[styles.bullet, { color: primaryColor }]}>• </Text>
                    <FormattedText style={[styles.listText, { color: textColor }]}>
                        Une recherche avancée par mot-clé
                    </FormattedText>
                </View>
            </View>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Utilisation autorisée
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Vous pouvez utiliser l'application librement pour votre préparation personnelle. Il est interdit de copier, redistribuer ou revendre le contenu de l'application, ou d'en effectuer l'ingénierie inverse.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Exactitude du contenu
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Les questions et réponses sont basées sur des sources publiques et fournies à titre éducatif. Nous faisons notre possible pour maintenir le contenu à jour, mais nous ne garantissons pas qu'il corresponde exactement aux questions de l'entretien réel. Consultez toujours les sources officielles pour les informations les plus récentes.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Limitation de responsabilité
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'application est fournie « en l'état ». Nous ne garantissons pas la réussite de votre entretien de naturalisation. L'application est un outil d'aide, pas une garantie de résultat. Conformément au droit français, notre responsabilité est limitée aux dommages directs et prévisibles.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Propriété intellectuelle
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                L'application et son contenu sont protégés par le droit de la propriété intellectuelle. Vous bénéficiez d'une licence d'utilisation personnelle, non exclusive et non transférable.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Modifications
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Nous pouvons modifier ces conditions ou le contenu de l'application à tout moment. L'utilisation continue après modification vaut acceptation des nouvelles conditions.
            </FormattedText>

            <FormattedText style={[styles.h2, { color: textColor, marginTop: 20 }]}>
                Droit applicable
            </FormattedText>
            <FormattedText style={[styles.p, { color: textColor }]}>
                Ces conditions sont régies par le droit français. En cas de litige, vous pouvez recourir à un médiateur de la consommation ou saisir les tribunaux compétents.
            </FormattedText>

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
