export interface Question {
    id: number;
    question_fr: string;
    question_vi: string;
    explanation_fr: string;
    explanation_vi: string;
    image: string | null;
}

export interface HistorySubcategory {
    id: string;
    title: string;
    title_vi?: string;
    icon: string;
    description: string;
    description_vi?: string;
    questions: Question[];
}

export interface HistoryCategory {
    id: string;
    title: string;
    title_vi?: string;
    icon: string;
    description: string;
    description_vi?: string;
    subcategories: HistorySubcategory[];
}

export type QuestionType = 'dates' | 'people' | 'events' | 'places';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'fr' | 'vi';