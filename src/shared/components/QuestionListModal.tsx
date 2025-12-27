import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useIcon3D } from '../hooks';
import FormattedText from './FormattedText';
import Icon3D from './Icon3D';
import { getQuestionText } from '../utils/questionUtils';

export interface QuestionListItem {
    readonly index: number;
    readonly id: number | string;
    readonly questionText: string;
}

export interface QuestionListModalProps {
    visible: boolean;
    onClose: () => void;
    questions: QuestionListItem[];
    currentIndex: number;
    totalCount: number;
    onSelectQuestion: (index: number) => void;
    title?: string;
}

const QuestionListModal: React.FC<QuestionListModalProps> = ({
    visible,
    onClose,
    questions,
    currentIndex,
    totalCount,
    onSelectQuestion,
    title = 'Liste des questions',
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();
    const questionListRef = useRef<FlatList>(null);
    const closeIcon = getIcon('close');

    useEffect(() => {
        if (visible && questionListRef.current && questions.length > 0) {
            const scrollTimeout = setTimeout(() => {
                try {
                    questionListRef.current?.scrollToIndex({
                        index: Math.max(0, Math.min(currentIndex, questions.length - 1)),
                        animated: true,
                        viewPosition: 0.5,
                    });
                } catch (error) {
                    // Silently handle scroll errors
                }
            }, 300);
            return () => clearTimeout(scrollTimeout);
        }
    }, [visible, currentIndex, questions.length]);

    const handleQuestionSelect = useCallback((index: number) => {
        if (index >= 0 && index < totalCount) {
            onSelectQuestion(index);
        }
    }, [totalCount, onSelectQuestion]);

    const renderQuestionItem = useCallback(({ item }: { item: QuestionListItem }) => {
        const isSelected = item.index === currentIndex;
        const questionNumber = item.index + 1;
        const truncatedText = item.questionText.length > 60 
            ? item.questionText.substring(0, 60) + '...' 
            : item.questionText;

        return (
            <TouchableOpacity
                style={[
                    styles.questionListItem,
                    {
                        backgroundColor: isSelected 
                            ? theme.colors.primary + '20' 
                            : theme.colors.background,
                        borderLeftColor: isSelected 
                            ? theme.colors.primary 
                            : 'transparent',
                    }
                ]}
                onPress={() => handleQuestionSelect(item.index)}
                activeOpacity={0.7}
            >
                <View style={styles.questionListItemContent}>
                    <View style={[styles.questionNumberBadge, { backgroundColor: isSelected ? theme.colors.primary : theme.colors.divider }]}>
                        <FormattedText style={[styles.questionNumberText, { color: isSelected ? theme.colors.buttonText : theme.colors.text }]}>
                            {questionNumber}
                        </FormattedText>
                    </View>
                    <View style={styles.questionListItemText}>
                        <FormattedText 
                            style={[styles.questionListItemQuestion, { color: theme.colors.text }]}
                            numberOfLines={2}
                        >
                            {truncatedText}
                        </FormattedText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [currentIndex, theme, handleQuestionSelect]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.divider }]}>
                        <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {title} ({totalCount})
                        </FormattedText>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Icon3D
                                name={closeIcon.name}
                                size={24}
                                color={theme.colors.text}
                                variant={closeIcon.variant}
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        ref={questionListRef}
                        data={questions}
                        keyExtractor={(item) => `question-${item.index}`}
                        style={styles.questionList}
                        contentContainerStyle={styles.questionListContent}
                        getItemLayout={(data, index) => ({
                            length: 76,
                            offset: 76 * index,
                            index,
                        })}
                        onScrollToIndexFailed={(info) => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                questionListRef.current?.scrollToIndex({ index: info.index, animated: true });
                            });
                        }}
                        renderItem={renderQuestionItem}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    questionList: {
        flex: 1,
    },
    questionListContent: {
        paddingBottom: 20,
    },
    questionListItem: {
        borderLeftWidth: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
    },
    questionListItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    questionNumberBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    questionNumberText: {
        fontSize: 14,
        fontWeight: '600',
    },
    questionListItemText: {
        flex: 1,
    },
    questionListItemQuestion: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default QuestionListModal;

