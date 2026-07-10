import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// NOTE: expo-notifications functionality has been removed from Expo Go (SDK 53+).
// To fully enable notifications, a custom development client is required (npx expo run:android).
// This service is currently mocked out so it doesn't crash Expo Go.

const REMINDER_STORAGE_KEY = "habit_reminder_time";
const REMINDER_ENABLED_KEY = "habit_reminder_enabled";

export const NotificationService = {
  async requestPermissions() {
    return false;
  },

  async scheduleDailyReminder(hour: number, minute: number) {
    return false;
  },

  async cancelAllReminders() {
    await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "false");
  },

  async getReminderSettings() {
    return { isEnabled: false, time: { hour: 20, minute: 0 } };
  },
};
