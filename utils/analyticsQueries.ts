import { SQLiteDatabase } from 'expo-sqlite';
import { DateTime } from 'luxon';

export interface ChartDataPoint {
  date: string;
  label: string;
  value: number;
}

export async function getWeeklyCompletionData(db: SQLiteDatabase): Promise<ChartDataPoint[]> {
  const today = DateTime.now().startOf('day');
  const data: ChartDataPoint[] = [];

  // Generate the last 7 days including today
  for (let i = 6; i >= 0; i--) {
    const d = today.minus({ days: i });
    const dateStr = d.toISODate();
    
    // SQLite can get count of completed entries for this date
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM habits_entry WHERE date = ? AND status = 1",
        [dateStr]
      );
      
      data.push({
        date: dateStr,
        label: d.toFormat('ccc'), // Mon, Tue, Wed
        value: result?.count || 0
      });
    } catch (e) {
      console.error(e);
      data.push({
        date: dateStr,
        label: d.toFormat('ccc'),
        value: 0
      });
    }
  }

  return data;
}
