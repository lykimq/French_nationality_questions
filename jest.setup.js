import "@testing-library/jest-native/extend-expect";

jest.setTimeout(10000);

require("./jest.setup.shared");

jest.mock("firebase/functions", () => ({
    getFunctions: jest.fn(),
    connectFunctionsEmulator: jest.fn(),
    httpsCallable: jest.fn(() =>
        jest.fn(() =>
            Promise.resolve({
                data: { audioBase64: "", contentType: "audio/mpeg" },
            })
        )
    ),
}));

jest.mock("expo-av", () => ({
    Audio: {
        setAudioModeAsync: jest.fn(),
        Sound: {
            createAsync: jest.fn(() =>
                Promise.resolve({
                    sound: {
                        setOnPlaybackStatusUpdate: jest.fn(),
                        stopAsync: jest.fn(),
                        unloadAsync: jest.fn(),
                    },
                })
            ),
        },
    },
}));

jest.mock("expo-file-system/legacy", () => ({
    cacheDirectory: "/tmp/",
    EncodingType: { Base64: "base64" },
    getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
    makeDirectoryAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
}));

jest.mock("expo-crypto", () => ({
    CryptoDigestAlgorithm: { SHA256: "SHA-256" },
    digestStringAsync: jest.fn(() => Promise.resolve("test-hash")),
}));

jest.mock("expo-speech", () => ({
    speak: jest.fn(),
    stop: jest.fn(() => Promise.resolve()),
    getAvailableVoicesAsync: jest.fn(() =>
        Promise.resolve([
            {
                identifier: "fr-test-female",
                language: "fr-FR",
                name: "Amélie",
                quality: "Default",
            },
            {
                identifier: "fr-test-male",
                language: "fr-FR",
                name: "Thomas",
                quality: "Default",
            },
        ])
    ),
}));

jest.mock("@sentry/react-native", () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    setContext: jest.fn(),
    addBreadcrumb: jest.fn(),
}));

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native");
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            setOptions: jest.fn(),
        }),
        useRoute: () => ({
            params: {},
        }),
    };
});
