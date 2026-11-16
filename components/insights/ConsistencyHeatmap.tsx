import { theme } from "@/utils/theme";
import type { DayRatio } from "@/utils/insights";
import { DateTime } from "luxon";
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, type ScrollViewInstance } from "react-native";

// One-hue sequential ramp, validated against the dark surface (low -> high).
export const HEAT_RAMP = ["#1F5E46", "#2A8C66", "#34D399", "#A7F3D0"];
const CELL = 13;
const GAP = 3;

function cellColor(d: DayRatio | undefined, future: boolean) {
  if (future || !d || d.expected === 0) return "transparent";
  const r = d.done / d.expected;
  if (r === 0) return theme.elevated;
  return HEAT_RAMP[Math.min(3, Math.floor(r * 4 - 1e-9))];
}

/** Weeks as columns (Mon-Sun rows), scrolled to the most recent week. */
export default function ConsistencyHeatmap({ days, today }: { days: DayRatio[]; today: string }) {
  const [selected, setSelected] = useState<DayRatio | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const first = DateTime.fromISO(days[0]?.date ?? today).startOf("week");
  const weeks = Math.ceil(DateTime.fromISO(today).endOf("week").diff(first, "days").days / 7);

  return (
    <View>
      <Text className="text-fg-secondary text-sm mb-2 h-5">
        {selected
          ? `${DateTime.fromISO(selected.date).toFormat("ccc d LLL")}: ${selected.done} of ${selected.expected} done`
          : "Tap a day for details"}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View className="flex-row">
          {Array.from({ length: weeks }, (_, w) => {
            const weekStart = first.plus({ weeks: w });
            const showMonth = weekStart.day <= 7;
            return (
              <View key={w} style={{ marginRight: GAP }}>
                <Text className="text-muted" style={{ fontSize: 9, height: 12, width: CELL * 2 }}>
                  {showMonth ? weekStart.toFormat("LLL") : ""}
                </Text>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = weekStart.plus({ days: i }).toFormat("yyyy-MM-dd");
                  const d = byDate.get(date);
                  const future = date > today;
                  return (
                    <Pressable
                      key={i}
                      disabled={future || !d || d.expected === 0}
                      onPress={() => setSelected(d ?? null)}
                      hitSlop={2}
                      accessibilityLabel={d ? `${date}: ${d.done} of ${d.expected}` : date}
                      style={{
                        width: CELL,
                        height: CELL,
                        marginBottom: GAP,
                        borderRadius: 3,
                        backgroundColor: cellColor(d, future),
                        borderWidth: selected?.date === date ? 1.5 : date === today ? 1 : 0,
                        borderColor: theme.text,
                      }}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View className="flex-row items-center justify-end mt-2">
        <Text className="text-muted text-xs mr-1.5">Less</Text>
        {[theme.elevated, ...HEAT_RAMP].map((c) => (
          <View key={c} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c, marginRight: 3 }} />
        ))}
        <Text className="text-muted text-xs ml-1">More</Text>
      </View>
    </View>
  );
}
