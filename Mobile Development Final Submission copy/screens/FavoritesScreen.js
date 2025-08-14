import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pets from '../data/pets';
import PetCard from '../components/PetCard';
import { sendAdoptedNotification } from '../utils/notifications';
import { ThemeContext } from '../context/ThemeContext';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const parsed = storedFavorites ? JSON.parse(storedFavorites) : [];
      const filtered = pets.filter((pet) => parsed.includes(pet.id));
      setFavorites(filtered);
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  };

  const simulateAdoption = () => {
    if (favorites.length === 0) {
      Alert.alert('No favorites yet', 'Please favorite a pet first!');
      return;
    }

    const randomPet = favorites[Math.floor(Math.random() * favorites.length)];
    sendAdoptedNotification(randomPet.name);
    Alert.alert('Adoption Alert!', `${randomPet.name} has been adopted 🎉`);
  };

  const handlePetPress = (pet) => {
    navigation.navigate('Home', {
      screen: 'PetProfile',
      params: { pet },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        ❤️ Your Favorite Pets
      </Text>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PetCard pet={item} onPress={() => handlePetPress(item)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.text }]}>
            No favorites yet.
          </Text>
        }
      />

      <View
        style={[
          styles.buttonContainer,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Button
          title="🐾 Simulate Adoption"
          onPress={simulateAdoption}
          color={colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: 'bold', padding: 16 },
  list: { paddingBottom: 20 },
  empty: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
