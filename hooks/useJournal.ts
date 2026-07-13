import { JournalEntry } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

export const useJournal = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const t = getDateInfo();

  // Get all journal entries ordered by date descending
  const {
    data: entries = [],
    isLoading,
    error,
    refetch,
  } = useQuery<JournalEntry[]>({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      try {
        const rows = await db.getAllAsync<JournalEntry>(
          'SELECT * FROM daily_journal ORDER BY date DESC'
        );
        return rows;
      } catch (e) {
        return [];
      }
    },
  });

  // Save or update an entry for a specific date
  const saveEntryMutation = useMutation({
    mutationFn: async ({ date, content }: { date: string; content: string }) => {
      const timestamp = t.isoTimestamp;

      // Check if entry exists
      const existing = await db.getFirstAsync<JournalEntry>(
        'SELECT * FROM daily_journal WHERE date = ?',
        [date]
      );

      if (existing) {
        await db.runAsync(
          'UPDATE daily_journal SET content = ?, updated_at = ? WHERE date = ?',
          [content, timestamp, date]
        );
      } else {
        await db.runAsync(
          'INSERT INTO daily_journal (date, content, created_at) VALUES (?, ?, ?)',
          [date, content, timestamp]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
    },
    onError: (e) => {
      console.error(e);
      Alert.alert("Error", "Failed to save journal entry.");
    },
  });

  // Delete an entry
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.runAsync("DELETE FROM daily_journal WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete journal entry.");
    },
  });

  return {
    entries,
    isLoading,
    error,
    refetch,
    saveEntry: (data: { date: string; content: string }) => saveEntryMutation.mutateAsync(data),
    deleteEntry: (id: number) => deleteEntryMutation.mutate(id),
  };
};
