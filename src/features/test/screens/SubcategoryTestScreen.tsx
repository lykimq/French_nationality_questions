import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import { useTest } from '../contexts/TestContext';
import { useIcons } from '../../../shared/contexts/IconContext';
import { FormattedText } from '../../../shared/components';
import { TestStackParamList, TestConfig, TestMode, SubcategoryTestModeOption } from '../types';

type SubcategoryTestScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const SubcategoryTestScreen = () => {
    const navigation = useNavigation<SubcategoryTestScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage, historyCategories, historySubcategories } = useLanguage();
    const { startTest } = useTest();
    const { getIconName, getJsonIconName } = useIcons();

    const [isStartingTest, setIsStartingTest] = useState(false);

    const getSubcategoryColor = (subcategoryId: string): string => {
        const colors: { [key: string]: string } = {
            local_gov: '#3498DB',
            monarchy: '#9B59B6',
            revolution: '#E74C3C',
            wars: '#34495E',
            republic: '#2ECC71',
            democracy: '#F39C12',
            economy: '#1ABC9C',
            culture: '#E67E22',
            arts: '#8E44AD',
            celebrities: '#E91E63',
            sports: '#FF9800',
            holidays: '#607D8B',
        };
        return colors[subcategoryId] || '#95A5A6';
    };

    // Create subcategory test modes from the history categories data
    const subcategoryTestModes: SubcategoryTestModeOption[] = React.useMemo(() => {
        if (!historyCategories || !historySubcategories) return [];

        return historyCategories.subcategories.map(subcategory => {
            const subcategoryData = historySubcategories[subcategory.id];
            const questionCount = subcategoryData?.questions?.length || 0;

            return {
                mode: `subcategory_${subcategory.id}` as TestMode,
                subcategoryId: subcategory.id,
                title_fr: subcategory.title,
                title_vi: subcategory.title_vi || subcategory.title,
                description_fr: subcategory.description || '',
                description_vi: subcategory.description_vi || subcategory.description || '',
                icon: subcategory.icon || 'help-circle',
                color: getSubcategoryColor(subcategory.id),
                questionCount,
            };
        });
    }, [historyCategories, historySubcategories]);

    const getLocalizedText = (textFr: string, textVi: string): string => {
        if (language === 'fr') {
            return textFr;
        } else {
            return `${textVi}\n${textFr}`;
        }
    };

    const handleStartTest = async (testMode: SubcategoryTestModeOption) => {
        if (testMode.questionCount === 0) {
            Alert.alert(
                getLocalizedText('Aucune question disponible', 'Không có câu hỏi'),
                getLocalizedText(
                    'Il n\'y a pas de questions disponibles pour cette catégorie.',
                    'Không có câu hỏi nào có sẵn cho danh mục này.'
                )
            );
            return;
        }

        try {
            setIsStartingTest(true);

            const config: TestConfig = {
                mode: testMode.mode,
                questionCount: Math.min(testMode.questionCount, 20), // Limit to 20 questions max for subcategory tests
                timeLimit: Math.ceil(testMode.questionCount * 1.5), // 1.5 minutes per question
                includeExplanations: true,
                shuffleQuestions: true,
                shuffleOptions: false,
                showProgress: true,
            };

            await startTest(config as any);
            navigation.navigate('TestQuestion', undefined);
        } catch (error) {
            console.error('Error starting subcategory test:', error);
            Alert.alert(
                getLocalizedText('Erreur', 'Lỗi'),
                getLocalizedText(
                    'Impossible de démarrer le test. Veuillez réessayer.',
                    'Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.'
                )
            );
        } finally {
            setIsStartingTest(false);
        }
    };

    const renderSubcategoryCard = (testMode: SubcategoryTestModeOption) => (
        <TouchableOpacity
            key={testMode.subcategoryId}
            style={[
                styles.subcategoryCard,
                {
                    backgroundColor: theme.colors.questionCardBackground,
                    borderColor: testMode.questionCount > 0 ? testMode.color : theme.colors.border,
                }
            ]}
            onPress={() => handleStartTest(testMode)}
            disabled={isStartingTest || testMode.questionCount === 0}
            activeOpacity={0.7}
        >
            <View style={[styles.cardHeader, { backgroundColor: testMode.color + '20' }]}>
                <View style={[styles.iconContainer, { backgroundColor: testMode.color }]}>
                    <Ionicons name={getJsonIconName(testMode.icon) as any} size={24} color="white" />
                </View>
                <View style={styles.questionCountBadge}>
                    <FormattedText style={[styles.questionCountText, { color: testMode.color }]}>
                        {testMode.questionCount}
                    </FormattedText>
                </View>
            </View>

            <View style={styles.cardContent}>
                <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {getLocalizedText(testMode.title_fr, testMode.title_vi)}
                </FormattedText>
                <FormattedText style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                    {getLocalizedText(testMode.description_fr, testMode.description_vi)}
                </FormattedText>

                {testMode.questionCount > 0 && (
                    <View style={styles.testInfo}>
                        <FormattedText style={[styles.testInfoText, { color: testMode.color }]}>
                            {language === 'fr' ? 'Questions' : 'Câu hỏi'}: {testMode.questionCount}
                        </FormattedText>
                        <FormattedText style={[styles.testInfoText, { color: testMode.color }]}>
                            {language === 'fr' ? 'Durée' : 'Thời gian'}: ~{Math.ceil(testMode.questionCount * 1.5)} min
                        </FormattedText>
                    </View>
                )}

                {testMode.questionCount === 0 && (
                    <FormattedText style={[styles.noQuestionsText, { color: theme.colors.textSecondary }]}>
                        {getLocalizedText('Aucune question disponible', 'Chưa có câu hỏi')}
                    </FormattedText>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name={getIconName('arrowBack') as any} size={24} color={theme.colors.headerText} />
                    </TouchableOpacity>

                    <View style={styles.headerTextContainer}>
                        <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                            {getLocalizedText('Tests par Catégorie', 'Bài Kiểm Tra Theo Chủ Đề')}
                        </FormattedText>
                        <FormattedText style={[styles.headerSubtitle, { color: theme.colors.headerText + 'B3' }]}>
                            {getLocalizedText('Choisissez une catégorie spécifique', 'Chọn một chủ đề cụ thể')}
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
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {subcategoryTestModes.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <FormattedText style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            {getLocalizedText('Chargement des catégories...', 'Đang tải các chủ đề...')}
                        </FormattedText>
                    </View>
                ) : (
                    <View style={styles.cardsContainer}>
                        {subcategoryTestModes.map(renderSubcategoryCard)}
                    </View>
                )}

                {isStartingTest && (
                    <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background + 'E6' }]}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <FormattedText style={[styles.loadingText, { color: theme.colors.text }]}>
                            {getLocalizedText('Préparation du test...', 'Đang chuẩn bị bài kiểm tra...')}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backButton: {
        marginRight: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    languageLabel: {
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    subcategoryCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionCountBadge: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    questionCountText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        lineHeight: 18,
    },
    cardDescription: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 8,
    },
    testInfo: {
        marginTop: 8,
    },
    testInfoText: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    noQuestionsText: {
        fontSize: 11,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

export default SubcategoryTestScreen;