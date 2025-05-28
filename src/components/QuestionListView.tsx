import React from 'react';
import { ScrollView } from 'react-native';
import QuestionCard from './QuestionCard';
import { listViewStyles as styles } from '../styles/questionViews';
import { Question } from '../types/questions';

interface QuestionListViewProps {
    questions: Question[];
    language: 'fr' | 'vi';
}

const QuestionListView: React.FC<QuestionListViewProps> = ({ questions, language }) => {
    const getLocalizedQuestion = (question: Question) => {
        if (language === 'vi' && 'question_vi' in question) {
            return question.question_vi;
        }
        return question.question;
    };

    const getLocalizedAnswer = (question: Question) => {
        if (language === 'vi' && 'answer_vi' in question) {
            return question.answer_vi;
        }
        return question.answer;
    };

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {questions.map((question) => (
                <QuestionCard
                    key={question.id}
                    id={question.id}
                    question={getLocalizedQuestion(question)}
                    answer={getLocalizedAnswer(question)}
                    explanation={question.explanation || ''}
                    image={question.image}
                    language={language}
                />
            ))}
        </ScrollView>
    );
};

export default QuestionListView;