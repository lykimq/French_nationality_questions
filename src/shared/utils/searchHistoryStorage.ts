import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLogger } from "./logger";

const logger = createLogger("SearchHistoryStorage");

const STORAGE_KEY = "@question_search_history_v1";
const MAX_ENTRIES = 10;

export const loadSearchHistory = async (): Promise<string[]> => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .filter((entry): entry is string => typeof entry === "string")
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)
            .slice(0, MAX_ENTRIES);
    } catch (error) {
        logger.warn("Failed to load search history:", error);
        return [];
    }
};

export const persistSearchHistory = async (
    history: readonly string[]
): Promise<void> => {
    try {
        const sanitized = history
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)
            .slice(0, MAX_ENTRIES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
        logger.warn("Failed to persist search history:", error);
    }
};

export const clearStoredSearchHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        logger.warn("Failed to clear search history:", error);
    }
};
