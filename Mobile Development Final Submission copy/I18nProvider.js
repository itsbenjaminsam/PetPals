// I18nProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resources } from './translations';

const I18nContext = createContext(null);
const STORAGE_KEY = 'settings_language';

function interpolate(str, vars = {}) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));
}
function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && resources[saved]) setLanguage(saved);
    })();
  }, []);

  const t = useMemo(() => {
    return (key, vars) => {
      const str = getByPath(resources[language], key);
      if (typeof str === 'string') return interpolate(str, vars);
      const fb = getByPath(resources.en, key);
      return typeof fb === 'string' ? interpolate(fb, vars) : key;
    };
  }, [language]);

  const changeLanguage = async (lang) => {
    if (!resources[lang]) return;
    setLanguage(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  const value = { t, language, changeLanguage, resources: resources[language] };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
