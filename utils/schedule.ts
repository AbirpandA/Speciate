import type { Habit, TimeOfDay } from "@/types/dbTypes";
import { DateTime } from "luxon";

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function parseScheduleDays(habit: Pick<Habit, "schedule_days">): number[] | null {
  if (!habit.schedule_days) return null;
  try {
    const days = JSON.parse(habit.schedule_days);
    return Array.isArray(days) && days.length > 0 && days.length < 7 ? days : null;
  } catch {
    return null;
  }
}

/** Is a build habit expected on this date? Quit habits apply every day. */
export function isScheduledOn(habit: Habit, date: string): boolean {
  if (date < habit.created_at.slice(0, 10)) return false;
  const days = parseScheduleDays(habit);
  if (!days) return true;
  return days.includes(DateTime.fromISO(date).weekday);
}

export function describeSchedule(habit: Habit): string {
  if (habit.type === "quit") return "Every day";
  if (habit.times_per_week) return `${habit.times_per_week}× per week`;
  const days = parseScheduleDays(habit);
  if (!days) return "Every day";
  const sorted = [...days].sort();
  if (sorted.join() === "1,2,3,4,5") return "Weekdays";
  if (sorted.join() === "6,7") return "Weekends";
  return sorted.map((d) => WEEKDAY_LABELS[d - 1]).join(", ");
}

export const TIME_OF_DAY_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening", "anytime"];

export const TIME_OF_DAY_META: Record<TimeOfDay, { label: string; icon: string }> = {
  morning: { label: "Morning", icon: "sunny-outline" },
  afternoon: { label: "Afternoon", icon: "partly-sunny-outline" },
  evening: { label: "Evening", icon: "moon-outline" },
  anytime: { label: "Anytime", icon: "time-outline" },
};

/** Count target for the day; 1 means a simple done/not-done check. */
export function dailyTarget(habit: Habit): number {
  return habit.target && habit.target > 1 ? habit.target : 1;
}
