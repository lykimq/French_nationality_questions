import { MultiLangText } from '../contexts/LanguageContext';

export interface BaseQuestion {
    id: number;
    question: string;
    answer: string;
    explanation?: string | MultiLangText;
    image?: string;
}

export interface MultiLangQuestion extends BaseQuestion {
    question_vi: string;
    answer_vi: string;
    explanation_vi?: string;
}

export type Question = BaseQuestion | MultiLangQuestion;