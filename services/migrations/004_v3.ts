import type { SQLiteDatabase } from "expo-sqlite";

// Migration 004 (v3): build/quit habits, flexible schedules, richer entries,
// urge/slip events for quit habits, and journal mood.
//
// Written step-by-step and idempotent so a partially applied run (crash,
// killed app, double start) can simply be re-run on the next launch.
//
// habits_entry is rebuilt because SQLite cannot alter the original
// CHECK (status IN (0, 1)) constraint. New status meanings:
//   0 = not done / missed, 1 = done, 2 = skipped (neutral for streaks)

const HABIT_COLUMNS: [string, string][] = [
  ["type", "TEXT NOT NULL DEFAULT 'build'"],
  ["schedule_days", "TEXT"],
  ["times_per_week", "INTEGER"],
  ["time_of_day", "TEXT NOT NULL DEFAULT 'anytime'"],
  ["cue", "TEXT"],
  ["why", "TEXT"],
  ["unit", "TEXT"],
  ["start_date", "TEXT"],
];

const HABITS_ENTRY_V3 = `
CREATE TABLE habits_entry_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status INTEGER NOT NULL CHECK (status IN (0, 1, 2)),
  value INTEGER,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);`;

async function columns(db: SQLiteDatabase, table: string): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return new Set(rows.map((r) => r.name));
}

async function tableExists(db: SQLiteDatabase, name: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [name]
  );
  return (row?.n ?? 0) > 0;
}

/** Statements to run inside a transaction. Must be safe to re-run. */
export async function migrate004(db: SQLiteDatabase) {
  // 1. New habit columns
  const habitCols = await columns(db, "habits");
  for (const [name, def] of HABIT_COLUMNS) {
    if (!habitCols.has(name)) {
      await db.execAsync(`ALTER TABLE habits ADD COLUMN "${name}" ${def};`);
    }
  }

  // 2. Rebuild habits_entry (new status values + value/note columns)
  const entryCols = await columns(db, "habits_entry");
  if (!entryCols.has("value")) {
    await db.execAsync(`DROP TABLE IF EXISTS habits_entry_new;`);
    await db.execAsync(HABITS_ENTRY_V3);
    await db.execAsync(`
      INSERT INTO habits_entry_new (id, habit_id, date, status, created_at, updated_at)
        SELECT id, habit_id, date, status, created_at, updated_at FROM habits_entry;
      DROP TABLE habits_entry;
      ALTER TABLE habits_entry_new RENAME TO habits_entry;
    `);
  } else if (await tableExists(db, "habits_entry_new")) {
    await db.execAsync(`DROP TABLE habits_entry_new;`);
  }
  await db.execAsync(
    `CREATE INDEX IF NOT EXISTS idx_entry_habit_date ON habits_entry (habit_id, date);`
  );

  // 3. Urge / slip events for quit habits
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('urge', 'slip')),
      intensity INTEGER,
      "trigger" TEXT,
      note TEXT,
      resisted INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_events_habit ON habit_events (habit_id, created_at);
  `);

  // 4. Journal mood
  if (!(await columns(db, "daily_journal")).has("mood")) {
    await db.execAsync(`ALTER TABLE daily_journal ADD COLUMN mood INTEGER;`);
  }
}
