import { createLogger } from "../utils/logger";
import { clearFlashCardDataCache } from "../../flashcard/utils/flashCardDataCache";
import { clearAllCaches } from "./dataService";
import { clearCloudSpeechCache } from "./cloudSpeechService";

const logger = createLogger("ApplicationCache");

export const clearApplicationCaches = async (): Promise<void> => {
    clearAllCaches();
    clearFlashCardDataCache();
    await clearCloudSpeechCache();
    logger.info("Cleared application caches (data, images, flashcards, speech)");
};
