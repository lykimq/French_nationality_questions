import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
// IMPORTANT: Never commit actual keys to git. Use .env file (which is gitignored)
// All credentials should be in .env file with EXPO_PUBLIC_ prefix
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

// Validate configuration - warn if required values are missing but don't crash the app
const requiredFields = ['apiKey', 'projectId', 'storageBucket'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

let app: any = null;
let storage: any = null;

if (missingFields.length > 0) {
    const platform = typeof window !== 'undefined' ? 'Web' : 'Native';
    const errorMessage = `⚠️ Firebase configuration is incomplete on ${platform}. Missing: ${missingFields.join(', ')}. ` +
        `\n📝 To fix this:\n` +
        `   1. Copy .env.example to .env: cp .env.example .env\n` +
        `   2. Fill in your Firebase credentials from Firebase Console\n` +
        `   3. Restart Expo server (stop and start again)\n` +
        `   4. On web, ensure variables start with EXPO_PUBLIC_\n` +
        `\nThe app will continue to run but Firebase features will not work.`;
    console.warn(errorMessage);
} else {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        
        // Initialize Cloud Storage and get a reference to the service
        storage = getStorage(app);
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
    }
}

export { storage };
export default app;