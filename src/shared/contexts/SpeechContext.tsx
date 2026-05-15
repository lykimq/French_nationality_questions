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
import { createLogger } from "../utils/logger";
import {
    DEFAULT_SPEECH_RATE,
    resolveSelectedVoiceId,
    resolveSpeechVoiceParam,
    selectCuratedVoices,
    SPEECH_PREVIEW_TEXT,
    type CuratedSpeechVoice,
} from "../utils/speechUtils";
import type { SpeechSettings } from "../../types";

const logger = createLogger("SpeechContext");

const STORAGE_KEY = "@speech_settings";
const VOICE_LOAD_TIMEOUT_MS = 5000;
const VOICE_RETRY_DELAY_MS = 1000;

const defaultSettings: SpeechSettings = {
    selectedVoiceId: null,
    rate: DEFAULT_SPEECH_RATE,
};

const isValidSettings = (settings: unknown): settings is SpeechSettings => {
    if (typeof settings !== "object" || settings === null) return false;
    const candidate = settings as SpeechSettings;
    return (
        ("selectedVoiceId" in candidate
            ? candidate.selectedVoiceId === null ||
              typeof candidate.selectedVoiceId === "string"
            : true) &&
        typeof candidate.rate === "number" &&
        candidate.rate > 0 &&
        candidate.rate <= 2
    );
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

const loadAvailableVoices = async (): Promise<CuratedSpeechVoice[]> => {
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
        logger.warn(
            "French voice discovery failed, speech will use fr-FR fallback:",
            error
        );
        return [];
    }
};

interface SpeechContextType {
    settings: SpeechSettings;
    availableVoices: CuratedSpeechVoice[];
    isVoicesLoading: boolean;
    isSpeechReady: boolean;
    isSpeaking: boolean;
    speakingText: string | null;
    hasFrenchVoices: boolean;
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
    const [availableVoices, setAvailableVoices] = useState<CuratedSpeechVoice[]>(
        []
    );
    const [isVoicesLoading, setIsVoicesLoading] = useState(true);
    const [isSpeechReady, setIsSpeechReady] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    const activeTextRef = useRef<string | null>(null);
    const availableVoicesRef = useRef(availableVoices);
    const settingsRef = useRef(settings);
    const voicesLoadingRef = useRef(false);

    settingsRef.current = settings;
    availableVoicesRef.current = availableVoices;

    const refreshVoicesInBackground = useCallback(() => {
        if (voicesLoadingRef.current) return;
        voicesLoadingRef.current = true;

        void loadAvailableVoices()
            .then((voices) => {
                if (voices.length > 0) {
                    setAvailableVoices(voices);
                    const resolvedVoiceId = resolveSelectedVoiceId(
                        settingsRef.current.selectedVoiceId,
                        voices
                    );
                    if (
                        resolvedVoiceId &&
                        resolvedVoiceId !== settingsRef.current.selectedVoiceId
                    ) {
                        setSettings((prev) => ({
                            ...prev,
                            selectedVoiceId: resolvedVoiceId,
                        }));
                    }
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
                const voices = await loadAvailableVoices();

                if (cancelled) return;

                setAvailableVoices(voices);

                let nextSettings = defaultSettings;
                if (storedSettings) {
                    const parsed = JSON.parse(storedSettings);
                    if (isValidSettings(parsed)) {
                        nextSettings = parsed;
                    }
                }

                const resolvedVoiceId = resolveSelectedVoiceId(
                    nextSettings.selectedVoiceId,
                    voices
                );
                const mergedSettings: SpeechSettings = {
                    ...nextSettings,
                    selectedVoiceId: resolvedVoiceId,
                };
                setSettings(mergedSettings);

                if (
                    resolvedVoiceId !== nextSettings.selectedVoiceId &&
                    resolvedVoiceId
                ) {
                    await AsyncStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(mergedSettings)
                    );
                }
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
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            logger.error("Failed to save speech settings:", error);
        }
        setSettings(newSettings);
    }, []);

    const clearSpeakingState = useCallback(() => {
        activeTextRef.current = null;
        setSpeakingText(null);
        setIsSpeaking(false);
    }, []);

    const stop = useCallback(() => {
        clearSpeakingState();
        void Speech.stop();
    }, [clearSpeakingState]);

    const utterText = useCallback(
        (text: string, useSelectedVoice: boolean) => {
            const voices = availableVoicesRef.current;
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
                        logger.error("Speech error:", error);
                        if (useSelectedVoice && voiceParam) {
                            utterText(text, false);
                            return;
                        }
                        clearSpeakingState();
                    },
                });
            } catch (error) {
                logger.error("Speech.speak failed:", error);
                if (useSelectedVoice && voiceParam) {
                    utterText(text, false);
                    return;
                }
                clearSpeakingState();
            }
        },
        [clearSpeakingState]
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

            if (availableVoicesRef.current.length === 0) {
                refreshVoicesInBackground();
            }

            activeTextRef.current = trimmed;
            setSpeakingText(trimmed);
            setIsSpeaking(true);

            utterText(trimmed, true);
        },
        [stop, utterText, refreshVoicesInBackground]
    );

    const setSelectedVoiceId = useCallback(
        (voiceId: string) => {
            const newSettings: SpeechSettings = {
                ...settingsRef.current,
                selectedVoiceId: voiceId,
            };
            void saveSettings(newSettings);
        },
        [saveSettings]
    );

    const previewVoice = useCallback(() => {
        speak(SPEECH_PREVIEW_TEXT);
    }, [speak]);

    useEffect(() => {
        return () => {
            void Speech.stop();
        };
    }, []);

    const value: SpeechContextType = {
        settings,
        availableVoices,
        isVoicesLoading,
        isSpeechReady,
        isSpeaking,
        speakingText,
        hasFrenchVoices: availableVoices.length > 0,
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
