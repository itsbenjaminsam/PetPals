import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // Disabled badge counter
  }),
});

/**
 * Register the device for push notifications
 * @returns {Promise<string|undefined>} Expo push token
 */
export async function registerForPushNotificationAsync() {
  let token;

  if (Platform.OS === 'android') {s
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (finalStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: 'bdd61330-1263-4357-aa04-7ad68845f5d6',
      })
    ).data;

    console.log('Expo Push Token:', token);
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Send an adoption success notification with haptic feedback
 * @param {string} petName - Name of the adopted pet
 */
export async function sendAdoptedNotification(petName) {
  try {
    // Haptic feedback sequence
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 50));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise(resolve => setTimeout(resolve, 50));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Visual notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Adoption Success!',
        body: `${petName} has found a loving forever home!`,
        data: { petName },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
      trigger: { seconds: 1 },
    });

  } catch (error) {
    console.error('Notification Error:', error);
    // Fallback vibration
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

/**
 * Schedule a daily reminder notification
 * @param {Object} options - Configuration options
 * @param {number} [options.hour=19] - Hour of reminder (24h format)
 * @param {number} [options.minute=30] - Minute of reminder
 */
export async function scheduleDailyReminder({ hour = 19, minute = 30 } = {}) {
  try {
    await Haptics.selectionAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐾 Don\'t forget!',
        body: 'Complete your pet adoption process today',
        sound: 'default',
      },
      trigger: { 
        hour,
        minute,
        repeats: true 
      },
    });
    console.log(`Daily reminder scheduled for ${hour}:${minute}`);
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
    Alert.alert('Failed to schedule reminder');
  }
}

// Notification event listeners
export function setupNotificationListeners() {
  // Listen for incoming notifications while app is foregrounded
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });

  // Listen for notification responses (user taps on notification)
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response:', response);
  });
}