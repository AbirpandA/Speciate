import ProgressRing from "@/components/ui/ProgressRing";
import { WeekDayProgress } from "@/hooks/useDayHabits";
import { theme } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { DateTime } from "luxon";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function WeekStrip({
  days,
  selected,
  today,
  onSelect,
}: {
  days: WeekDayProgress[];
  selected: string;
  today: string;
  onSelect: (date: string) => void;
}) {
  return (
    <View className="flex-row justify-between mb-4">
      {days.map((d) => {
        const dt = DateTime.fromISO(d.date);
        const isSelected = d.date === selected;
        const isFuture = d.date > today;
        const isToday = d.date === today;
        const progress = d.scheduled > 0 ? d.done / d.scheduled : 0;
        return (
          <Pressable
            key={d.date}
            disabled={isFuture}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(d.date);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isFuture }}
            accessibilityLabel={`${dt.toFormat("cccc d LLLL")}, ${d.done} of ${d.scheduled} done`}
            className="items-center py-2 rounded-2xl"
            style={{
              width: 44,
              backgroundColor: isSelected ? theme.elevated : "transparent",
              opacity: isFuture ? 0.35 : 1,
            }}
          >
            <Text
              className="text-xs font-semibold mb-1.5"
              style={{ color: isToday ? theme.accent : theme.muted }}
            >
              {dt.toFormat("ccc")}
            </Text>
            <ProgressRing
              progress={isFuture ? 0 : progress}
              size={34}
              stroke={3.5}
              color={progress >= 1 ? theme.accent : theme.accentStrong}
            >
              <Text className="text-white text-sm font-semibold">{dt.day}</Text>
            </ProgressRing>
          </Pressable>
        );
      })}
    </View>
  );
}
