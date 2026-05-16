import type { FormationCategory } from "../types";

let cachedData: { [key: string]: FormationCategory } | null = null;
let loadPromise: Promise<{ [key: string]: FormationCategory } | null> | null =
    null;

export const getFlashCardDataCache = (): {
    [key: string]: FormationCategory;
} | null => cachedData;

export const getFlashCardDataLoadPromise = (): Promise<{
    [key: string]: FormationCategory;
} | null> | null => loadPromise;

export const setFlashCardDataCache = (
    data: { [key: string]: FormationCategory } | null
): void => {
    cachedData = data;
};

export const setFlashCardDataLoadPromise = (
    promise: Promise<{ [key: string]: FormationCategory } | null> | null
): void => {
    loadPromise = promise;
};

export const clearFlashCardDataCache = (): void => {
    cachedData = null;
    loadPromise = null;
};
