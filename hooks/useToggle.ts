import type { EntryStatus } from "@/types/dbTypes";
import { writeHeatmapDay } from "@/services/heatmapCache";
import { invalidateHabitQueries } from "@/utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export type EntryUpdate = {
  habitId: number;
  date: string;
  /** null removes the entry entirely (back to "not logged") */
  status: EntryStatus | null;
  value?: number | null;
  note?: string | null;
};

export const useSetHabitEntry = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ habitId, date, status, value, note }: EntryUpdate) => {
      const iso = DateTime.local().toISO() ?? "";
      const existing = await db.getFirstAsync<{ id: number; note: string | null; value: number | null }>(
        `SELECT id, note, value FROM habits_entry WHERE habit_id=? AND date=?`,
        [habitId, date]
      );

      const nextNote = note !== undefined ? note : existing?.note ?? null;
      const nextValue = value !== undefined ? value : existing?.value ?? null;

      if (status === null && !nextNote) {
        if (existing) await db.runAsync(`DELETE FROM habits_entry WHERE id=?`, [existing.id]);
      } else {
        const s = status ?? 0;
        if (existing) {
          await db.runAsync(
            `UPDATE habits_entry SET status=?, value=?, note=?, updated_at=? WHERE id=?`,
            [s, nextValue, nextNote, iso, existing.id]
          );
        } else {
          await db.runAsync(
            `INSERT INTO habits_entry (habit_id, date, status, value, note, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [habitId, date, s, nextValue, nextNote, iso]
          );
        }
      }

      await writeHeatmapDay(db, habitId, date, status);
    },
    onSuccess: () => invalidateHabitQueries(queryClient),
  });

  return {
    setEntry: (update: EntryUpdate) => mutation.mutate(update),
    setEntryAsync: (update: EntryUpdate) => mutation.mutateAsync(update),
  };
};

/** Back-compat: simple done/not-done toggle. */
export const useToggleHabitEntry = () => {
  const { setEntry } = useSetHabitEntry();
  return {
    toggleCheck: (habitId: number, date: string, status: number | null) =>
      setEntry({ habitId, date, status: status === 1 ? 0 : 1 }),
  };
};
