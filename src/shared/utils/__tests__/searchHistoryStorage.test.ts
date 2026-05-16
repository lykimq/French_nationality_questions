import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    clearStoredSearchHistory,
    loadSearchHistory,
    persistSearchHistory,
} from "../searchHistoryStorage";

describe("searchHistoryStorage", () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it("loadSearchHistory returns empty when unset", async () => {
        await expect(loadSearchHistory()).resolves.toEqual([]);
    });

    it("persistSearchHistory stores trimmed queries capped at 10", async () => {
        const entries = Array.from({ length: 12 }, (_, i) => `query ${i}`);
        await persistSearchHistory(entries);

        await expect(loadSearchHistory()).resolves.toEqual(
            entries.slice(0, 10)
        );
    });

    it("loadSearchHistory ignores invalid stored payloads", async () => {
        await AsyncStorage.setItem(
            "@question_search_history_v1",
            JSON.stringify([1, "valid", ""])
        );
        await expect(loadSearchHistory()).resolves.toEqual(["valid"]);
    });

    it("clearStoredSearchHistory removes saved history", async () => {
        await persistSearchHistory(["naturalisation"]);
        await clearStoredSearchHistory();
        await expect(loadSearchHistory()).resolves.toEqual([]);
    });
});
