/**
 * Data file paths configuration.
 */

export const DATA_FILES = {
    /**
     * Livret du Citoyen data (1053 questions).
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
    FORMATION: {
        DIRECTORY: 'knowledge/formation/',
        FILES: [
            'principes_et_valeurs.json',
            'histoire_geographie_et_culture.json',
            'droits_et_devoirs.json',
            'system_et_politique.json',
            'vivre_dans_la_societe_francaise.json'
        ] as const
    },
    TEST_CIVIC: {
        DIRECTORY: 'test_civic/',
        FILES: [
            'principes_et_valeurs.json',
            'system_et_politique.json',
            'droits_et_devoirs.json',
            'histoire_geographie_et_culture.json',
            'hist_geo_part1.json',
            'hist_geo_part2.json',
            'vivre_dans_la_societe_francaise.json'
        ] as const
    }
};

