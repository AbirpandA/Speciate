import { HabitEntryRow } from "../types/dbTypes";
import { DateTime } from "luxon";

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
};

/**
 * Calculates the current and longest streak from a list of habit entries.
 * Entries should be for a specific habit and should be in descending date order or we sort them.
 */
export const calculateStreaks = (
  entries: { date: string; status: number }[],
  frequency: "daily" | "weekly" | "monthly" | "custom" = "daily"
): StreakData => {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Filter only completed entries
  const completedEntries = entries.filter((e) => e.status === 1);

  if (completedEntries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort dates descending
  const sortedDates = completedEntries
    .map((e) => e.date)
    .sort((a, b) => b.localeCompare(a));

  // Remove duplicates just in case
  const uniqueDates = Array.from(new Set(sortedDates));

  if (frequency === "daily") {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = DateTime.now().startOf("day");
    const yesterday = today.minus({ days: 1 });
    
    const firstDate = DateTime.fromISO(uniqueDates[0]).startOf("day");
    const isStreakActive = firstDate.equals(today) || firstDate.equals(yesterday);

    let previousDate: DateTime | null = null;

    // Iterate through dates from most recent to oldest
    for (let i = 0; i < uniqueDates.length; i++) {
      const entryDate = DateTime.fromISO(uniqueDates[i]).startOf("day");

      if (i === 0) {
        tempStreak = 1;
      } else if (previousDate) {
        const diffInDays = previousDate.diff(entryDate, "days").days;

        if (Math.round(diffInDays) === 1) {
          tempStreak++;
        } else {
          // Break in streak
          if (isStreakActive && currentStreak === 0) {
            currentStreak = tempStreak;
          }
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1; // reset for the next block
        }
      }
      previousDate = entryDate;
    }

    // Finalize
    if (isStreakActive && currentStreak === 0) {
        currentStreak = tempStreak;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  // For weekly/monthly, keeping it simple
  return {
    currentStreak: completedEntries.length,
    longestStreak: completedEntries.length,
  };
};
