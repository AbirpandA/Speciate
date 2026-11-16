import React from "react";
import { Text, View } from "react-native";

export default function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View className="flex-1 bg-surface border border-line rounded-3xl p-4 m-1">
      <Text className="text-muted text-xs font-semibold uppercase tracking-wider">{label}</Text>
      <Text className="text-white text-2xl font-bold mt-1">{value}</Text>
      {hint ? <Text className="text-muted text-xs mt-0.5">{hint}</Text> : null}
    </View>
  );
}
