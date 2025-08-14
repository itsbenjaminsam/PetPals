// jest.config.js
module.exports = {
    verbose: true,
    preset: 'jest-expo',
    setupFilesAfterEnv: [
      '@testing-library/jest-native/extend-expect',
      '<rootDir>/jest/setup.js',
    ],
    transformIgnorePatterns: [
      'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-picker|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|react-native-.*|@react-native-.*)',
    ],
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  };
  