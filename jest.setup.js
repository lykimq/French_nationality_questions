import "@testing-library/jest-native/extend-expect";

jest.setTimeout(10000);

require("./jest.setup.shared");

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
