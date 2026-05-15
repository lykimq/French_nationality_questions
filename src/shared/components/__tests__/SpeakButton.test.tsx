import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SpeakButton from "../SpeakButton";

const mockSpeak = jest.fn();
const mockStop = jest.fn();

jest.mock("../../contexts/SpeechContext", () => ({
    useSpeech: () => ({
        speak: mockSpeak,
        stop: mockStop,
        isSpeaking: false,
        speakingText: null,
        hasFrenchVoices: true,
        isVoicesLoading: false,
        isSpeechReady: true,
        isCloudSpeechEnabled: true,
        settings: { speechEngine: "cloud", selectedVoiceId: "fr-FR-Neural2-A", rate: 0.95 },
    }),
}));

jest.mock("../../contexts/ThemeContext", () => ({
    useTheme: () => ({
        theme: {
            colors: {
                primary: "#0000ff",
                accent: "#ff0000",
                textMuted: "#999999",
            },
        },
    }),
}));

describe("SpeakButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls speak with prepared text when pressed", () => {
        const { getByRole } = render(
            <SpeakButton text="Bonjour → monde" accessibilityLabel="Écouter" />
        );

        fireEvent.press(getByRole("button"));

        expect(mockSpeak).toHaveBeenCalledWith("Bonjour monde");
    });

    it("does not call speak when text is empty", () => {
        const { getByRole } = render(<SpeakButton text="   " />);

        fireEvent.press(getByRole("button"));

        expect(mockSpeak).not.toHaveBeenCalled();
    });
});
