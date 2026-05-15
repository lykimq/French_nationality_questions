import type { VoiceGender } from "./speechUtils";

export type SpeechEngine = "cloud" | "device";

export interface CloudFrenchVoice {
    identifier: string;
    name: string;
    gender: VoiceGender;
}

export const CLOUD_FRENCH_VOICES: readonly CloudFrenchVoice[] = [
    {
        identifier: "fr-FR-Neural2-A",
        name: "Neural2 A",
        gender: "female",
    },
    {
        identifier: "fr-FR-Neural2-B",
        name: "Neural2 B",
        gender: "male",
    },
    {
        identifier: "fr-FR-Neural2-C",
        name: "Neural2 C",
        gender: "female",
    },
    {
        identifier: "fr-FR-Neural2-D",
        name: "Neural2 D",
        gender: "male",
    },
] as const;

export const DEFAULT_CLOUD_VOICE_ID = CLOUD_FRENCH_VOICES[0].identifier;

export const isAllowedCloudVoiceId = (voiceId: string): boolean =>
    CLOUD_FRENCH_VOICES.some((voice) => voice.identifier === voiceId);

export const resolveCloudVoiceId = (
    storedId: string | null | undefined
): string => {
    if (storedId && isAllowedCloudVoiceId(storedId)) {
        return storedId;
    }
    return DEFAULT_CLOUD_VOICE_ID;
};

export const getCloudVoiceLabel = (voiceId: string): string => {
    const voice = CLOUD_FRENCH_VOICES.find(
        (entry) => entry.identifier === voiceId
    );
    return voice?.name ?? voiceId;
};
