import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../contexts/CivicExamContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { createLogger } from '../../shared/utils/logger';
import { TOPIC_DISPLAY_NAMES } from '../constants/civicExamConstants';
import type { CivicExamStackParamList, CivicExamTopic } from '../types';

const logger = createLogger('CivicExamPractice');

type CivicExamPracticeScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const ALL_TOPICS: CivicExamTopic[] = [
    'principles_values',
    'institutional_political',
    'rights_duties',
    'history_geography_culture',
    'living_society',
];

const CivicExamPracticeScreen = () => {
    const navigation = useNavigation<CivicExamPracticeScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { startExam } = useCivicExam();
    const [selectedTopics, setSelectedTopics] = useState<CivicExamTopic[]>(ALL_TOPICS);
    const [isStarting, setIsStarting] = useState(false);

    const toggleTopic = (topicId: CivicExamTopic) => {
        setSelectedTopics(prev => {
            if (prev.includes(topicId)) {
                return prev.filter(t => t !== topicId);
            } else {
                return [...prev, topicId];
            }
        });
    };

    const selectAll = () => {
        setSelectedTopics(ALL_TOPICS);
    };

    const deselectAll = () => {
        setSelectedTopics([]);
    };

    const handleStartPractice = async () => {
        if (selectedTopics.length === 0) {
            Alert.alert(
                'Aucun thème sélectionné',
                'Veuillez sélectionner au moins un thème pour commencer.'
            );
            return;
        }

        try {
            setIsStarting(true);
            await startExam({
                mode: 'civic_exam_practice',
                questionCount: 40,
                timeLimit: 45,
                includeExplanations: true,
                shuffleQuestions: true,
                shuffleOptions: true,
                showProgress: true,
                selectedTopics,
            });
            navigation.navigate('CivicExamQuestion');
        } catch (error) {
            logger.error('Error starting practice:', error);
            Alert.alert(
                'Erreur',
                'Impossible de démarrer la pratique. Veuillez réessayer.'
            );
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
                    </TouchableOpacity>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        Mode pratique
                    </FormattedText>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                            Sélectionnez les thèmes que vous souhaitez pratiquer. 40 questions seront générées aléatoirement à partir des thèmes sélectionnés.
                        </FormattedText>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={selectAll}
                        >
                            <FormattedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                                Tout sélectionner
                            </FormattedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}
                            onPress={deselectAll}
                        >
                            <FormattedText style={[styles.actionButtonText, { color: theme.colors.text }]}>
                                Tout désélectionner
                            </FormattedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.themesContainer}>
                        {ALL_TOPICS.map((topicId) => {
                            const isSelected = selectedTopics.includes(topicId);
                            const topicInfo = TOPIC_DISPLAY_NAMES[topicId];
                            return (
                                <TouchableOpacity
                                    key={topicId}
                                    style={[
                                        styles.themeCard,
                                        {
                                            backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.card,
                                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                        }
                                    ]}
                                    onPress={() => toggleTopic(topicId)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.themeCardContent}>
                                        <Ionicons
                                            name={isSelected ? 'checkbox' : 'square-outline'}
                                            size={24}
                                            color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                                        />
                                        <View style={styles.themeTextContainer}>
                                            <FormattedText style={[styles.themeTitle, { color: theme.colors.text }]}>
                                                {topicInfo}
                                            </FormattedText>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.startButton,
                            {
                                backgroundColor: selectedTopics.length > 0 ? theme.colors.primary : theme.colors.textMuted,
                                opacity: isStarting ? 0.6 : 1,
                            }
                        ]}
                        onPress={handleStartPractice}
                        disabled={selectedTopics.length === 0 || isStarting}
                        activeOpacity={0.8}
                    >
                        <FormattedText style={[styles.startButtonText, { color: '#FFFFFF' }]}>
                            {isStarting ? 'Démarrage...' : 'Commencer la pratique'}
                        </FormattedText>
                    </TouchableOpacity>
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    themesContainer: {
        gap: 12,
        marginBottom: 24,
    },
    themeCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
    },
    themeCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    themeTextContainer: {
        flex: 1,
    },
    themeTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    startButton: {
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CivicExamPracticeScreen;

