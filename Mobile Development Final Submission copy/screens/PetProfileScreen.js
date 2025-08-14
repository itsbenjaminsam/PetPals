import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

export default function PetProfileScreen({ route }) {
  const { pet } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);
  const { colors, isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const checkIfFavorited = async () => {
      const saved = await AsyncStorage.getItem('favorites');
      const favs = saved ? JSON.parse(saved) : [];
      const exists = favs.includes(pet.id);
      setIsFavorited(exists);
    };

    checkIfFavorited();
  }, [pet]);

  const handleToggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favs = stored ? JSON.parse(stored) : [];

      if (isFavorited) {
        const updated = favs.filter((id) => id !== pet.id);
        await AsyncStorage.setItem('favorites', JSON.stringify(updated));
        setIsFavorited(false);
        Alert.alert(`${pet.name} has been removed from your favorites.`);
      } else {
        const updated = [...favs, pet.id];
        await AsyncStorage.setItem('favorites', JSON.stringify(updated));
        setIsFavorited(true);
        Alert.alert(`${pet.name} has been added to your favorites!`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Something went wrong.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={pet.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{pet.name}</Text>
        <Text style={[styles.details, { color: colors.text }]}>
          {pet.breed} • {pet.age}
        </Text>
        <Text style={[styles.species, { color: isDarkMode ? '#aaa' : '#888' }]}>
          {pet.species}
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {pet.description}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isFavorited ? '#999' : '#ff6b6b' },
          ]}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.buttonText}>
            {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 300 },
  info: { padding: 20 },
  name: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  details: { fontSize: 16, marginBottom: 4 },
  species: { fontSize: 14, marginBottom: 16 },
  description: { fontSize: 16, lineHeight: 22 },
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
