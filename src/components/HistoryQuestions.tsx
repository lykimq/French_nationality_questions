import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryQuestions } from '../hooks/useHistoryQuestions';
import { HistorySubcategory, Language } from '../types/history';
import { historyStyles as styles } from '../styles/historyStyles';

interface HistoryQuestionsProps {
    subcategory: HistorySubcategory;
    language?: Language;
    onBack?: () => void;
}

const HistoryQuestions: React.FC<HistoryQuestionsProps> = ({
    subcategory,
    language = 'fr',
    onBack
}) => {
    const {
        currentQuestion,
        progress,
        getNextQuestion,
        markQuestionAsAnswered
    } = useHistoryQuestions({ subcategory, language });

    const [showExplanation, setShowExplanation] = useState(false);

    const handleNextQuestion = () => {
        setShowExplanation(false);
        getNextQuestion();
    };

    const handleMarkAnswered = () => {
        if (currentQuestion) {
            markQuestionAsAnswered(currentQuestion.id);
            setShowExplanation(true);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                {onBack && (
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#3F51B5" />
                    </Pressable>
                )}
                <Text style={styles.title}>
                    {language === 'fr' ? subcategory.title : subcategory.title_vi || subcategory.title}
                </Text>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {language === 'fr' ? 'Progression' : 'Tiến độ'}: {progress.answered}/{progress.total}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress.percentage}%` }
                        ]}
                    />
                </View>
            </View>

            {currentQuestion ? (
                <View style={styles.questionCard}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>

                    {showExplanation ? (
                        <>
                            <Text style={styles.explanationLabel}>
                                {language === 'fr' ? 'Explication' : 'Giải thích'}:
                            </Text>
                            <Text style={styles.explanationText}>
                                {currentQuestion.explanation}
                            </Text>
                            <Pressable
                                style={styles.nextButton}
                                onPress={handleNextQuestion}
                            >
                                <Text style={styles.buttonText}>
                                    {language === 'fr' ? 'Question suivante' : 'Câu hỏi tiếp theo'}
                                </Text>
                            </Pressable>
                        </>
                    ) : (
                        <Pressable
                            style={styles.showAnswerButton}
                            onPress={handleMarkAnswered}
                        >
                            <Text style={styles.buttonText}>
                                {language === 'fr' ? 'Voir la réponse' : 'Xem câu trả lời'}
                            </Text>
                        </Pressable>
                    )}
                </View>
            ) : (
                <Pressable
                    style={styles.startButton}
                    onPress={getNextQuestion}
                >
                    <Text style={styles.buttonText}>
                        {language === 'fr' ? 'Commencer' : 'Bắt đầu'}
                    </Text>
                </Pressable>
            )}

            {currentQuestion?.image && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: currentQuestion.image }}
                        style={styles.questionImage}
                        resizeMode="contain"
                    />
                </View>
            )}
        </ScrollView>
    );
};

export default HistoryQuestions;