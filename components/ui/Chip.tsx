import React from "react";
import { Pressable, Text } from "react-native";
import { theme } from "@/utils/theme";

export default function Chip({
  label,
  selected,
  onPress,
  color = theme.accent,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="px-4 py-2 rounded-full border mr-2 mb-2"
      style={{
        borderColor: selected ? color : theme.border,
        backgroundColor: selected ? color + "22" : theme.surface,
      }}
    >
      <Text style={{ color: selected ? color : theme.textSecondary }} className="font-medium">
        {label}
      </Text>
    </Pressable>
  );
}
