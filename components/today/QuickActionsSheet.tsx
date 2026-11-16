import BottomSheetModal from "@/components/BottomSheetModal";
import { DayHabit } from "@/hooks/useDayHabits";
import { dailyTarget } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Action = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
};

export default function QuickActionsSheet({
  habit,
  onClose,
  onSkip,
  onReset,
  onEdit,
  onDetails,
  onSetCount,
  onReorder,
}: {
  habit: DayHabit | null;
  onClose: () => void;
  onSkip: (h: DayHabit) => void;
  onReset: (h: DayHabit) => void;
  onEdit: (h: DayHabit) => void;
  onDetails: (h: DayHabit) => void;
  onSetCount: (h: DayHabit) => void;
  onReorder: () => void;
}) {
  if (!habit) return null;
  const run = (fn: () => void) => () => {
    onClose();
    fn();
  };
  const actions: Action[] = [
    { icon: "stats-chart-outline", label: "View details & history", onPress: run(() => onDetails(habit)) },
    ...(dailyTarget(habit) > 1
      ? [{ icon: "keypad-outline" as const, label: "Set count…", onPress: run(() => onSetCount(habit)) }]
      : []),
    habit.entry_status === 2
      ? { icon: "arrow-undo-outline", label: "Undo skip", onPress: run(() => onReset(habit)) }
      : { icon: "play-skip-forward-outline", label: "Skip (won't break streak)", onPress: run(() => onSkip(habit)) },
    ...(habit.entry_status != null && habit.entry_status !== 2
      ? [{ icon: "refresh-outline" as const, label: "Reset", onPress: run(() => onReset(habit)) }]
      : []),
    { icon: "create-outline", label: "Edit habit", onPress: run(() => onEdit(habit)) },
    { icon: "swap-vertical-outline", label: "Reorder habits", onPress: run(onReorder) },
  ];

  return (
    <BottomSheetModal visible onClose={onClose}>
      <View className="w-10 h-1 rounded-full bg-line-strong self-center mb-4" />
      <Text className="text-white text-xl font-bold mb-4" numberOfLines={1}>
        {habit.name}
      </Text>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          onPress={a.onPress}
          accessibilityRole="button"
          className="flex-row items-center py-3.5 active:opacity-60"
        >
          <Ionicons name={a.icon} size={22} color={theme.textSecondary} />
          <Text className="text-white text-base ml-4">{a.label}</Text>
        </Pressable>
      ))}
      <View className="h-4" />
    </BottomSheetModal>
  );
}
