// __tests__/PetProfileScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PetProfileScreen from '../screens/PetProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock navigation route
const mockRoute = {
  params: {
    pet: {
      id: 1,
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: '2 years',
      species: 'Dog',
      description: 'A friendly dog.',
      image: { uri: 'test://image.jpg' },
    },
  },
};

// Render helper with ThemeContext
const renderWithProviders = () => {
  const themeValue = {
    colors: {
      background: '#fff',
      text: '#000',
      card: '#f3f3f3',
      border: '#ddd',
      primary: '#4f46e5',
    },
    isDarkMode: false,
  };
  return render(
    <ThemeContext.Provider value={themeValue}>
      <PetProfileScreen route={mockRoute} />
    </ThemeContext.Provider>
  );
};

describe('PetProfileScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('shows pet details', async () => {
    const { getByText, getAllByText } = renderWithProviders();
    expect(getByText('Buddy')).toBeTruthy();
    expect(getByText(/Golden Retriever/i)).toBeTruthy();

    // ✅ Avoids "multiple elements" error
    const dogMatches = getAllByText(/Dog/i);
    expect(dogMatches.length).toBeGreaterThan(0);

    expect(getByText(/A friendly dog./i)).toBeTruthy();
  });

  it('marks as favorited if pet ID is in AsyncStorage', async () => {
    await AsyncStorage.setItem('favorites', JSON.stringify([1]));
    const { getByText } = renderWithProviders();

    await waitFor(() => {
      expect(getByText(/Remove from Favorites/i)).toBeTruthy();
    });
  });

  it('adds pet to favorites when button pressed', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() => {
      expect(getByText(/Add to Favorites/i)).toBeTruthy();
    });

    fireEvent.press(getByText(/Add to Favorites/i));

    await waitFor(async () => {
      const favs = JSON.parse(await AsyncStorage.getItem('favorites'));
      expect(favs).toContain(1);
    });

    expect(Alert.alert).toHaveBeenCalledWith('Buddy has been added to your favorites!');
  });

  it('removes pet from favorites when button pressed', async () => {
    await AsyncStorage.setItem('favorites', JSON.stringify([1]));
    const { getByText } = renderWithProviders();

    await waitFor(() => {
      expect(getByText(/Remove from Favorites/i)).toBeTruthy();
    });

    fireEvent.press(getByText(/Remove from Favorites/i));

    await waitFor(async () => {
      const favs = JSON.parse(await AsyncStorage.getItem('favorites'));
      expect(favs).not.toContain(1);
    });

    expect(Alert.alert).toHaveBeenCalledWith('Buddy has been removed from your favorites.');
  });
});
