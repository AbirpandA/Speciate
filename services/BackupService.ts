import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { SQLiteDatabase } from "expo-sqlite";

const BACKUP_TABLES = [
  "habits",
  "habits_entry",
  "habit_events",
  "goals",
  "daily_journal",
] as const;

/** Insert rows, keeping only columns that exist in the current table schema. */
async function insertRows(
  db: SQLiteDatabase,
  table: string,
  rows: Record<string, unknown>[]
) {
  if (rows.length === 0) return;
  const info = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`
  );
  const known = new Set(info.map((c) => c.name));

  for (const row of rows) {
    const cols = Object.keys(row).filter((c) => known.has(c));
    if (cols.length === 0) continue;
    const quoted = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map(() => "?").join(", ");
    await db.runAsync(
      `INSERT INTO ${table} (${quoted}) VALUES (${placeholders})`,
      cols.map((c) => (row[c] ?? null) as any)
    );
  }
}

export const BackupService = {
  /**
   * Export database tables to a JSON file and share it.
   */
  async exportData(db: SQLiteDatabase) {
    try {
      const tables: Record<string, unknown[]> = {};
      for (const table of BACKUP_TABLES) {
        tables[table] = await db.getAllAsync(`SELECT * FROM ${table}`);
      }

      const backupData = {
        version: 2,
        timestamp: new Date().toISOString(),
        ...tables,
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

      await db.execAsync("PRAGMA foreign_keys = OFF;");
      try {
        await db.withTransactionAsync(async () => {
          for (const table of BACKUP_TABLES) {
            const rows = parsedData[table];
            // Older (v1) backups only contain habits + habits_entry; leave
            // other tables untouched in that case.
            if (!Array.isArray(rows)) continue;
            await db.execAsync(`DELETE FROM ${table};`);
            await insertRows(db, table, rows);
          }
        });
      } finally {
        await db.execAsync("PRAGMA foreign_keys = ON;");
      }

      return { success: true };
    } catch (error: any) {
      console.error("Import error:", error);
      return { success: false, error: error.message };
    }
  }
};
