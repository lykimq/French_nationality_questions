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
    },
    FORMATION: {
        DIRECTORY: 'formation/',
        FILES: [
            'principes_et_valeurs.json',
            'histoire_geographie_et_culture.json',
            'droits_et_devoirs.json',
            'system_et_politique.json',
            'vivre_dans_la_societe_francaise.json'
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
    'formation/principes_et_valeurs.json': require('../../data/formation/principes_et_valeurs.json'),
    'formation/histoire_geographie_et_culture.json': require('../../data/formation/histoire_geographie_et_culture.json'),
    'formation/droits_et_devoirs.json': require('../../data/formation/droits_et_devoirs.json'),
    'formation/system_et_politique.json': require('../../data/formation/system_et_politique.json'),
    'formation/vivre_dans_la_societe_francaise.json': require('../../data/formation/vivre_dans_la_societe_francaise.json'),
};

/**
 * Maps image paths to local require statements.
 * This is necessary because React Native's 'require' must be static.
 */
export const LOCAL_IMAGE_MAP: Record<string, any> = {
    'pics/card.png': require('../../data/pics/card.png'),
    'pics/chart_ecole.png': require('../../data/pics/chart_ecole.png'),
    'pics/child.png': require('../../data/pics/child.png'),
    'pics/earth.png': require('../../data/pics/earth.png'),
    'pics/euro.png': require('../../data/pics/euro.png'),
    'pics/food.png': require('../../data/pics/food.png'),
    'pics/judiciaire.png': require('../../data/pics/judiciaire.png'),
    'pics/lecole.png': require('../../data/pics/lecole.png'),
    'pics/parcours_dune_loi.png': require('../../data/pics/parcours_dune_loi.png'),
    'pics/parent.png': require('../../data/pics/parent.png'),
    'pics/politiques.png': require('../../data/pics/politiques.png'),
    'pics/porte.png': require('../../data/pics/porte.png'),
    'pics/region.png': require('../../data/pics/region.png'),
    'pics/territories.png': require('../../data/pics/territories.png'),
    'pics/urgence_number.png': require('../../data/pics/urgence_number.png'),
};
