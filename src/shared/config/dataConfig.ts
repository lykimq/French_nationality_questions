/**
 * Configuration for data files and their mappings.
 * Centrally manages the file structure used throughout the app.
 */

export const DATA_FILES = {
    /**
     * Unified data source from Livret du Citoyen.
     * Total: 1053 questions with explanations across all categories.
     */
    SUBCATEGORIES: {
        DIRECTORY: 'knowledge/new_livret/',
        FILES: [
            'administration_locale.json',
            'arts_culture_sports.json',
            'ddhc.json',
            'democratie_politique.json',
            'droits_devoirs.json',
            'france_europe_monde.json',
            'geographie_sites.json',
            'principes_valeurs.json',
            'reperes_historiques.json',
            'vie_personnelle_integration.json'
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
 * 
 * This mapping is necessary because:
 * 1. React Native's 'require' must be static (cannot use dynamic paths)
 * 2. Provides offline fallback when Firebase is unavailable
 * 3. Enables faster initial load from bundled assets
 * 
 * Each entry maps a Firebase Storage path to its corresponding local asset.
 * The paths must match exactly with the Firebase Storage structure.
 */
export const LOCAL_DATA_MAP: Record<string, any> = {
    'knowledge/new_livret/administration_locale.json': require('../../data/knowledge/new_livret/administration_locale.json'),
    'knowledge/new_livret/arts_culture_sports.json': require('../../data/knowledge/new_livret/arts_culture_sports.json'),
    'knowledge/new_livret/ddhc.json': require('../../data/knowledge/new_livret/ddhc.json'),
    'knowledge/new_livret/democratie_politique.json': require('../../data/knowledge/new_livret/democratie_politique.json'),
    'knowledge/new_livret/droits_devoirs.json': require('../../data/knowledge/new_livret/droits_devoirs.json'),
    'knowledge/new_livret/france_europe_monde.json': require('../../data/knowledge/new_livret/france_europe_monde.json'),
    'knowledge/new_livret/geographie_sites.json': require('../../data/knowledge/new_livret/geographie_sites.json'),
    'knowledge/new_livret/principes_valeurs.json': require('../../data/knowledge/new_livret/principes_valeurs.json'),
    'knowledge/new_livret/reperes_historiques.json': require('../../data/knowledge/new_livret/reperes_historiques.json'),
    'knowledge/new_livret/vie_personnelle_integration.json': require('../../data/knowledge/new_livret/vie_personnelle_integration.json'),
    // Formation data
    'knowledge/formation/principes_et_valeurs.json': require('../../data/knowledge/formation/principes_et_valeurs.json'),
    'knowledge/formation/histoire_geographie_et_culture.json': require('../../data/knowledge/formation/histoire_geographie_et_culture.json'),
    'knowledge/formation/droits_et_devoirs.json': require('../../data/knowledge/formation/droits_et_devoirs.json'),
    'knowledge/formation/system_et_politique.json': require('../../data/knowledge/formation/system_et_politique.json'),
    'knowledge/formation/vivre_dans_la_societe_francaise.json': require('../../data/knowledge/formation/vivre_dans_la_societe_francaise.json'),
};

/**
 * Maps image paths to local require statements.
 * 
 * Similar to LOCAL_DATA_MAP, this provides:
 * 1. Static require statements for React Native bundler
 * 2. Offline image access
 * 3. Immediate image availability without network requests
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
