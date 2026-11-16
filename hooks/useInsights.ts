import type { Habit, HabitEvent } from "@/types/dbTypes";
import {
  dailyRatios,
  DayRatio,
  EntryLite,
  habitRates,
  moodVsCompletion,
  triggerCounts,
  urgeSummary,
  weekdayRates,
  weekScores,
} from "@/utils/insights";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export const HEATMAP_WEEKS = 26;

export const useInsights = () => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const today = DateTime.local();
      const todayStr = today.toFormat("yyyy-MM-dd");
      const from = today.startOf("week").minus({ weeks: HEATMAP_WEEKS - 1 }).toFormat("yyyy-MM-dd");

      const habits = await db.getAllAsync<Habit>(
        `SELECT * FROM habits WHERE active = 1 AND type = 'build' ORDER BY "order" ASC, id DESC`
      );
      const quitCount = await db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM habits WHERE active = 1 AND type = 'quit'`
      );
      const entries = await db.getAllAsync<EntryLite>(
        `SELECT e.habit_id, e.date, e.status FROM habits_entry e
           JOIN habits h ON h.id = e.habit_id
          WHERE h.active = 1 AND h.type = 'build'`
      );
      const events = await db.getAllAsync<HabitEvent>(
        `SELECT ev.* FROM habit_events ev JOIN habits h ON h.id = ev.habit_id WHERE h.active = 1`
      );
      const moods = await db.getAllAsync<{ date: string; mood: number }>(
        `SELECT date, mood FROM daily_journal WHERE mood IS NOT NULL`
      );

      const days: DayRatio[] = dailyRatios(habits, entries, from, todayStr);
      const last8w = days.slice(-56);
      return {
        today: todayStr,
        hasHabits: habits.length > 0,
        hasQuit: (quitCount?.n ?? 0) > 0,
        days,
        week: weekScores(days, todayStr),
        weekdays: weekdayRates(last8w),
        habits: habitRates(habits, entries, todayStr),
        urges: urgeSummary(events),
        triggers: triggerCounts(events),
        mood: moodVsCompletion(days, moods),
        moodDays: moods.length,
      };
    },
  });
};
