import { calculateHabitStats } from "../habitStats";
import { calculateQuitStats } from "../quitStats";

const daily = { created_at: "2024-01-01T08:00:00.000Z" };
const done = (...dates: string[]) => dates.map((date) => ({ date, status: 1 }));

describe("calculateHabitStats (daily)", () => {
  it("counts a run ending today", () => {
    const s = calculateHabitStats(daily, done("2024-01-08", "2024-01-09", "2024-01-10"), "2024-01-10");
    expect(s.currentStreak).toBe(3);
    expect(s.longestStreak).toBe(3);
  });

  it("does not break the streak while today is unlogged", () => {
    const s = calculateHabitStats(daily, done("2024-01-08", "2024-01-09"), "2024-01-10");
    expect(s.currentStreak).toBe(2);
  });

  it("breaks on a missed past day", () => {
    const s = calculateHabitStats(daily, done("2024-01-06", "2024-01-07", "2024-01-09"), "2024-01-10");
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(2);
  });

  it("treats skipped days as neutral", () => {
    const entries = [...done("2024-01-08"), { date: "2024-01-09", status: 2 }, ...done("2024-01-10")];
    const s = calculateHabitStats({ created_at: "2024-01-08" }, entries, "2024-01-10");
    expect(s.currentStreak).toBe(2);
    expect(s.rateAll).toBe(1);
  });
});

describe("calculateHabitStats (weekday schedule)", () => {
  // Mon-Fri only. 2024-01-12 is a Friday, 2024-01-15 is a Monday.
  const weekdays = { created_at: "2024-01-08", schedule_days: "[1,2,3,4,5]" };

  it("ignores unscheduled weekend days", () => {
    const s = calculateHabitStats(weekdays, done("2024-01-11", "2024-01-12", "2024-01-15"), "2024-01-15");
    expect(s.currentStreak).toBe(3);
  });
});

describe("calculateHabitStats (times per week)", () => {
  const tpw = { created_at: "2024-01-01", times_per_week: 3 };

  it("counts met weeks and keeps the in-progress week from breaking", () => {
    const entries = done(
      "2024-01-01", "2024-01-03", "2024-01-05", // week 1: met
      "2024-01-08", "2024-01-09", "2024-01-10", // week 2: met
      "2024-01-15" // week 3: in progress
    );
    const s = calculateHabitStats(tpw, entries, "2024-01-16");
    expect(s.streakUnit).toBe("weeks");
    expect(s.currentStreak).toBe(2);
  });
});

describe("calculateQuitStats", () => {
  it("counts days since start with no slips", () => {
    const s = calculateQuitStats("2024-01-01", [], "2024-01-11");
    expect(s.currentDays).toBe(10);
    expect(s.bestDays).toBe(10);
  });

  it("resets after a slip but keeps best and total", () => {
    const s = calculateQuitStats("2024-01-01", ["2024-01-08"], "2024-01-11");
    expect(s.bestDays).toBe(7);
    expect(s.currentDays).toBe(2); // run restarts Jan 9: Jan 9 + Jan 10 complete
    expect(s.totalCleanDays).toBe(9);
    expect(s.slips).toBe(1);
  });
});
