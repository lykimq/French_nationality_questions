import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TestMode, TestConfig, TestRecommendation, MainTestModeOption, TestStackParamList } from '../types';
import { useTest } from '../contexts/TestContext';

type TestScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

interface UseTestActionsProps {
    testModes: MainTestModeOption[];
    getLocalizedText: (textFr: string, textVi: string) => string;
}

export const useTestActions = ({ testModes, getLocalizedText }: UseTestActionsProps) => {
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
                getLocalizedText('Aucune question disponible', 'Không có câu hỏi'),
                getLocalizedText(
                    'Il n\'y a pas de questions disponibles pour ce mode de test.',
                    'Không có câu hỏi nào có sẵn cho chế độ kiểm tra này.'
                )
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
                getLocalizedText('Erreur', 'Lỗi'),
                getLocalizedText(
                    'Impossible de démarrer le test. Veuillez réessayer.',
                    'Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.'
                )
            );
        } finally {
            setIsStartingTest(false);
            setShowModeModal(false);
        }
    }, [testModes, getLocalizedText, startTest, navigation]);

    const handleRecommendationAction = useCallback(async (recommendation: TestRecommendation) => {
        try {
            if (recommendation.type === 'review_questions' && recommendation.questionIds && recommendation.questionIds.length > 0) {
                navigation.navigate('Review', undefined);
            } else if (recommendation.type === 'study_category' && recommendation.categoryIds && recommendation.categoryIds.length > 0) {
                const categories = recommendation.categoryIds.join(', ');
                Alert.alert(
                    getLocalizedText('Étude par catégorie', 'Học theo chủ đề'),
                    getLocalizedText(
                        `Catégories à améliorer: ${categories}\n\nUtilisez la recherche pour trouver des questions de ces catégories spécifiques.`,
                        `Các chủ đề cần cải thiện: ${categories}\n\nSử dụng tìm kiếm để tìm câu hỏi từ các chủ đề này.`
                    ),
                    [
                        {
                            text: getLocalizedText('Aller à la recherche', 'Đi tới tìm kiếm'),
                            onPress: () => {
                                (navigation as any).navigate('SearchTab');
                            }
                        },
                        {
                            text: getLocalizedText('Annuler', 'Hủy'),
                            style: 'cancel'
                        }
                    ]
                );
            } else if (recommendation.type === 'good_job') {
                const mockInterviewMode = testModes.find(m => m.mode === 'mock_interview');
                if (mockInterviewMode) {
                    Alert.alert(
                        getLocalizedText('Prêt pour un défi ?', 'Sẵn sàng cho thử thách?'),
                        getLocalizedText(
                            'Vous performez excellemment ! Voulez-vous essayer un entretien fictif ?',
                            'Bạn đang thể hiện xuất sắc! Bạn có muốn thử phỏng vấn giả lập không?'
                        ),
                        [
                            {
                                text: getLocalizedText('Commencer l\'entretien', 'Bắt đầu phỏng vấn'),
                                onPress: () => {
                                    setSelectedMode('mock_interview');
                                    setShowModeModal(true);
                                }
                            },
                            {
                                text: getLocalizedText('Plus tard', 'Để sau'),
                                style: 'cancel'
                            }
                        ]
                    );
                }
            } else if (recommendation.type === 'practice_more') {
                const geographyMode = testModes.find(m => m.mode === 'geography_only');
                if (geographyMode) {
                    Alert.alert(
                        getLocalizedText('Commencer par les bases', 'Bắt đầu từ cơ bản'),
                        getLocalizedText(
                            'Nous vous recommandons de commencer par le test de géographie pour établir de bonnes bases.',
                            'Chúng tôi khuyên bạn nên bắt đầu với bài kiểm tra địa lý để thiết lập nền tảng vững chắc.'
                        ),
                        [
                            {
                                text: getLocalizedText('Commencer le test', 'Bắt đầu bài test'),
                                onPress: () => {
                                    setSelectedMode('geography_only');
                                    setShowModeModal(true);
                                }
                            },
                            {
                                text: getLocalizedText('Annuler', 'Hủy'),
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Error handling recommendation action:', error);
            Alert.alert(
                getLocalizedText('Erreur', 'Lỗi'),
                getLocalizedText(
                    'Une erreur s\'est produite. Veuillez réessayer.',
                    'Đã xảy ra lỗi. Vui lòng thử lại.'
                )
            );
        }
    }, [testModes, getLocalizedText, navigation]);

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