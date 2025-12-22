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
        DIRECTORY: 'knowledge/merged/subcategories/',
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
    'knowledge/merged/subcategories/local_gov.json': require('../../data/knowledge/merged/subcategories/local_gov.json'),
    'knowledge/merged/subcategories/monarchy.json': require('../../data/knowledge/merged/subcategories/monarchy.json'),
    'knowledge/merged/subcategories/revolution.json': require('../../data/knowledge/merged/subcategories/revolution.json'),
    'knowledge/merged/subcategories/wars.json': require('../../data/knowledge/merged/subcategories/wars.json'),
    'knowledge/merged/subcategories/republic.json': require('../../data/knowledge/merged/subcategories/republic.json'),
    'knowledge/merged/subcategories/democracy.json': require('../../data/knowledge/merged/subcategories/democracy.json'),
    'knowledge/merged/subcategories/economy.json': require('../../data/knowledge/merged/subcategories/economy.json'),
    'knowledge/merged/subcategories/culture.json': require('../../data/knowledge/merged/subcategories/culture.json'),
    'knowledge/merged/subcategories/arts.json': require('../../data/knowledge/merged/subcategories/arts.json'),
    'knowledge/merged/subcategories/celebrities.json': require('../../data/knowledge/merged/subcategories/celebrities.json'),
    'knowledge/merged/subcategories/sports.json': require('../../data/knowledge/merged/subcategories/sports.json'),
    'knowledge/merged/subcategories/holidays.json': require('../../data/knowledge/merged/subcategories/holidays.json'),
    'knowledge/merged/subcategories/history_general.json': require('../../data/knowledge/merged/subcategories/history_general.json'),
    'knowledge/merged/subcategories/geography.json': require('../../data/knowledge/merged/subcategories/geography.json'),
    'knowledge/merged/subcategories/society.json': require('../../data/knowledge/merged/subcategories/society.json'),
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
