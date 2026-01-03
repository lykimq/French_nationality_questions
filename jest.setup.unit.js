global.__DEV__ = true;

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  Linking: {
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openURL: jest.fn(() => Promise.resolve()),
  },
}));

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

// Use actual local data maps to test with real JSON files
jest.mock('./src/shared/config/dataMaps', () => {
  const actualDataMaps = jest.requireActual('./src/shared/config/dataMaps');
  return actualDataMaps;
});

global.fetch = jest.fn();

