import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
  activeColor,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Partial<Record<T, string>>;
  activeColor?: string;
}) {
  return (
    <View className="flex-row bg-surface border border-line rounded-2xl p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(opt);
            }}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={active ? { backgroundColor: activeColor ?? "#2E2E33" } : undefined}
          >
            <Text
              className={`font-semibold ${active ? "" : "text-muted"}`}
              style={active ? { color: activeColor ? "#0B0B0C" : "#fff" } : undefined}
            >
              {labels?.[opt] ?? opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
