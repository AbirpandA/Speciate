export const MIGRATION_003_SQL = `
CREATE TABLE IF NOT EXISTS daily_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_journal_date ON daily_journal(date);
`;
