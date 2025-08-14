import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainHomeScreen from './MainHomeScreen';
import PetProfileScreen from './PetProfileScreen';
import { ThemeContext } from '../context/ThemeContext';
import { useTheme } from '@react-navigation/native';
import AddPetScreen from './AddPetScreen';

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  const { colors } = useContext(ThemeContext);
  const navTheme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: navTheme.colors.card },
        headerTintColor: navTheme.colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainHome"
        component={MainHomeScreen}
        options={{ title: 'Available Pets' }}
      />
      <Stack.Screen
        name="PetProfile"
        component={PetProfileScreen}
        options={{ title: 'Pet Details' }}
      />
      <Stack.Screen 
        name="AddPetForm" 
        component={AddPetScreen} 
        options={{ title: 'Add New Pet' }}
      />
    </Stack.Navigator>
  );
}