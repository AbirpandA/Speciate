import type { HabitType, TimeOfDay } from "@/types/dbTypes";

export type FocusArea = "health" | "mind" | "productivity" | "fitness" | "sleep" | "relationships";

export const FOCUS_AREAS: { id: FocusArea; label: string; icon: string }[] = [
  { id: "health", label: "Health", icon: "nutrition-outline" },
  { id: "mind", label: "Mind", icon: "leaf-outline" },
  { id: "productivity", label: "Productivity", icon: "rocket-outline" },
  { id: "fitness", label: "Fitness", icon: "barbell-outline" },
  { id: "sleep", label: "Sleep", icon: "moon-outline" },
  { id: "relationships", label: "Relationships", icon: "people-outline" },
];

export type HabitTemplate = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: HabitType;
  focus?: FocusArea;
  time_of_day?: TimeOfDay;
  cue?: string;
  target?: number;
  unit?: string;
  schedule_days?: number[];
  times_per_week?: number;
};

// Small, specific starter versions: easy to start beats ambitious and abandoned.
export const BUILD_TEMPLATES: HabitTemplate[] = [
  { id: "water", name: "Drink water", icon: "water-outline", color: "#4D96FF", type: "build", focus: "health", time_of_day: "anytime", target: 8, unit: "glasses" },
  { id: "veg", name: "Eat a vegetable", icon: "nutrition-outline", color: "#6BCB77", type: "build", focus: "health", time_of_day: "afternoon", cue: "With lunch" },
  { id: "vitamins", name: "Take vitamins", icon: "medkit-outline", color: "#FF9F1C", type: "build", focus: "health", time_of_day: "morning", cue: "After I brush my teeth" },
  { id: "meditate", name: "Meditate 5 minutes", icon: "leaf-outline", color: "#6BCB77", type: "build", focus: "mind", time_of_day: "morning", cue: "After my morning coffee" },
  { id: "read", name: "Read 10 pages", icon: "book-outline", color: "#C56CF0", type: "build", focus: "mind", time_of_day: "evening", cue: "After dinner" },
  { id: "gratitude", name: "Write 3 things I'm grateful for", icon: "create-outline", color: "#FFD93D", type: "build", focus: "mind", time_of_day: "evening", cue: "Before bed" },
  { id: "plan", name: "Plan tomorrow", icon: "list-outline", color: "#4D96FF", type: "build", focus: "productivity", time_of_day: "evening", cue: "When I finish work", schedule_days: [1, 2, 3, 4, 5] },
  { id: "deepwork", name: "One focused hour", icon: "timer-outline", color: "#6A67CE", type: "build", focus: "productivity", time_of_day: "morning", schedule_days: [1, 2, 3, 4, 5] },
  { id: "inbox", name: "Clear my inbox", icon: "mail-outline", color: "#A5A6F6", type: "build", focus: "productivity", time_of_day: "afternoon", schedule_days: [1, 2, 3, 4, 5] },
  { id: "walk", name: "Walk 20 minutes", icon: "walk-outline", color: "#6BCB77", type: "build", focus: "fitness", time_of_day: "afternoon", cue: "After lunch" },
  { id: "workout", name: "Work out", icon: "barbell-outline", color: "#FF6B6B", type: "build", focus: "fitness", time_of_day: "morning", times_per_week: 3 },
  { id: "stretch", name: "Stretch 5 minutes", icon: "body-outline", color: "#F78DA7", type: "build", focus: "fitness", time_of_day: "morning", cue: "After I get out of bed" },
  { id: "bedtime", name: "In bed by 11", icon: "bed-outline", color: "#6A67CE", type: "build", focus: "sleep", time_of_day: "evening" },
  { id: "noscreens", name: "No screens 30 min before bed", icon: "moon-outline", color: "#A8A4CE", type: "build", focus: "sleep", time_of_day: "evening", cue: "When I plug in my phone for the night" },
  { id: "sunlight", name: "Morning sunlight", icon: "sunny-outline", color: "#FFD93D", type: "build", focus: "sleep", time_of_day: "morning", cue: "After I wake up" },
  { id: "callfamily", name: "Call family or a friend", icon: "call-outline", color: "#F78DA7", type: "build", focus: "relationships", time_of_day: "evening", times_per_week: 2 },
  { id: "kind", name: "Do one kind thing", icon: "heart-outline", color: "#FF6B6B", type: "build", focus: "relationships", time_of_day: "anytime" },
  { id: "phonefree", name: "Phone-free meal", icon: "restaurant-outline", color: "#FF9F1C", type: "build", focus: "relationships", time_of_day: "evening" },
];

export const QUIT_TEMPLATES: HabitTemplate[] = [
  { id: "scroll", name: "Doomscrolling", icon: "phone-portrait-outline", color: "#FF9F1C", type: "quit", cue: "Put the phone in another room and stretch" },
  { id: "smoke", name: "Smoking", icon: "flame-outline", color: "#FF6B6B", type: "quit", cue: "Drink a glass of water and take 10 slow breaths" },
  { id: "junk", name: "Junk food", icon: "fast-food-outline", color: "#FFD93D", type: "quit", cue: "Eat a piece of fruit first" },
  { id: "procrastinate", name: "Procrastinating", icon: "hourglass-outline", color: "#6A67CE", type: "quit", cue: "Do just the first 2 minutes of the task" },
  { id: "alcohol", name: "Drinking alcohol", icon: "wine-outline", color: "#C56CF0", type: "quit", cue: "Make a sparkling water or tea instead" },
  { id: "sugar", name: "Sugary drinks", icon: "cafe-outline", color: "#F78DA7", type: "quit", cue: "Have sparkling water with lemon" },
  { id: "nails", name: "Nail biting", icon: "hand-left-outline", color: "#A5A6F6", type: "quit", cue: "Squeeze a stress ball or clasp my hands" },
  { id: "latenight", name: "Late-night snacking", icon: "moon-outline", color: "#4D96FF", type: "quit", cue: "Brush my teeth right after dinner" },
];

/** Suggested starters for the chosen focus areas (two per area, max six). */
export function suggestBuildTemplates(areas: FocusArea[]): HabitTemplate[] {
  const picks = areas.flatMap((a) => BUILD_TEMPLATES.filter((t) => t.focus === a).slice(0, 2));
  return (picks.length ? picks : BUILD_TEMPLATES.slice(0, 4)).slice(0, 6);
}
