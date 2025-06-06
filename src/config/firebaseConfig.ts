import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables with fallbacks
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkQTh-WeU8kD75I7vLC4JLNbfGr4JDxYU",
    authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "french-nationality-questions"}.firebaseapp.com`,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "french-nationality-questions",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "french-nationality-questions.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "354295722936",
    appId: process.env.EXPO_PUBLIC_FIREBASE_MOBILE_SDK_APP_ID || "1:354295722936:android:6abc060a38f4390f9c554d"
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
    console.error('❌ Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;