// __tests__/NearbyPetsScreen.test.js
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import NearbyPetsScreen from '../screens/NearbyPetsScreen';

// --- Mocks ---
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MockMapView = ({ children }) => <View testID="map">{children}</View>;
  const MockMarker = ({ title, description, onPress }) => (
    <Text onPress={onPress}>{title || description}</Text>
  );
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

jest.mock('../data/pets', () => [
  { id: 1, name: 'Buddy', breed: 'Golden Retriever', location: { latitude: 1.3, longitude: 103.8 } },
  { id: 2, name: 'Mittens', breed: 'Tabby Cat', location: { latitude: 1.31, longitude: 103.81 } },
]);

describe('NearbyPetsScreen', () => {
  let mockNavigation;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation = { navigate: jest.fn() };
  });

  it('shows error if permission denied', async () => {
    const Location = require('expo-location');
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { getByText } = render(<NearbyPetsScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText(/permission to access location was denied/i)).toBeTruthy();
    });
  });

  it('shows map and markers when permission granted', async () => {
    const Location = require('expo-location');
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1.3, longitude: 103.8 },
    });

    const { getByText, getByTestId } = render(<NearbyPetsScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByTestId('map')).toBeTruthy();
      expect(getByText('Buddy')).toBeTruthy();
      expect(getByText('Mittens')).toBeTruthy();
    });
  });

  it('navigates to PetProfile when pet marker pressed', async () => {
    const Location = require('expo-location');
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1.3, longitude: 103.8 },
    });

    const { getByText } = render(<NearbyPetsScreen navigation={mockNavigation} />);
    await waitFor(() => fireEvent.press(getByText('Buddy')));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home', {
      screen: 'PetProfile',
      params: { pet: expect.objectContaining({ name: 'Buddy' }) },
    });
  });
});
