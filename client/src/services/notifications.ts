import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running inside Expo Go client app
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

let Notifications: any = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (e) {
    // Module not loaded
  }
}

export async function registerForPushNotificationsAsync() {
  if (isExpoGo || !Notifications) return false;
  try {
    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance?.MAX || 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
        sound: 'default'
      });
    }

    if (Device.isDevice && Notifications.getPermissionsAsync) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return false;
      }
      return true;
    }
  } catch (err) {
    // Gracefully catch push token restrictions in Expo Go
  }
  return false;
}

export async function scheduleLocalNotification(title: string, body: string, triggerInSeconds: number) {
  if (isExpoGo || !Notifications || !Notifications.scheduleNotificationAsync) return;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: {
        seconds: triggerInSeconds,
        channelId: 'default',
      },
    });
    return id;
  } catch (error) {
    // Local notification suppressed in Expo Go
  }
}

export async function cancelNotification(id: string) {
  if (isExpoGo || !Notifications || !Notifications.cancelScheduledNotificationAsync) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    // Ignore error
  }
}
