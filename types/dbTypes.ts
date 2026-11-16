export type HabitType = "build" | "quit";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";

export type Habit = {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  target?: number; // count target per day (e.g. 8 glasses). 0/1 = simple check
  active: number; // 1 active, 0 archived
  order?: number; // order for sorting habits
  // v3
  type: HabitType; // "build" = a do, "quit" = a don't
  schedule_days?: string | null; // JSON array of weekdays 1-7 (Mon-Sun); null = every day
  times_per_week?: number | null; // flexible "X times per week" schedule
  time_of_day: TimeOfDay;
  cue?: string | null; // implementation intention: "After I ..."
  why?: string | null; // personal reason
  unit?: string | null; // unit for count targets (e.g. "glasses")
  start_date?: string | null; // quit habits: clean-since date (YYYY-MM-DD)
};

/** 0 = not done, 1 = done, 2 = skipped */
export type EntryStatus = 0 | 1 | 2;

// export type HabitEntry = {
//   id: number;
//   habit_id: number;
//   date: string; // YYYY-MM-DD
//   status: 0 | 1; // checked or unchecked
//   created_at: string;
//   updated_at?: string;
// };
export type HabitEntryRow = {
  id: number;
  habit_id: number;
  date: string;
  status: number; // EntryStatus, but SQLite returns number
  value: number | null;
  note: string | null;
  created_at: string;
  updated_at: string | null;
};

export type HabitEvent = {
  id: number;
  habit_id: number;
  kind: "urge" | "slip";
  intensity: number | null;
  trigger: string | null;
  note: string | null;
  resisted: number | null;
  created_at: string;
};

export type HeatmapRow = {
  id: number;
  habit_id: number;
  week_start: string; // YYYY-MM-DD
  statuses: 0 | 1 | null; // JSON string or null
};
export type ParsedHeatmapEntry = {
  week_start: string;
  statuses: string | null;
};
export type HabitWithWeeklyEntries = Habit & {
  entries: ParsedHeatmapEntry[];
};

export type User = {
  id: 1;
  is_pro: number; // 0 = free, 1 = pro
  pro_type?: "monthly" | "yearly" | "lifetime";
  pro_expiry?: string | null;
  created_at: string;
  updated_at?: string;
};

export type SubscriptionHistory = {
  id: number;
  purchase_type: "monthly" | "yearly" | "lifetime";
  purchase_token?: string;
  start_date: string;
  end_date?: string | null;
  created_at: string;
};

export type Goal = {
  id: number;
  title: string;
  timeframe: "weekly" | "monthly" | "long_term";
  status: number; // 0 = active, 1 = completed
  deadline?: string | null;
  created_at: string;
  order: number;
};

export type JournalEntry = {
  id: number;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: number | null; // 1-5
  created_at: string;
  updated_at?: string | null;
};
