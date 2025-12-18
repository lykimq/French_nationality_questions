import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../shared/contexts/ThemeContext';
import { useTest } from './contexts/TestContext';
import { FormattedText, BackButton } from '../shared/components';
import { sharedStyles } from '../shared/utils';
import { TestStackParamList } from '../types';

type ProgressScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const ProgressScreen = () => {
    const navigation = useNavigation<ProgressScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { testProgress, testStatistics, isLoading, refreshProgress } = useTest();

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Refresh progress when screen loads
        handleRefresh();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshProgress();
        } catch (error) {
            console.error('Error refreshing progress:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const getPerformanceColor = (accuracy: number) => {
        const safeAccuracy = accuracy || 0;
        if (safeAccuracy >= 80) return theme.colors.success;
        if (safeAccuracy >= 60) return theme.colors.warning;
        return theme.colors.error;
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return 'trending-up';
            case 'declining': return 'trending-down';
            default: return 'remove';
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving': return theme.colors.success;
            case 'declining': return theme.colors.error;
            default: return theme.colors.textMuted;
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    Chargement des statistiques...
                </FormattedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <BackButton onPress={handleGoBack} />
                    <View style={styles.headerCenter}>
                        <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                            Progression
                        </FormattedText>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Overall Progress */}
                    <View style={[styles.overallCard, { backgroundColor: theme.colors.surface }]}>
                        <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                            Progression Globale
                        </FormattedText>

                        <View style={styles.progressStats}>
                            <View style={styles.progressStat}>
                                <FormattedText style={[styles.progressValue, { color: theme.colors.primary }]}>
                                    {testProgress.totalTestsTaken || 0}
                                </FormattedText>
                                <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                                    Tests effectués
                                </FormattedText>
                            </View>

                            <View style={styles.progressStat}>
                                <FormattedText style={[styles.progressValue, { color: theme.colors.success }]}>
                                    {Math.round(testProgress.averageScore || 0)}%
                                </FormattedText>
                                <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                                    Score moyen
                                </FormattedText>
                            </View>

                            <View style={styles.progressStat}>
                                <FormattedText style={[styles.progressValue, { color: theme.colors.warning }]}>
                                    {Math.round(testProgress.bestScore || 0)}%
                                </FormattedText>
                                <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                                    Meilleur score
                                </FormattedText>
                            </View>
                        </View>

                        <View style={styles.trendContainer}>
                            <Ionicons
                                name={getTrendIcon(testStatistics.improvementTrend || 'stable')}
                                size={20}
                                color={getTrendColor(testStatistics.improvementTrend || 'stable')}
                            />
                            <FormattedText style={[styles.trendText, { color: getTrendColor(testStatistics.improvementTrend || 'stable') }]}>
                                {(testStatistics.improvementTrend || 'stable') === 'improving' ? 'En progression' :
                                    (testStatistics.improvementTrend || 'stable') === 'declining' ? 'En baisse' : 'Stable'}
                            </FormattedText>
                        </View>
                    </View>

                    {/* Category Performance */}
                    {Object.keys(testStatistics.categoryPerformance).length > 0 && (
                        <View style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}>
                            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                                Performance par Catégorie
                            </FormattedText>

                            {Object.values(testStatistics.categoryPerformance).map((category, index) => (
                                <View key={index} style={styles.categoryItem}>
                                    <View style={styles.categoryHeader}>
                                        <FormattedText style={[styles.categoryTitle, { color: theme.colors.text }]}>
                                            {category.categoryTitle}
                                        </FormattedText>
                                        <FormattedText
                                            style={[styles.categoryAccuracy, { color: getPerformanceColor(category.accuracy || 0) }]}
                                        >
                                            {Math.round(category.accuracy || 0)}%
                                        </FormattedText>
                                    </View>

                                    <View style={styles.categoryStats}>
                                        <FormattedText style={[styles.categoryStatsText, { color: theme.colors.textMuted }]}>
                                            {category.correctAnswers || 0}/{category.questionsAttempted || 0} correctes • {Math.round(category.averageTime || 0)}s moy.
                                        </FormattedText>
                                    </View>

                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                {
                                                    width: `${Math.min(100, Math.max(0, category.accuracy || 0))}%`,
                                                    backgroundColor: getPerformanceColor(category.accuracy || 0),
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recent Scores */}
                    {testProgress.recentScores.length > 0 && (
                        <View style={[styles.scoresCard, { backgroundColor: theme.colors.surface }]}>
                            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                                Scores Récents
                            </FormattedText>

                            <View style={styles.scoresContainer}>
                                {testProgress.recentScores.slice(-10).map((score, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.scoreItem,
                                            { backgroundColor: getPerformanceColor(score || 0) + '20' }
                                        ]}
                                    >
                                        <FormattedText style={[styles.scoreText, { color: getPerformanceColor(score || 0) }]}>
                                            {Math.round(score || 0)}%
                                        </FormattedText>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Question Analysis */}
                    <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
                        <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                            Analyse des Questions
                        </FormattedText>

                        <View style={styles.analysisStats}>
                            <View style={styles.analysisStat}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                                <FormattedText style={[styles.analysisValue, { color: theme.colors.success }]}>
                                    {testStatistics.masteredQuestions?.length || 0}
                                </FormattedText>
                                <FormattedText style={[styles.analysisLabel, { color: theme.colors.textMuted }]}>
                                    Maîtrisées
                                </FormattedText>
                            </View>

                            <View style={styles.analysisStat}>
                                <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
                                <FormattedText style={[styles.analysisValue, { color: theme.colors.warning }]}>
                                    {testStatistics.strugglingQuestions?.length || 0}
                                </FormattedText>
                                <FormattedText style={[styles.analysisLabel, { color: theme.colors.textMuted }]}>
                                    À revoir
                                </FormattedText>
                            </View>

                            <View style={styles.analysisStat}>
                                <Ionicons name="bar-chart" size={20} color={theme.colors.primary} />
                                <FormattedText style={[styles.analysisValue, { color: theme.colors.primary }]}>
                                    {testProgress.questionsAnswered || 0}
                                </FormattedText>
                                <FormattedText style={[styles.analysisLabel, { color: theme.colors.textMuted }]}>
                                    Total répondues
                                </FormattedText>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    header: {
        ...sharedStyles.header,
    },
    backButton: {
        ...sharedStyles.backButton,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    overallCard: {
        ...sharedStyles.card,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    progressStat: {
        alignItems: 'center',
    },
    progressValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    trendText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    categoryCard: {
        ...sharedStyles.card,
    },
    categoryItem: {
        marginBottom: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    categoryAccuracy: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryStats: {
        marginBottom: 8,
    },
    categoryStatsText: {
        fontSize: 12,
    },
    progressBar: {
        ...sharedStyles.progressBar,
    },
    progressBarFill: {
        ...sharedStyles.progressBarFill,
    },
    scoresCard: {
        ...sharedStyles.card,
    },
    scoresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    scoreItem: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 50,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 12,
        fontWeight: '600',
    },
    analysisCard: {
        ...sharedStyles.card,
    },
    analysisStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    analysisStat: {
        alignItems: 'center',
        flex: 1,
    },
    analysisValue: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 8,
    },
    analysisLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
});

export default ProgressScreen;