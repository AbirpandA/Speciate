import { QuitHabit } from "@/hooks/useQuitHabits";
import { nextMilestone } from "@/utils/quitStats";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function QuitCard({
  habit,
  onPress,
}: {
  habit: QuitHabit;
  onPress: (h: QuitHabit) => void;
}) {
  const { currentDays } = habit.stats;
  const next = nextMilestone(currentDays);
  const color = habit.color || theme.quit;
  return (
    <Pressable
      onPress={() => onPress(habit)}
      accessibilityRole="button"
      accessibilityLabel={`${habit.name}: ${currentDays} days clean. Open details`}
      className="flex-row items-center rounded-3xl mb-3 p-3 bg-surface border border-line active:opacity-70"
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: color + "26" }}
      >
        <Ionicons name={(habit.icon as any) || "ban-outline"} size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-semibold" numberOfLines={1}>
          {habit.name}
        </Text>
        <Text className="text-muted text-sm mt-0.5" numberOfLines={1}>
          {next ? `${next - currentDays} day${next - currentDays === 1 ? "" : "s"} to ${next}-day milestone` : "Legendary run"}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-2xl font-bold" style={{ color }}>
          {currentDays}
        </Text>
        <Text className="text-muted text-xs">days clean</Text>
      </View>
    </Pressable>
  );
}
