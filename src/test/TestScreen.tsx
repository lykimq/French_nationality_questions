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

import { useTheme } from '../shared/contexts/ThemeContext';
import { useData } from '../shared/contexts/DataContext';
import { useTest } from './contexts/TestContext';
import { FormattedText } from '../shared/components';
import ProgressCard from './components/ProgressCard';
import TestModeCard from './components/TestModeCard';
import TestModeModal from './components/TestModeModal';
import RecommendationSection from './components/RecommendationSection';
import SubcategoryTestCard from './components/SubcategoryTestCard';
import { sharedStyles } from '../shared/utils';
import { useTestModes } from './hooks/useTestModes';
import { useTestActions } from './hooks/useTestActions';
import { createSubcategoryTestDetails } from './utils';

const TestScreen = () => {
    const untypedNavigation = useNavigation(); // For event listeners
    const { theme, themeMode } = useTheme();
    const {
        testProgress,
        testStatistics,
        isLoading,
        generateRecommendations,
        refreshProgress,
    } = useTest();

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
    } = useTestActions({ testModes });

    // Get subcategory test details
    const subcategoryTestDetails = createSubcategoryTestDetails();

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
                    Chargement...
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
                                Tests de Préparation
                            </FormattedText>
                            <FormattedText style={[styles.headerSubtitle, { color: theme.colors.headerText + 'B3' }]}>
                                Testez vos connaissances
                            </FormattedText>
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
                    />

                    <RecommendationSection
                        recommendations={recommendations}
                        onRecommendationAction={handleRecommendationAction}
                    />

                    <View style={styles.modesSection}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Modes de Test
                        </FormattedText>
                        {testModes.map((modeOption) => (
                            <TestModeCard
                                key={modeOption.mode}
                                modeOption={modeOption}
                                onPress={() => handleModeSelection(modeOption.mode)}
                                getLocalizedModeTitle={(mode) => getLocalizedModeTitle(mode)}
                                getLocalizedModeDescription={(mode) => getLocalizedModeDescription(mode)}
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

                    {/* Civic Exam Section */}
                    <SubcategoryTestCard
                        title="Examen Civique"
                        description="Examen civique pour la naturalisation - 40 questions, 45 minutes"
                        icon="document-text"
                        iconColor="#2196F3"
                        details={[
                            { icon: 'helpCircle', text: '40 questions à choix multiples' },
                            { icon: 'time', text: '45 minutes maximum' },
                            { icon: 'checkmarkCircle', text: '80% pour réussir (32/40)' },
                        ]}
                        onPress={() => {
                            const navigation = untypedNavigation as any;
                            navigation.navigate('CivicExamTab', { screen: 'CivicExamHome' });
                        }}
                    />
                </ScrollView>
            </SafeAreaView>

            <TestModeModal
                visible={showModeModal}
                modeOption={selectedMode ? testModes.find(m => m.mode === selectedMode) || null : null}
                isStartingTest={isStartingTest}
                onClose={handleModalClose}
                onStartTest={() => selectedMode && handleStartTest(selectedMode)}
                getLocalizedModeTitle={(mode) => getLocalizedModeTitle(mode)}
                getLocalizedModeDescription={(mode) => getLocalizedModeDescription(mode)}
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