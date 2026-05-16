import { useQuestionSearch } from "./useQuestionSearch";

export const useLiveSearchResults = (debounceMs: number = 200) =>
    useQuestionSearch({ debounceMs });
