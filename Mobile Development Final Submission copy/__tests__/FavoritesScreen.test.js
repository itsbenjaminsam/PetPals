// __tests__/FavoritesScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import FavoritesScreen from '../screens/FavoritesScreen';
import { ThemeContext } from '../context/ThemeContext';
import * as notifications from '../utils/notifications';

// ---- Silence only the "not wrapped in act" noise in this suite ----
const realError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('not wrapped in act')) return;
    realError(msg, ...args);
  });
});
afterAll(() => {
  console.error.mockRestore();
});

// ---- Stable pets data so assertions are deterministic ----
jest.mock('../data/pets', () => [
  { id: '1', name: 'Luna', species: 'Cat' },
  { id: '2', name: 'Milo', species: 'Dog' },
]);

// ---- PetCard: mock inside the factory (no out-of-scope refs) ----
jest.mock('../components/PetCard', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ pet, onPress }) =>
    React.createElement(Text, { accessibilityRole: 'button', onPress }, pet.name);
});

// ---- Notifications util ----
jest.mock('../utils/notifications', () => ({
  sendAdoptedNotification: jest.fn(),
}));

// ---- Alert ----
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// ---- Render helper with theme + focus trigger ----
const renderWithTheme = (navigationOverrides = {}) => {
  const colors = {
    background: '#fff',
    text: '#111',
    card: '#f3f3f3',
    border: '#ddd',
    primary: '#4f46e5',
  };

  let focusCb;
  const navigation = {
    addListener: (evt, cb) => {
      if (evt === 'focus') focusCb = cb;
      return () => {}; // unsubscribe
    },
    navigate: jest.fn(),
    ...navigationOverrides,
  };

  const utils = render(
    <ThemeContext.Provider value={{ colors }}>
      <FavoritesScreen navigation={navigation} />
    </ThemeContext.Provider>
  );

  const triggerFocus = async () => {
    if (focusCb) {
      await act(async () => {
        await focusCb();
      });
    }
  };

  return { ...utils, navigation, triggerFocus };
};

// ---- Tests ----
describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when there are no favorites', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const { getByText, triggerFocus } = renderWithTheme();
    await triggerFocus();

    expect(getByText('No favorites yet.')).toBeTruthy();
  });

  it('loads and lists favorites from AsyncStorage on focus', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['1']));

    const { getByText, queryByText, triggerFocus } = renderWithTheme();
    await triggerFocus();

    await waitFor(() => {
      expect(getByText('Luna')).toBeTruthy();
      expect(queryByText('Milo')).toBeNull();
    });
  });

  it('navigates to PetProfile when a card is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['2']));

    const { getByText, navigation, triggerFocus } = renderWithTheme();
    await triggerFocus();

    fireEvent.press(getByText('Milo'));

    expect(navigation.navigate).toHaveBeenCalledWith('Home', {
      screen: 'PetProfile',
      params: { pet: { id: '2', name: 'Milo', species: 'Dog' } },
    });
  });

  it('alerts when simulating adoption with no favorites', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

    const { getByText, triggerFocus } = renderWithTheme();
    await triggerFocus();

    fireEvent.press(getByText('🐾 Simulate Adoption'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'No favorites yet',
      'Please favorite a pet first!'
    );
    expect(notifications.sendAdoptedNotification).not.toHaveBeenCalled();
  });

  it('sends notification and shows alert when simulating adoption with favorites', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['1', '2']));
    const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0.01); // picks index 0 -> 'Luna'

    const { getByText, triggerFocus } = renderWithTheme();
    await triggerFocus();

    fireEvent.press(getByText('🐾 Simulate Adoption'));

    expect(notifications.sendAdoptedNotification).toHaveBeenCalledWith('Luna');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Adoption Alert!',
      'Luna has been adopted 🎉'
    );

    randSpy.mockRestore();
  });
});
