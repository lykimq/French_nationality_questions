import { useState, useEffect } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { getImageSource, getCachedImageSource } from '../utils';
import { createLogger } from '../utils/logger';

const logger = createLogger('useFirebaseImage');

interface UseFirebaseImageResult {
    imageSource: ImageSourcePropType | null;
    isLoading: boolean;
    error: boolean;
}

/**
 * Hook to handle Firebase image loading with caching support
 */
export const useFirebaseImage = (imagePath: string | null | undefined): UseFirebaseImageResult => {
    const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadImage = async () => {
            if (!imagePath) {
                setImageSource(null);
                setIsLoading(false);
                setError(false);
                return;
            }

            setIsLoading(true);
            setError(false);

            try {
                // Try cache first
                const cachedSource = getCachedImageSource(imagePath);
                if (cachedSource) {
                    if (isMounted) {
                        setImageSource(cachedSource);
                        setIsLoading(false);
                    }
                    return;
                }

                // Load from Firebase
                const source = await getImageSource(imagePath);
                if (isMounted) {
                    if (source) {
                        setImageSource(source);
                    } else {
                        setError(true);
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                logger.error(`Error loading image: ${imagePath}`, err);
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
    }, [imagePath]);

    return { imageSource, isLoading, error };
};
