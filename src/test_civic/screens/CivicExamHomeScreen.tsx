import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcon3D } from '../../shared/hooks';
import { useCivicExam } from '../contexts/CivicExamContext';
import { FormattedText, Icon3D, InfoBanner } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { createLogger } from '../../shared/utils/logger';
import type { CivicExamStackParamList } from '../types';
import { usePremiumAccess } from '../../shared/contexts/PremiumAccessContext';

const logger = createLogger('CivicExamHomeScreen');

type CivicExamHomeScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamHomeScreen = () => {
    const navigation = useNavigation<CivicExamHomeScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { getIcon } = useIcon3D();
    const { examProgress, isLoading, refreshProgress, pausedSession, resumeSession } = useCivicExam();
    const { isPremium, openPaywall } = usePremiumAccess();

    const arrowBackIcon = getIcon('arrowBack');

    useFocusEffect(
        React.useCallback(() => {
            refreshProgress();
            // Reload paused session when screen is focused
            // This is handled by the session context's useEffect
        }, [refreshProgress])
    );

    const guardExamAccess = React.useCallback((): boolean => {
        if (isPremium) {
            return true;
        }
        openPaywall();
        return false;
    }, [isPremium, openPaywall]);

    const handleStartExam = () => {
        if (!guardExamAccess()) {
            return;
        }
        navigation.navigate('CivicExamInfo');
    };

    const handlePracticeMode = () => {
        if (!guardExamAccess()) {
            return;
        }
        navigation.navigate('CivicExamPractice');
    };

    const handleResumePractice = async () => {
        try {
            await resumeSession();
            navigation.navigate('CivicExamQuestion');
        } catch (error) {
            logger.error('Error resuming practice:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                    Chargement...
                </FormattedText>
            </View>
        );
    }

    const examLocked = !isPremium;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon3D
                            name={arrowBackIcon.name}
                            size={20}
                            color={theme.colors.headerText}
                            variant={arrowBackIcon.variant}
                        />
                    </TouchableOpacity>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        Examen Civique
                    </FormattedText>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <InfoBanner
                        type="disclaimer"
                        title="Application de préparation"
                        message="Cette application est un outil de préparation et ne constitue pas l'examen officiel de naturalisation. Les examens pratiques simulés vous aident à vous préparer, mais le format, les questions et les conditions de l'examen réel peuvent différer. Consultez toujours les sources officielles pour les informations les plus récentes."
                        icon="warning"
                        collapsible={true}
                        storageKey="exam_disclaimer"
                    />
                    <InfoBanner
                        type="info"
                        title="À propos de cette section"
                        message="Cette section propose deux modes : l'examen pratique (simulation complète avec timer) et le mode pratique (apprentissage sans contrainte de temps). Utilisez ces outils pour vous familiariser avec le format des questions et évaluer votre niveau de préparation."
                        icon="document-text"
                        collapsible={true}
                        storageKey="exam_info"
                    />
                    <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Icon3D
                            name="school"
                            size={40}
                            color={theme.colors.primary}
                            variant="gradient"
                            containerStyle={styles.icon}
                        />
                        <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                            Examen Civique pour la Naturalisation
                        </FormattedText>
                        <FormattedText style={[styles.description, { color: theme.colors.textSecondary }]}>
                            40 questions • 45 minutes • 80% pour réussir
                        </FormattedText>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                            <FormattedText style={[styles.statValue, { color: theme.colors.primary }]}>
                                {examProgress.totalExamsTaken + examProgress.totalPracticeSessions}
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Tests passés
                            </FormattedText>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                            <FormattedText style={[styles.statValue, { color: examProgress.bestScore >= 80 ? '#4CAF50' : theme.colors.primary }]}>
                                {examProgress.bestScore}%
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Meilleur score
                            </FormattedText>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                            <FormattedText style={[styles.statValue, { color: examProgress.passedExams > 0 ? '#4CAF50' : theme.colors.primary }]}>
                                {examProgress.passedExams}
                            </FormattedText>
                            <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Réussis
                            </FormattedText>
                        </View>
                    </View>

                    {pausedSession && (
                        <TouchableOpacity
                            style={[styles.resumeButton, { backgroundColor: theme.colors.warning || '#FF9800', borderColor: theme.colors.border }]}
                            onPress={handleResumePractice}
                            activeOpacity={0.8}
                        >
                            <Icon3D
                                name="play"
                                size={20}
                                color="#FFFFFF"
                                variant="gradient"
                            />
                            <FormattedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                Reprendre la pratique
                            </FormattedText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: examLocked ? theme.colors.textMuted : theme.colors.primary },
                        ]}
                        onPress={examLocked ? openPaywall : handleStartExam}
                        activeOpacity={0.8}
                    >
                        <Icon3D
                            name="document-text"
                            size={20}
                            color="#FFFFFF"
                            variant="gradient"
                        />
                        <FormattedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                            {examLocked ? 'Débloquez Premium pour continuer' : 'Commencer l\'examen'}
                        </FormattedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.secondaryButton,
                            {
                                backgroundColor: examLocked ? theme.colors.textMuted + '20' : theme.colors.card,
                                borderColor: examLocked ? theme.colors.textMuted : theme.colors.border,
                                opacity: examLocked ? 0.6 : 1,
                            }
                        ]}
                        onPress={examLocked ? openPaywall : handlePracticeMode}
                        activeOpacity={0.8}
                    >
                        <Icon3D
                            name="book"
                            size={20}
                            color={examLocked ? theme.colors.textMuted : theme.colors.primary}
                            variant="elevated"
                        />
                        <FormattedText style={[styles.buttonText, { color: examLocked ? theme.colors.textMuted : theme.colors.primary }]}>
                            {examLocked ? 'Accès Premium requis' : 'Mode pratique'}
                        </FormattedText>
                    </TouchableOpacity>

                    {examLocked && (
                        <FormattedText style={[styles.lockedHint, { color: theme.colors.textSecondary }]}>
                            Débloquez Premium pour accéder aux examens et pratiques illimités.
                        </FormattedText>
                    )}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    infoCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        gap: 12,
    },
    resumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        gap: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    lockedHint: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default CivicExamHomeScreen;
