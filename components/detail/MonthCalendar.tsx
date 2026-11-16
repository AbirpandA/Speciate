import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import React from "react";
import { Pressable, Text, View } from "react-native";

export type DayCell = { status?: number; scheduled: boolean; hasNote?: boolean };

export default function MonthCalendar({
  month,
  onMonthChange,
  getDay,
  onDayPress,
  color,
  minMonth,
}: {
  month: DateTime; // any day in the month shown
  onMonthChange: (m: DateTime) => void;
  getDay: (date: string) => DayCell;
  onDayPress?: (date: string) => void;
  color: string;
  minMonth: DateTime;
}) {
  const today = DateTime.local().toFormat("yyyy-MM-dd");
  const first = month.startOf("month");
  const lead = first.weekday - 1;
  const cells: (string | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: first.endOf("month").day }, (_, i) =>
      first.plus({ days: i }).toFormat("yyyy-MM-dd")
    ),
  ];
  while (cells.length % 7) cells.push(null);
  const canPrev = first > minMonth.startOf("month");
  const canNext = first < DateTime.local().startOf("month");

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          disabled={!canPrev}
          onPress={() => onMonthChange(first.minus({ months: 1 }))}
          hitSlop={10}
          accessibilityLabel="Previous month"
          style={{ opacity: canPrev ? 1 : 0.3 }}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text className="text-white font-semibold text-base">{first.toFormat("LLLL yyyy")}</Text>
        <Pressable
          disabled={!canNext}
          onPress={() => onMonthChange(first.plus({ months: 1 }))}
          hitSlop={10}
          accessibilityLabel="Next month"
          style={{ opacity: canNext ? 1 : 0.3 }}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View className="flex-row mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <Text key={i} className="flex-1 text-center text-muted text-xs font-semibold">
            {d}
          </Text>
        ))}
      </View>

      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} className="flex-row">
          {cells.slice(row * 7, row * 7 + 7).map((date, i) => {
            if (!date) return <View key={i} className="flex-1 aspect-square" />;
            const cell = getDay(date);
            const future = date > today;
            const isDone = cell.status === 1;
            const isSkip = cell.status === 2;
            const missed = !future && cell.scheduled && cell.status !== 1 && cell.status !== 2 && date < today;
            return (
              <Pressable
                key={i}
                disabled={future || !onDayPress}
                onPress={() => onDayPress?.(date)}
                accessibilityLabel={`${DateTime.fromISO(date).toFormat("d LLLL")}: ${
                  isDone ? "done" : isSkip ? "skipped" : missed ? "missed" : "not logged"
                }`}
                className="flex-1 aspect-square p-0.5"
              >
                <View
                  className="flex-1 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: isDone ? color : isSkip ? theme.elevated : "transparent",
                    borderWidth: date === today ? 1.5 : missed ? 1 : 0,
                    borderColor: date === today ? theme.text : theme.border,
                    opacity: future || !cell.scheduled ? 0.35 : 1,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: isDone ? "#0B0B0C" : isSkip ? theme.skip : theme.textSecondary }}
                  >
                    {DateTime.fromISO(date).day}
                  </Text>
                  {cell.hasNote ? (
                    <View
                      className="w-1 h-1 rounded-full absolute bottom-1"
                      style={{ backgroundColor: isDone ? "#0B0B0C" : theme.textSecondary }}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
