import React, { useEffect, useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';
import SwipeScreen from './screens/SwipeScreen';
import NearbyPetsScreen from './screens/NearbyPetsScreen';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { registerForPushNotificationAsync } from './utils/notifications';

import { I18nProvider, useI18n } from './I18nProvider';

const Tab = createBottomTabNavigator();

function AppInner() {
  const { isDarkMode } = useContext(ThemeContext);
  const { t, language } = useI18n(); // reading language ensures re-render when it changes

  useEffect(() => {
    registerForPushNotificationAsync();
  }, []);

  return (
    // No key here, so the navigator does not remount and does not jump away from Settings
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home': iconName = 'paw'; break;
              case 'Favorites': iconName = 'heart'; break;
              case 'Swipe': iconName = 'hand-left-outline'; break;
              case 'Nearby': iconName = 'location-outline'; break;
              case 'Settings': iconName = 'settings'; break;
              default: iconName = 'help';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ff6b6b',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home'), tabBarLabel: t('tabs.home') }} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('tabs.favorites'), tabBarLabel: t('tabs.favorites') }} />
        <Tab.Screen name="Swipe" component={SwipeScreen} options={{ title: t('tabs.swipe'), tabBarLabel: t('tabs.swipe') }} />
        <Tab.Screen name="Nearby" component={NearbyPetsScreen} options={{ title: t('tabs.nearby'), tabBarLabel: t('tabs.nearby') }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings'), tabBarLabel: t('tabs.settings') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </I18nProvider>
  );
}
