import "@testing-library/jest-native/extend-expect";

jest.setTimeout(10000);

require("./jest.setup.shared");

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
