import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTest } from '../contexts/TestContext';
import FormattedText from '../components/FormattedText';
import { TestResult } from '../types/test';
import { RootStackParamList } from '../types/types';

const { width, height } = Dimensions.get('window');

type TestResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TestResultScreen = () => {
    const navigation = useNavigation<TestResultScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { testProgress, testStatistics, generateRecommendations } = useTest();

    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate getting test result - in real implementation this would come from navigation params
        const mockResult: TestResult = {
            session: {
                id: Date.now().toString(),
                mode: 'standard',
                questions: [],
                answers: [],
                startTime: new Date(),
                endTime: new Date(),
                isCompleted: true,
                score: 85,
                totalQuestions: 25,
                correctAnswers: 21,
            },
            statistics: testStatistics,
            recommendations: generateRecommendations(),
        };

        setTestResult(mockResult);
        setIsLoading(false);
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return theme.colors.success;
        if (score >= 60) return theme.colors.warning;
        return theme.colors.error;
    };

    const getScoreMessage = (score: number) => {
        if (score >= 90) {
            return language === 'fr' ? 'Excellent!' : 'Xuất sắc!';
        } else if (score >= 80) {
            return language === 'fr' ? 'Très bien!' : 'Rất tốt!';
        } else if (score >= 70) {
            return language === 'fr' ? 'Bien!' : 'Tốt!';
        } else if (score >= 60) {
            return language === 'fr' ? 'Passable' : 'Đạt';
        } else {
            return language === 'fr' ? 'À améliorer' : 'Cần cải thiện';
        }
    };

    const handleRetakeTest = () => {
        navigation.navigate('TestTab', undefined);
    };

    const handleViewProgress = () => {
        navigation.navigate('TestTab', undefined);
    };

    if (isLoading || !testResult) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    {language === 'fr' ? 'Chargement des résultats...' : 'Đang tải kết quả...'}
                </FormattedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('TestTab', undefined)} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.colors.headerText} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                            {language === 'fr' ? 'Résultats du Test' : 'Kết quả bài kiểm tra'}
                        </FormattedText>
                    </View>
                    <View style={styles.languageSelector}>
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor={theme.colors.switchThumb}
                            trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                            style={styles.languageSwitch}
                        />
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Score Card */}
                    <LinearGradient
                        colors={[getScoreColor(testResult.session.score) + '20', getScoreColor(testResult.session.score) + '05']}
                        style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}
                    >
                        <View style={styles.scoreHeader}>
                            <Ionicons name="trophy" size={32} color={getScoreColor(testResult.session.score)} />
                            <FormattedText style={[styles.scoreMessage, { color: getScoreColor(testResult.session.score) }]}>
                                {getScoreMessage(testResult.session.score)}
                            </FormattedText>
                        </View>

                        <View style={styles.scoreMain}>
                            <FormattedText style={[styles.scoreValue, { color: getScoreColor(testResult.session.score) }]}>
                                {testResult.session.score}%
                            </FormattedText>
                            <FormattedText style={[styles.scoreDetails, { color: theme.colors.textMuted }]}>
                                {testResult.session.correctAnswers} / {testResult.session.totalQuestions} {language === 'fr' ? 'correctes' : 'đúng'}
                            </FormattedText>
                        </View>
                    </LinearGradient>

                    {/* Statistics */}
                    <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                        <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Statistiques' : 'Thống kê'}
                        </FormattedText>

                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Ionicons name="time" size={20} color={theme.colors.primary} />
                                <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Temps moyen' : 'Thời gian TB'}
                                </FormattedText>
                                <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                    {testStatistics.timeStats.averageTimePerQuestion}s
                                </FormattedText>
                            </View>

                            <View style={styles.statItem}>
                                <Ionicons name="trending-up" size={20} color={theme.colors.success} />
                                <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Tendance' : 'Xu hướng'}
                                </FormattedText>
                                <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                    {language === 'fr' ? (
                                        testStatistics.improvementTrend === 'improving' ? 'Progression' :
                                            testStatistics.improvementTrend === 'declining' ? 'Baisse' : 'Stable'
                                    ) : (
                                        testStatistics.improvementTrend === 'improving' ? 'Tiến bộ' :
                                            testStatistics.improvementTrend === 'declining' ? 'Giảm' : 'Ổn định'
                                    )}
                                </FormattedText>
                            </View>

                            <View style={styles.statItem}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                                <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Maîtrisées' : 'Đã thành thạo'}
                                </FormattedText>
                                <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                    {testStatistics.masteredQuestions.length}
                                </FormattedText>
                            </View>

                            <View style={styles.statItem}>
                                <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
                                <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'À revoir' : 'Cần xem lại'}
                                </FormattedText>
                                <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                                    {testStatistics.strugglingQuestions.length}
                                </FormattedText>
                            </View>
                        </View>
                    </View>

                    {/* Recommendations */}
                    {testResult.recommendations.length > 0 && (
                        <View style={[styles.recommendationsCard, { backgroundColor: theme.colors.surface }]}>
                            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Recommandations' : 'Đề xuất'}
                            </FormattedText>

                            {testResult.recommendations.map((rec, index) => (
                                <View key={index} style={styles.recommendationItem}>
                                    <View style={styles.recommendationHeader}>
                                        <Ionicons
                                            name={rec.type === 'good_job' ? 'trophy' : 'bulb'}
                                            size={20}
                                            color={theme.colors.primary}
                                        />
                                        <FormattedText style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                                            {language === 'fr' ? rec.title_fr : rec.title_vi}
                                        </FormattedText>
                                    </View>
                                    <FormattedText style={[styles.recommendationDescription, { color: theme.colors.textMuted }]}>
                                        {language === 'fr' ? rec.description_fr : rec.description_vi}
                                    </FormattedText>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Progress Overview */}
                    <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
                        <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Progression Globale' : 'Tiến độ tổng thể'}
                        </FormattedText>

                        <View style={styles.progressStats}>
                            <View style={styles.progressStat}>
                                <FormattedText style={[styles.progressValue, { color: theme.colors.primary }]}>
                                    {testProgress.totalTestsTaken}
                                </FormattedText>
                                <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Tests effectués' : 'Bài test đã làm'}
                                </FormattedText>
                            </View>

                            <View style={styles.progressStat}>
                                <FormattedText style={[styles.progressValue, { color: theme.colors.success }]}>
                                    {testProgress.averageScore}%
                                </FormattedText>
                                <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Score moyen' : 'Điểm trung bình'}
                                </FormattedText>
                            </View>

                            <View style={styles.progressStat}>
                                <FormattedText style={[styles.progressValue, { color: theme.colors.warning }]}>
                                    {testProgress.bestScore}%
                                </FormattedText>
                                <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                                    {language === 'fr' ? 'Meilleur score' : 'Điểm cao nhất'}
                                </FormattedText>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.border }]}
                        onPress={handleViewProgress}
                    >
                        <Ionicons name="analytics" size={20} color={theme.colors.primary} />
                        <FormattedText style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                            {language === 'fr' ? 'Voir Progression' : 'Xem tiến độ'}
                        </FormattedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleRetakeTest}
                    >
                        <Ionicons name="refresh" size={20} color="white" />
                        <FormattedText style={styles.primaryButtonText}>
                            {language === 'fr' ? 'Nouveau Test' : 'Làm bài mới'}
                        </FormattedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    closeButton: {
        padding: 8,
    },
    headerCenter: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageLabel: {
        fontSize: 12,
        marginHorizontal: 8,
    },
    languageSwitch: {
        transform: [{ scale: 0.75 }],
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    scoreCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    scoreHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreMessage: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    scoreMain: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreDetails: {
        fontSize: 16,
    },
    statsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    recommendationsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    recommendationItem: {
        marginBottom: 16,
    },
    recommendationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    recommendationDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 28,
    },
    progressCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
    actionContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    primaryButton: {
        // backgroundColor set dynamically
    },
    secondaryButton: {
        borderWidth: 1,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default TestResultScreen;