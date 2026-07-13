import { Goal } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

export const useGoals = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const t = getDateInfo();

  // Get all goals ordered by timeframe and order
  const {
    data: goals = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      // Create table if it doesn't exist yet (just in case migration hasn't fired)
      try {
        const rows = await db.getAllAsync<Goal>(
          'SELECT * FROM goals ORDER BY "order" ASC, id DESC'
        );
        return rows;
      } catch (e) {
        return [];
      }
    },
  });

  // Create Goal
  const addGoalMutation = useMutation({
    mutationFn: async ({
      title,
      timeframe,
      deadline,
    }: {
      title: string;
      timeframe: "weekly" | "monthly" | "long_term";
      deadline?: string;
    }) => {
      if (!title.trim()) {
        Alert.alert("Validation", "Goal title cannot be empty.");
        return;
      }

      const createdAt = t.isoTimestamp;

      // Get max order
      const maxOrderResult = await db.getFirstAsync<{ max_order: number }>(
        'SELECT COALESCE(MAX("order"), 0) as max_order FROM goals WHERE timeframe = ?',
        [timeframe]
      );
      const newOrder = (maxOrderResult?.max_order ?? 0) + 1;

      await db.runAsync(
        'INSERT INTO goals (title, timeframe, status, deadline, created_at, "order") VALUES (?, ?, ?, ?, ?, ?)',
        [title, timeframe, 0, deadline ?? null, createdAt, newOrder]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (e) => {
      console.error(e);
      Alert.alert("Error", "Failed to create goal. Try again.");
    },
  });

  // Toggle Goal Status
  const toggleGoalMutation = useMutation({
    mutationFn: async (goal: Goal) => {
      const newStatus = goal.status === 0 ? 1 : 0;
      await db.runAsync("UPDATE goals SET status = ? WHERE id = ?", [
        newStatus,
        goal.id,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update goal. Try again.");
    },
  });

  // Delete Goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.runAsync("DELETE FROM goals WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete goal. Try again.");
    },
  });

  return {
    goals,
    isLoading,
    error,
    refetch,
    addGoal: (data: {
      title: string;
      timeframe: "weekly" | "monthly" | "long_term";
      deadline?: string;
    }) => addGoalMutation.mutate(data),
    toggleGoal: (goal: Goal) => toggleGoalMutation.mutate(goal),
    deleteGoal: (id: number) => deleteGoalMutation.mutate(id),
  };
};
