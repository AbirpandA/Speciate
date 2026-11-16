import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";
import { theme } from "@/utils/theme";

export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = "ghost",
  size = 22,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  accessibilityLabel: string;
  variant?: "ghost" | "filled" | "accent";
  size?: number;
}) {
  const bg =
    variant === "accent" ? theme.accent : variant === "filled" ? theme.elevated : "transparent";
  const fg = variant === "accent" ? "#0B0B0C" : theme.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className="w-11 h-11 rounded-full items-center justify-center active:opacity-70"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name={icon} size={size} color={fg} />
    </Pressable>
  );
}
