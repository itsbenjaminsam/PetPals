import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import { ThemeContext } from '../context/ThemeContext';

// Mock the entire native stack navigation to avoid NavigationContainer requirement
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children, screenOptions }) => {
      // Mock Navigator that just renders its children
      return <>{children}</>;
    },
    Screen: ({ component: Component, name, options, ...props }) => {
      // Mock Screen that renders the component if it's the main one
      if (name === 'MainHome' && Component) {
        const mockNavigation = {
          navigate: jest.fn(),
        };
        return <Component navigation={mockNavigation} {...props} />;
      }
      return null; // Don't render other screens
    },
  }),
}));

// Mock the navigation hooks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useTheme: () => ({
    colors: { card: '#f5f5f5', text: '#000' }
  })
}));

// Mock MainHomeScreen so we can simulate navigation without mounting the real screen
jest.mock('../screens/MainHomeScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ navigation }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PetProfile')}>
      <Text>Go to Pet Profile</Text>
    </TouchableOpacity>
  );
});

// Mock PetProfileScreen (not used directly here but avoids unexpected imports)
jest.mock('../screens/PetProfileScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>Pet Profile Screen</Text>;
});

// Mock AddPetScreen
jest.mock('../screens/AddPetScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>Add Pet Screen</Text>;
});

// Helper to wrap component in ThemeContext
const renderWithProviders = (ui) => {
  const themeValue = {
    colors: { background: '#fff', text: '#000', card: '#f5f5f5', border: '#ddd' },
    isDarkMode: false,
  };

  return render(
    <ThemeContext.Provider value={themeValue}>
      {ui}
    </ThemeContext.Provider>
  );
};

describe('HomeScreen', () => {
  it('renders MainHomeScreen and can simulate navigation', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    
    // Check that MainHomeScreen is rendered
    expect(getByText('Go to Pet Profile')).toBeTruthy();
    
    // Test that we can press the button (navigation mock is handled in the Screen mock)
    fireEvent.press(getByText('Go to Pet Profile'));
    // Note: We can't easily test the navigation.navigate call with this approach,
    // but we can verify the component renders and the button is pressable
  });
});