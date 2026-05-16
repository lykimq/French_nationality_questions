import { useState, useEffect } from "react";
import type { ImageSourcePropType } from "react-native";
import { loadImageResource, getCachedImage } from "../services/dataService";
import { resolveImagePath } from "../utils/imagePathUtils";
import { createLogger } from "../utils/logger";

const logger = createLogger("useFirebaseImage");

interface UseFirebaseImageResult {
    imageSource: ImageSourcePropType | null;
    isLoading: boolean;
    error: boolean;
}

/**
 * Hook for Firebase image loading with caching.
 */
export const useFirebaseImage = (
    imagePath: string | null | undefined
): UseFirebaseImageResult => {
    const resolvedPath = resolveImagePath(imagePath);
    const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadImage = async () => {
            if (!resolvedPath) {
                setImageSource(null);
                setIsLoading(false);
                setError(false);
                return;
            }

            setIsLoading(true);
            setError(false);

            try {
                // Try cache first
                const cachedSource = getCachedImage(resolvedPath);
                if (cachedSource) {
                    if (isMounted) {
                        setImageSource(cachedSource);
                        setIsLoading(false);
                    }
                    return;
                }

                const source = await loadImageResource(resolvedPath);
                if (isMounted) {
                    if (source) {
                        setImageSource(source);
                    } else {
                        setError(true);
                    }
                    setIsLoading(false);
                }
            } catch (error: unknown) {
                logger.error(`Error loading image: ${resolvedPath}`, error);
                if (isMounted) {
                    setError(true);
                    setIsLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [resolvedPath]);

    return { imageSource, isLoading, error };
};
