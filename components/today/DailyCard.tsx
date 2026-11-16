import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import { theme } from "@/utils/theme";
import React from "react";
import { Text, View } from "react-native";

export default function DailyCard({
  done,
  total,
  line,
  label,
}: {
  done: number;
  total: number;
  line: string;
  label: string;
}) {
  const progress = total > 0 ? done / total : 0;
  return (
    <Card className="flex-row items-center mb-5">
      <ProgressRing progress={progress} size={72} stroke={8}>
        <Text className="text-white text-base font-bold">{Math.round(progress * 100)}%</Text>
      </ProgressRing>
      <View className="flex-1 ml-4">
        <Text className="text-muted text-xs font-semibold uppercase tracking-wider">{label}</Text>
        <Text className="text-white text-xl font-bold mt-0.5">
          {done} of {total} done
        </Text>
        <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
          {line}
        </Text>
      </View>
    </Card>
  );
}
