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

// ==================== CATEGORY TO TOPIC MAPPING ====================
// Note: This mapping is deprecated and not used. Kept for reference only.
// General knowledge questions use categoryId, not topics.

export const CATEGORY_TO_TOPIC_MAP: Record<string, CivicExamTopic> = {
    democracy: 'principles_values',
    republic: 'institutional_political',
    local_gov: 'institutional_political',
    monarchy: 'history_geography_culture',
    revolution: 'history_geography_culture',
    wars: 'history_geography_culture',
    geography: 'history_geography_culture',
    culture: 'history_geography_culture',
    arts: 'history_geography_culture',
    personal: 'living_society',
};

// ==================== SUBTOPIC TO CATEGORY MAPPING ====================
// Note: This mapping is deprecated and not used. Kept for reference only.

export const SUBTOPIC_TO_CATEGORY_MAP: Partial<Record<CivicExamSubTopic, string[]>> = {
    devise_symboles: ['democracy'],
    laicite: ['democracy'],
    democracy_vote: ['democracy', 'republic'],
    organization_republic: ['republic', 'local_gov'],
    european_institutions: ['republic'],
    fundamental_rights: ['democracy'],
    obligations_duties: ['democracy'],
    historical_periods: ['monarchy', 'revolution', 'wars'],
    territories_geography: ['geography'],
    heritage: ['culture', 'arts'],
    residence: ['personal'],
    healthcare: ['personal'],
    work: ['personal'],
    parental_authority_education: ['personal'],
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

// ==================== SUBTOPIC DISPLAY NAMES ====================

export const SUBTOPIC_DISPLAY_NAMES: Record<CivicExamSubTopic, string> = {
    devise_symboles: 'Devise et symboles de la République',
    laicite: 'Laïcité',
    situational_principles: 'Mises en situation',
    democracy_vote: 'Démocratie et droit de vote',
    organization_republic: 'Organisation de la République française',
    european_institutions: 'Institutions européennes',
    fundamental_rights: 'Droits fondamentaux',
    obligations_duties: 'Obligations et devoirs',
    situational_rights: 'Mises en situation',
    historical_periods: 'Principales périodes et personnages historiques',
    territories_geography: 'Territoires et géographie',
    heritage: 'Patrimoine français',
    residence: "S'installer et résider en France",
    healthcare: "L'accès aux soins",
    work: 'Travailler en France',
    parental_authority_education: "Autorité parentale et système éducatif",
};

