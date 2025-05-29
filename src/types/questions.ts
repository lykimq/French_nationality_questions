import { MultiLangText } from '../contexts/LanguageContext';

export interface BaseQuestion {
    id: number;
    question: string | MultiLangText;
    answer?: string | MultiLangText;
    explanation?: string | MultiLangText;
    image?: string | null;
}

export interface MultiLangQuestion extends Omit<BaseQuestion, 'question' | 'explanation'> {
    question: string;
    question_vi: string;
    explanation?: string;
    explanation_vi?: string;
}

export type Question = BaseQuestion | MultiLangQuestion;