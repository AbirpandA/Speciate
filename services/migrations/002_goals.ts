export const MIGRATION_002_SQL = `
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  timeframe TEXT CHECK (timeframe IN ('weekly', 'monthly', 'long_term')),
  status INTEGER NOT NULL DEFAULT 0,
  deadline TEXT,
  created_at TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_goals_timeframe ON goals(timeframe);
`;
