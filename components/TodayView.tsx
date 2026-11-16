import Celebration from "@/components/today/Celebration";
import DailyCard from "@/components/today/DailyCard";
import HabitCard from "@/components/today/HabitCard";
import QuickActionsSheet from "@/components/today/QuickActionsSheet";
import QuitCard from "@/components/today/QuitCard";
import WeekStrip from "@/components/today/WeekStrip";
import { DayHabit, useDayHabits, useWeekProgress } from "@/hooks/useDayHabits";
import { QuitHabit, useQuitHabits } from "@/hooks/useQuitHabits";
import { useSetHabitEntry } from "@/hooks/useToggle";
import { motivationLine } from "@/utils/motivation";
import { dailyTarget, TIME_OF_DAY_META, TIME_OF_DAY_ORDER } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

function SectionTitle({ icon, label, count }: { icon: string; label: string; count?: string }) {
  return (
    <View className="flex-row items-center mt-2 mb-3">
      <Ionicons name={icon as any} size={15} color={theme.muted} />
      <Text className="text-muted text-xs font-semibold uppercase tracking-wider ml-1.5 flex-1">
        {label}
      </Text>
      {count ? <Text className="text-muted text-xs font-semibold">{count}</Text> : null}
    </View>
  );
}

export default function TodayView({ header }: { header: React.ReactNode }) {
  const router = useRouter();
  const today = DateTime.local().toFormat("yyyy-MM-dd");
  const [selected, setSelected] = useState(today);
  const [sheetHabit, setSheetHabit] = useState<DayHabit | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const { data: habits = [], isLoading } = useDayHabits(selected);
  const { data: week = [] } = useWeekProgress(selected);
  const { data: quitHabits = [] } = useQuitHabits();
  const { setEntry } = useSetHabitEntry();

  const isToday = selected === today;
  const active = habits.filter((h) => h.entry_status !== 2);
  const done = active.filter((h) => h.entry_status === 1).length;
  const total = active.length;

  // Celebrate only on the transition to "all done" for today, not on load.
  const prevDone = useRef<number | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (isToday && prevDone.current !== null && prevDone.current < total && done === total && total > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebrate(true);
    }
    prevDone.current = isToday ? done : null;
  }, [done, total, isToday, isLoading]);

  const onCheck = useCallback(
    (h: DayHabit) => {
      const target = dailyTarget(h);
      if (h.entry_status === 1) {
        setEntry({ habitId: h.id, date: selected, status: null, value: null });
      } else if (target > 1) {
        const next = (h.entry_value ?? 0) + 1;
        setEntry({ habitId: h.id, date: selected, status: next >= target ? 1 : 0, value: next });
      } else {
        setEntry({ habitId: h.id, date: selected, status: 1 });
      }
    },
    [selected, setEntry]
  );

  const openDetails = useCallback(
    (h: { id: number }) => router.push({ pathname: "/habit/[id]", params: { id: String(h.id) } }),
    [router]
  );

  const sections = useMemo(() => {
    const groups = TIME_OF_DAY_ORDER.map((tod) => ({
      tod,
      items: habits.filter((h) => (h.time_of_day ?? "anytime") === tod),
    })).filter((g) => g.items.length > 0);
    return groups;
  }, [habits]);
  const showSectionTitles = sections.length > 1 || (sections[0] && sections[0].tod !== "anytime");

  const selectedDt = DateTime.fromISO(selected);
  const line = motivationLine({
    done,
    total,
    hour: DateTime.local().hour,
    isToday,
    dayOfYear: selectedDt.ordinal,
  });
  const nothingYet = habits.length === 0 && quitHabits.length === 0 && !isLoading;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {header}
        <WeekStrip days={week} selected={selected} today={today} onSelect={setSelected} />

        {nothingYet ? (
          <View className="items-center mt-16 px-6">
            <View className="w-20 h-20 rounded-full bg-surface border border-line items-center justify-center mb-5">
              <Ionicons name="leaf-outline" size={34} color={theme.accent} />
            </View>
            <Text className="text-white text-xl font-bold text-center">Start with one small habit</Text>
            <Text className="text-muted text-center mt-2 leading-5">
              Pick something you can do in two minutes, or something you want to stop. Tap + above.
            </Text>
          </View>
        ) : (
          <>
            {habits.length > 0 && (
              <DailyCard
                done={done}
                total={total}
                line={line}
                label={isToday ? "Today" : selectedDt.toFormat("cccc, d LLL")}
              />
            )}

            {isLoading ? (
              <ActivityIndicator color={theme.accent} className="mt-6" />
            ) : (
              sections.map((g) => (
                <View key={g.tod}>
                  {showSectionTitles && (
                    <SectionTitle
                      icon={TIME_OF_DAY_META[g.tod].icon}
                      label={TIME_OF_DAY_META[g.tod].label}
                      count={`${g.items.filter((h) => h.entry_status === 1).length}/${g.items.length}`}
                    />
                  )}
                  {g.items.map((h) => (
                    <HabitCard
                      key={h.id}
                      habit={h}
                      onPress={openDetails}
                      onLongPress={setSheetHabit}
                      onCheck={onCheck}
                    />
                  ))}
                </View>
              ))
            )}

            {quitHabits.length > 0 && (
              <View className="mt-3">
                <SectionTitle icon="shield-checkmark-outline" label="Breaking" />
                {quitHabits.map((h: QuitHabit) => (
                  <QuitCard key={h.id} habit={h} onPress={openDetails} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <QuickActionsSheet
        habit={sheetHabit}
        onClose={() => setSheetHabit(null)}
        onSkip={(h) => setEntry({ habitId: h.id, date: selected, status: 2, value: null })}
        onReset={(h) => setEntry({ habitId: h.id, date: selected, status: null, value: null })}
        onEdit={(h) => router.push({ pathname: "/newHabit", params: { habitId: String(h.id) } })}
        onDetails={openDetails}
        onReorder={() => router.push("/reorder")}
      />

      <Celebration visible={celebrate} onDone={() => setCelebrate(false)} />
    </View>
  );
}
