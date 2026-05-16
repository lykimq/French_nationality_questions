import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import RatingModal from "../../settings/components/RatingModal";
import {
    incrementLaunchCount,
    markRatingPromptShown,
    shouldPromptForRating,
} from "../utils/ratingUtils";
import { createLogger } from "../utils/logger";

const logger = createLogger("RatingPromptContext");

interface RatingPromptContextType {
    openRatingModal: () => void;
}

const RatingPromptContext = createContext<
    RatingPromptContextType | undefined
>(undefined);

export const RatingPromptProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [autoPromptVisible, setAutoPromptVisible] = useState(false);
    const [manualPromptVisible, setManualPromptVisible] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkAndPrompt = async () => {
            try {
                await incrementLaunchCount();
                const shouldPrompt = await shouldPromptForRating();
                if (shouldPrompt && !cancelled) {
                    setAutoPromptVisible(true);
                    await markRatingPromptShown();
                }
            } catch (error) {
                logger.error("Failed to check rating prompt:", error);
            }
        };

        void checkAndPrompt();

        return () => {
            cancelled = true;
        };
    }, []);

    const dismissPrompt = useCallback(() => {
        setAutoPromptVisible(false);
        setManualPromptVisible(false);
    }, []);

    const openRatingModal = useCallback(() => {
        setManualPromptVisible(true);
    }, []);

    const visible = autoPromptVisible || manualPromptVisible;

    const value = useMemo(
        () => ({
            openRatingModal,
        }),
        [openRatingModal]
    );

    return (
        <RatingPromptContext.Provider value={value}>
            {children}
            {visible && (
                <RatingModal visible={visible} onClose={dismissPrompt} />
            )}
        </RatingPromptContext.Provider>
    );
};

export const useRatingPrompt = (): RatingPromptContextType => {
    const context = useContext(RatingPromptContext);
    if (!context) {
        throw new Error(
            "useRatingPrompt must be used within a RatingPromptProvider"
        );
    }
    return context;
};
