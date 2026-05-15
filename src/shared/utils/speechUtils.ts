import { Platform } from "react-native";

export interface SpeechVoiceInput {
    identifier: string;
    language: string;
    name: string;
    quality?: string;
}

export type VoiceGender = "male" | "female" | "unknown";

export interface CuratedSpeechVoice {
    identifier: string;
    name: string;
    language: string;
    gender: VoiceGender;
}

const MALE_HINTS = [
    "thomas",
    "daniel",
    "jacques",
    "henri",
    "male",
    "homme",
    "paul",
    "nicolas",
];

const FEMALE_HINTS = [
    "amelie",
    "amélie",
    "marie",
    "aurelie",
    "aurélie",
    "female",
    "femme",
    "denise",
    "virginie",
    "claire",
    "julie",
];

const MALE_IDENTIFIERS = [
    "fr-fr.thomas",
    "fr-fr.daniel",
    "com.apple.voice.compact.fr-fr.thomas",
    "com.apple.ttsbundle.thomas-compact",
];

const FEMALE_IDENTIFIERS = [
    "fr-fr.amelie",
    "fr-fr.marie",
    "com.apple.voice.compact.fr-fr.amelie",
    "com.apple.ttsbundle.amelie-compact",
];

export const SPEECH_PREVIEW_TEXT =
    "Bonjour. Ceci est un exemple de voix française.";

export const DEFAULT_SPEECH_RATE = 0.95;

export const isFrenchVoice = (voice: SpeechVoiceInput): boolean =>
    (voice.language ?? "").toLowerCase().startsWith("fr");

const normalizeKey = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export const classifyVoiceGender = (voice: SpeechVoiceInput): VoiceGender => {
    const identifier = normalizeKey(voice.identifier ?? "");
    const name = normalizeKey(voice.name ?? "");
    const combined = `${identifier} ${name}`;

    if (
        MALE_IDENTIFIERS.some((id) => identifier.includes(id)) ||
        MALE_HINTS.some((hint) => combined.includes(hint))
    ) {
        return "male";
    }

    if (
        FEMALE_IDENTIFIERS.some((id) => identifier.includes(id)) ||
        FEMALE_HINTS.some((hint) => combined.includes(hint))
    ) {
        return "female";
    }

    return "unknown";
};

const voiceQualityScore = (voice: SpeechVoiceInput): number => {
    const quality = (voice.quality ?? "").toLowerCase();
    if (quality.includes("enhanced")) return 3;
    if (quality.includes("default")) return 2;
    return 1;
};

const toCuratedVoice = (voice: SpeechVoiceInput): CuratedSpeechVoice => ({
    identifier: voice.identifier,
    name: voice.name?.trim() || voice.identifier,
    language: voice.language,
    gender: classifyVoiceGender(voice),
});

const sortRawVoices = (voices: SpeechVoiceInput[]): SpeechVoiceInput[] =>
    [...voices].sort((a, b) => {
        const qualityDiff = voiceQualityScore(b) - voiceQualityScore(a);
        if (qualityDiff !== 0) return qualityDiff;
        return (a.name ?? a.identifier).localeCompare(
            b.name ?? b.identifier,
            "fr"
        );
    });

export const selectCuratedVoices = (
    voices: SpeechVoiceInput[]
): CuratedSpeechVoice[] => {
    const french = sortRawVoices(voices.filter(isFrenchVoice));

    const uniqueById = new Map<string, SpeechVoiceInput>();
    for (const voice of french) {
        if (!uniqueById.has(voice.identifier)) {
            uniqueById.set(voice.identifier, voice);
        }
    }

    const deduped = [...uniqueById.values()];
    const males = deduped
        .filter((v) => classifyVoiceGender(v) === "male")
        .slice(0, 2)
        .map(toCuratedVoice);
    const females = deduped
        .filter((v) => classifyVoiceGender(v) === "female")
        .slice(0, 2)
        .map(toCuratedVoice);
    const selected = [...females, ...males];

    if (selected.length >= 4) {
        return selected.slice(0, 4);
    }

    const usedIds = new Set(selected.map((v) => v.identifier));
    const remaining = deduped
        .filter((v) => !usedIds.has(v.identifier))
        .map(toCuratedVoice);

    return [...selected, ...remaining].slice(0, 4);
};

export const getDefaultVoiceId = (
    voices: readonly CuratedSpeechVoice[]
): string | null => {
    if (voices.length === 0) return null;
    const firstFemale = voices.find((v) => v.gender === "female");
    return (firstFemale ?? voices[0]).identifier;
};

export const resolveSelectedVoiceId = (
    storedId: string | null | undefined,
    voices: readonly CuratedSpeechVoice[]
): string | null => {
    if (voices.length === 0) return null;
    if (storedId && voices.some((v) => v.identifier === storedId)) {
        return storedId;
    }
    return getDefaultVoiceId(voices);
};

export const resolveSpeechVoiceParam = (
    storedId: string | null | undefined,
    voices: readonly CuratedSpeechVoice[]
): string | undefined => {
    const voiceId = resolveSelectedVoiceId(storedId, voices);
    if (!voiceId) return undefined;

    const voice = voices.find((entry) => entry.identifier === voiceId);
    if (!voice) return undefined;

    if (Platform.OS === "android") {
        return voice.name;
    }

    return voice.identifier;
};

export const prepareTextForSpeech = (text: string): string => {
    if (!text) return "";

    let prepared = text
        .replace(/→/g, "")
        .replace(/←/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return prepared;
};

export const getVoiceGenderLabel = (gender: VoiceGender): string => {
    switch (gender) {
        case "male":
            return "Homme";
        case "female":
            return "Femme";
        default:
            return "Voix";
    }
};
