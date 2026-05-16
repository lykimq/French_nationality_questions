import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { isCloudSpeechAvailable } from "../services/cloudSpeechService";
import {
    getCloudSpeechFileUri,
    playCloudSpeechFile,
    stopCloudSpeech,
} from "../services/cloudSpeechService";
import { isFirebaseConfigured } from "../../config/firebaseConfig";
import { createLogger } from "../utils/logger";
import {
    CLOUD_FRENCH_VOICES,
    DEFAULT_CLOUD_VOICE_ID,
    resolveCloudVoiceId,
    type CloudFrenchVoice,
} from "../utils/cloudSpeechUtils";
import {
    DEFAULT_SPEECH_RATE,
    resolveSelectedVoiceId,
    resolveSpeechVoiceParam,
    selectCuratedVoices,
    SPEECH_PREVIEW_TEXT,
    type CuratedSpeechVoice,
} from "../utils/speechUtils";
import { formatCallableError } from "../utils/callableErrorUtils";
import type { SpeechEngine, SpeechSettings } from "../../types";

const logger = createLogger("SpeechContext");

const STORAGE_KEY = "@speech_settings";
const VOICE_LOAD_TIMEOUT_MS = 5000;
const VOICE_RETRY_DELAY_MS = 1000;

const getDefaultSpeechEngine = (): SpeechEngine => {
    if (!isCloudSpeechAvailable()) {
        return "device";
    }
    return __DEV__ ? "cloud" : "device";
};

const defaultSettings: SpeechSettings = {
    speechEngine: getDefaultSpeechEngine(),
    selectedVoiceId:
        getDefaultSpeechEngine() === "cloud" ? DEFAULT_CLOUD_VOICE_ID : null,
    rate: DEFAULT_SPEECH_RATE,
};

const isValidSettings = (settings: unknown): settings is SpeechSettings => {
    if (typeof settings !== "object" || settings === null) return false;
    const candidate = settings as SpeechSettings;
    return (
        (candidate.speechEngine === "cloud" ||
            candidate.speechEngine === "device") &&
        ("selectedVoiceId" in candidate
            ? candidate.selectedVoiceId === null ||
              typeof candidate.selectedVoiceId === "string"
            : true) &&
        typeof candidate.rate === "number" &&
        candidate.rate > 0 &&
        candidate.rate <= 2
    );
};

const parseStoredSettings = (raw: unknown): SpeechSettings => {
    if (isValidSettings(raw)) {
        return raw;
    }

    if (typeof raw === "object" && raw !== null) {
        const legacy = raw as Partial<SpeechSettings>;
        if (
            typeof legacy.rate === "number" &&
            legacy.rate > 0 &&
            legacy.rate <= 2
        ) {
            return {
                speechEngine: getDefaultSpeechEngine(),
                selectedVoiceId:
                    typeof legacy.selectedVoiceId === "string"
                        ? legacy.selectedVoiceId
                        : null,
                rate: legacy.rate,
            };
        }
    }

    return defaultSettings;
};

const normalizeSettings = (
    raw: SpeechSettings,
    deviceVoices: readonly CuratedSpeechVoice[]
): SpeechSettings => {
    if (raw.speechEngine === "cloud" && isCloudSpeechAvailable()) {
        return {
            ...raw,
            speechEngine: "cloud",
            selectedVoiceId: resolveCloudVoiceId(raw.selectedVoiceId),
        };
    }

    return {
        ...raw,
        speechEngine: "device",
        selectedVoiceId: resolveSelectedVoiceId(
            raw.selectedVoiceId,
            deviceVoices
        ),
    };
};

type DeviceVoice = Awaited<
    ReturnType<typeof Speech.getAvailableVoicesAsync>
>[number];

const fetchDeviceVoices = async (): Promise<DeviceVoice[]> => {
    let voices = await Speech.getAvailableVoicesAsync();
    if (voices.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, VOICE_RETRY_DELAY_MS));
        voices = await Speech.getAvailableVoicesAsync();
    }
    return voices;
};

const loadDeviceVoices = async (): Promise<CuratedSpeechVoice[]> => {
    try {
        const voices = await Promise.race([
            fetchDeviceVoices(),
            new Promise<never>((_, reject) => {
                setTimeout(
                    () => reject(new Error("Voice discovery timed out")),
                    VOICE_LOAD_TIMEOUT_MS
                );
            }),
        ]);
        return selectCuratedVoices(voices);
    } catch (error) {
        logger.warn("Device voice discovery failed:", error);
        return [];
    }
};

export type SpeechVoiceOption = CuratedSpeechVoice | CloudFrenchVoice;

interface SpeechContextType {
    settings: SpeechSettings;
    availableVoices: SpeechVoiceOption[];
    isVoicesLoading: boolean;
    isSpeechReady: boolean;
    isSpeaking: boolean;
    speakingText: string | null;
    hasFrenchVoices: boolean;
    isCloudSpeechEnabled: boolean;
    setSpeechEngine: (engine: SpeechEngine) => void;
    setSelectedVoiceId: (voiceId: string) => void;
    speak: (text: string) => void;
    stop: () => void;
    previewVoice: () => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [settings, setSettings] = useState<SpeechSettings>(defaultSettings);
    const [deviceVoices, setDeviceVoices] = useState<CuratedSpeechVoice[]>([]);
    const [isVoicesLoading, setIsVoicesLoading] = useState(true);
    const [isSpeechReady, setIsSpeechReady] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    const activeTextRef = useRef<string | null>(null);
    const deviceVoicesRef = useRef(deviceVoices);
    const settingsRef = useRef(settings);
    const cloudRequestRef = useRef(0);
    const voicesLoadingRef = useRef(false);

    settingsRef.current = settings;
    deviceVoicesRef.current = deviceVoices;

    const availableVoices: SpeechVoiceOption[] =
        settings.speechEngine === "cloud"
            ? [...CLOUD_FRENCH_VOICES]
            : deviceVoices;

    const refreshDeviceVoicesInBackground = useCallback(() => {
        if (voicesLoadingRef.current) return;
        voicesLoadingRef.current = true;

        void loadDeviceVoices()
            .then((voices) => {
                if (voices.length > 0) {
                    setDeviceVoices(voices);
                }
            })
            .finally(() => {
                voicesLoadingRef.current = false;
            });
    }, []);

    useEffect(() => {
        let cancelled = false;

        const initialize = async () => {
            setIsVoicesLoading(true);
            try {
                const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
                const loadedDeviceVoices = await loadDeviceVoices();

                if (cancelled) return;

                setDeviceVoices(loadedDeviceVoices);

                let nextSettings = defaultSettings;
                if (storedSettings) {
                    nextSettings = parseStoredSettings(
                        JSON.parse(storedSettings)
                    );
                }

                const mergedSettings = normalizeSettings(
                    nextSettings,
                    loadedDeviceVoices
                );
                setSettings(mergedSettings);
                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(mergedSettings)
                );
            } catch (error) {
                logger.error("Failed to initialize speech settings:", error);
            } finally {
                setIsVoicesLoading(false);
                setIsSpeechReady(true);
            }
        };

        void initialize();

        return () => {
            cancelled = true;
        };
    }, []);

    const saveSettings = useCallback(async (newSettings: SpeechSettings) => {
        const normalized = normalizeSettings(newSettings, deviceVoicesRef.current);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } catch (error) {
            logger.error("Failed to save speech settings:", error);
        }
        setSettings(normalized);
    }, []);

    const clearSpeakingState = useCallback(() => {
        activeTextRef.current = null;
        setSpeakingText(null);
        setIsSpeaking(false);
    }, []);

    const stop = useCallback(() => {
        cloudRequestRef.current += 1;
        clearSpeakingState();
        void stopCloudSpeech();
        void Speech.stop();
    }, [clearSpeakingState]);

    const utterWithDevice = useCallback(
        (text: string, useSelectedVoice: boolean) => {
            const voices = deviceVoicesRef.current;
            const voiceParam = useSelectedVoice
                ? resolveSpeechVoiceParam(
                      settingsRef.current.selectedVoiceId,
                      voices
                  )
                : undefined;

            try {
                Speech.speak(text, {
                    language: "fr-FR",
                    ...(voiceParam ? { voice: voiceParam } : {}),
                    rate: settingsRef.current.rate,
                    onStart: () => {
                        activeTextRef.current = text;
                        setSpeakingText(text);
                        setIsSpeaking(true);
                    },
                    onDone: () => {
                        if (activeTextRef.current === text) {
                            clearSpeakingState();
                        }
                    },
                    onStopped: () => {
                        if (activeTextRef.current === text) {
                            clearSpeakingState();
                        }
                    },
                    onError: (error) => {
                        logger.error("Device speech error:", error);
                        if (useSelectedVoice && voiceParam) {
                            utterWithDevice(text, false);
                            return;
                        }
                        clearSpeakingState();
                    },
                });
            } catch (error) {
                logger.error("Speech.speak failed:", error);
                if (useSelectedVoice && voiceParam) {
                    utterWithDevice(text, false);
                    return;
                }
                clearSpeakingState();
            }
        },
        [clearSpeakingState]
    );

    const utterWithCloud = useCallback(
        (text: string) => {
            const requestId = ++cloudRequestRef.current;
            const voiceId = resolveCloudVoiceId(
                settingsRef.current.selectedVoiceId
            );

            activeTextRef.current = text;
            setSpeakingText(text);
            setIsSpeaking(true);

            void (async () => {
                try {
                    const fileUri = await getCloudSpeechFileUri(text, voiceId);
                    if (cloudRequestRef.current !== requestId) return;

                    await playCloudSpeechFile(
                        fileUri,
                        () => {
                            if (activeTextRef.current === text) {
                                clearSpeakingState();
                            }
                        },
                        (error) => {
                            logger.error("Cloud playback error:", error);
                            if (cloudRequestRef.current !== requestId) return;
                            clearSpeakingState();
                            utterWithDevice(text, true);
                        }
                    );
                } catch (error) {
                    logger.error(
                        "Cloud TTS failed, using device voice:",
                        formatCallableError(error)
                    );
                    if (cloudRequestRef.current !== requestId) return;
                    clearSpeakingState();
                    utterWithDevice(text, true);
                }
            })();
        },
        [clearSpeakingState, utterWithDevice]
    );

    const speak = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            if (activeTextRef.current === trimmed) {
                stop();
                return;
            }

            void Speech.stop();
            void stopCloudSpeech();

            const useCloud =
                settingsRef.current.speechEngine === "cloud" &&
                isCloudSpeechAvailable();

            if (useCloud) {
                utterWithCloud(trimmed);
                return;
            }

            if (deviceVoicesRef.current.length === 0) {
                refreshDeviceVoicesInBackground();
            }

            activeTextRef.current = trimmed;
            setSpeakingText(trimmed);
            setIsSpeaking(true);
            utterWithDevice(trimmed, true);
        },
        [stop, utterWithCloud, utterWithDevice, refreshDeviceVoicesInBackground]
    );

    const setSpeechEngine = useCallback(
        (engine: SpeechEngine) => {
            const current = settingsRef.current;
            const selectedVoiceId =
                engine === "cloud"
                    ? resolveCloudVoiceId(
                          current.speechEngine === "cloud"
                              ? current.selectedVoiceId
                              : DEFAULT_CLOUD_VOICE_ID
                      )
                    : resolveSelectedVoiceId(
                          current.selectedVoiceId,
                          deviceVoicesRef.current
                      );

            void saveSettings({
                ...current,
                speechEngine: engine,
                selectedVoiceId,
            });
        },
        [saveSettings]
    );

    const setSelectedVoiceId = useCallback(
        (voiceId: string) => {
            void saveSettings({
                ...settingsRef.current,
                selectedVoiceId: voiceId,
            });
        },
        [saveSettings]
    );

    const previewVoice = useCallback(() => {
        speak(SPEECH_PREVIEW_TEXT);
    }, [speak]);

    useEffect(() => {
        return () => {
            void Speech.stop();
            void stopCloudSpeech();
        };
    }, []);

    const value: SpeechContextType = {
        settings,
        availableVoices,
        isVoicesLoading,
        isSpeechReady,
        isSpeaking,
        speakingText,
        hasFrenchVoices:
            settings.speechEngine === "cloud"
                ? isFirebaseConfigured()
                : deviceVoices.length > 0,
        isCloudSpeechEnabled: isCloudSpeechAvailable(),
        setSpeechEngine,
        setSelectedVoiceId,
        speak,
        stop,
        previewVoice,
    };

    return (
        <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
    );
};

export const useSpeech = (): SpeechContextType => {
    const context = useContext(SpeechContext);
    if (!context) {
        throw new Error("useSpeech must be used within a SpeechProvider");
    }
    return context;
};

export const useStopSpeechOnChange = (
    dependency: string | number | null | undefined
): void => {
    const { stop } = useSpeech();
    const previousDependencyRef = useRef<typeof dependency>(undefined);
    const isFirstRenderRef = useRef(true);

    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            previousDependencyRef.current = dependency;
            return;
        }

        if (previousDependencyRef.current === dependency) {
            return;
        }

        previousDependencyRef.current = dependency;
        stop();
    }, [dependency, stop]);
};
