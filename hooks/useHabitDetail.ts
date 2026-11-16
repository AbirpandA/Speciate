import type { Habit, HabitEntryRow } from "@/types/dbTypes";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

export const useHabitDetail = (id: number) => {
  const db = useSQLiteContext();
  return useQuery<{ habit: Habit | null; entries: HabitEntryRow[] }>({
    queryKey: ["habit-detail", id],
    queryFn: async () => {
      const habit = await db.getFirstAsync<Habit>("SELECT * FROM habits WHERE id = ?", [id]);
      const entries = await db.getAllAsync<HabitEntryRow>(
        "SELECT * FROM habits_entry WHERE habit_id = ? ORDER BY date DESC",
        [id]
      );
      return { habit, entries };
    },
  });
};
