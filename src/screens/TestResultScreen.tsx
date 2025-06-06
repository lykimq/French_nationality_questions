import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { useTestResult } from '../hooks/useTestResult';
import {
    ScoreCard,
    StatisticsCard,
    RecommendationsCard,
    ProgressOverviewCard,
    ActionButtons,
    TestResultHeader,
    LoadingView,
} from '../components/test-result';
import { sharedStyles } from '../utils/sharedStyles';

const TestResultScreen = () => {
    const { themeMode } = useTheme();
    const { testResult, isLoading, handlers, testProgress } = useTestResult();

    if (isLoading || !testResult) {
        return <LoadingView />;
    }

    return (
        <View style={[styles.container, { backgroundColor: testResult ? 'transparent' : 'white' }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <TestResultHeader onClose={handlers.handleCloseTest} />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <ScoreCard
                        score={testResult.session.score}
                        correctAnswers={testResult.session.correctAnswers}
                        totalQuestions={testResult.session.totalQuestions}
                    />

                    <StatisticsCard statistics={testResult.statistics} />

                    <RecommendationsCard recommendations={testResult.recommendations} />

                    <ProgressOverviewCard testProgress={testProgress} />
                </ScrollView>

                <ActionButtons
                    onRetakeTest={handlers.handleRetakeTest}
                    onViewProgress={handlers.handleViewProgress}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
});

export default TestResultScreen;