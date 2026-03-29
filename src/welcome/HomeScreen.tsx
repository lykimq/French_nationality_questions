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
import { FormattedText, AppHeader, Icon3D, StreakBadge, GlobalSearchBar } from '../shared/components';
import { sharedStyles } from '../shared/utils';
import { useMastery } from '../shared/contexts/MasteryContext';
import { getCategoryMasteryStats } from '../shared/utils/MasteryUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme } = useTheme();
    const { questionsData } = useData();
    const { getGlobalMasteryPercentage, masteryMap } = useMastery();

    const globalMastery = getGlobalMasteryPercentage();

    const categories = React.useMemo(() => {
        const cats = questionsData?.categories || [];
        return [...cats].sort((a, b) => a.id.localeCompare(b.id));
    }, [questionsData?.categories]);

    const navigateToCategory = (categoryId: string) => {
        if (categoryId === 'recommended') {
            navigation.navigate('FlashCard' as any, { categoryId });
        } else {
            // New navigation flow: Home -> Detail -> FlashCard
            navigation.navigate('CategoryDetail' as any, { categoryId });
        }
    };

    const navigateToSearch = () => {
        navigation.navigate('QuestionSearch' as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader
                title="Mon Parcours"
                subtitle="Préparez votre entretien de naturalisation"
                showTricolore={true}
                rightAction={<StreakBadge streak={1} />} // Placeholder streak value
            />

            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Global Search Bar */}
                <GlobalSearchBar onPress={navigateToSearch} />

                {/* Stats Overview */}
                <View style={[sharedStyles.premiumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, paddingVertical: 20 }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Icon3D name="school" size={24} color={theme.colors.primary} variant="gradient" />
                            </View>
                            <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                {categories.length}
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Thématiques
                            </FormattedText>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#4CAF5015' }]}>
                                <Icon3D name="document-text" size={24} color="#4CAF50" variant="gradient" />
                            </View>
                            <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                {categories.reduce((acc, cat) => acc + (cat.questions?.length || 0), 0)}
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Questions
                            </FormattedText>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#FF980015' }]}>
                                <Icon3D name="medal" size={24} color="#FF9800" variant="gradient" />
                            </View>
                            <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                {globalMastery}%
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Maîtrise
                            </FormattedText>
                        </View>
                    </View>
                </View>

                {/* Recommended for You */}
                <TouchableOpacity 
                    style={[sharedStyles.premiumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary, borderWidth: 1.5, padding: 16 }]}
                    onPress={() => navigateToCategory('recommended')}
                    activeOpacity={0.9}
                >
                    <View style={sharedStyles.row}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons name="sparkles" size={26} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <FormattedText style={{ fontWeight: 'bold', fontSize: 17, color: theme.colors.text }}>
                                Recommandé pour vous
                            </FormattedText>
                            <FormattedText style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                                Session de 20 questions personnalisées
                            </FormattedText>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
                    </View>
                </TouchableOpacity>

                <View style={[sharedStyles.spaceBetween, { marginTop: 25, marginBottom: 15 }]}>
                    <FormattedText style={[sharedStyles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>
                        Catégories
                    </FormattedText>
                    <TouchableOpacity>
                        <FormattedText style={{ color: theme.colors.primary, fontWeight: '500' }}>
                            Voir tout
                        </FormattedText>
                    </TouchableOpacity>
                </View>

                {categories.length > 0 ? (
                    <View style={styles.categoriesGrid}>
                        {categories.map((category: FrenchCategory) => {
                            const stats = getCategoryMasteryStats(category.questions || [], masteryMap);
                            return (
                                <CategoryCard
                                    key={category.id}
                                    title={category.title}
                                    description={category.description}
                                    icon={category.icon}
                                    count={category.questions?.length || 0}
                                    progress={stats.percentage / 100}
                                    onPress={() => navigateToCategory(category.id)}
                                />
                            );
                        })}
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
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
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