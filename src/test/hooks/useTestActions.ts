import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TestMode, TestConfig, TestRecommendation, MainTestModeOption, TestStackParamList } from '../types';
import { useTest } from '../contexts/TestContext';

type TestScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

interface UseTestActionsProps {
    testModes: MainTestModeOption[];
}

export const useTestActions = ({ testModes }: UseTestActionsProps) => {
    const navigation = useNavigation<TestScreenNavigationProp>();
    const { startTest } = useTest();

    const [selectedMode, setSelectedMode] = useState<TestMode | null>(null);
    const [showModeModal, setShowModeModal] = useState(false);
    const [isStartingTest, setIsStartingTest] = useState(false);

    const handleStartTest = useCallback(async (mode: TestMode) => {
        const modeOption = testModes.find(m => m.mode === mode);
        if (!modeOption) return;

        if (modeOption.questionCount === 0) {
            Alert.alert(
                'Aucune question disponible',
                'Il n\'y a pas de questions disponibles pour ce mode de test.'
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

            await startTest(config as any);
            navigation.navigate('TestQuestion', undefined);
        } catch (error) {
            console.error('Error starting test:', error);
            Alert.alert(
                'Erreur',
                'Impossible de démarrer le test. Veuillez réessayer.'
            );
        } finally {
            setIsStartingTest(false);
            setShowModeModal(false);
        }
    }, [testModes, startTest, navigation]);

    const handleRecommendationAction = useCallback(async (recommendation: TestRecommendation) => {
        try {
            if (recommendation.type === 'review_questions' && recommendation.questionIds && recommendation.questionIds.length > 0) {
                navigation.navigate('Review', undefined);
            } else if (recommendation.type === 'study_category' && recommendation.categoryIds && recommendation.categoryIds.length > 0) {
                const categories = recommendation.categoryIds.join(', ');
                Alert.alert(
                    'Étude par catégorie',
                    `Catégories à améliorer: ${categories}\n\nUtilisez la recherche pour trouver des questions de ces catégories spécifiques.`,
                    [
                        {
                            text: 'Aller à la recherche',
                            onPress: () => {
                                (navigation as any).navigate('SearchTab');
                            }
                        },
                        {
                            text: 'Annuler',
                            style: 'cancel'
                        }
                    ]
                );
            } else if (recommendation.type === 'good_job') {
                const mockInterviewMode = testModes.find(m => m.mode === 'mock_interview');
                if (mockInterviewMode) {
                    Alert.alert(
                        'Prêt pour un défi ?',
                        'Vous performez excellemment ! Voulez-vous essayer un entretien fictif ?',
                        [
                            {
                                text: 'Commencer l\'entretien',
                                onPress: () => {
                                    setSelectedMode('mock_interview');
                                    setShowModeModal(true);
                                }
                            },
                            {
                                text: 'Plus tard',
                                style: 'cancel'
                            }
                        ]
                    );
                }
            } else if (recommendation.type === 'practice_more') {
                const geographyMode = testModes.find(m => m.mode === 'geography_only');
                if (geographyMode) {
                    Alert.alert(
                        'Commencer par les bases',
                        'Nous vous recommandons de commencer par le test de géographie pour établir de bonnes bases.',
                        [
                            {
                                text: 'Commencer le test',
                                onPress: () => {
                                    setSelectedMode('geography_only');
                                    setShowModeModal(true);
                                }
                            },
                            {
                                text: 'Annuler',
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Error handling recommendation action:', error);
            Alert.alert(
                'Erreur',
                'Une erreur s\'est produite. Veuillez réessayer.'
            );
        }
    }, [testModes, navigation]);

    const handleViewDetailedProgress = useCallback(() => {
        navigation.navigate('Progress', undefined);
    }, [navigation]);

    const handleNavigateToSubcategoryTests = useCallback(() => {
        navigation.navigate('SubcategoryTest', undefined);
    }, [navigation]);

    const handleNavigateToPart1Tests = useCallback(() => {
        navigation.navigate('ConversationTest', undefined);
    }, [navigation]);

    const handleModeSelection = useCallback((mode: TestMode) => {
        setSelectedMode(mode);
        setShowModeModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModeModal(false);
    }, []);

    return {
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
    };
};