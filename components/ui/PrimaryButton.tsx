import React from "react";
import { Pressable, Text } from "react-native";
import { theme } from "@/utils/theme";

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  color = theme.accent,
  variant = "solid",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  variant?: "solid" | "outline" | "danger";
}) {
  const solid = variant === "solid";
  const fg = solid ? "#0B0B0C" : variant === "danger" ? theme.danger : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="py-4 rounded-2xl items-center active:opacity-80"
      style={{
        backgroundColor: solid ? color : theme.surface,
        borderWidth: solid ? 0 : 1,
        borderColor: theme.border,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text className="text-lg font-semibold" style={{ color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
}
