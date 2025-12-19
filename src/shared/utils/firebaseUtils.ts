import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebaseConfig';
import { createLogger } from './logger';

const logger = createLogger('FirebaseUtils');

/**
 * Uploads an image to Firebase Storage
 * @param file - The file to upload
 * @param fileName - The name for the file in storage
 * @returns Promise that resolves to the download URL
 */
export const uploadImageToFirebase = async (file: Blob | Uint8Array, fileName: string): Promise<string> => {
    try {
        const imageRef = ref(storage, `French_questions/assets/${fileName}`);
        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        logger.error('Error uploading image:', error);
        throw error;
    }
};

/**
 * Lists all images in the Firebase Storage assets folder
 * @returns Promise that resolves to an array of image names
 */
export const listFirebaseImages = async (): Promise<string[]> => {
    try {
        const assetsRef = ref(storage, 'French_questions/assets');
        const result = await listAll(assetsRef);
        return result.items.map(item => item.name);
    } catch (error) {
        logger.error('Error listing images:', error);
        throw error;
    }
};

/**
 * Deletes an image from Firebase Storage
 * @param fileName - The name of the file to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImageFromFirebase = async (fileName: string): Promise<void> => {
    try {
        const imageRef = ref(storage, `French_questions/assets/${fileName}`);
        await deleteObject(imageRef);
    } catch (error) {
        logger.error('Error deleting image:', error);
        throw error;
    }
};

/**
 * Gets the Firebase Storage reference for an image
 * @param fileName - The name of the file
 * @returns Storage reference
 */
export const getImageRef = (fileName: string) => {
    return ref(storage, `French_questions/assets/${fileName}`);
};

/**
 * Checks if an image exists in Firebase Storage
 * @param fileName - The name of the file to check
 * @returns Promise that resolves to boolean indicating if file exists
 */
export const imageExistsInFirebase = async (fileName: string): Promise<boolean> => {
    try {
        const imageRef = ref(storage, `French_questions/assets/${fileName}`);
        await getDownloadURL(imageRef);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Batch upload multiple images to Firebase Storage
 * @param files - Array of {file: Blob, fileName: string} objects
 * @returns Promise that resolves to array of upload results
 */
export const batchUploadImages = async (files: Array<{ file: Blob | Uint8Array, fileName: string }>): Promise<Array<{ fileName: string, url?: string, error?: string }>> => {
    const results = [];

    for (const { file, fileName } of files) {
        try {
            const url = await uploadImageToFirebase(file, fileName);
            results.push({ fileName, url });
        } catch (error) {
            results.push({ fileName, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    return results;
};