import { useMemo } from "react";
import { useData } from "../contexts/DataContext";
import {
    buildSearchCatalog,
    createDefaultSearchFilters,
    type SearchCatalog,
    type SearchFilters,
} from "../utils/searchQuestions";
import type { FrenchQuestionsData } from "../../types/questionsData";

export const useSearchCatalog = (): {
    catalog: SearchCatalog;
    defaultFilters: SearchFilters;
    questionsData: FrenchQuestionsData;
} => {
    const { questionsData } = useData();

    const catalog = useMemo(
        () => buildSearchCatalog(questionsData),
        [questionsData]
    );

    const defaultFilters = useMemo(
        () => createDefaultSearchFilters(catalog.idRange),
        [catalog.idRange]
    );

    return { catalog, defaultFilters, questionsData };
};
