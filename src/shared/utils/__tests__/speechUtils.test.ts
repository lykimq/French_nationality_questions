import {
    classifyVoiceGender,
    getDefaultVoiceId,
    getVoiceGenderLabel,
    isFrenchVoice,
    prepareTextForSpeech,
    resolveSelectedVoiceId,
    resolveSpeechVoiceParam,
    selectCuratedVoices,
    type CuratedSpeechVoice,
} from "../speechUtils";
const voice = (
    partial: {
        identifier: string;
        name?: string;
        language?: string;
        quality?: string;
    }
) => ({
    language: "fr-FR",
    name: partial.name ?? partial.identifier,
    quality: "Default",
    ...partial,
});

describe("speechUtils", () => {
    describe("isFrenchVoice", () => {
        it("accepts fr-FR and fr-CA voices", () => {
            expect(isFrenchVoice(voice({ identifier: "a", language: "fr-FR" }))).toBe(
                true
            );
            expect(isFrenchVoice(voice({ identifier: "b", language: "fr-CA" }))).toBe(
                true
            );
            expect(isFrenchVoice(voice({ identifier: "c", language: "en-US" }))).toBe(
                false
            );
        });
    });

    describe("classifyVoiceGender", () => {
        it("detects common French male and female voices", () => {
            expect(
                classifyVoiceGender(
                    voice({
                        identifier: "com.apple.voice.compact.fr-FR.Thomas",
                        name: "Thomas",
                    })
                )
            ).toBe("male");

            expect(
                classifyVoiceGender(
                    voice({
                        identifier: "com.apple.voice.compact.fr-FR.Amelie",
                        name: "Amélie",
                    })
                )
            ).toBe("female");
        });
    });

    describe("selectCuratedVoices", () => {
        it("returns up to four French voices with male and female preference", () => {
            const voices = selectCuratedVoices([
                voice({
                    identifier: "fr-1",
                    name: "Thomas",
                    quality: "Enhanced",
                }),
                voice({
                    identifier: "fr-2",
                    name: "Daniel",
                    quality: "Default",
                }),
                voice({
                    identifier: "fr-3",
                    name: "Amélie",
                    quality: "Enhanced",
                }),
                voice({
                    identifier: "fr-4",
                    name: "Marie",
                    quality: "Default",
                }),
                voice({ identifier: "en-1", language: "en-US", name: "Samantha" }),
            ]);

            expect(voices.length).toBeLessThanOrEqual(4);
            expect(voices.every((v) => v.language.startsWith("fr"))).toBe(true);
            expect(voices.some((v) => v.gender === "male")).toBe(true);
            expect(voices.some((v) => v.gender === "female")).toBe(true);
        });
    });

    describe("resolveSpeechVoiceParam", () => {
        const curated = [
            {
                identifier: "voice-id-1",
                name: "Amélie",
                language: "fr-FR",
                gender: "female" as const,
            },
        ];

        it("returns undefined when no voices are available", () => {
            expect(resolveSpeechVoiceParam("voice-id-1", [])).toBeUndefined();
        });

        it("returns a voice param for a known stored id", () => {
            expect(resolveSpeechVoiceParam("voice-id-1", curated)).toBeTruthy();
        });
    });

    describe("resolveSelectedVoiceId", () => {
        const curated: CuratedSpeechVoice[] = [
            {
                identifier: "fr-a",
                name: "Amélie",
                language: "fr-FR",
                gender: "female",
            },
            {
                identifier: "fr-b",
                name: "Thomas",
                language: "fr-FR",
                gender: "male",
            },
        ];

        it("keeps a valid stored voice id", () => {
            expect(resolveSelectedVoiceId("fr-b", curated)).toBe("fr-b");
        });

        it("falls back to default when stored id is missing", () => {
            expect(resolveSelectedVoiceId("missing", curated)).toBe(
                getDefaultVoiceId(curated)
            );
        });
    });

    describe("prepareTextForSpeech", () => {
        it("strips markers and collapses whitespace", () => {
            expect(
                prepareTextForSpeech("Bonjour → monde ←\n\nComment ça va ?")
            ).toBe("Bonjour monde Comment ça va ?");
        });

        it("returns empty string for blank input", () => {
            expect(prepareTextForSpeech("   ")).toBe("");
        });
    });

    describe("getVoiceGenderLabel", () => {
        it("returns French labels", () => {
            expect(getVoiceGenderLabel("male")).toBe("Homme");
            expect(getVoiceGenderLabel("female")).toBe("Femme");
            expect(getVoiceGenderLabel("unknown")).toBe("Voix");
        });
    });
});
