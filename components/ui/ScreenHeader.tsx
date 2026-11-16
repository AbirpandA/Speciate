import React from "react";
import { Text, View } from "react-native";

export default function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between mb-5">
      <View className="flex-1 pr-3">
        {subtitle ? (
          <Text className="text-muted text-sm font-medium mb-0.5">{subtitle}</Text>
        ) : null}
        <Text className="text-white text-3xl font-bold" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <View className="flex-row items-center gap-2">{right}</View> : null}
    </View>
  );
}
