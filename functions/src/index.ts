import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { logger } from "firebase-functions/v2";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import type { google } from "@google-cloud/text-to-speech/build/protos/protos";

setGlobalOptions({ region: "europe-west1", maxInstances: 20 });

const MAX_TEXT_LENGTH = 5000;
const MIN_TEXT_LENGTH = 1;

const ALLOWED_VOICES = new Set([
    "fr-FR-Neural2-A",
    "fr-FR-Neural2-B",
    "fr-FR-Neural2-C",
    "fr-FR-Neural2-D",
    "fr-FR-Standard-A",
    "fr-FR-Standard-B",
    "fr-FR-Standard-C",
    "fr-FR-Standard-D",
]);

const DEFAULT_VOICE = "fr-FR-Neural2-B";
const FALLBACK_VOICES = ["fr-FR-Neural2-B", "fr-FR-Standard-B"] as const;

const ttsClient = new TextToSpeechClient();

interface SynthesizeRequest {
    text?: unknown;
    voiceName?: unknown;
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

const encodeAudioContent = (
    audioContent: Uint8Array | string | null | undefined
): string => {
    if (!audioContent) {
        throw new HttpsError("internal", "TTS returned empty audio.");
    }

    if (typeof audioContent === "string") {
        return audioContent;
    }

    return Buffer.from(audioContent).toString("base64");
};

const synthesizeWithVoice = async (
    text: string,
    voiceName: string
): Promise<google.cloud.texttospeech.v1.ISynthesizeSpeechResponse> => {
    const [response] = await ttsClient.synthesizeSpeech({
        input: { text },
        voice: {
            languageCode: "fr-FR",
            name: voiceName,
        },
        audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1,
            pitch: 0,
        },
    });

    return response;
};

const resolveVoiceCandidates = (requestedVoice: string): string[] => {
    const candidates = [
        requestedVoice,
        ...FALLBACK_VOICES.filter((voice) => voice !== requestedVoice),
    ];
    return [...new Set(candidates)];
};

export const synthesizeFrenchSpeech = onCall(
    {
        cors: true,
        invoker: "public",
        timeoutSeconds: 60,
        memory: "256MiB",
    },
    async (request) => {
        const data = (request.data ?? {}) as SynthesizeRequest;
        const text =
            typeof data.text === "string" ? data.text.trim() : "";

        if (text.length < MIN_TEXT_LENGTH || text.length > MAX_TEXT_LENGTH) {
            throw new HttpsError(
                "invalid-argument",
                `Text length must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters.`
            );
        }

        const requestedVoice =
            typeof data.voiceName === "string" &&
            ALLOWED_VOICES.has(data.voiceName)
                ? data.voiceName
                : DEFAULT_VOICE;

        const voiceCandidates = resolveVoiceCandidates(requestedVoice);
        let lastError: unknown = null;

        for (const voiceName of voiceCandidates) {
            try {
                const response = await synthesizeWithVoice(text, voiceName);
                const audioBase64 = encodeAudioContent(
                    response.audioContent as Uint8Array | string | null
                );

                if (voiceName !== requestedVoice) {
                    logger.warn(
                        `TTS fallback voice used: ${voiceName} (requested ${requestedVoice})`
                    );
                }

                return {
                    audioBase64,
                    contentType: "audio/mpeg",
                    voiceName,
                };
            } catch (error) {
                lastError = error;
                logger.warn(
                    `TTS failed for voice ${voiceName}: ${getErrorMessage(error)}`
                );
            }
        }

        const detail = getErrorMessage(lastError);
        logger.error("synthesizeFrenchSpeech failed for all voices:", lastError);

        throw new HttpsError(
            "internal",
            detail.includes("texttospeech") || detail.includes("Text-to-Speech")
                ? detail
                : `Speech synthesis failed: ${detail}. Enable Cloud Text-to-Speech API and billing on the Firebase/GCP project.`
        );
    }
);
