import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Modal,
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
import { TestMode, TestConfig } from '../types/test';
import { TestStackParamList } from '../types/types';

const { width, height } = Dimensions.get('window');

type TestScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

interface TestModeOption {
    mode: TestMode;
    title_vi: string;
    title_fr: string;
    description_vi: string;
    description_fr: string;
    icon: string;
    questionCount: number;
    timeLimit?: number;
    color: string;
    isRecommended?: boolean;
}

const TestScreen = () => {
    const navigation = useNavigation<TestScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const {
        testProgress,
        testStatistics,
        startTest,
        isTestActive,
        isLoading,
        generateRecommendations,
        refreshProgress,
    } = useTest();

    const [selectedMode, setSelectedMode] = useState<TestMode | null>(null);
    const [showModeModal, setShowModeModal] = useState(false);
    const [isStartingTest, setIsStartingTest] = useState(false);

    // Refresh data when screen is focused
    useEffect(() => {
        refreshProgress();
    }, []);

    const testModes: TestModeOption[] = [
        {
            mode: 'geography_only',
            title_vi: 'Kiểm tra Địa lý',
            title_fr: 'Test de Géographie',
            description_vi: 'Tập trung vào câu hỏi địa lý',
            description_fr: 'Se concentrer sur les questions de géographie',
            icon: 'map',
            questionCount: 11,
            timeLimit: 15,
            color: '#00B4D8',
            isRecommended: testProgress.totalTestsTaken === 0,
        },
        {
            mode: 'history_culture_comprehensive',
            title_vi: 'Kiểm tra Lịch sử & Văn hoá',
            title_fr: 'Test Histoire & Culture',
            description_vi: 'Bài kiểm tra toàn diện về lịch sử, địa lý và văn hóa Pháp (165 câu hỏi)',
            description_fr: 'Test complet sur l\'histoire, géographie et culture française (165 questions)',
            icon: 'library',
            questionCount: 165,
            timeLimit: 120,
            color: '#F77F00',
            isRecommended: testProgress.totalTestsTaken > 0 && testProgress.averageScore > 60,
        },
        {
            mode: 'mock_interview',
            title_vi: 'Phỏng vấn thử',
            title_fr: 'Entretien Fictif',
            description_vi: 'Mô phỏng điều kiện phỏng vấn thực tế',
            description_fr: 'Simuler les conditions d\'entretien réelles',
            icon: 'person',
            questionCount: 30,
            timeLimit: 45,
            color: '#9B59B6',
            isRecommended: testProgress.averageScore >= 70,
        },
    ];

    const handleStartTest = async (mode: TestMode) => {
        const modeOption = testModes.find(m => m.mode === mode);
        if (!modeOption) return;

        if (modeOption.questionCount === 0) {
            Alert.alert(
                language === 'fr' ? 'Aucune question disponible' : 'Không có câu hỏi',
                language === 'fr'
                    ? 'Il n\'y a pas de questions disponibles pour ce mode de test.'
                    : 'Không có câu hỏi nào có sẵn cho chế độ kiểm tra này.'
            );
            return;
        }

        try {
            setIsStartingTest(true);

            const config: TestConfig = {
                mode,
                questionCount: modeOption.questionCount,
                timeLimit: modeOption.timeLimit,
                includeExplanations: true,
                shuffleQuestions: true,
                shuffleOptions: false,
                showProgress: true,
            };

            await startTest(config);
            navigation.navigate('TestQuestion', undefined);
        } catch (error) {
            console.error('Error starting test:', error);
            Alert.alert(
                language === 'fr' ? 'Erreur' : 'Lỗi',
                language === 'fr'
                    ? 'Impossible de démarrer le test. Veuillez réessayer.'
                    : 'Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.'
            );
        } finally {
            setIsStartingTest(false);
            setShowModeModal(false);
        }
    };

    const handleViewDetailedProgress = () => {
        navigation.navigate('Progress', undefined);
    };

    const renderProgressCard = () => (
        <TouchableOpacity
            style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}
            onPress={handleViewDetailedProgress}
            activeOpacity={0.8}
        >
            <View style={styles.progressHeader}>
                <FormattedText style={[styles.progressTitle, { color: theme.colors.text }]}>
                    {language === 'fr' ? 'Votre Progression' : 'Tiến độ của bạn'}
                </FormattedText>
                <View style={styles.progressHeaderRight}>
                    <Ionicons name="analytics" size={24} color={theme.colors.primary} />
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} style={{ marginLeft: 8 }} />
                </View>
            </View>

            <View style={styles.progressStats}>
                <View style={styles.statItem}>
                    <FormattedText style={[styles.statValue, { color: theme.colors.primary }]}>
                        {testProgress.totalTestsTaken}
                    </FormattedText>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {language === 'fr' ? 'Tests' : 'Bài test'}
                    </FormattedText>
                </View>

                <View style={styles.statItem}>
                    <FormattedText style={[styles.statValue, { color: theme.colors.success }]}>
                        {testProgress.averageScore}%
                    </FormattedText>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {language === 'fr' ? 'Moyenne' : 'Trung bình'}
                    </FormattedText>
                </View>

                <View style={styles.statItem}>
                    <FormattedText style={[styles.statValue, { color: theme.colors.warning }]}>
                        {testProgress.bestScore}%
                    </FormattedText>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {language === 'fr' ? 'Meilleur' : 'Cao nhất'}
                    </FormattedText>
                </View>
            </View>

            {testProgress.totalTestsTaken > 0 && (
                <View style={styles.trendContainer}>
                    <Ionicons
                        name={
                            testStatistics.improvementTrend === 'improving' ? 'trending-up' :
                                testStatistics.improvementTrend === 'declining' ? 'trending-down' : 'remove'
                        }
                        size={16}
                        color={
                            testStatistics.improvementTrend === 'improving' ? theme.colors.success :
                                testStatistics.improvementTrend === 'declining' ? theme.colors.error : theme.colors.textMuted
                        }
                    />
                    <FormattedText style={[styles.trendText, {
                        color: testStatistics.improvementTrend === 'improving' ? theme.colors.success :
                            testStatistics.improvementTrend === 'declining' ? theme.colors.error : theme.colors.textMuted
                    }]}>
                        {language === 'fr' ? (
                            testStatistics.improvementTrend === 'improving' ? 'En progression' :
                                testStatistics.improvementTrend === 'declining' ? 'En baisse' : 'Stable'
                        ) : (
                            testStatistics.improvementTrend === 'improving' ? 'Đang tiến bộ' :
                                testStatistics.improvementTrend === 'declining' ? 'Đang giảm' : 'Ổn định'
                        )}
                    </FormattedText>
                </View>
            )}

            <View style={styles.viewDetailsHint}>
                <FormattedText style={[styles.viewDetailsText, { color: theme.colors.textMuted }]}>
                    {language === 'fr' ? 'Appuyez pour voir les détails' : 'Nhấn để xem chi tiết'}
                </FormattedText>
            </View>
        </TouchableOpacity>
    );

    const renderTestModeCard = (modeOption: TestModeOption) => (
        <TouchableOpacity
            key={modeOption.mode}
            style={[
                styles.modeCard,
                { backgroundColor: theme.colors.surface },
                modeOption.isRecommended && styles.recommendedCard
            ]}
            onPress={() => {
                setSelectedMode(modeOption.mode);
                setShowModeModal(true);
            }}
            activeOpacity={0.8}
        >
            {modeOption.isRecommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.primary }]}>
                    <FormattedText style={styles.recommendedText}>
                        {language === 'fr' ? 'Recommandé' : 'Được đề xuất'}
                    </FormattedText>
                </View>
            )}

            <View style={[styles.modeIconContainer, { backgroundColor: modeOption.color + '20' }]}>
                <Ionicons name={modeOption.icon as any} size={32} color={modeOption.color} />
            </View>

            <View style={styles.modeContent}>
                <FormattedText style={[styles.modeTitle, { color: theme.colors.text }]}>
                    {language === 'fr' ? modeOption.title_fr : modeOption.title_vi}
                </FormattedText>
                <FormattedText style={[styles.modeDescription, { color: theme.colors.textMuted }]}>
                    {language === 'fr' ? modeOption.description_fr : modeOption.description_vi}
                </FormattedText>

                <View style={styles.modeDetails}>
                    <View style={styles.modeDetail}>
                        <Ionicons name="help-circle" size={16} color={theme.colors.textMuted} />
                        <FormattedText style={[styles.modeDetailText, { color: theme.colors.textMuted }]}>
                            {modeOption.questionCount} {language === 'fr' ? 'questions' : 'câu hỏi'}
                        </FormattedText>
                    </View>

                    {modeOption.timeLimit && (
                        <View style={styles.modeDetail}>
                            <Ionicons name="time" size={16} color={theme.colors.textMuted} />
                            <FormattedText style={[styles.modeDetailText, { color: theme.colors.textMuted }]}>
                                {modeOption.timeLimit} {language === 'fr' ? 'min' : 'phút'}
                            </FormattedText>
                        </View>
                    )}
                </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
    );

    const renderModeModal = () => {
        const modeOption = testModes.find(m => m.mode === selectedMode);
        if (!modeOption) return null;

        return (
            <Modal
                visible={showModeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <LinearGradient
                            colors={[modeOption.color + '20', modeOption.color + '05']}
                            style={styles.modalHeader}
                        >
                            <View style={[styles.modalIconContainer, { backgroundColor: modeOption.color }]}>
                                <Ionicons name={modeOption.icon as any} size={40} color="white" />
                            </View>
                            <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                                {language === 'fr' ? modeOption.title_fr : modeOption.title_vi}
                            </FormattedText>
                            <FormattedText style={[styles.modalDescription, { color: theme.colors.textMuted }]}>
                                {language === 'fr' ? modeOption.description_fr : modeOption.description_vi}
                            </FormattedText>
                        </LinearGradient>

                        <View style={styles.modalBody}>
                            <View style={styles.modalDetails}>
                                <View style={styles.modalDetailRow}>
                                    <Ionicons name="help-circle" size={20} color={theme.colors.primary} />
                                    <FormattedText style={[styles.modalDetailLabel, { color: theme.colors.text }]}>
                                        {language === 'fr' ? 'Questions:' : 'Số câu hỏi:'}
                                    </FormattedText>
                                    <FormattedText style={[styles.modalDetailValue, { color: theme.colors.textMuted }]}>
                                        {modeOption.questionCount}
                                    </FormattedText>
                                </View>

                                {modeOption.timeLimit && (
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="time" size={20} color={theme.colors.primary} />
                                        <FormattedText style={[styles.modalDetailLabel, { color: theme.colors.text }]}>
                                            {language === 'fr' ? 'Durée:' : 'Thời gian:'}
                                        </FormattedText>
                                        <FormattedText style={[styles.modalDetailValue, { color: theme.colors.textMuted }]}>
                                            {modeOption.timeLimit} {language === 'fr' ? 'minutes' : 'phút'}
                                        </FormattedText>
                                    </View>
                                )}

                                <View style={styles.modalDetailRow}>
                                    <Ionicons name="shuffle" size={20} color={theme.colors.primary} />
                                    <FormattedText style={[styles.modalDetailLabel, { color: theme.colors.text }]}>
                                        {language === 'fr' ? 'Questions mélangées' : 'Câu hỏi ngẫu nhiên'}
                                    </FormattedText>
                                    <Ionicons name="checkmark" size={20} color={theme.colors.success} />
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]}
                                    onPress={() => setShowModeModal(false)}
                                >
                                    <FormattedText style={[styles.modalButtonText, { color: theme.colors.textMuted }]}>
                                        {language === 'fr' ? 'Annuler' : 'Hủy'}
                                    </FormattedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalStartButton, { backgroundColor: modeOption.color }]}
                                    onPress={() => handleStartTest(modeOption.mode)}
                                    disabled={isStartingTest}
                                >
                                    {isStartingTest ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="play" size={20} color="white" />
                                            <FormattedText style={styles.modalStartButtonText}>
                                                {language === 'fr' ? 'Commencer' : 'Bắt đầu'}
                                            </FormattedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const recommendations = generateRecommendations();

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    {language === 'fr' ? 'Chargement...' : 'Đang tải...'}
                </FormattedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerText}>
                            <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                                {language === 'fr' ? 'Tests de Préparation' : 'Bài kiểm tra chuẩn bị'}
                            </FormattedText>
                            <FormattedText style={[styles.headerSubtitle, { color: theme.colors.headerText + 'B3' }]}>
                                {language === 'fr' ? 'Testez vos connaissances' : 'Kiểm tra kiến thức của bạn'}
                            </FormattedText>
                        </View>
                        <View style={styles.languageSelector}>
                            <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                            <Switch
                                value={language === 'vi'}
                                onValueChange={toggleLanguage}
                                thumbColor={theme.colors.switchThumb}
                                trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                            />
                            <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                        </View>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {renderProgressCard()}

                    {recommendations.length > 0 && (
                        <View style={[styles.recommendationsSection, { backgroundColor: theme.colors.surface }]}>
                            <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Recommandations' : 'Đề xuất'}
                            </FormattedText>
                            {recommendations.slice(0, 2).map((rec, index) => (
                                <View key={index} style={styles.recommendationItem}>
                                    <Ionicons
                                        name={rec.type === 'good_job' ? 'trophy' : 'bulb'}
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                    <View style={styles.recommendationContent}>
                                        <FormattedText style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                                            {language === 'fr' ? rec.title_fr : rec.title_vi}
                                        </FormattedText>
                                        <FormattedText style={[styles.recommendationDescription, { color: theme.colors.textMuted }]}>
                                            {language === 'fr' ? rec.description_fr : rec.description_vi}
                                        </FormattedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.modesSection}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Modes de Test' : 'Chế độ kiểm tra'}
                        </FormattedText>
                        {testModes.map(renderTestModeCard)}
                    </View>
                </ScrollView>
            </SafeAreaView>

            {renderModeModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    progressCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    trendText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    recommendationsSection: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    recommendationContent: {
        flex: 1,
        marginLeft: 12,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    recommendationDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    modesSection: {
        marginBottom: 20,
    },
    modeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        position: 'relative',
    },
    recommendedCard: {
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -8,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    recommendedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    modeIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    modeContent: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    modeDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    modeDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    modeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    modeDetailText: {
        marginLeft: 4,
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: height * 0.8,
        elevation: 10,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    modalHeader: {
        padding: 24,
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalBody: {
        padding: 24,
    },
    modalDetails: {
        marginBottom: 24,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    modalDetailLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    modalDetailValue: {
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelButton: {
        borderWidth: 1,
    },
    modalStartButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalStartButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingText: {
        fontSize: 16,
    },
    viewDetailsHint: {
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    viewDetailsText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default TestScreen;