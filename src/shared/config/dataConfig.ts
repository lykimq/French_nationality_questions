/**
 * Configuration for data files and their mappings.
 * Centrally manages the file structure used throughout the app.
 */

export const DATA_FILES = {
    MAIN: {
        PERSONAL: 'knowledge/personal_fr_vi.json',
        GEOGRAPHY: 'knowledge/geography_fr_vi.json',
    },
    HISTORY: {
        CATEGORIES: 'knowledge/history_categories.json',
    },
    SUBCATEGORIES: {
        DIRECTORY: 'knowledge/subcategories/',
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
            'holidays.json',
            'history_general.json',
            'geography.json',
            'society.json'
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
        DIRECTORY: 'knowledge/formation/',
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
    [DATA_FILES.MAIN.PERSONAL]: require('../../data/knowledge/personal_fr_vi.json'),
    [DATA_FILES.MAIN.GEOGRAPHY]: require('../../data/knowledge/geography_fr_vi.json'),
    [DATA_FILES.HISTORY.CATEGORIES]: require('../../data/knowledge/history_categories.json'),
    'knowledge/subcategories/local_gov.json': require('../../data/knowledge/subcategories/local_gov.json'),
    'knowledge/subcategories/monarchy.json': require('../../data/knowledge/subcategories/monarchy.json'),
    'knowledge/subcategories/revolution.json': require('../../data/knowledge/subcategories/revolution.json'),
    'knowledge/subcategories/wars.json': require('../../data/knowledge/subcategories/wars.json'),
    'knowledge/subcategories/republic.json': require('../../data/knowledge/subcategories/republic.json'),
    'knowledge/subcategories/democracy.json': require('../../data/knowledge/subcategories/democracy.json'),
    'knowledge/subcategories/economy.json': require('../../data/knowledge/subcategories/economy.json'),
    'knowledge/subcategories/culture.json': require('../../data/knowledge/subcategories/culture.json'),
    'knowledge/subcategories/arts.json': require('../../data/knowledge/subcategories/arts.json'),
    'knowledge/subcategories/celebrities.json': require('../../data/knowledge/subcategories/celebrities.json'),
    'knowledge/subcategories/sports.json': require('../../data/knowledge/subcategories/sports.json'),
    'knowledge/subcategories/holidays.json': require('../../data/knowledge/subcategories/holidays.json'),
    'knowledge/subcategories/history_general.json': require('../../data/knowledge/subcategories/history_general.json'),
    'knowledge/subcategories/geography.json': require('../../data/knowledge/subcategories/geography.json'),
    'knowledge/subcategories/society.json': require('../../data/knowledge/subcategories/society.json'),
    'knowledge/formation/principes_et_valeurs.json': require('../../data/knowledge/formation/principes_et_valeurs.json'),
    'knowledge/formation/histoire_geographie_et_culture.json': require('../../data/knowledge/formation/histoire_geographie_et_culture.json'),
    'knowledge/formation/droits_et_devoirs.json': require('../../data/knowledge/formation/droits_et_devoirs.json'),
    'knowledge/formation/system_et_politique.json': require('../../data/knowledge/formation/system_et_politique.json'),
    'knowledge/formation/vivre_dans_la_societe_francaise.json': require('../../data/knowledge/formation/vivre_dans_la_societe_francaise.json'),
};

/**
 * Maps image paths to local require statements.
 * This is necessary because React Native's 'require' must be static.
 */
export const LOCAL_IMAGE_MAP: Record<string, any> = {
    'pics/card.png': require('../../data/knowledge/pics/card.png'),
    'pics/chart_ecole.png': require('../../data/knowledge/pics/chart_ecole.png'),
    'pics/child.png': require('../../data/knowledge/pics/child.png'),
    'pics/earth.png': require('../../data/knowledge/pics/earth.png'),
    'pics/euro.png': require('../../data/knowledge/pics/euro.png'),
    'pics/food.png': require('../../data/knowledge/pics/food.png'),
    'pics/judiciaire.png': require('../../data/knowledge/pics/judiciaire.png'),
    'pics/lecole.png': require('../../data/knowledge/pics/lecole.png'),
    'pics/parcours_dune_loi.png': require('../../data/knowledge/pics/parcours_dune_loi.png'),
    'pics/parent.png': require('../../data/knowledge/pics/parent.png'),
    'pics/politiques.png': require('../../data/knowledge/pics/politiques.png'),
    'pics/porte.png': require('../../data/knowledge/pics/porte.png'),
    'pics/region.png': require('../../data/knowledge/pics/region.png'),
    'pics/territories.png': require('../../data/knowledge/pics/territories.png'),
    'pics/urgence_number.png': require('../../data/knowledge/pics/urgence_number.png'),
};
