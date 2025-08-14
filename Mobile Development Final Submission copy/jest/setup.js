// jest/setup.js
import '@testing-library/jest-native/extend-expect';

jest.mock(
  'react-native-gesture-handler',
  () => {
    const React = require('react');
    return {
      GestureHandlerRootView: ({ children }) =>
        React.createElement(React.Fragment, null, children),
      PanGestureHandler: 'PanGestureHandler',
      TapGestureHandler: 'TapGestureHandler',
      LongPressGestureHandler: 'LongPressGestureHandler',
      State: { BEGAN: 0, ACTIVE: 2, END: 5 },
    };
  },
  { virtual: true }
);

jest.mock(
  'react-native-reanimated',
  () => {
    const Reanimated = {
      default: {
        addWhitelistedNativeProps: () => {},
        createAnimatedComponent: comp => comp,
        View: 'Animated.View',
      },
      Easing: { linear: () => {} },
      useSharedValue: v => ({ value: v }),
      withTiming: v => v,
      withSpring: v => v,
      useAnimatedStyle: fn => fn(),
      runOnJS: fn => fn,
    };
    return Reanimated;
  },
  { virtual: true }
);

// -----------------------------
// RN internal helper (path differs by RN version)
// -----------------------------
try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch { /* noop */ }

// -----------------------------
// Common native / Expo mocks
// -----------------------------

// AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Expo Constants
jest.mock('expo-constants', () => ({
  default: { expoVersion: '53.0.0' },
  expoVersion: '53.0.0',
}));

// Expo ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    cancelled: false, // for older checks in your code
    assets: [{ uri: 'test://image.jpg' }],
  }),
  MediaTypeOptions: { Images: 'Images' },
}));

// React Native Screens
jest.mock('react-native-screens', () => ({
  enableScreens: () => {},
}));

// Picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children, ...props }) =>
    React.createElement('picker', props, children);
  Picker.Item = props => React.createElement('picker-item', props, null);
  return { Picker };
});

// Ionicons (subpath)
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Root vector-icons (prevents act() warnings)
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = (props) => React.createElement('Icon', props);
  return { Ionicons: MockIcon };
});

// Navigation theme
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        background: '#ffffff',
        text: '#111111',
        card: '#f3f3f3',
        border: '#dddddd',
        primary: '#4f46e5',
      },
    }),
  };
});

// Safe-area
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: 'SafeAreaView',
  };
});
