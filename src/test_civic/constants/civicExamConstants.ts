import type { CivicExamTheme, CivicExamSubTheme } from '../types';

// ==================== QUESTION DISTRIBUTION ====================

export const CIVIC_EXAM_DISTRIBUTION: Record<CivicExamTheme, {
    total: number;
    subThemes: Record<CivicExamSubTheme, number>;
}> = {
    principles_values: {
        total: 11,
        subThemes: {
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
        subThemes: {
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
        subThemes: {
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
        subThemes: {
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
        subThemes: {
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

// ==================== CATEGORY TO THEME MAPPING ====================

export const CATEGORY_TO_THEME_MAP: Record<string, CivicExamTheme> = {
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

// ==================== SUBTHEME TO CATEGORY MAPPING ====================

export const SUBTHEME_TO_CATEGORY_MAP: Partial<Record<CivicExamSubTheme, string[]>> = {
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

// ==================== THEME DISPLAY NAMES ====================

export const THEME_DISPLAY_NAMES: Record<CivicExamTheme, { fr: string; vi: string }> = {
    principles_values: {
        fr: 'Principes et valeurs de la République',
        vi: 'Nguyên tắc và giá trị của Cộng hòa',
    },
    institutional_political: {
        fr: 'Système institutionnel et politique',
        vi: 'Hệ thống thể chế và chính trị',
    },
    rights_duties: {
        fr: 'Droits et devoirs',
        vi: 'Quyền và nghĩa vụ',
    },
    history_geography_culture: {
        fr: 'Histoire, géographie et culture',
        vi: 'Lịch sử, địa lý và văn hóa',
    },
    living_society: {
        fr: 'Vivre dans la société française',
        vi: 'Sống trong xã hội Pháp',
    },
};

// ==================== SUBTHEME DISPLAY NAMES ====================

export const SUBTHEME_DISPLAY_NAMES: Record<CivicExamSubTheme, { fr: string; vi: string }> = {
    devise_symboles: { fr: 'Devise et symboles de la République', vi: 'Khẩu hiệu và biểu tượng của Cộng hòa' },
    laicite: { fr: 'Laïcité', vi: 'Thế tục hóa' },
    situational_principles: { fr: 'Mises en situation', vi: 'Tình huống' },
    democracy_vote: { fr: 'Démocratie et droit de vote', vi: 'Dân chủ và quyền bầu cử' },
    organization_republic: { fr: 'Organisation de la République française', vi: 'Tổ chức của Cộng hòa Pháp' },
    european_institutions: { fr: 'Institutions européennes', vi: 'Thể chế châu Âu' },
    fundamental_rights: { fr: 'Droits fondamentaux', vi: 'Quyền cơ bản' },
    obligations_duties: { fr: 'Obligations et devoirs', vi: 'Nghĩa vụ và bổn phận' },
    situational_rights: { fr: 'Mises en situation', vi: 'Tình huống' },
    historical_periods: { fr: 'Principales périodes et personnages historiques', vi: 'Các giai đoạn và nhân vật lịch sử chính' },
    territories_geography: { fr: 'Territoires et géographie', vi: 'Lãnh thổ và địa lý' },
    heritage: { fr: 'Patrimoine français', vi: 'Di sản Pháp' },
    residence: { fr: "S'installer et résider en France", vi: 'Định cư và cư trú tại Pháp' },
    healthcare: { fr: "L'accès aux soins", vi: 'Tiếp cận chăm sóc sức khỏe' },
    work: { fr: 'Travailler en France', vi: 'Làm việc tại Pháp' },
    parental_authority_education: { fr: "Autorité parentale et système éducatif", vi: 'Quyền cha mẹ và hệ thống giáo dục' },
};

