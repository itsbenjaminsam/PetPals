// screens/SettingsScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, Pressable, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../I18nProvider';

const STORAGE_KEYS = { notifications: 'settings_notifications_enabled' };

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ms', label: 'Malay' },
  { code: 'ta', label: 'Tamil' },
];

export default function SettingsScreen() {
  const { t, language, changeLanguage } = useI18n();
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedNotif = await AsyncStorage.getItem(STORAGE_KEYS.notifications);
        if (savedNotif !== null) setNotificationsEnabled(savedNotif === 'true');
      } catch (e) {
        console.warn('Failed to load notification preference:', e);
      }
    })();
  }, []);

  const handleToggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem(STORAGE_KEYS.notifications, String(value));
    } catch (e) {
      console.warn('Failed to save notification preference:', e);
      Alert.alert(t('common.error'), 'Could not save notification preference.');
    }
  };

  const openSupportEmail = () => {
    const subject = encodeURIComponent('PetPals Support');
    const body = encodeURIComponent('Hi PetPals team, I need help with...');
    const mailto = `mailto:support@petpals.app?subject=${subject}&body=${body}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert(t('common.error'), 'No email app found on this device.')
    );
  };

  const showAbout = () => {
    Alert.alert(t('settings.aboutApp'), t('about.dialog', { version: '1.0.0' }));
  };

  const settingsSections = [
    {
      title: t('settings.appearance'),
      options: [
        {
          title: t('settings.darkMode'),
          icon: 'moon',
          right: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary, false: '#ccc' }}
              thumbColor="#fff"
            />
          ),
          onPress: null,
        },
      ],
    },
    {
      title: t('settings.preferences'),
      options: [
        {
          title: t('settings.notifications'),
          icon: 'notifications-outline',
          right: (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ true: colors.primary, false: '#ccc' }}
              thumbColor="#fff"
            />
          ),
          onPress: null,
        },
        {
          title: t('settings.language'),
          icon: 'language-outline',
          right: (
            <View style={styles.rowRight}>
              <Text style={[styles.badge, { color: colors.textSecondary }]}>
                {LANGUAGES.find((l) => l.code === language)?.label || 'English'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </View>
          ),
          onPress: () => setLanguageModalVisible(true),
        },
      ],
    },
    {
      title: t('settings.about'),
      options: [
        {
          title: t('settings.help'),
          icon: 'help-circle-outline',
          right: <Ionicons name="chevron-forward" size={20} color={colors.text} />,
          onPress: openSupportEmail,
        },
        {
          title: t('settings.aboutApp'),
          icon: 'information-circle-outline',
          right: <Ionicons name="chevron-forward" size={20} color={colors.text} />,
          onPress: showAbout,
        },
      ],
    },
  ];

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={[styles.header, { color: colors.text }]}>{t('settings.title')}</Text>

        {settingsSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.options.map((option, oIdx) => {
                const isLast = oIdx === section.options.length - 1;
                return (
                  <TouchableOpacity
                    key={oIdx}
                    style={[
                      styles.optionRow,
                      { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border },
                    ]}
                    activeOpacity={0.7}
                    onPress={option.onPress || undefined}
                    disabled={!option.onPress}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons name={option.icon} size={22} color={colors.primary} style={styles.optionIcon} />
                      <Text style={[styles.optionText, { color: colors.text }]}>{option.title}</Text>
                    </View>
                    {option.right}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {t('settings.version', { version: '1.0.0' })}
          </Text>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.chooseLanguage')}</Text>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [
                  styles.modalOption,
                  { backgroundColor: pressed ? colors.background : 'transparent' },
                ]}
                onPress={() => {
                  changeLanguage(lang.code);
                  setLanguageModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{lang.label}</Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
            <Pressable style={styles.modalClose} onPress={() => setLanguageModalVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>
                {t('settings.close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', margin: 20, marginBottom: 30 },
  section: { marginBottom: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, opacity: 0.7 },
  sectionContent: { borderRadius: 12, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { marginRight: 15 },
  optionText: { fontSize: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { fontSize: 14, opacity: 0.7, marginRight: 4 },
  versionContainer: { alignItems: 'center', marginTop: 20 },
  versionText: { fontSize: 14 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalOption: { paddingVertical: 14, paddingHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOptionText: { fontSize: 16 },
  modalClose: { marginTop: 8, alignSelf: 'flex-end', padding: 8 },
  modalCloseText: { fontSize: 16, fontWeight: '600' },
});
