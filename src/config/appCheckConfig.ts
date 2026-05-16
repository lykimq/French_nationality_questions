import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import type { FirebaseApp } from "firebase/app";
import { createLogger } from "../shared/utils/logger";

const logger = createLogger("AppCheckConfig");

declare global {
    var FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean | undefined;
}

const getRecaptchaSiteKey = (): string | undefined => {
    const key = process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY;
    return key && key.trim().length > 0 ? key.trim() : undefined;
};

const getDebugToken = (): string | undefined => {
    const token = process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
    return token && token.trim().length > 0 ? token.trim() : undefined;
};

export const initializeAppCheckIfConfigured = (app: FirebaseApp): void => {
    const siteKey = getRecaptchaSiteKey();
    const debugToken = getDebugToken();

    if (!siteKey && !debugToken) {
        return;
    }

    if (__DEV__ && debugToken) {
        globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN =
            debugToken === "true" ? true : debugToken;
        logger.info(
            "App Check debug mode enabled. Register the debug token in Firebase Console > App Check if needed."
        );
    }

    const providerSiteKey = siteKey ?? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(providerSiteKey),
            isTokenAutoRefreshEnabled: true,
        });
        logger.info("Firebase App Check initialized.");
    } catch (error) {
        logger.warn("Firebase App Check initialization failed:", error);
    }
};
