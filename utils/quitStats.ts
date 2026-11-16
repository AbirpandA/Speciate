import { DateTime } from "luxon";

export type QuitStats = {
  /** whole days since the clean start or the most recent slip */
  currentDays: number;
  bestDays: number;
  /** total clean days since start (days without a slip) */
  totalCleanDays: number;
  slips: number;
  /** ISO date the current run started */
  since: string;
};

export const QUIT_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

/**
 * Days-clean math for a quit habit. A slip on day D resets the run; the new
 * run starts the day after the slip.
 */
export function calculateQuitStats(
  startDate: string,
  slipDates: string[],
  today: string = DateTime.local().toFormat("yyyy-MM-dd")
): QuitStats {
  const start = DateTime.fromISO(startDate).startOf("day");
  const now = DateTime.fromISO(today).startOf("day");
  const slips = Array.from(new Set(slipDates.map((d) => d.slice(0, 10))))
    .filter((d) => d >= startDate && d <= today)
    .sort();

  let runStart = start;
  let best = 0;
  for (const s of slips) {
    const slipDay = DateTime.fromISO(s).startOf("day");
    best = Math.max(best, Math.round(slipDay.diff(runStart, "days").days));
    runStart = slipDay.plus({ days: 1 });
  }
  const current = Math.max(0, Math.round(now.diff(runStart, "days").days));
  const totalDays = Math.max(0, Math.round(now.diff(start, "days").days));

  return {
    currentDays: current,
    bestDays: Math.max(best, current),
    totalCleanDays: Math.max(0, totalDays - slips.length),
    slips: slips.length,
    since: runStart.toFormat("yyyy-MM-dd"),
  };
}

export function nextMilestone(days: number): number | null {
  return QUIT_MILESTONES.find((m) => m > days) ?? null;
}
