import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText, Icon3D } from '../../shared/components';

interface AboutItemProps {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
}

const AboutItem: React.FC<AboutItemProps> = ({ icon, iconColor, title, description }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.item, { borderBottomColor: theme.colors.divider }]}>
            <Icon3D
                name={icon}
                size={18}
                color={iconColor}
                variant="glass"
                containerStyle={styles.itemIcon}
            />
            <View style={styles.itemTextContainer}>
                <FormattedText style={[styles.itemTitle, { color: theme.colors.text }]}>
                    {title}
                </FormattedText>
                <FormattedText style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
                    {description}
                </FormattedText>
            </View>
        </View>
    );
};

const AboutAppSettings: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View>
            <View style={[styles.disclaimerCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }]}>
                <Icon3D
                    name="information-circle"
                    size={18}
                    color={theme.colors.primary}
                    variant="default"
                    containerStyle={styles.disclaimerIcon}
                />
                <FormattedText style={[styles.disclaimerText, { color: theme.colors.text }]}>
                    Cette application est un outil de préparation pour l'entretien de naturalisation française. Elle n'est pas l'examen officiel et ne remplace pas la préparation officielle fournie par les autorités françaises. Les questions et réponses sont basées sur des sources publiques et peuvent évoluer.
                </FormattedText>
            </View>

            <AboutItem
                icon="book"
                iconColor={theme.colors.primary}
                title="Questions par catégorie"
                description="Parcourez les questions par thème avec des explications détaillées pour comprendre les concepts clés de l'entretien."
            />

            <AboutItem
                icon="document-text"
                iconColor={theme.colors.accent}
                title="Examen civique"
                description="Deux modes disponibles : simulation complète avec timer (40 questions, 45 min) et mode pratique sans contrainte de temps."
            />

            <AboutItem
                icon="school"
                iconColor={theme.colors.warning || '#FF9800'}
                title="Cartes flash"
                description="Outil d'apprentissage actif pour réviser les questions de manière interactive. Retournez les cartes pour tester votre mémoire."
            />

            <AboutItem
                icon="search"
                iconColor={theme.colors.info}
                title="Recherche avancée"
                description="Recherchez des questions par mot-clé avec des filtres par catégorie, présence d'image et plage de questions."
            />
        </View>
    );
};

const styles = StyleSheet.create({
    disclaimerCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 10,
        padding: 14,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        borderWidth: 1,
    },
    disclaimerIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    itemIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 13,
        lineHeight: 19,
    },
});

export default AboutAppSettings;
