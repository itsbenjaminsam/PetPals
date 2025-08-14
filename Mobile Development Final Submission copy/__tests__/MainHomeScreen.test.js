import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import MainHomeScreen from '../screens/MainHomeScreen';
import { ThemeContext } from '../context/ThemeContext';

// Mock reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-screens', () => require('react-native-screens/mock'));

// Mock the pets data file to return empty array so we only test custom pets
jest.mock('../data/pets', () => ({
  default: []
}));

// Safe PetCard mock
jest.mock('../components/PetCard', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return ({ pet, onPress, onDelete }) => (
    <TouchableOpacity onPress={() => onPress(pet)}>
      <Text>{pet.name}</Text>
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(pet.id)}>
          <Text>Delete {pet.name}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const renderWithProviders = (ui) => {
  const themeValue = {
    colors: { background: '#fff', text: '#000', card: '#f5f5f5', border: '#ddd' },
    isDarkMode: false,
  };
  
  const mockNavigation = {
    navigate: jest.fn(),
  };
  
  return {
    ...render(
      <ThemeContext.Provider value={themeValue}>
        <NavigationContainer>
          {React.cloneElement(ui, { navigation: mockNavigation })}
        </NavigationContainer>
      </ThemeContext.Provider>
    ),
    navigation: mockNavigation
  };
};

describe('MainHomeScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('loads and displays pets from AsyncStorage', async () => {
    await AsyncStorage.setItem(
      'customPets',
      JSON.stringify([{ 
        id: '1', 
        name: 'Test Pet', 
        breed: 'Labrador', 
        species: 'Dog', 
        age: '2 years', 
        image: null 
      }])
    );

    const { getByText } = renderWithProviders(<MainHomeScreen />);
    
    await waitFor(() => {
      expect(getByText('Test Pet')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('filters pets by search query', async () => {
    await AsyncStorage.setItem(
      'customPets',
      JSON.stringify([
        { 
          id: '2', 
          name: 'Buddy', 
          breed: 'Beagle', 
          species: 'Dog', 
          age: '3 years', 
          image: null 
        },
        { 
          id: '3', 
          name: 'Whiskers', 
          breed: 'Persian', 
          species: 'Cat', 
          age: '1 year', 
          image: null 
        }
      ])
    );

    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(<MainHomeScreen />);
    
    // Wait for pets to load
    await waitFor(() => {
      expect(getByText('Buddy')).toBeTruthy();
      expect(getByText('Whiskers')).toBeTruthy();
    });

    // Filter by search query
    fireEvent.changeText(getByPlaceholderText('Search by name, breed, or species...'), 'Buddy');

    await waitFor(() => {
      expect(getByText('Buddy')).toBeTruthy();
      expect(queryByText('Whiskers')).toBeNull();
    });
  });

  it('deletes a pet from AsyncStorage', async () => {
    await AsyncStorage.setItem(
      'customPets',
      JSON.stringify([{ 
        id: '3', 
        name: 'DeleteMe', 
        breed: 'Bulldog', 
        species: 'Dog', 
        age: '4 years', 
        image: null 
      }])
    );

    const { getByText, queryByText } = renderWithProviders(<MainHomeScreen />);
    
    // Wait for pet to load
    await waitFor(() => {
      expect(getByText('DeleteMe')).toBeTruthy();
    });

    // Mock Alert.alert to automatically confirm deletion
    const originalAlert = require('react-native').Alert.alert;
    require('react-native').Alert.alert = jest.fn((title, message, buttons) => {
      // Simulate pressing the "Delete" button
      const deleteButton = buttons.find(button => button.text === 'Delete');
      if (deleteButton && deleteButton.onPress) {
        deleteButton.onPress();
      }
    });

    // Trigger delete
    fireEvent.press(getByText('Delete DeleteMe'));

    await waitFor(() => {
      expect(queryByText('DeleteMe')).toBeNull();
    });

    // Restore original Alert
    require('react-native').Alert.alert = originalAlert;
  });
});