import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  format = (v) => String(v),
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  format?: (v: number) => string;
  label: string;
}) {
  const btn = (icon: "remove" | "add", next: number, disabled: boolean) => (
    <Pressable
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync();
        onChange(next);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${icon === "add" ? "Increase" : "Decrease"} ${label}`}
      className="w-10 h-10 rounded-xl bg-elevated items-center justify-center"
      style={{ opacity: disabled ? 0.35 : 1 }}
    >
      <Ionicons name={icon} size={20} color={theme.text} />
    </Pressable>
  );
  return (
    <View className="flex-row items-center">
      {btn("remove", value - 1, value <= min)}
      <Text className="text-white text-base font-semibold text-center" style={{ minWidth: 72 }}>
        {format(value)}
      </Text>
      {btn("add", value + 1, value >= max)}
    </View>
  );
}
