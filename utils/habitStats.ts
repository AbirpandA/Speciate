import { DateTime } from "luxon";

export type StatsHabit = {
  created_at: string;
  schedule_days?: string | null;
  times_per_week?: number | null;
};

export type StatsEntry = { date: string; status: number };

export type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  /** "days" for daily/weekday schedules, "weeks" for X-times-per-week */
  streakUnit: "days" | "weeks";
  rate30: number; // 0..1
  rateAll: number; // 0..1
  totalDone: number;
};

const fmt = (d: DateTime) => d.toFormat("yyyy-MM-dd");

function scheduledDays(habit: StatsHabit): number[] | null {
  if (!habit.schedule_days) return null;
  try {
    const d = JSON.parse(habit.schedule_days);
    return Array.isArray(d) && d.length > 0 && d.length < 7 ? d : null;
  } catch {
    return null;
  }
}

/**
 * Schedule-aware streaks and completion rates.
 *  - Only scheduled days count. Skipped days (status 2) are neutral.
 *  - Today being unlogged never breaks a streak (the day isn't over).
 *  - Times-per-week habits are judged per Mon-Sun week; the current week
 *    counts once met, and never breaks the streak while in progress.
 */
export function calculateHabitStats(
  habit: StatsHabit,
  entries: StatsEntry[],
  today: string = fmt(DateTime.local())
): HabitStats {
  const byDate = new Map<string, number>();
  for (const e of entries) byDate.set(e.date, e.status);
  const totalDone = entries.filter((e) => e.status === 1).length;

  const created = habit.created_at.slice(0, 10);
  const earliestEntry = entries.reduce((m, e) => (e.date < m ? e.date : m), created);
  const start = DateTime.fromISO(earliestEntry < created ? earliestEntry : created).startOf("day");
  const end = DateTime.fromISO(today).startOf("day");
  const thirtyAgo = fmt(end.minus({ days: 29 }));

  if (habit.times_per_week && habit.times_per_week > 0) {
    const target = habit.times_per_week;
    let cur = 0;
    let longest = 0;
    let run = 0;
    let weeksMet = 0;
    let weeksTotal = 0;
    let weeksMet30 = 0;
    let weeksTotal30 = 0;
    const thisWeek = fmt(end.startOf("week"));
    for (let w = start.startOf("week"); w <= end; w = w.plus({ weeks: 1 })) {
      let done = 0;
      for (let i = 0; i < 7; i++) if (byDate.get(fmt(w.plus({ days: i }))) === 1) done++;
      const met = done >= target;
      const isCurrent = fmt(w) === thisWeek;
      if (met) run++;
      else if (!isCurrent) run = 0;
      longest = Math.max(longest, run);
      if (!isCurrent || met) {
        weeksTotal++;
        if (met) weeksMet++;
        if (fmt(w.plus({ days: 6 })) >= thirtyAgo) {
          weeksTotal30++;
          if (met) weeksMet30++;
        }
      }
      cur = run;
    }
    return {
      currentStreak: cur,
      longestStreak: longest,
      streakUnit: "weeks",
      rate30: weeksTotal30 ? weeksMet30 / weeksTotal30 : 0,
      rateAll: weeksTotal ? weeksMet / weeksTotal : 0,
      totalDone,
    };
  }

  const days = scheduledDays(habit);
  let run = 0;
  let longest = 0;
  let expected = 0;
  let done = 0;
  let expected30 = 0;
  let done30 = 0;
  for (let d = start; d <= end; d = d.plus({ days: 1 })) {
    if (days && !days.includes(d.weekday)) continue;
    const key = fmt(d);
    const status = byDate.get(key);
    const isToday = key === today;
    if (status === 2) continue; // skipped: neutral
    if (status === 1) {
      run++;
      longest = Math.max(longest, run);
      expected++;
      done++;
      if (key >= thirtyAgo) {
        expected30++;
        done30++;
      }
    } else if (!isToday) {
      run = 0;
      expected++;
      if (key >= thirtyAgo) expected30++;
    }
  }

  return {
    currentStreak: run,
    longestStreak: longest,
    streakUnit: "days",
    rate30: expected30 ? done30 / expected30 : 0,
    rateAll: expected ? done / expected : 0,
    totalDone,
  };
}
