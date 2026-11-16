import type { Habit } from "@/types/dbTypes";
import { dailyRatios, moodVsCompletion, triggerCounts, urgeSummary, weekdayRates, weekScores } from "../insights";

const habit = (id: number, extra: Partial<Habit> = {}): Habit =>
  ({ id, name: `H${id}`, created_at: "2024-01-01", active: 1, type: "build", time_of_day: "anytime", ...extra }) as Habit;

describe("insights", () => {
  // 2024-01-08 is a Monday
  const habits = [habit(1), habit(2, { schedule_days: "[1,3,5]" }), habit(3, { times_per_week: 3 })];
  const entries = [
    { habit_id: 1, date: "2024-01-08", status: 1 },
    { habit_id: 2, date: "2024-01-08", status: 1 },
    { habit_id: 1, date: "2024-01-09", status: 2 }, // skipped
    { habit_id: 3, date: "2024-01-09", status: 1 }, // times-per-week: ignored
  ];

  it("computes daily ratios with schedules and skips", () => {
    const days = dailyRatios(habits, entries, "2024-01-08", "2024-01-10");
    expect(days).toEqual([
      { date: "2024-01-08", done: 2, expected: 2 },
      { date: "2024-01-09", done: 0, expected: 0 },
      { date: "2024-01-10", done: 0, expected: 2 },
    ]);
  });

  it("scores this week vs last week", () => {
    const days = dailyRatios(habits, entries, "2024-01-01", "2024-01-10");
    const s = weekScores(days, "2024-01-10");
    expect(s.thisWeek).toBe(0.5);
    expect(s.lastWeek).toBe(0);
  });

  it("rates weekdays (Monday first)", () => {
    const r = weekdayRates(dailyRatios(habits, entries, "2024-01-08", "2024-01-10"));
    expect(r[0]).toBe(1);
    expect(r[1]).toBeNull();
    expect(r[2]).toBe(0);
  });

  it("summarises urges, slips and triggers", () => {
    const ev = (kind: "urge" | "slip", resisted: number | null, trigger: string | null) =>
      ({ id: 0, habit_id: 1, kind, resisted, trigger, intensity: null, note: null, created_at: "" });
    const events = [ev("urge", 1, "Stress"), ev("urge", 0, "Stress"), ev("slip", null, "Stress"), ev("urge", 1, "Boredom")];
    expect(urgeSummary(events)).toEqual({ resisted: 2, gaveIn: 1, slips: 1 });
    expect(triggerCounts(events)[0]).toEqual({ trigger: "Stress", count: 3 });
  });

  it("relates mood to completion", () => {
    const days = [
      { date: "a", done: 1, expected: 2 },
      { date: "b", done: 2, expected: 2 },
    ];
    const r = moodVsCompletion(days, [{ date: "a", mood: 2 }, { date: "b", mood: 5 }]);
    expect(r[1].rate).toBe(0.5);
    expect(r[4].rate).toBe(1);
    expect(r[0].rate).toBeNull();
  });
});
