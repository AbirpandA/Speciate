import type { Habit, HabitType, TimeOfDay } from "@/types/dbTypes";
import { invalidateHabitQueries } from "@/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";
import { Alert } from "react-native";

export type HabitInput = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: HabitType;
  target?: number;
  unit?: string | null;
  schedule_days?: number[] | null;
  times_per_week?: number | null;
  time_of_day?: TimeOfDay;
  cue?: string | null;
  why?: string | null;
  start_date?: string | null;
};

const EDITABLE_FIELDS = [
  "name",
  "description",
  "icon",
  "color",
  "type",
  "target",
  "unit",
  "schedule_days",
  "times_per_week",
  "time_of_day",
  "cue",
  "why",
  "start_date",
] as const;

function toDbValue(field: string, value: unknown) {
  if (field === "schedule_days") {
    return Array.isArray(value) && value.length > 0 && value.length < 7
      ? JSON.stringify(value)
      : null;
  }
  return (value ?? null) as any;
}

export const useHabits = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const invalidate = () => invalidateHabitQueries(queryClient);
  const onError = (what: string) => () =>
    Alert.alert("Error", `Failed to ${what}. Try again.`);

  const { data: habits = [], isLoading, error, refetch } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: () =>
      db.getAllAsync<Habit>(
        'SELECT * FROM habits WHERE active = 1 ORDER BY "order" ASC, id DESC'
      ),
  });

  const addHabitMutation = useMutation({
    mutationFn: async (input: HabitInput) => {
      if (!input.name.trim()) return;
      const now = DateTime.local();
      const maxOrder = await db.getFirstAsync<{ max_order: number }>(
        'SELECT COALESCE(MAX("order"), 0) as max_order FROM habits WHERE active = 1'
      );

      const values: Record<string, unknown> = {
        ...input,
        name: input.name.trim(),
        type: input.type ?? "build",
        time_of_day: input.time_of_day ?? "anytime",
        target: input.target ?? 1,
        start_date:
          input.type === "quit" ? input.start_date ?? now.toFormat("yyyy-MM-dd") : null,
      };
      const fields = EDITABLE_FIELDS.filter((f) => values[f] !== undefined);
      const cols = [...fields, "created_at", "frequency", "active", "order"];
      const params = [
        ...fields.map((f) => toDbValue(f, values[f])),
        now.toISO() ?? "",
        "daily",
        1,
        (maxOrder?.max_order ?? 0) + 1,
      ];
      const result = await db.runAsync(
        `INSERT INTO habits (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols
          .map(() => "?")
          .join(", ")})`,
        params
      );
      return result.lastInsertRowId;
    },
    onSuccess: invalidate,
    onError: onError("create habit"),
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, ...input }: Partial<HabitInput> & { id: number }) => {
      const fields = EDITABLE_FIELDS.filter((f) => (input as any)[f] !== undefined);
      if (fields.length === 0) return;
      await db.runAsync(
        `UPDATE habits SET ${fields.map((f) => `"${f}" = ?`).join(", ")} WHERE id = ?`,
        [...fields.map((f) => toDbValue(f, (input as any)[f])), id]
      );
    },
    onSuccess: invalidate,
    onError: onError("update habit"),
  });

  const reorderHabitsMutation = useMutation({
    mutationFn: async (habitIds: number[]) => {
      for (let i = 0; i < habitIds.length; i++) {
        await db.runAsync('UPDATE habits SET "order" = ? WHERE id = ?', [i + 1, habitIds[i]]);
      }
    },
    onSuccess: () => setTimeout(invalidate, 200),
    onError: onError("reorder habits"),
  });

  const setActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: 0 | 1 }) =>
      db.runAsync("UPDATE habits SET active = ? WHERE id = ?", [active, id]),
    onSuccess: invalidate,
    onError: onError("update habit"),
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (id: number) => db.runAsync("DELETE FROM habits WHERE id = ?", [id]),
    onSuccess: invalidate,
    onError: onError("delete habit"),
  });

  return {
    habits,
    isLoading,
    error,
    refetch,
    addHabit: (data: HabitInput) => addHabitMutation.mutate(data),
    addHabitAsync: (data: HabitInput) => addHabitMutation.mutateAsync(data),
    updateHabit: (data: Partial<HabitInput> & { id: number }) =>
      updateHabitMutation.mutate(data),
    reorderHabits: (habitIds: number[]) => reorderHabitsMutation.mutate(habitIds),
    archiveHabit: (id: number) => setActiveMutation.mutate({ id, active: 0 }),
    restoreHabit: (id: number) => setActiveMutation.mutate({ id, active: 1 }),
    deleteHabit: (id: number) => deleteHabitMutation.mutate(id),
  };
};

export const useArchivedHabits = () => {
  const db = useSQLiteContext();
  return useQuery<Habit[]>({
    queryKey: ["habits-archived"],
    queryFn: () =>
      db.getAllAsync<Habit>("SELECT * FROM habits WHERE active = 0 ORDER BY name ASC"),
  });
};
