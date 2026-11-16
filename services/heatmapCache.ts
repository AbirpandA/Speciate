import type { SQLiteDatabase } from "expo-sqlite";
import { DateTime } from "luxon";

type CacheStatus = 0 | 1 | 2 | null;

/** Write one day's status into the weekly habit_heatmap cache row. */
export async function writeHeatmapDay(
  db: SQLiteDatabase,
  habitId: number,
  date: string,
  status: CacheStatus
) {
  const iso = DateTime.local().toISO() ?? "";
  const dt = DateTime.fromISO(date);
  const weekStart = dt.startOf("week").toFormat("yyyy-MM-dd");
  const weekdayIndex = dt.weekday - 1;

  const row = await db.getFirstAsync<{ statuses: string | null }>(
    `SELECT statuses FROM habit_heatmap WHERE habit_id=? AND week_start=?`,
    [habitId, weekStart]
  );

  let statuses: CacheStatus[] = Array(7).fill(null);
  if (row?.statuses != null) statuses = JSON.parse(String(row.statuses));
  statuses[weekdayIndex] = status;
  const str = JSON.stringify(statuses);

  if (row) {
    await db.runAsync(
      `UPDATE habit_heatmap SET statuses=?, updated_at=? WHERE habit_id=? AND week_start=?`,
      [str, iso, habitId, weekStart]
    );
  } else {
    await db.runAsync(
      `INSERT INTO habit_heatmap (habit_id, week_start, statuses, updated_at) VALUES (?, ?, ?, ?)`,
      [habitId, weekStart, str, iso]
    );
  }
}

/** Rebuild the whole habit_heatmap cache from habits_entry (e.g. after import). */
export async function rebuildHeatmapCache(db: SQLiteDatabase) {
  const entries = await db.getAllAsync<{
    habit_id: number;
    date: string;
    status: number;
  }>(`SELECT habit_id, date, status FROM habits_entry`);

  const weeks = new Map<string, CacheStatus[]>();
  for (const e of entries) {
    const dt = DateTime.fromISO(e.date);
    const weekStart = dt.startOf("week").toFormat("yyyy-MM-dd");
    const key = `${e.habit_id}|${weekStart}`;
    const arr = weeks.get(key) ?? Array(7).fill(null);
    arr[dt.weekday - 1] = e.status as CacheStatus;
    weeks.set(key, arr);
  }

  const iso = DateTime.local().toISO() ?? "";
  await db.execAsync(`DELETE FROM habit_heatmap;`);
  for (const [key, statuses] of weeks) {
    const [habitId, weekStart] = key.split("|");
    await db.runAsync(
      `INSERT INTO habit_heatmap (habit_id, week_start, statuses, updated_at) VALUES (?, ?, ?, ?)`,
      [Number(habitId), weekStart, JSON.stringify(statuses), iso]
    );
  }
}
