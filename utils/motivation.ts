export function greeting(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Winding down";
}

const START_LINES = [
  "Small steps every day lead to big changes.",
  "You don't have to be perfect, just consistent.",
  "Make it easy to start. Two minutes counts.",
  "Every check-in is a vote for who you're becoming.",
];
const PROGRESS_LINES = [
  "Nice momentum. Keep it rolling.",
  "You're showing up. That's the hard part.",
  "One more is closer than you think.",
];
const LATE_LINES = [
  "There's still time. Pick the easiest one.",
  "A small version still counts tonight.",
];
const PAST_LINES = ["Logging honestly helps you see the real pattern."];

export type DayContext = {
  done: number;
  total: number;
  hour: number;
  isToday: boolean;
  dayOfYear: number;
};

/** Pick a line that fits the day. Stable for a given day so it doesn't flicker. */
export function motivationLine({ done, total, hour, isToday, dayOfYear }: DayContext): string {
  const pick = (lines: string[]) => lines[dayOfYear % lines.length];
  if (total === 0) return "Add a habit to start shaping your day.";
  if (!isToday) return pick(PAST_LINES);
  if (done >= total) return "Every habit done today. Well earned. 🌱";
  if (done === 0 && hour >= 19) return pick(LATE_LINES);
  if (done === 0) return pick(START_LINES);
  if (total - done === 1) return "Just one left. Finish strong.";
  return pick(PROGRESS_LINES);
}
