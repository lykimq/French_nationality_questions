/**
 * Configuration for data files and their mappings.
 * Centrally manages the file structure used throughout the app.
 */

export const DATA_FILES = {
    MAIN: {
        PERSONAL: 'personal_fr_vi.json',
        GEOGRAPHY: 'geography_fr_vi.json',
    },
    HISTORY: {
        CATEGORIES: 'history_categories.json',
    },
    SUBCATEGORIES: {
        DIRECTORY: 'subcategories/',
        FILES: [
            'local_gov.json',
            'monarchy.json',
            'revolution.json',
            'wars.json',
            'republic.json',
            'democracy.json',
            'economy.json',
            'culture.json',
            'arts.json',
            'celebrities.json',
            'sports.json',
            'holidays.json'
        ] as const
    },
    TESTS: {
        DIRECTORY: 'tests/',
        PART1: [
            'test_personal_fr_vi.json',
            'test_opinions_fr_vi.json',
            'test_daily_life_fr_vi.json'
        ] as const
    }
};

/**
 * Maps Firebase data paths to local require statements.
 * This is necessary because React Native's 'require' must be static.
 */
export const LOCAL_DATA_MAP: Record<string, any> = {
    [DATA_FILES.MAIN.PERSONAL]: require('../../data/personal_fr_vi.json'),
    [DATA_FILES.MAIN.GEOGRAPHY]: require('../../data/geography_fr_vi.json'),
    [DATA_FILES.HISTORY.CATEGORIES]: require('../../data/history_categories.json'),
    'subcategories/local_gov.json': require('../../data/subcategories/local_gov.json'),
    'subcategories/monarchy.json': require('../../data/subcategories/monarchy.json'),
    'subcategories/revolution.json': require('../../data/subcategories/revolution.json'),
    'subcategories/wars.json': require('../../data/subcategories/wars.json'),
    'subcategories/republic.json': require('../../data/subcategories/republic.json'),
    'subcategories/democracy.json': require('../../data/subcategories/democracy.json'),
    'subcategories/economy.json': require('../../data/subcategories/economy.json'),
    'subcategories/culture.json': require('../../data/subcategories/culture.json'),
    'subcategories/arts.json': require('../../data/subcategories/arts.json'),
    'subcategories/celebrities.json': require('../../data/subcategories/celebrities.json'),
    'subcategories/sports.json': require('../../data/subcategories/sports.json'),
    'subcategories/holidays.json': require('../../data/subcategories/holidays.json'),
};
