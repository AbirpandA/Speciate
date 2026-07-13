import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { SQLiteDatabase } from "expo-sqlite";

export const BackupService = {
  /**
   * Export database tables to a JSON file and share it.
   */
  async exportData(db: SQLiteDatabase) {
    try {
      // Read all habits
      const habits = await db.getAllAsync("SELECT * FROM habits");
      
      // Read all habit entries
      const habits_entry = await db.getAllAsync("SELECT * FROM habits_entry");
      
      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        habits,
        habits_entry,
      };
      
      const jsonStr = JSON.stringify(backupData, null, 2);
      
      // @ts-ignore
      const fileUri = FileSystem.documentDirectory + "habit-tracker-backup.json";
      await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
        // @ts-ignore
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Habit Data",
        });
        return { success: true };
      } else {
        return { success: false, error: "Sharing is not available on this device" };
      }
    } catch (error: any) {
      console.error("Export error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Import database tables from a selected JSON file.
   */
  async importData(db: SQLiteDatabase) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: "Import cancelled" };
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        // @ts-ignore
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsedData = JSON.parse(fileContent);

      if (!parsedData.habits || !parsedData.habits_entry) {
         return { success: false, error: "Invalid backup file format" };
      }

      // Execute import in a transaction if possible, or sequential
      // For simplicity in expo-sqlite ^16.0.0 we can use execAsync for raw queries or runAsync sequentially
      
      await db.execAsync("PRAGMA foreign_keys = OFF;");
      
      // Clear existing tables
      await db.execAsync("DELETE FROM habits;");
      await db.execAsync("DELETE FROM habits_entry;");

      // Insert habits
      for (const h of parsedData.habits) {
        await db.runAsync(
          `INSERT INTO habits (id, name, description, icon, color, created_at, frequency, target, active, "order") 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            h.id, h.name, h.description, h.icon, h.color, h.created_at, 
            h.frequency, h.target, h.active, h.order
          ]
        );
      }

      // Insert entries
      for (const e of parsedData.habits_entry) {
         await db.runAsync(
          `INSERT INTO habits_entry (id, habit_id, date, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            e.id, e.habit_id, e.date, e.status, e.created_at, e.updated_at
          ]
        );
      }

      await db.execAsync("PRAGMA foreign_keys = ON;");
      
      return { success: true };
    } catch (error: any) {
      console.error("Import error:", error);
      return { success: false, error: error.message };
    }
  }
};
