import React, { useEffect, useState } from "react";
import { Text, View, Switch, TouchableOpacity, Alert } from "react-native";
import { NotificationService } from "@/services/NotificationService";
import { BackupService } from "@/services/BackupService";
import { useSQLiteContext } from "expo-sqlite";

const MoreOptionsScreen = () => {
  const db = useSQLiteContext();
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await NotificationService.getReminderSettings();
    setReminderEnabled(settings.isEnabled);
  };

  const toggleReminder = async (value: boolean) => {
    if (value) {
      const success = await NotificationService.scheduleDailyReminder(20, 0); // 8 PM
      if (success) {
        setReminderEnabled(true);
        Alert.alert("Success", "Daily reminders set for 8:00 PM");
      } else {
        Alert.alert("Permission Required", "Please enable notifications in your device settings.");
      }
    } else {
      await NotificationService.cancelAllReminders();
      setReminderEnabled(false);
    }
  };

  const handleExport = async () => {
    const res = await BackupService.exportData(db);
    if (!res.success) {
      Alert.alert("Export Failed", res.error || "Unknown error");
    }
  };

  const handleImport = async () => {
    Alert.alert(
      "Warning",
      "Importing data will overwrite your current habits. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Import", 
          style: "destructive",
          onPress: async () => {
            const res = await BackupService.importData(db);
            if (res.success) {
              Alert.alert("Success", "Data imported successfully. Please restart the app to see changes.");
            } else {
              Alert.alert("Import Failed", res.error || "Unknown error");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-neutral-900 pt-16 px-6">
      <Text className="text-white text-3xl font-bold mb-8">Settings</Text>

      <View className="mb-8">
        <Text className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider">Notifications</Text>
        <View className="flex-row items-center justify-between bg-neutral-800 p-4 rounded-xl">
          <View>
            <Text className="text-white text-lg font-medium">Daily Reminder</Text>
            <Text className="text-gray-400 text-sm">Remind me at 8:00 PM</Text>
          </View>
          <Switch 
            value={reminderEnabled}
            onValueChange={toggleReminder}
            trackColor={{ false: "#3f3f46", true: "#10b981" }}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider">Data & Backup</Text>
        
        <TouchableOpacity 
          className="bg-neutral-800 p-4 rounded-xl mb-3 flex-row items-center justify-between"
          onPress={handleExport}
        >
          <Text className="text-white text-lg font-medium">Export Backup</Text>
          <Text className="text-gray-400 text-sm">Save to Files</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-neutral-800 p-4 rounded-xl flex-row items-center justify-between"
          onPress={handleImport}
        >
          <Text className="text-red-400 text-lg font-medium">Import Backup</Text>
          <Text className="text-gray-400 text-sm">Overwrite data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MoreOptionsScreen;
