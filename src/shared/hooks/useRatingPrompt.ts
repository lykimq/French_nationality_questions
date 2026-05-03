import { useEffect, useState } from "react";
import {
    incrementLaunchCount,
    shouldPromptForRating,
    markRatingPromptShown,
} from "../utils/ratingUtils";
import { createLogger } from "../utils/logger";

const logger = createLogger("useRatingPrompt");

export const useRatingPrompt = () => {
    const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkAndPrompt = async () => {
            try {
                await incrementLaunchCount();

                const shouldPrompt = await shouldPromptForRating();
                if (shouldPrompt && isMounted) {
                    setShouldShowPrompt(true);
                    await markRatingPromptShown();
                }
            } catch (error) {
                logger.error("Failed to check rating prompt:", error);
            }
        };

        checkAndPrompt();

        return () => {
            isMounted = false;
        };
    }, []);

    const dismissPrompt = () => {
        setShouldShowPrompt(false);
    };

    return {
        shouldShowPrompt,
        dismissPrompt,
    };
};
