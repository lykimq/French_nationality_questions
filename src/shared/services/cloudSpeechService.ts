import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import { httpsCallable } from "firebase/functions";
import { createLogger } from "../utils/logger";
import { getFirebaseFunctions, isFirebaseConfigured } from "../../config/firebaseConfig";
import { resolveCloudVoiceId } from "../utils/cloudSpeechUtils";
import { formatCallableError } from "../utils/callableErrorUtils";

const logger = createLogger("CloudSpeechService");

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ""}speech-cache/`;

let currentSound: Audio.Sound | null = null;
let cacheDirReady = false;

interface SynthesizeResponse {
    audioBase64: string;
    contentType: string;
    voiceName: string;
}

const ensureCacheDir = async (): Promise<void> => {
    if (cacheDirReady || !FileSystem.cacheDirectory) return;
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
    cacheDirReady = true;
};

const buildCacheKey = async (text: string, voiceId: string): Promise<string> => {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${voiceId}::${text}`
    );
    return digest;
};

const getCachedFileUri = async (
    text: string,
    voiceId: string
): Promise<string | null> => {
    await ensureCacheDir();
    const key = await buildCacheKey(text, voiceId);
    const uri = `${CACHE_DIR}${key}.mp3`;
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? uri : null;
};

const writeCachedAudio = async (
    text: string,
    voiceId: string,
    audioBase64: string
): Promise<string> => {
    await ensureCacheDir();
    const key = await buildCacheKey(text, voiceId);
    const uri = `${CACHE_DIR}${key}.mp3`;
    await FileSystem.writeAsStringAsync(uri, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
};

const fetchAudioFromCloud = async (
    text: string,
    voiceId: string
): Promise<string> => {
    const functions = getFirebaseFunctions();
    if (!functions) {
        throw new Error("Firebase Functions is not configured.");
    }

    const synthesize = httpsCallable<
        { text: string; voiceName: string },
        SynthesizeResponse
    >(functions, "synthesizeFrenchSpeech");

    let result;
    try {
        result = await synthesize({
            text,
            voiceName: resolveCloudVoiceId(voiceId),
        });
    } catch (error) {
        logger.error("synthesizeFrenchSpeech callable failed:", formatCallableError(error));
        throw error;
    }

    const audioBase64 = result.data?.audioBase64;
    if (!audioBase64) {
        throw new Error("Cloud TTS returned no audio data.");
    }

    return writeCachedAudio(text, voiceId, audioBase64);
};

export const isCloudSpeechAvailable = (): boolean => isFirebaseConfigured();

export const getCloudSpeechFileUri = async (
    text: string,
    voiceId: string
): Promise<string> => {
    const resolvedVoiceId = resolveCloudVoiceId(voiceId);
    const cached = await getCachedFileUri(text, resolvedVoiceId);
    if (cached) return cached;
    return fetchAudioFromCloud(text, resolvedVoiceId);
};

export const playCloudSpeechFile = async (
    fileUri: string,
    onFinish: () => void,
    onError: (error: unknown) => void
): Promise<void> => {
    await stopCloudSpeech();

    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
            if ("error" in status && status.error) {
                logger.error("Playback status error:", status.error);
                onError(new Error(status.error));
            }
            return;
        }
        if (status.didJustFinish) {
            void stopCloudSpeech();
            onFinish();
        }
    });
};

export const stopCloudSpeech = async (): Promise<void> => {
    if (!currentSound) return;
    try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
    } catch (error) {
        logger.warn("stopCloudSpeech:", error);
    } finally {
        currentSound = null;
    }
};

export const clearCloudSpeechCache = async (): Promise<void> => {
    if (!FileSystem.cacheDirectory) return;
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
    cacheDirReady = false;
};
