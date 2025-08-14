import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function AddPetScreen({ navigation }) {
  const { colors } = useTheme();
  const [form, setForm] = useState({
    name: '',
    age: '',
    breed: '',
    description: '',
    species: 'Dog'
  });
  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant photo access permission.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.breed || !form.description || !imageUri) {
      Alert.alert('Missing info', 'Please fill out all fields and select an image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newPet = {
        id: uuid.v4(),
        ...form,
        image: { uri: imageUri },
        createdAt: new Date().toISOString()
      };

      const existingPets = await AsyncStorage.getItem('customPets');
      const pets = existingPets ? JSON.parse(existingPets) : [];
      const updatedPets = [...pets, newPet];
      
      await AsyncStorage.setItem('customPets', JSON.stringify(updatedPets));
      
      Alert.alert(
        'Success!',
        `${form.name} was added successfully.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Home') 
          }
        ]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not save pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { backgroundColor: colors.background }
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Add a New Pet 🐾</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#999"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
        style={[
          styles.input, 
          { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border
          }
        ]}
      />

      <TextInput
        placeholder="Age"
        placeholderTextColor="#999"
        value={form.age}
        onChangeText={(text) => handleChange('age', text)}
        keyboardType="numeric"
        style={[
          styles.input, 
          { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border
          }
        ]}
      />

      <TextInput
        placeholder="Breed"
        placeholderTextColor="#999"
        value={form.breed}
        onChangeText={(text) => handleChange('breed', text)}
        style={[
          styles.input, 
          { 
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border
          }
        ]}
      />

      <TextInput
        placeholder="Description"
        placeholderTextColor="#999"
        value={form.description}
        onChangeText={(text) => handleChange('description', text)}
        multiline
        numberOfLines={4}
        style={[
          styles.input, 
          { 
            height: 100,
            backgroundColor: colors.card, 
            color: colors.text,
            borderColor: colors.border,
            textAlignVertical: 'top'
          }
        ]}
      />

      <Text style={[styles.label, { color: colors.text }]}>Species:</Text>
      <View style={[
        styles.pickerContainer,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border
        }
      ]}>
        <Picker
          selectedValue={form.species}
          onValueChange={(value) => handleChange('species', value)}
          dropdownIconColor={colors.text}
          style={{ 
            color: colors.text,
            backgroundColor: colors.card,
            height: Platform.OS === 'ios' ? 180 : 50,
          }}
          itemStyle={{
            color: colors.text,
            backgroundColor: colors.card,
            fontSize: 16,
            height: Platform.OS === 'ios' ? 120 : 50,
          }}
          mode="dropdown"
        >
          <Picker.Item label="Dog" value="Dog" />
          <Picker.Item label="Cat" value="Cat" />
          <Picker.Item label="Rabbit" value="Rabbit" />
          <Picker.Item label="Bird" value="Bird" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <TouchableOpacity 
        style={[
          styles.imageButton, 
          { backgroundColor: colors.primary }
        ]}
        onPress={handlePickImage}
      >
        <Ionicons name="camera" size={20} color="white" />
        <Text style={styles.imageButtonText}>Select Image</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.imagePreview} 
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary }
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Add Pet</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 16
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16
  },
  pickerContainer: {
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden'
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  imageButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20
  },
  submitButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});