import type { Habit } from "@/types/dbTypes";
import { calculateHabitStats } from "@/utils/habitStats";
import { isScheduledOn } from "@/utils/schedule";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export type DayHabit = Habit & {
  entry_status: number | null; // null = nothing logged
  entry_value: number | null;
  entry_note: string | null;
  /** completions this week (Mon-Sun) for times-per-week habits */
  week_done: number;
  /** current streak as of today (days, or weeks for X-per-week habits) */
  streak: number;
  /** last scheduled day was missed: missing again resets the streak */
  at_risk: boolean;
};

/** Active build habits scheduled on `date`, with that day's entry. */
export const useDayHabits = (date: string) => {
  const db = useSQLiteContext();

  return useQuery<DayHabit[]>({
    queryKey: ["habits-day", date],
    queryFn: async () => {
      const weekStart = DateTime.fromISO(date).startOf("week").toFormat("yyyy-MM-dd");
      const weekEnd = DateTime.fromISO(date).endOf("week").toFormat("yyyy-MM-dd");
      const rows = await db.getAllAsync<DayHabit>(
        `
        SELECT h.*,
          e.status AS entry_status,
          e.value AS entry_value,
          e.note AS entry_note,
          (SELECT COUNT(*) FROM habits_entry w
             WHERE w.habit_id = h.id AND w.status = 1 AND w.date BETWEEN ? AND ?) AS week_done
        FROM habits h
        LEFT JOIN habits_entry e ON e.habit_id = h.id AND e.date = ?
        WHERE h.active = 1 AND h.type = 'build'
        ORDER BY h."order" ASC, h.id DESC
        `,
        [weekStart, weekEnd, date]
      );

      // Dedupe in case legacy data has more than one entry per day
      const seen = new Set<number>();
      const scheduled = rows.filter((h) => {
        if (seen.has(h.id) || !isScheduledOn(h, date)) return false;
        seen.add(h.id);
        return true;
      });

      // Streaks need each habit's full history; one query, grouped in JS.
      const history = await db.getAllAsync<{ habit_id: number; date: string; status: number }>(
        `SELECT e.habit_id, e.date, e.status FROM habits_entry e
           JOIN habits h ON h.id = e.habit_id
          WHERE h.active = 1 AND h.type = 'build'`
      );
      const byHabit = new Map<number, { date: string; status: number }[]>();
      for (const e of history) {
        const list = byHabit.get(e.habit_id) ?? [];
        list.push(e);
        byHabit.set(e.habit_id, list);
      }
      return scheduled.map((h) => {
        const stats = calculateHabitStats(h, byHabit.get(h.id) ?? []);
        return { ...h, streak: stats.currentStreak, at_risk: stats.atRisk };
      });
    },
  });
};

export type WeekDayProgress = { date: string; done: number; scheduled: number };

/** Completion summary for each day of the week containing `date`. */
export const useWeekProgress = (date: string) => {
  const db = useSQLiteContext();
  return useQuery<WeekDayProgress[]>({
    queryKey: ["week-progress", DateTime.fromISO(date).startOf("week").toFormat("yyyy-MM-dd")],
    queryFn: async () => {
      const start = DateTime.fromISO(date).startOf("week");
      const end = start.plus({ days: 6 });
      const habits = await db.getAllAsync<Habit>(
        "SELECT * FROM habits WHERE active = 1 AND type = 'build'"
      );
      const entries = await db.getAllAsync<{ habit_id: number; date: string; status: number }>(
        "SELECT habit_id, date, status FROM habits_entry WHERE date BETWEEN ? AND ?",
        [start.toFormat("yyyy-MM-dd"), end.toFormat("yyyy-MM-dd")]
      );
      return Array.from({ length: 7 }, (_, i) => {
        const d = start.plus({ days: i }).toFormat("yyyy-MM-dd");
        const scheduled = habits.filter((h) => isScheduledOn(h, d));
        const ids = new Set(scheduled.map((h) => h.id));
        const day = entries.filter((e) => e.date === d && ids.has(e.habit_id));
        const done = day.filter((e) => e.status === 1).length;
        const skipped = day.filter((e) => e.status === 2).length;
        return { date: d, done, scheduled: scheduled.length - skipped };
      });
    },
  });
};
