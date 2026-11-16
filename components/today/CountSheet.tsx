import BottomSheetModal from "@/components/BottomSheetModal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Stepper from "@/components/ui/Stepper";
import { DayHabit } from "@/hooks/useDayHabits";
import { dailyTarget } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import React, { useState } from "react";
import { Text, View } from "react-native";

/** Set a count habit's value directly (mounted per habit via `key`). */
export default function CountSheet({
  habit,
  onClose,
  onSave,
}: {
  habit: DayHabit | null;
  onClose: () => void;
  onSave: (h: DayHabit, value: number) => void;
}) {
  const target = habit ? dailyTarget(habit) : 1;
  const [value, setValue] = useState(
    habit ? habit.entry_value ?? (habit.entry_status === 1 ? target : 0) : 0
  );
  if (!habit) return null;
  const color = habit.color || theme.accent;
  return (
    <BottomSheetModal visible onClose={onClose}>
      <View className="w-10 h-1 rounded-full bg-line-strong self-center mb-4" />
      <Text className="text-white text-xl font-bold" numberOfLines={1}>
        {habit.name}
      </Text>
      <Text className="text-muted mt-1">
        Goal: {target}
        {habit.unit ? ` ${habit.unit}` : ""} a day
      </Text>
      <View className="items-center my-6">
        <Stepper
          label={habit.unit || "count"}
          value={value}
          min={0}
          max={Math.max(target * 3, 99)}
          onChange={setValue}
          format={(v) => `${v}${habit.unit ? ` ${habit.unit}` : ""}`}
        />
      </View>
      <PrimaryButton
        label="Save"
        color={color}
        onPress={() => {
          onSave(habit, value);
          onClose();
        }}
      />
      <View className="h-4" />
    </BottomSheetModal>
  );
}
