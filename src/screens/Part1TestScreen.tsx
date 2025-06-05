import React, { useState, useEffect } from 'react';
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

import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTest } from '../contexts/TestContext';
import { useIcons } from '../contexts/IconContext';
import FormattedText from '../components/FormattedText';
import { TestStackParamList, TestConfig, TestMode, Part1TestModeOption } from '../types';
import { preloadAllPart1TestData } from '../utils/dataUtils';

type Part1TestScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const Part1TestScreen = () => {
    const navigation = useNavigation<Part1TestScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { startTest } = useTest();
    const { getIconName, getJsonIconName } = useIcons();

    const [isStartingTest, setIsStartingTest] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);
    const [part1TestCategories, setPart1TestCategories] = useState<any>(null);
    const [part1TestSubcategories, setPart1TestSubcategories] = useState<{ [key: string]: any }>({});

    // Load Part 1 test data on component mount
    useEffect(() => {
        const loadPart1TestData = async () => {
            try {
                setIsDataLoading(true);
                setDataLoadingError(null);

                const { part1TestData, part1SubcategoryTestData } = await preloadAllPart1TestData();

                if (part1TestData) {
                    setPart1TestCategories(part1TestData);
                    setPart1TestSubcategories(part1SubcategoryTestData);
                } else {
                    setDataLoadingError('Failed to load Part 1 test data');
                }

                setIsDataLoading(false);
            } catch (error) {
                setDataLoadingError(error instanceof Error ? error.message : 'Unknown error loading Part 1 test data');
                setIsDataLoading(false);
            }
        };

        loadPart1TestData();
    }, []);

    const getSubcategoryColor = (subcategoryId: string): string => {
        const colors: { [key: string]: string } = {
            test_personal: '#3498DB',
            test_opinions: '#9B59B6',
            test_daily_life: '#E74C3C',
        };
        return colors[subcategoryId] || '#95A5A6';
    };

    // Create subcategory test modes from the Part 1 test data
    const part1TestModes: Part1TestModeOption[] = React.useMemo(() => {
        if (!part1TestCategories || !part1TestSubcategories) return [];

        return part1TestCategories.subcategories.map((subcategory: any) => {
            const subcategoryData = part1TestSubcategories[subcategory.id];
            const questionCount = subcategoryData?.questions?.length || 0;

            return {
                mode: `part1_${subcategory.id}` as TestMode,
                subcategoryId: subcategory.id,
                title_fr: subcategory.title,
                title_vi: subcategory.title_vi,
                description_fr: subcategory.description,
                description_vi: subcategory.description_vi,
                icon: subcategory.icon,
                color: getSubcategoryColor(subcategory.id),
                questionCount,
            };
        });
    }, [part1TestCategories, part1TestSubcategories]);

    // Helper function to create shorter, user-friendly titles
    const getShortTitle = (subcategoryId: string): { fr: string; vi: string } => {
        const shortTitles: { [key: string]: { fr: string; vi: string } } = {
            test_personal: {
                fr: 'Informations personnelles',
                vi: 'Thông tin cá nhân'
            },
            test_opinions: {
                fr: 'Vos opinions',
                vi: 'Ý kiến của bạn'
            },
            test_daily_life: {
                fr: 'Vie quotidienne',
                vi: 'Cuộc sống hàng ngày'
            }
        };
        return shortTitles[subcategoryId] || { fr: subcategoryId, vi: subcategoryId };
    };

    const getLocalizedText = (textFr: string, textVi: string): string => {
        if (language === 'fr') {
            return textFr;
        } else {
            return `${textVi}\n${textFr}`;
        }
    };

    const handleStartTest = async (testMode: Part1TestModeOption) => {
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
                questionCount: testMode.questionCount, // Use all available questions for Part 1 tests
                timeLimit: Math.ceil(testMode.questionCount * 2), // 2 minutes per question for Part 1 tests
                includeExplanations: true,
                shuffleQuestions: false, // Don't shuffle Part 1 test questions
                shuffleOptions: false,
                showProgress: true,
            };

            await startTest(config as any);
            navigation.navigate('TestQuestion', undefined);
        } catch (error) {
            console.error('Error starting Part 1 test:', error);
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

    const renderTestCard = (testMode: Part1TestModeOption) => {
        const shortTitle = getShortTitle(testMode.subcategoryId);

        return (
            <TouchableOpacity
                key={testMode.subcategoryId}
                style={[
                    styles.testCard,
                    {
                        backgroundColor: theme.colors.questionCardBackground,
                        borderColor: testMode.questionCount > 0 ? testMode.color : theme.colors.border,
                    }
                ]}
                onPress={() => handleStartTest(testMode)}
                disabled={isStartingTest || testMode.questionCount === 0}
                activeOpacity={0.7}
            >
                <View style={styles.cardLayout}>
                    {/* Left: Icon and Title */}
                    <View style={styles.cardLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: testMode.color }]}>
                            <Ionicons name={getJsonIconName(testMode.icon) as any} size={24} color="white" />
                        </View>
                        <View style={styles.titleContainer}>
                            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
                                {getLocalizedText(shortTitle.fr, shortTitle.vi)}
                            </FormattedText>
                            <FormattedText style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                {testMode.questionCount} {language === 'fr' ? 'questions' : 'câu hỏi'}
                            </FormattedText>
                        </View>
                    </View>

                    {/* Right: Question count badge */}
                    <View style={styles.cardRight}>
                        <View style={[styles.questionCountBadge, { borderColor: testMode.color }]}>
                            <FormattedText style={[styles.questionCountText, { color: testMode.color }]}>
                                {testMode.questionCount}
                            </FormattedText>
                        </View>
                        <Ionicons name={getIconName('chevronForward') as any} size={20} color={theme.colors.textMuted} style={{ marginTop: 8 }} />
                    </View>
                </View>

                {/* Bottom: Description and time info */}
                <View style={styles.cardBottom}>
                    <FormattedText style={[styles.cardDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {getLocalizedText(testMode.description_fr, testMode.description_vi)}
                    </FormattedText>

                    {testMode.questionCount > 0 && (
                        <View style={styles.testInfo}>
                            <View style={styles.testInfoItem}>
                                <Ionicons name={getIconName('time') as any} size={14} color={testMode.color} />
                                <FormattedText style={[styles.testInfoText, { color: testMode.color }]}>
                                    ~{Math.ceil(testMode.questionCount * 2)} {language === 'fr' ? 'min' : 'phút'}
                                </FormattedText>
                            </View>
                            <View style={styles.testInfoItem}>
                                <Ionicons name={getIconName('chatbox') as any} size={14} color={testMode.color} />
                                <FormattedText style={[styles.testInfoText, { color: testMode.color }]}>
                                    {language === 'fr' ? 'Conversation' : 'Hội thoại'}
                                </FormattedText>
                            </View>
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
    };

    if (isDataLoading) {
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
                                {getLocalizedText('Tests Partie 1', 'Bài Kiểm Tra Phần 1')}
                            </FormattedText>
                        </View>
                    </View>
                </SafeAreaView>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <FormattedText style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        {getLocalizedText('Chargement des tests...', 'Đang tải bài kiểm tra...')}
                    </FormattedText>
                </View>
            </View>
        );
    }

    if (dataLoadingError) {
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
                                {getLocalizedText('Tests Partie 1', 'Bài Kiểm Tra Phần 1')}
                            </FormattedText>
                        </View>
                    </View>
                </SafeAreaView>
                <View style={styles.errorContainer}>
                    <Ionicons name={getIconName('alertCircle') as any} size={48} color={theme.colors.error} />
                    <FormattedText style={[styles.errorText, { color: theme.colors.error }]}>
                        {getLocalizedText('Erreur de chargement', 'Lỗi tải dữ liệu')}
                    </FormattedText>
                    <FormattedText style={[styles.errorDetailText, { color: theme.colors.textSecondary }]}>
                        {dataLoadingError}
                    </FormattedText>
                </View>
            </View>
        );
    }

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
                            {getLocalizedText('Tests Partie 1', 'Bài Kiểm Tra Phần 1')}
                        </FormattedText>
                        <FormattedText style={[styles.headerSubtitle, { color: theme.colors.headerText + 'B3' }]}>
                            {getLocalizedText('Tests de conversation et connaissances', 'Bài kiểm tra hội thoại và kiến thức')}
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
                <View style={styles.cardsContainer}>
                    {part1TestModes.map(renderTestCard)}
                </View>

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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },
    errorDetailText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    cardsContainer: {
        flexDirection: 'column',
        gap: 16,
    },
    testCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 16,
    },
    cardLayout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: 16,
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 22,
    },
    cardSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardRight: {
        alignItems: 'center',
    },
    questionCountBadge: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 2,
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 40,
        alignItems: 'center',
        marginBottom: 8,
    },
    questionCountText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardBottom: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    cardDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    testInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    testInfoText: {
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    },
    noQuestionsText: {
        fontSize: 12,
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

export default Part1TestScreen;