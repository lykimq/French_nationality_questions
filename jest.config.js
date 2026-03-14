const projects = [
  {
    displayName: 'unit',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
      '**/__tests__/**/*.test.ts',
      '**/*.test.ts',
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/test-utils',
      '/e2e',
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.unit.js'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^firebase/app$': '<rootDir>/src/__tests__/__mocks__/firebase-app.js',
      '^firebase/storage$': '<rootDir>/src/__tests__/__mocks__/firebase-storage.js',
      '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    },
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        tsconfig: {
          esModuleInterop: true,
        },
      }],
    },
  },
  {
    displayName: 'integration',
    preset: 'jest-expo',
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|@sentry|native-base|react-native-svg)',
    ],
    setupFiles: ['<rootDir>/jest.setup.globals.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: [
      '**/__tests__/**/*.test.tsx',
      '**/*.test.tsx',
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/test-utils',
      '/e2e',
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^firebase/app$': '<rootDir>/src/__tests__/__mocks__/firebase-app.js',
      '^firebase/storage$': '<rootDir>/src/__tests__/__mocks__/firebase-storage.js',
      '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    },
  },
  {
    displayName: 'e2e',
    preset: 'jest-expo',
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|@sentry|native-base|react-native-svg)',
    ],
    setupFiles: ['<rootDir>/jest.setup.globals.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: [
      '**/e2e/**/*.test.tsx',
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/test-utils',
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^firebase/app$': '<rootDir>/src/__tests__/__mocks__/firebase-app.js',
      '^firebase/storage$': '<rootDir>/src/__tests__/__mocks__/firebase-storage.js',
      '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    },
  },
];

module.exports = {
  projects,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
};

