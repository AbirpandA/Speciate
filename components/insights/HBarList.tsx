import { theme } from "@/utils/theme";
import React from "react";
import { Text, View } from "react-native";

export type HBar = { key: string; label: string; value: number; display: string };

/** Single-series horizontal bars: thin, rounded data end, value in text ink. */
export default function HBarList({ bars, color = theme.accent }: { bars: HBar[]; color?: string }) {
  return (
    <View accessibilityRole="list">
      {bars.map((b) => (
        <View
          key={b.key}
          className="mb-3"
          accessible
          accessibilityLabel={`${b.label}: ${b.display}`}
        >
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-white text-sm flex-1 mr-2" numberOfLines={1}>
              {b.label}
            </Text>
            <Text className="text-fg-secondary text-sm font-semibold">{b.display}</Text>
          </View>
          <View className="h-2 rounded-full" style={{ backgroundColor: theme.elevated }}>
            {b.value > 0 && (
              <View
                className="h-2 rounded-full"
                style={{ width: `${Math.max(3, Math.min(100, b.value * 100))}%`, backgroundColor: color }}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
