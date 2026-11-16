import type { Habit, HabitEvent } from "@/types/dbTypes";
import { calculateHabitStats } from "@/utils/habitStats";
import { isScheduledOn } from "@/utils/schedule";
import { DateTime } from "luxon";

export type EntryLite = { habit_id: number; date: string; status: number };
export type DayRatio = { date: string; done: number; expected: number };

const fmt = (d: DateTime) => d.toFormat("yyyy-MM-dd");

/**
 * Per-day completion across build habits with a daily/weekday schedule.
 * Times-per-week habits are left out (they have no fixed day), and skipped
 * days don't count as expected.
 */
export function dailyRatios(habits: Habit[], entries: EntryLite[], from: string, to: string): DayRatio[] {
  const daily = habits.filter((h) => !h.times_per_week);
  const status = new Map<string, number>();
  for (const e of entries) status.set(`${e.habit_id}|${e.date}`, e.status);
  const out: DayRatio[] = [];
  for (let d = DateTime.fromISO(from); fmt(d) <= to; d = d.plus({ days: 1 })) {
    const date = fmt(d);
    let done = 0;
    let expected = 0;
    for (const h of daily) {
      if (!isScheduledOn(h, date)) continue;
      const s = status.get(`${h.id}|${date}`);
      if (s === 2) continue;
      expected++;
      if (s === 1) done++;
    }
    out.push({ date, done, expected });
  }
  return out;
}

const rate = (days: DayRatio[]) => {
  const e = days.reduce((a, d) => a + d.expected, 0);
  return e ? days.reduce((a, d) => a + d.done, 0) / e : null;
};

export function weekScores(days: DayRatio[], today: string) {
  const t = DateTime.fromISO(today);
  const thisStart = fmt(t.startOf("week"));
  const lastStart = fmt(t.startOf("week").minus({ weeks: 1 }));
  return {
    thisWeek: rate(days.filter((d) => d.date >= thisStart && d.date <= today)),
    lastWeek: rate(days.filter((d) => d.date >= lastStart && d.date < thisStart)),
  };
}

/** Completion rate per weekday (index 0 = Monday) over the given days. */
export function weekdayRates(days: DayRatio[]): (number | null)[] {
  const acc = Array.from({ length: 7 }, () => ({ done: 0, expected: 0 }));
  for (const d of days) {
    const i = DateTime.fromISO(d.date).weekday - 1;
    acc[i].done += d.done;
    acc[i].expected += d.expected;
  }
  return acc.map((a) => (a.expected ? a.done / a.expected : null));
}

export function habitRates(habits: Habit[], entries: EntryLite[], today: string) {
  return habits
    .map((h) => {
      const stats = calculateHabitStats(h, entries.filter((e) => e.habit_id === h.id), today);
      return { id: h.id, name: h.name, color: h.color, rate30: stats.rate30, streak: stats.currentStreak };
    })
    .sort((a, b) => b.rate30 - a.rate30);
}

export function triggerCounts(events: HabitEvent[]) {
  const counts = new Map<string, number>();
  for (const e of events) if (e.trigger) counts.set(e.trigger, (counts.get(e.trigger) ?? 0) + 1);
  return [...counts.entries()].map(([trigger, count]) => ({ trigger, count })).sort((a, b) => b.count - a.count);
}

export function urgeSummary(events: HabitEvent[]) {
  const urges = events.filter((e) => e.kind === "urge");
  return {
    resisted: urges.filter((e) => e.resisted === 1).length,
    gaveIn: urges.filter((e) => e.resisted === 0).length,
    slips: events.filter((e) => e.kind === "slip").length,
  };
}

/** Average habit completion on days you logged each mood (1-5). */
export function moodVsCompletion(days: DayRatio[], moods: { date: string; mood: number }[]) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const acc = Array.from({ length: 5 }, () => ({ sum: 0, n: 0 }));
  for (const m of moods) {
    const d = byDate.get(m.date);
    if (!d || !d.expected || m.mood < 1 || m.mood > 5) continue;
    acc[m.mood - 1].sum += d.done / d.expected;
    acc[m.mood - 1].n++;
  }
  return acc.map((a, i) => ({ mood: i + 1, rate: a.n ? a.sum / a.n : null, days: a.n }));
}
