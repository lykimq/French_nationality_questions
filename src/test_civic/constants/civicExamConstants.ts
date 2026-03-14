import type { CivicExamTopic, CivicExamSubTopic } from '../types';

// ==================== QUESTION DISTRIBUTION ====================

export const CIVIC_EXAM_DISTRIBUTION: Record<CivicExamTopic, {
    total: number;
    subTopics: Record<CivicExamSubTopic, number>;
}> = {
    principles_values: {
        total: 11,
        subTopics: {
            devise_symboles: 3,
            laicite: 2,
            situational_principles: 6,
            democracy_vote: 0,
            organization_republic: 0,
            european_institutions: 0,
            fundamental_rights: 0,
            obligations_duties: 0,
            situational_rights: 0,
            historical_periods: 0,
            territories_geography: 0,
            heritage: 0,
            residence: 0,
            healthcare: 0,
            work: 0,
            parental_authority_education: 0,
        },
    },
    institutional_political: {
        total: 6,
        subTopics: {
            devise_symboles: 0,
            laicite: 0,
            situational_principles: 0,
            democracy_vote: 3,
            organization_republic: 2,
            european_institutions: 1,
            fundamental_rights: 0,
            obligations_duties: 0,
            situational_rights: 0,
            historical_periods: 0,
            territories_geography: 0,
            heritage: 0,
            residence: 0,
            healthcare: 0,
            work: 0,
            parental_authority_education: 0,
        },
    },
    rights_duties: {
        total: 11,
        subTopics: {
            devise_symboles: 0,
            laicite: 0,
            situational_principles: 0,
            democracy_vote: 0,
            organization_republic: 0,
            european_institutions: 0,
            fundamental_rights: 2,
            obligations_duties: 3,
            situational_rights: 6,
            historical_periods: 0,
            territories_geography: 0,
            heritage: 0,
            residence: 0,
            healthcare: 0,
            work: 0,
            parental_authority_education: 0,
        },
    },
    history_geography_culture: {
        total: 8,
        subTopics: {
            devise_symboles: 0,
            laicite: 0,
            situational_principles: 0,
            democracy_vote: 0,
            organization_republic: 0,
            european_institutions: 0,
            fundamental_rights: 0,
            obligations_duties: 0,
            situational_rights: 0,
            historical_periods: 3,
            territories_geography: 3,
            heritage: 2,
            residence: 0,
            healthcare: 0,
            work: 0,
            parental_authority_education: 0,
        },
    },
    living_society: {
        total: 4,
        subTopics: {
            devise_symboles: 0,
            laicite: 0,
            situational_principles: 0,
            democracy_vote: 0,
            organization_republic: 0,
            european_institutions: 0,
            fundamental_rights: 0,
            obligations_duties: 0,
            situational_rights: 0,
            historical_periods: 0,
            territories_geography: 0,
            heritage: 0,
            residence: 1,
            healthcare: 1,
            work: 1,
            parental_authority_education: 1,
        },
    },
};

// ==================== EXAM CONFIGURATION ====================

export const CIVIC_EXAM_CONFIG = {
    TOTAL_QUESTIONS: 40,
    TIME_LIMIT_MINUTES: 45,
    TIME_LIMIT_SECONDS: 45 * 60,
    PASSING_SCORE: 32, // 80%
    PASSING_PERCENTAGE: 80,
} as const;

// ==================== TOPIC DISPLAY NAMES ====================

export const TOPIC_DISPLAY_NAMES: Record<CivicExamTopic, string> = {
    principles_values: 'Principes et valeurs de la République',
    institutional_political: 'Système institutionnel et politique',
    rights_duties: 'Droits et devoirs',
    history_geography_culture: 'Histoire, géographie et culture',
    living_society: 'Vivre dans la société française',
};


