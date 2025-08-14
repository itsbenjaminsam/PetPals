import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PetCard from '../components/PetCard';
import { ThemeContext } from '../context/ThemeContext';
import { useIsFocused } from '@react-navigation/native';

export default function MainHomeScreen({ navigation }) {
  const [allPets, setAllPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const { colors, isDarkMode } = useContext(ThemeContext);
  const isFocused = useIsFocused();

  const loadAllPets = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('customPets');
      const customPets = stored ? JSON.parse(stored) : [];
      const basePets = require('../data/pets').default;
      const combinedPets = [...basePets, ...customPets];
      setAllPets(combinedPets);
      setFilteredPets(combinedPets);
    } catch (err) {
      console.error('Error loading pets:', err);
      Alert.alert('Error', 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPets = useCallback(() => {
    let filtered = allPets;

    if (selectedSpecies !== 'All') {
      filtered = filtered.filter((pet) => pet.species === selectedSpecies);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(query) ||
          pet.breed.toLowerCase().includes(query) ||
          pet.species.toLowerCase().includes(query)
      );
    }

    setFilteredPets(filtered);
  }, [allPets, searchQuery, selectedSpecies]);

  const handleDeletePet = async (petId) => {
    try {
      Alert.alert(
        'Delete Pet',
        'Are you sure you want to delete this pet?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Only delete from customPets (not base pets)
              const stored = await AsyncStorage.getItem('customPets');
              const customPets = stored ? JSON.parse(stored) : [];
              const updatedPets = customPets.filter(pet => pet.id !== petId);
              await AsyncStorage.setItem('customPets', JSON.stringify(updatedPets));
              loadAllPets(); // Refresh the list
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete pet');
    }
  };

  useEffect(() => {
    if (isFocused) loadAllPets();
  }, [isFocused]);

  useEffect(() => {
    filterPets();
  }, [filterPets]);

  const handlePetPress = (pet) => {
    navigation.navigate('PetProfile', { pet });
  };

  const handleAddPetPress = () => {
    navigation.navigate('AddPetForm');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        placeholder="Search by name, breed, or species..."
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: isDarkMode ? '#444' : '#ddd',
          },
        ]}
      />

      <View style={styles.filterRow}>
        {['All', 'Dog', 'Cat', 'Rabbit'].map((type) => {
          const isActive = selectedSpecies === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedSpecies(type)}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isActive
                    ? '#ff6b6b'
                    : isDarkMode
                    ? '#444'
                    : '#eee',
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? 'white' : colors.text,
                  },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading pets...
        </Text>
      ) : (
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PetCard 
              pet={item} 
              onPress={() => handlePetPress(item)}
              onDelete={handleDeletePet}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text }]}>
              No matching pets found.
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#ff6b6b' }]}
        onPress={handleAddPetPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  searchInput: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    marginVertical: 4,
  },
  filterText: {
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    marginBottom: 2,
  },
});