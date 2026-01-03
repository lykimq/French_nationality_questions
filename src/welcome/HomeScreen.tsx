import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from './CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, FrenchCategory } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText, InfoBanner, PremiumGate } from '../shared/components';
import { usePremiumAccess } from '../shared/contexts/PremiumAccessContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const FREE_CATEGORY_IDS = new Set(['administration_locale', 'arts_culture_sports']);

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { questionsData } = useData();
    const { isPremium, openPaywall } = usePremiumAccess();

    const categories = React.useMemo(() => {
        const cats = questionsData?.categories || [];
        return [...cats].sort((a, b) => a.id.localeCompare(b.id));
    }, [questionsData?.categories]);

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        Questions de Naturalisation
                    </FormattedText>
                    <FormattedText style={[styles.subtitle, { color: theme.colors.headerText + 'B3' }]}>
                        Préparez votre entretien de naturalisation
                    </FormattedText>
                </View>
            </SafeAreaView>

            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {categories.length > 0 ? (
                    <>
                        <InfoBanner
                            type="disclaimer"
                            title="Application de préparation"
                            message="Cette application est un outil de préparation pour l'entretien de naturalisation française. Elle n'est pas l'examen officiel et ne remplace pas la préparation officielle fournie par les autorités françaises. Les questions et réponses sont basées sur des sources publiques et peuvent évoluer."
                            icon="information-circle"
                            collapsible={true}
                            storageKey="home_disclaimer"
                        />
                        <InfoBanner
                            type="info"
                            title="À propos de cette section"
                            message="Parcourez les questions par catégorie pour vous familiariser avec les différents thèmes de l'entretien de naturalisation. Chaque catégorie contient des questions avec des explications détaillées pour vous aider à comprendre les concepts clés."
                            icon="book"
                            collapsible={true}
                            storageKey="home_info"
                        />
                        {categories.map((category: FrenchCategory) => {
                            const isUnlocked = isPremium || FREE_CATEGORY_IDS.has(category.id);
                            if (isUnlocked) {
                                return (
                                    <CategoryCard
                                        key={category.id}
                                        title={category.title}
                                        description={category.description}
                                        icon={category.icon}
                                        count={category.questions?.length || 0}
                                        onPress={() => navigateToCategory(category.id)}
                                    />
                                );
                            }
                            return (
                                <PremiumGate
                                    key={`${category.id}_locked`}
                                    isLocked={true}
                                    hint="Accès complet aux catégories avec la version Premium."
                                >
                                    <CategoryCard
                                        title={category.title}
                                        description={category.description}
                                        icon={category.icon}
                                        count={category.questions?.length || 0}
                                        onPress={openPaywall}
                                    />
                                </PremiumGate>
                            );
                        })}

                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <FormattedText style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                            Chargement des catégories...
                        </FormattedText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 5,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default HomeScreen;