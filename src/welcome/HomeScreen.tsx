import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from './CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, FrenchCategory } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText, AppHeader, Icon3D, ProgressBar } from '../shared/components';
import { sharedStyles } from '../shared/utils';
import { useMastery } from '../shared/contexts/MasteryContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { questionsData } = useData();
    const { getGlobalMasteryPercentage, dailyStats } = useMastery();

    const globalMastery = getGlobalMasteryPercentage();
    const dailyProgress = dailyStats.goal > 0 ? dailyStats.count / dailyStats.goal : 0;

    const categories = React.useMemo(() => {
        const cats = questionsData?.categories || [];
        return [...cats].sort((a, b) => a.id.localeCompare(b.id));
    }, [questionsData?.categories]);

    const navigateToCategory = (categoryId: string) => {
        if (categoryId === 'recommended') {
            // Navigate directly to FlashCard for the next-gen experience
            navigation.navigate('FlashCard' as any, { categoryId });
        } else {
            navigation.navigate('CategoryQuestions', { categoryId });
        }
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

                    {/* Mastery Progress */}
                    <View style={styles.masteryContainer}>
                        <View style={sharedStyles.spaceBetween}>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Maîtrise Globale
                            </FormattedText>
                            <FormattedText style={[styles.statValue, { color: theme.colors.primary, fontSize: 14, marginTop: 0 }]}>
                                {globalMastery}%
                            </FormattedText>
                        </View>
                        <ProgressBar 
                            progress={globalMastery / 100} 
                            height={8} 
                            containerStyle={{ marginTop: 8 }} 
                        />
                    </View>
                </View>

                {/* Daily Goal Section */}
                <View style={[sharedStyles.premiumCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30', padding: 16 }]}>
                    <View style={sharedStyles.row}>
                        <Icon3D name="flash" size={32} color={theme.colors.primary} variant="gradient" />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <FormattedText style={[styles.statLabel, { fontWeight: 'bold', color: theme.colors.text }]}>
                                Objectif du jour
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { fontSize: 12, color: theme.colors.textSecondary }]}>
                                {dailyStats.count} / {dailyStats.goal} questions révisées
                            </FormattedText>
                        </View>
                        <FormattedText style={[styles.statValue, { color: theme.colors.primary, fontSize: 16, marginTop: 0 }]}>
                            {Math.round(dailyProgress * 100)}%
                        </FormattedText>
                    </View>
                    <ProgressBar 
                        progress={dailyProgress} 
                        height={4} 
                        color={theme.colors.primary} 
                        containerStyle={{ marginTop: 12 }} 
                    />
                </View>

                {/* Recommended for You */}
                <TouchableOpacity 
                    style={[sharedStyles.premiumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary, borderWidth: 2 }]}
                    onPress={() => navigateToCategory('recommended')}
                >
                    <View style={sharedStyles.row}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <FormattedText style={[styles.statLabel, { fontWeight: 'bold', fontSize: 16, color: theme.colors.text }]}>
                                Recommandé pour vous
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Session personnalisée basée sur votre progression
                            </FormattedText>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
                    </View>
                </TouchableOpacity>

                <FormattedText style={[sharedStyles.sectionTitle, { color: theme.colors.text, marginTop: 25 }]}>
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
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    masteryContainer: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoriesGrid: {
        marginTop: 10,
        paddingBottom: 80, // Space for floating tab bar
    },
});

export default HomeScreen;