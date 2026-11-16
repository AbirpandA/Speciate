import { JournalEntry } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

export const useJournal = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

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

  // Save or update an entry for a specific date. Only the provided fields change.
  const saveEntryMutation = useMutation({
    mutationFn: async ({
      date,
      content,
      mood,
      append,
    }: {
      date: string;
      content?: string;
      mood?: number | null;
      /** add a paragraph to the end of the existing content */
      append?: string;
    }) => {
      const timestamp = getDateInfo().isoTimestamp;
      const existing = await db.getFirstAsync<JournalEntry>(
        "SELECT * FROM daily_journal WHERE date = ?",
        [date]
      );
      let nextContent = content ?? existing?.content ?? "";
      if (append) nextContent = nextContent.trim() ? `${nextContent.trim()}\n\n${append}` : append;
      const nextMood = mood !== undefined ? mood : existing?.mood ?? null;

      if (existing) {
        await db.runAsync(
          "UPDATE daily_journal SET content = ?, mood = ?, updated_at = ? WHERE date = ?",
          [nextContent, nextMood, timestamp, date]
        );
      } else {
        await db.runAsync(
          "INSERT INTO daily_journal (date, content, mood, created_at) VALUES (?, ?, ?, ?)",
          [date, nextContent, nextMood, timestamp]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
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
    saveEntry: (data: { date: string; content?: string; mood?: number | null; append?: string }) =>
      saveEntryMutation.mutateAsync(data),
    deleteEntry: (id: number) => deleteEntryMutation.mutate(id),
  };
};
