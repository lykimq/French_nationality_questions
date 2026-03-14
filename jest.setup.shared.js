jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  requestReview: jest.fn(() => Promise.resolve()),
}));

jest.mock('./src/config/firebaseConfig', () => ({
  storage: null,
  default: null,
}));

jest.mock('./src/shared/config/dataMaps', () => {
  const actualDataMaps = jest.requireActual('./src/shared/config/dataMaps');
  return actualDataMaps;
});

global.fetch = jest.fn();
