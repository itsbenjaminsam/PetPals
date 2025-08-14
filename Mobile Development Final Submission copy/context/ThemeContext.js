import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem('theme');
      if (stored === 'dark') setIsDarkMode(true);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem('theme', newValue ? 'dark' : 'light');
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode
      ? {
          background: '#121212',
          text: '#ffffff',
          card: '#1e1e1e',
        }
      : {
          background: '#f2f2f2',
          text: '#333333',
          card: '#ffffff',
        },
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};