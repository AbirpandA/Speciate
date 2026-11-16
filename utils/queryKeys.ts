import type { QueryClient } from "@tanstack/react-query";

/** Every query whose data depends on habits or their entries. */
const HABIT_QUERY_ROOTS = [
  "habits",
  "habits-archived",
  "habits-day",
  "habit-detail",
  "habit-entries",
  "week-progress",
  "heatmap-weekly",
  "heatmap-monthly",
  "heatmap-overall",
  "analytics",
];

export function invalidateHabitQueries(queryClient: QueryClient) {
  for (const key of HABIT_QUERY_ROOTS) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}
