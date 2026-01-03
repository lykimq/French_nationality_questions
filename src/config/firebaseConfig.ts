import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { createLogger } from '../shared/utils/logger';

const logger = createLogger('FirebaseConfig');

// Firebase configuration from environment variables
// Credentials must be in .env file with EXPO_PUBLIC_ prefix (never commit to git)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_MOBILE_SDK_APP_ID
};

// Validate required fields and initialize Firebase if configuration is complete
const requiredFields = ['apiKey', 'projectId', 'storageBucket'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

if (missingFields.length > 0) {
    const platform = typeof window !== 'undefined' ? 'Web' : 'Native';
    const errorMessage = `⚠️ Firebase configuration is incomplete on ${platform}. Missing: ${missingFields.join(', ')}. ` +
        `\n📝 To fix this:\n` +
        `   1. Copy .env.example to .env: cp .env.example .env\n` +
        `   2. Fill in your Firebase credentials from Firebase Console\n` +
        `   3. Restart Expo server (stop and start again)\n` +
        `   4. On web, ensure variables start with EXPO_PUBLIC_\n` +
        `\nThe app will continue to run but Firebase features will not work.`;
    logger.warn(errorMessage);
} else {
    try {
        app = initializeApp(firebaseConfig);
        storage = getStorage(app);
    } catch (error) {
        logger.error('Failed to initialize Firebase:', error);
    }
}

export { storage };
export default app;