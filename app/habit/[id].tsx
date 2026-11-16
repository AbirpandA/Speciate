import ConfirmSheet from "@/components/ConfirmSheet";
import DayEditSheet from "@/components/detail/DayEditSheet";
import MonthCalendar, { DayCell } from "@/components/detail/MonthCalendar";
import SlipSheet from "@/components/detail/SlipSheet";
import StatTile from "@/components/detail/StatTile";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useHabitDetail } from "@/hooks/useHabitDetail";
import { useHabits } from "@/hooks/useHabits";
import { useHabitEvents, useLogHabitEvent } from "@/hooks/useQuitHabits";
import { useSetHabitEntry } from "@/hooks/useToggle";
import { calculateHabitStats } from "@/utils/habitStats";
import { calculateQuitStats, nextMilestone } from "@/utils/quitStats";
import { describeSchedule, isScheduledOn, TIME_OF_DAY_META } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DateTime } from "luxon";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const { data, isLoading } = useHabitDetail(habitId);
  const { data: events = [] } = useHabitEvents(habitId);
  const { archiveHabit, deleteHabit } = useHabits();
  const { setEntry } = useSetHabitEntry();
  const { logEvent } = useLogHabitEvent();

  const [month, setMonth] = useState(DateTime.local());
  const [editDate, setEditDate] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);
  const [slipOpen, setSlipOpen] = useState(false);

  const habit = data?.habit ?? null;
  const entries = useMemo(() => data?.entries ?? [], [data]);
  const entryMap = useMemo(() => new Map(entries.map((e) => [e.date, e])), [entries]);
  const isQuit = habit?.type === "quit";
  const color = habit?.color || (isQuit ? theme.quit : theme.accent);

  const slipDates = useMemo(
    () =>
      events
        .filter((e) => e.kind === "slip")
        .map((e) => DateTime.fromISO(e.created_at).toFormat("yyyy-MM-dd")),
    [events]
  );
  const urgesResisted = events.filter((e) => e.kind === "urge" && e.resisted === 1).length;

  const buildStats = useMemo(
    () => (habit && !isQuit ? calculateHabitStats(habit, entries) : null),
    [habit, isQuit, entries]
  );
  const quitStats = useMemo(
    () =>
      habit && isQuit
        ? calculateQuitStats(habit.start_date ?? habit.created_at.slice(0, 10), slipDates)
        : null,
    [habit, isQuit, slipDates]
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }
  if (!habit) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-white text-lg mb-4">This habit no longer exists.</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const startDate = isQuit ? habit.start_date ?? habit.created_at.slice(0, 10) : habit.created_at.slice(0, 10);
  const getDay = (date: string): DayCell => {
    if (isQuit) {
      const today = DateTime.local().toFormat("yyyy-MM-dd");
      if (date < startDate) return { scheduled: false };
      if (slipDates.includes(date)) return { scheduled: true, status: 0 };
      return { scheduled: true, status: date < today ? 1 : undefined };
    }
    const e = entryMap.get(date);
    return { scheduled: isScheduledOn(habit, date), status: e?.status, hasNote: !!e?.note };
  };

  const notes = entries.filter((e) => e.note).slice(0, 5);
  const editing = editDate ? entryMap.get(editDate) : undefined;
  const next = quitStats ? nextMilestone(quitStats.currentDays) : null;
  const minMonth = DateTime.fromISO(
    entries.length ? entries[entries.length - 1].date < startDate ? entries[entries.length - 1].date : startDate : startDate
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-3 py-1">
        <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={() => router.back()} />
        <IconButton
          icon="create-outline"
          accessibilityLabel="Edit habit"
          onPress={() => router.push({ pathname: "/newHabit", params: { habitId: String(habit.id) } })}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>
        {/* Hero */}
        <View className="items-center mb-6">
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-3"
            style={{ backgroundColor: color + "26" }}
          >
            <Ionicons name={(habit.icon as any) || "ellipse-outline"} size={38} color={color} />
          </View>
          <Text className="text-white text-2xl font-bold text-center">{habit.name}</Text>
          <View className="flex-row items-center mt-2">
            <View
              className="px-2.5 py-1 rounded-full mr-2"
              style={{ backgroundColor: isQuit ? theme.quitSoft : theme.accentSoft }}
            >
              <Text className="text-xs font-semibold" style={{ color: isQuit ? theme.quit : theme.accent }}>
                {isQuit ? "Breaking" : "Building"}
              </Text>
            </View>
            <Text className="text-muted text-sm">
              {describeSchedule(habit)}
              {!isQuit && habit.time_of_day !== "anytime" ? ` · ${TIME_OF_DAY_META[habit.time_of_day].label}` : ""}
            </Text>
          </View>
        </View>

        {(habit.cue || habit.why) && (
          <Card className="mb-4">
            {habit.cue ? (
              <View className="flex-row mb-1">
                <Ionicons name="git-branch-outline" size={16} color={theme.muted} style={{ marginTop: 2 }} />
                <Text className="text-white ml-2 flex-1">{habit.cue}</Text>
              </View>
            ) : null}
            {habit.why ? (
              <View className="flex-row mt-1">
                <Ionicons name="heart-outline" size={16} color={theme.muted} style={{ marginTop: 2 }} />
                <Text className="text-fg-secondary ml-2 flex-1 italic">{habit.why}</Text>
              </View>
            ) : null}
          </Card>
        )}

        {/* Stats */}
        {buildStats && (
          <View className="-mx-1 mb-4">
            <View className="flex-row">
              <StatTile
                label="Streak"
                value={`${buildStats.currentStreak} 🔥`}
                hint={buildStats.atRisk ? "missed last time: don't miss twice" : buildStats.streakUnit}
              />
              <StatTile label="Best" value={`${buildStats.longestStreak}`} hint={buildStats.streakUnit} />
            </View>
            <View className="flex-row">
              <StatTile label="Last 30 days" value={pct(buildStats.rate30)} />
              <StatTile label="Total done" value={`${buildStats.totalDone}`} hint={`${pct(buildStats.rateAll)} all time`} />
            </View>
          </View>
        )}

        {quitStats && (
          <>
            <Card className="items-center mb-3 py-6">
              <Text className="text-6xl font-bold" style={{ color }}>
                {quitStats.currentDays}
              </Text>
              <Text className="text-fg-secondary mt-1">
                day{quitStats.currentDays === 1 ? "" : "s"} clean since{" "}
                {DateTime.fromISO(quitStats.since).toFormat("d LLL")}
              </Text>
              {next ? (
                <Text className="text-muted text-sm mt-2">
                  {next - quitStats.currentDays} to your {next}-day milestone
                </Text>
              ) : null}
            </Card>
            <View className="-mx-1 mb-3 flex-row">
              <StatTile label="Best run" value={`${quitStats.bestDays}`} hint="days" />
              <StatTile label="Clean days" value={`${quitStats.totalCleanDays}`} hint="total" />
              <StatTile label="Urges beaten" value={`${urgesResisted}`} />
            </View>
            <View className="flex-row mb-5">
              <View className="flex-1 mr-1.5">
                <PrimaryButton
                  label="I feel an urge"
                  color={color}
                  onPress={() => router.push({ pathname: "/urge/[id]", params: { id: String(habit.id) } })}
                />
              </View>
              <View className="flex-1 ml-1.5">
                <PrimaryButton label="I slipped" variant="outline" onPress={() => setSlipOpen(true)} />
              </View>
            </View>
          </>
        )}

        {/* Calendar */}
        <Card className="mb-4">
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            getDay={getDay}
            onDayPress={isQuit ? undefined : setEditDate}
            color={color}
            minMonth={minMonth}
          />
          {!isQuit && (
            <Text className="text-muted text-xs text-center mt-3">
              Tap a day to log it, skip it, or add a note
            </Text>
          )}
        </Card>

        {notes.length > 0 && (
          <View className="mb-4">
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Notes</Text>
            {notes.map((n) => (
              <Card key={n.id} className="mb-2">
                <Text className="text-muted text-xs mb-1">{DateTime.fromISO(n.date).toFormat("ccc, d LLL")}</Text>
                <Text className="text-white">{n.note}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Danger zone */}
        <View className="mt-4">
          <PrimaryButton label="Archive habit" variant="outline" onPress={() => setConfirm("archive")} />
          <View className="h-2" />
          <PrimaryButton label="Delete habit" variant="danger" onPress={() => setConfirm("delete")} />
        </View>
      </ScrollView>

      <DayEditSheet
        key={editDate ?? "none"}
        date={editDate}
        status={editing?.status}
        note={editing?.note}
        color={color}
        onClose={() => setEditDate(null)}
        onSave={(status, note) => editDate && setEntry({ habitId: habit.id, date: editDate, status, note })}
      />

      <SlipSheet
        visible={slipOpen}
        habitName={habit.name}
        bestDays={quitStats?.bestDays ?? 0}
        onClose={() => setSlipOpen(false)}
        onConfirm={(trigger) =>
          logEvent({ habit_id: habit.id, kind: "slip", trigger, intensity: null, note: null, resisted: null })
        }
      />

      <ConfirmSheet
        visible={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "delete" ? "Delete this habit?" : "Archive this habit?"}
        message={
          confirm === "delete"
            ? "All of its history will be permanently deleted. This can't be undone."
            : "It will be hidden from Today. You can restore it any time from Settings."
        }
        confirmText={confirm === "delete" ? "Yes, delete" : "Archive"}
        onConfirm={() => {
          if (confirm === "delete") deleteHabit(habit.id);
          else archiveHabit(habit.id);
          setConfirm(null);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
