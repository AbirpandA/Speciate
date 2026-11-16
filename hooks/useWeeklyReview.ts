import type { Habit } from "@/types/dbTypes";
import { dailyRatios, EntryLite } from "@/utils/insights";
import { isScheduledOn } from "@/utils/schedule";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export type WeeklyReview = {
  weekStart: string; // Monday of the week being reviewed
  rate: number | null;
  wins: { name: string; done: number; expected: number }[];
  mostMissed: { name: string; missed: number; why?: string | null } | null;
};

/** Summary of last week (Mon-Sun) for the start-of-week review card. */
export const useWeeklyReview = (enabled: boolean) => {
  const db = useSQLiteContext();
  const lastStart = DateTime.local().startOf("week").minus({ weeks: 1 });
  const start = lastStart.toFormat("yyyy-MM-dd");
  const end = lastStart.plus({ days: 6 }).toFormat("yyyy-MM-dd");

  return useQuery<WeeklyReview>({
    queryKey: ["analytics", "weekly-review", start],
    enabled,
    queryFn: async () => {
      const habits = await db.getAllAsync<Habit>(
        `SELECT * FROM habits WHERE active = 1 AND type = 'build'`
      );
      const entries = await db.getAllAsync<EntryLite>(
        `SELECT habit_id, date, status FROM habits_entry WHERE date BETWEEN ? AND ?`,
        [start, end]
      );
      const days = dailyRatios(habits, entries, start, end);
      const expected = days.reduce((a, d) => a + d.expected, 0);
      const done = days.reduce((a, d) => a + d.done, 0);

      const perHabit = habits.map((h) => {
        let exp = 0;
        let ok = 0;
        for (let i = 0; i < 7; i++) {
          const date = lastStart.plus({ days: i }).toFormat("yyyy-MM-dd");
          const e = entries.find((x) => x.habit_id === h.id && x.date === date);
          if (e?.status === 1) ok++;
          if (h.times_per_week) continue;
          if (!isScheduledOn(h, date) || e?.status === 2) continue;
          exp++;
        }
        if (h.times_per_week) exp = h.times_per_week;
        return { name: h.name, why: h.why, done: Math.min(ok, exp), expected: exp };
      });

      const wins = perHabit
        .filter((h) => h.expected > 0 && h.done / h.expected >= 0.8)
        .sort((a, b) => b.done / b.expected - a.done / a.expected)
        .slice(0, 3)
        .map(({ name, done: d, expected: e }) => ({ name, done: d, expected: e }));
      const missed = perHabit
        .map((h) => ({ name: h.name, why: h.why, missed: h.expected - h.done }))
        .filter((h) => h.missed > 0)
        .sort((a, b) => b.missed - a.missed)[0];

      return {
        weekStart: start,
        rate: expected ? done / expected : null,
        wins,
        mostMissed: missed ?? null,
      };
    },
  });
};
