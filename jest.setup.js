import '@testing-library/jest-native/extend-expect';

// Set test timeout for integration and e2e tests
jest.setTimeout(10000);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  requestReview: jest.fn(() => Promise.resolve()),
}));

// firebaseConfig returns null storage, forcing all data loading to use local files
jest.mock('./src/config/firebaseConfig', () => ({
  storage: null,
  default: null,
}));

// Mock Sentry to avoid ESM module issues
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Use actual local data maps instead of mocking them empty
// This allows tests to use real JSON files from the data folder
jest.mock('./src/shared/config/dataMaps', () => {
  const actualDataMaps = jest.requireActual('./src/shared/config/dataMaps');
  return actualDataMaps;
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
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

global.fetch = jest.fn();
