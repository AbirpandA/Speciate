import type { SQLiteDatabase } from "expo-sqlite";
import { INIT_SQL } from "./migrations/001_init";
import { MIGRATION_002_SQL } from "./migrations/002_goals";
import { MIGRATION_003_SQL } from "./migrations/003_journal";
import { migrate004 } from "./migrations/004_v3";

export const DATABASE_VERSION = 4;

type Step = (db: SQLiteDatabase) => Promise<void>;

// Index i migrates from version i to version i + 1. Every step must be
// idempotent: a crash between running a step and saving the new version
// means the step runs again on the next launch.
const STEPS: Step[] = [
  (db) => db.execAsync(INIT_SQL),
  (db) => db.execAsync(MIGRATION_002_SQL),
  (db) => db.execAsync(MIGRATION_003_SQL),
  migrate004,
];

/** Run a step in its own transaction, rolling back cleanly on failure. */
async function runInTransaction(db: SQLiteDatabase, step: Step) {
  await db.execAsync("BEGIN;");
  try {
    await step(db);
    await db.execAsync("COMMIT;");
  } catch (error) {
    try {
      await db.execAsync("ROLLBACK;");
    } catch {
      // SQLite may already have rolled back on its own; keep the original error.
    }
    throw error;
  }
}

async function runMigrations(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let version = result?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version === 0) {
    await db.execAsync(`PRAGMA journal_mode = 'wal';`);
  }

  // Table rebuilds need foreign keys off; the pragma is ignored inside a
  // transaction, so set it around the whole run.
  await db.execAsync("PRAGMA foreign_keys = OFF;");
  try {
    while (version < DATABASE_VERSION) {
      await runInTransaction(db, STEPS[version]);
      version += 1;
      await db.execAsync(`PRAGMA user_version = ${version}`);
    }
  } finally {
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
}

// One migration at a time per database, even if the provider calls onInit twice.
const inFlight = new WeakMap<SQLiteDatabase, Promise<void>>();

export function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const running = inFlight.get(db);
  if (running) return running;
  const promise = runMigrations(db).finally(() => inFlight.delete(db));
  inFlight.set(db, promise);
  return promise;
}
