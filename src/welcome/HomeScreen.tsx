import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from './CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, FrenchCategory } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText, AppHeader, Icon3D } from '../shared/components';
import { sharedStyles } from '../shared/utils';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { questionsData } = useData();

    const categories = React.useMemo(() => {
        const cats = questionsData?.categories || [];
        return [...cats].sort((a, b) => a.id.localeCompare(b.id));
    }, [questionsData?.categories]);

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader
                title="Mon Parcours"
                subtitle="Préparez votre entretien de naturalisation"
                showTricolore={true}
            />

            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Overview Section */}
                <View style={[sharedStyles.premiumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Icon3D name="school" size={24} color={theme.colors.primary} variant="gradient" />
                            <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                {categories.length}
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                Thématiques
                            </FormattedText>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Icon3D name="document-text" size={24} color={theme.colors.primary} variant="gradient" />
                            <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                {categories.reduce((acc, cat) => acc + (cat.questions?.length || 0), 0)}
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                Questions
                            </FormattedText>
                        </View>
                    </View>
                </View>

                <FormattedText style={[sharedStyles.sectionTitle, { color: theme.colors.text, marginTop: 10 }]}>
                    Catégories d'apprentissage
                </FormattedText>

                {categories.length > 0 ? (
                    <View style={styles.categoriesGrid}>
                        {categories.map((category: FrenchCategory) => (
                            <CategoryCard
                                key={category.id}
                                title={category.title}
                                description={category.description}
                                icon={category.icon}
                                count={category.questions?.length || 0}
                                onPress={() => navigateToCategory(category.id)}
                            />
                        ))}
                    </View>
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    categoriesGrid: {
        marginTop: 10,
    },
});

export default HomeScreen;