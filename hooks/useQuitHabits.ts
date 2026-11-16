import type { Habit, HabitEvent } from "@/types/dbTypes";
import { invalidateHabitQueries } from "@/utils/queryKeys";
import { calculateQuitStats, QuitStats } from "@/utils/quitStats";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export type QuitHabit = Habit & { stats: QuitStats };

export const useQuitHabits = () => {
  const db = useSQLiteContext();
  return useQuery<QuitHabit[]>({
    queryKey: ["habits", "quit"],
    queryFn: async () => {
      const habits = await db.getAllAsync<Habit>(
        `SELECT * FROM habits WHERE active = 1 AND type = 'quit' ORDER BY "order" ASC, id DESC`
      );
      const slips = await db.getAllAsync<{ habit_id: number; created_at: string }>(
        `SELECT habit_id, created_at FROM habit_events WHERE kind = 'slip'`
      );
      return habits.map((h) => ({
        ...h,
        stats: calculateQuitStats(
          h.start_date ?? h.created_at.slice(0, 10),
          slips
            .filter((s) => s.habit_id === h.id)
            .map((s) => DateTime.fromISO(s.created_at).toFormat("yyyy-MM-dd"))
        ),
      }));
    },
  });
};

export const useHabitEvents = (habitId: number) => {
  const db = useSQLiteContext();
  return useQuery<HabitEvent[]>({
    queryKey: ["habit-detail", habitId, "events"],
    queryFn: () =>
      db.getAllAsync<HabitEvent>(
        `SELECT * FROM habit_events WHERE habit_id = ? ORDER BY created_at DESC`,
        [habitId]
      ),
  });
};

export type NewHabitEvent = Omit<HabitEvent, "id" | "created_at"> & { created_at?: string };

export const useLogHabitEvent = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const m = useMutation({
    mutationFn: async (e: NewHabitEvent) => {
      await db.runAsync(
        `INSERT INTO habit_events (habit_id, kind, intensity, trigger, note, resisted, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          e.habit_id,
          e.kind,
          e.intensity ?? null,
          e.trigger ?? null,
          e.note ?? null,
          e.resisted ?? null,
          e.created_at ?? DateTime.local().toISO() ?? "",
        ]
      );
    },
    onSuccess: () => invalidateHabitQueries(queryClient),
  });
  return { logEvent: m.mutateAsync };
};
