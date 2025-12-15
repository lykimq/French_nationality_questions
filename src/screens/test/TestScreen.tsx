import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTest } from '../../contexts/TestContext';
import FormattedText from '../../components/FormattedText';
import ProgressCard from '../../components/test/ProgressCard';
import TestModeCard from '../../components/test/TestModeCard';
import TestModeModal from '../../components/test/TestModeModal';
import RecommendationSection from '../../components/test/RecommendationSection';
import SubcategoryTestCard from '../../components/test/SubcategoryTestCard';
import { sharedStyles } from '../../utils/shared';
import { useTestModes } from '../../hooks/useTestModes';
import { useTestActions } from '../../hooks/useTestActions';
import { getLocalizedText, createSubcategoryTestDetails } from '../../utils/test';

const TestScreen = () => {
    const untypedNavigation = useNavigation(); // For event listeners
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const {
        testProgress,
        testStatistics,
        isLoading,
        generateRecommendations,
        refreshProgress,
    } = useTest();

    // Create localized text function
    const localizedText = getLocalizedText(language);

    // Get test modes configuration
    const { testModes, getLocalizedModeTitle, getLocalizedModeDescription } = useTestModes({
        testProgress
    });

    // Get test actions and handlers
    const {
        selectedMode,
        showModeModal,
        isStartingTest,
        handleStartTest,
        handleRecommendationAction,
        handleViewDetailedProgress,
        handleNavigateToSubcategoryTests,
        handleNavigateToPart1Tests,
        handleModeSelection,
        handleModalClose,
    } = useTestActions({ testModes, getLocalizedText: localizedText });

    // Get subcategory test details
    const subcategoryTestDetails = createSubcategoryTestDetails(localizedText);

    // Refresh data when screen mounts and when it comes into focus
    useEffect(() => {
        refreshProgress();
    }, []); // Run once on mount

    // Listen for navigation focus events to refresh data when coming back to this screen
    useEffect(() => {
        const unsubscribe = untypedNavigation.addListener('focus', () => {
            refreshProgress();
        });

        return unsubscribe;
    }, [untypedNavigation, refreshProgress]);

    const recommendations = generateRecommendations();

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    {localizedText('Chargement...', 'Đang tải...')}
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
                                {localizedText('Tests de Préparation', 'Bài kiểm tra chuẩn bị')}
                            </FormattedText>
                            <FormattedText style={[styles.headerSubtitle, { color: theme.colors.headerText + 'B3' }]}>
                                {localizedText('Testez vos connaissances', 'Kiểm tra kiến thức của bạn')}
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
                    <ProgressCard
                        testProgress={testProgress}
                        testStatistics={testStatistics}
                        onPress={handleViewDetailedProgress}
                        getLocalizedText={localizedText}
                        language={language}
                    />

                    <RecommendationSection
                        recommendations={recommendations}
                        onRecommendationAction={handleRecommendationAction}
                        getLocalizedText={localizedText}
                    />

                    <View style={styles.modesSection}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {localizedText('Modes de Test', 'Chế độ kiểm tra')}
                        </FormattedText>
                        {testModes.map((modeOption) => (
                            <TestModeCard
                                key={modeOption.mode}
                                modeOption={modeOption}
                                onPress={() => handleModeSelection(modeOption.mode)}
                                getLocalizedText={localizedText}
                                getLocalizedModeTitle={(mode) => getLocalizedModeTitle(mode, language, localizedText)}
                                getLocalizedModeDescription={(mode) => getLocalizedModeDescription(mode, language, localizedText)}
                            />
                        ))}
                    </View>

                    {/* Subcategory Tests Section */}
                    <SubcategoryTestCard
                        title={subcategoryTestDetails[0].title}
                        description={subcategoryTestDetails[0].description}
                        icon={subcategoryTestDetails[0].icon}
                        iconColor={subcategoryTestDetails[0].iconColor}
                        details={subcategoryTestDetails[0].details}
                        onPress={handleNavigateToSubcategoryTests}
                    />

                    {/* Part 1 Tests Section */}
                    <SubcategoryTestCard
                        title={subcategoryTestDetails[1].title}
                        description={subcategoryTestDetails[1].description}
                        icon={subcategoryTestDetails[1].icon}
                        iconColor={subcategoryTestDetails[1].iconColor}
                        details={subcategoryTestDetails[1].details}
                        onPress={handleNavigateToPart1Tests}
                    />
                </ScrollView>
            </SafeAreaView>

            <TestModeModal
                visible={showModeModal}
                modeOption={selectedMode ? testModes.find(m => m.mode === selectedMode) || null : null}
                isStartingTest={isStartingTest}
                onClose={handleModalClose}
                onStartTest={() => selectedMode && handleStartTest(selectedMode)}
                getLocalizedText={localizedText}
                getLocalizedModeTitle={(mode) => getLocalizedModeTitle(mode, language, localizedText)}
                getLocalizedModeDescription={(mode) => getLocalizedModeDescription(mode, language, localizedText)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerContent: {
        ...sharedStyles.spaceBetween,
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
        ...sharedStyles.languageSelector,
    },
    languageLabel: {
        ...sharedStyles.languageLabel,
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    modesSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default TestScreen;