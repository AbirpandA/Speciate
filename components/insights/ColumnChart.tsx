import { theme } from "@/utils/theme";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type Column = { key: string; label: string; value: number | null; display: string };

/** Single-series column chart (0..1). Tap a column to read its value. */
export default function ColumnChart({
  columns,
  height = 110,
  color = theme.accent,
}: {
  columns: Column[];
  height?: number;
  color?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = columns.find((c) => c.key === selected);
  return (
    <View>
      <Text className="text-fg-secondary text-sm mb-2 h-5">
        {sel ? `${sel.label}: ${sel.display}` : "Tap a bar for details"}
      </Text>
      <View className="flex-row items-end" style={{ height }}>
        {columns.map((c) => {
          const h = c.value == null ? 0 : Math.max(4, c.value * height);
          return (
            <Pressable
              key={c.key}
              onPress={() => setSelected(selected === c.key ? null : c.key)}
              accessibilityRole="button"
              accessibilityLabel={`${c.label}: ${c.display}`}
              className="flex-1 items-center justify-end"
              style={{ height }}
            >
              <View
                style={{
                  width: 18,
                  height: c.value == null ? 2 : h,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  backgroundColor: c.value == null ? theme.border : color,
                  opacity: selected && selected !== c.key ? 0.45 : 1,
                }}
              />
            </Pressable>
          );
        })}
      </View>
      <View className="h-px" style={{ backgroundColor: theme.border }} />
      <View className="flex-row mt-1.5">
        {columns.map((c) => (
          <Text key={c.key} className="flex-1 text-center text-muted text-xs">
            {c.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
