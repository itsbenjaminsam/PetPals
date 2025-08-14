import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function PetCard({ pet, onPress, onDelete }) {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(pet)}
    >
      <Image source={pet.image} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.text }]}>{pet.name}</Text>
          <TouchableOpacity 
            onPress={() => onDelete(pet.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.meta, { color: colors.text }]}>{pet.breed} • {pet.age}</Text>
        <Text style={[styles.species, { color: colors.text }]}>{pet.species}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#ccc',
  },
  info: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  meta: {
    fontSize: 14,
  },
  species: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
});