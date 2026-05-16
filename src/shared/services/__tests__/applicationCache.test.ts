import { clearApplicationCaches } from "../applicationCache";
import { clearAllCaches } from "../dataService";
import { clearCloudSpeechCache } from "../cloudSpeechService";
import { clearFlashCardDataCache } from "../../../flashcard/utils/flashCardDataCache";

jest.mock("../dataService", () => ({
    clearAllCaches: jest.fn(),
}));

jest.mock("../cloudSpeechService", () => ({
    clearCloudSpeechCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../flashcard/utils/flashCardDataCache", () => ({
    clearFlashCardDataCache: jest.fn(),
}));

describe("clearApplicationCaches", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("clears data, flashcard, and speech caches", async () => {
        await clearApplicationCaches();

        expect(clearAllCaches).toHaveBeenCalledTimes(1);
        expect(clearFlashCardDataCache).toHaveBeenCalledTimes(1);
        expect(clearCloudSpeechCache).toHaveBeenCalledTimes(1);
    });
});
