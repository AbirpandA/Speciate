import { DayHabit } from "@/hooks/useDayHabits";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

/**
 * "Never miss twice": habits missed on their last scheduled day. Missing one
 * day is normal; the second miss is where a habit starts to slip.
 */
export default function AtRiskBanner({ habits }: { habits: DayHabit[] }) {
  if (habits.length === 0) return null;
  const first = habits[0];
  const others = habits.length - 1;
  return (
    <View
      className="rounded-3xl p-4 mb-5 flex-row"
      style={{ backgroundColor: theme.quitSoft, borderWidth: 1, borderColor: theme.quit + "40" }}
      accessibilityRole="summary"
    >
      <Ionicons name="alert-circle-outline" size={22} color={theme.quit} style={{ marginTop: 1 }} />
      <View className="flex-1 ml-3">
        <Text className="text-white font-semibold">
          Don&apos;t miss twice: {first.name}
          {others > 0 ? ` +${others} more` : ""}
        </Text>
        <Text className="text-fg-secondary text-sm mt-1 leading-5">
          {first.why
            ? `You said: “${first.why}”. Even a tiny version today keeps your ${first.streak}-day streak alive.`
            : `One missed day is normal. Even a tiny version today keeps your ${first.streak}-day streak alive.`}
        </Text>
      </View>
    </View>
  );
}
