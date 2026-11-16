import IconModal from "@/components/IconModal";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Stepper from "@/components/ui/Stepper";
import { useHabits } from "@/hooks/useHabits";
import type { Habit, HabitType, TimeOfDay } from "@/types/dbTypes";
import { habitColors } from "@/utils/habitColors";
import { parseScheduleDays, TIME_OF_DAY_META, TIME_OF_DAY_ORDER, WEEKDAY_LABELS } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DateTime } from "luxon";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScheduleMode = "daily" | "days" | "weekly";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-white text-base font-semibold">{title}</Text>
      {hint ? <Text className="text-muted text-sm mt-0.5">{hint}</Text> : null}
      <View className="mt-3">{children}</View>
    </View>
  );
}

function Field(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={theme.muted}
      className="bg-surface border border-line rounded-2xl px-4 py-3.5 text-white text-base"
      {...props}
    />
  );
}

export default function NewHabitScreen() {
  const params = useLocalSearchParams<{ habitId?: string; type?: HabitType }>();
  const habitId = params.habitId ? parseInt(params.habitId, 10) : undefined;
  const { habits, isLoading } = useHabits();
  const existing = habitId ? habits.find((h) => h.id === habitId) : undefined;

  // In edit mode, wait for the habit so the form can start from its values.
  if (habitId && !existing) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        {isLoading ? <ActivityIndicator color={theme.accent} /> : <Text className="text-muted">Habit not found</Text>}
      </SafeAreaView>
    );
  }
  return <HabitForm existing={existing} initialType={params.type === "quit" ? "quit" : "build"} />;
}

function HabitForm({ existing, initialType }: { existing?: Habit; initialType: HabitType }) {
  const isEdit = !!existing;
  const habitId = existing?.id;
  const router = useRouter();
  const { addHabit, updateHabit } = useHabits();
  const sd = existing ? parseScheduleDays(existing) : null;

  const [type, setType] = useState<HabitType>(existing?.type ?? initialType);
  const [name, setName] = useState(existing?.name ?? "");
  const [icon, setIcon] = useState(existing?.icon || (initialType === "quit" ? "ban-outline" : "leaf-outline"));
  const [color, setColor] = useState<string>(existing?.color || habitColors[3]);
  const [mode, setMode] = useState<ScheduleMode>(
    existing?.times_per_week ? "weekly" : sd ? "days" : "daily"
  );
  const [days, setDays] = useState<number[]>(sd ?? [1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(existing?.times_per_week ?? 3);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(existing?.time_of_day ?? "anytime");
  const [target, setTarget] = useState(existing?.target && existing.target > 1 ? existing.target : 1);
  const [unit, setUnit] = useState(existing?.unit ?? "");
  const [cue, setCue] = useState(existing?.cue ?? "");
  const [why, setWhy] = useState(existing?.why ?? "");
  const [cleanDaysAgo, setCleanDaysAgo] = useState(() =>
    existing?.start_date
      ? Math.max(0, Math.round(DateTime.local().startOf("day").diff(DateTime.fromISO(existing.start_date), "days").days))
      : 0
  );
  const [iconModal, setIconModal] = useState(false);

  const isQuit = type === "quit";
  const accent = isQuit ? theme.quit : theme.accent;
  const canSave = name.trim().length > 0 && (mode !== "days" || days.length > 0 || isQuit);

  const save = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = {
      name: name.trim(),
      icon,
      color,
      type,
      cue: cue.trim() || null,
      why: why.trim() || null,
      time_of_day: isQuit ? ("anytime" as const) : timeOfDay,
      schedule_days: !isQuit && mode === "days" ? days : null,
      times_per_week: !isQuit && mode === "weekly" ? timesPerWeek : null,
      target: isQuit ? 1 : target,
      unit: !isQuit && target > 1 ? unit.trim() || null : null,
      start_date: isQuit
        ? DateTime.local().minus({ days: cleanDaysAgo }).toFormat("yyyy-MM-dd")
        : null,
    };
    if (isEdit && habitId) updateHabit({ id: habitId, ...data });
    else addHabit(data);
    router.back();
  };

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-row items-center px-3 pb-2">
          <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
          <Text className="text-white text-xl font-bold ml-2">{isEdit ? "Edit habit" : "New habit"}</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {!isEdit && (
            <View className="mb-6">
              <SegmentedControl
                options={["build", "quit"] as const}
                labels={{ build: "✓  Build a habit", quit: "✕  Break a habit" }}
                value={type}
                onChange={(t) => {
                  setType(t);
                  if (t === "quit" && icon === "leaf-outline") setIcon("ban-outline");
                  if (t === "build" && icon === "ban-outline") setIcon("leaf-outline");
                }}
                activeColor={accent}
              />
            </View>
          )}

          {/* Identity: icon + name */}
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => setIconModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Choose icon"
              className="w-[58px] h-[58px] rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: color + "26", borderWidth: 1, borderColor: color + "55" }}
            >
              <Ionicons name={icon as any} size={28} color={color} />
            </Pressable>
            <View className="flex-1">
              <Field
                value={name}
                onChangeText={setName}
                placeholder={isQuit ? "e.g. Doomscrolling" : "e.g. Read 10 pages"}
                autoFocus={!isEdit}
                returnKeyType="done"
                maxLength={60}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-7" keyboardShouldPersistTaps="handled">
            {habitColors.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  Keyboard.dismiss();
                  setColor(c);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Color ${c}`}
                accessibilityState={{ selected: c === color }}
                className="w-9 h-9 rounded-full mr-2.5 items-center justify-center"
                style={{ backgroundColor: c, borderWidth: c === color ? 3 : 0, borderColor: theme.text }}
              />
            ))}
          </ScrollView>

          {isQuit ? (
            <>
              <Section title="Clean since" hint="Already started? Count the days you've stayed away.">
                <Stepper
                  label="clean days"
                  value={cleanDaysAgo}
                  min={0}
                  max={3650}
                  onChange={setCleanDaysAgo}
                  format={(v) => (v === 0 ? "Today" : DateTime.local().minus({ days: v }).toFormat("d LLL"))}
                />
              </Section>
              <Section
                title="When the urge hits, I will…"
                hint="Swap in a replacement. It's easier than willpower alone."
              >
                <Field value={cue} onChangeText={setCue} placeholder="e.g. Put the phone in another room and stretch" />
              </Section>
            </>
          ) : (
            <>
              <Section title="How often?">
                <SegmentedControl
                  options={["daily", "days", "weekly"] as const}
                  labels={{ daily: "Every day", days: "Some days", weekly: "Per week" }}
                  value={mode}
                  onChange={setMode}
                />
                {mode === "days" && (
                  <View className="flex-row justify-between mt-3">
                    {WEEKDAY_LABELS.map((l, i) => {
                      const on = days.includes(i + 1);
                      return (
                        <Pressable
                          key={l}
                          onPress={() => toggleDay(i + 1)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: on }}
                          accessibilityLabel={l}
                          className="w-11 h-11 rounded-full items-center justify-center"
                          style={{
                            backgroundColor: on ? accent : theme.surface,
                            borderWidth: on ? 0 : 1,
                            borderColor: theme.border,
                          }}
                        >
                          <Text className="font-semibold" style={{ color: on ? "#0B0B0C" : theme.textSecondary }}>
                            {l.slice(0, 2)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
                {mode === "weekly" && (
                  <View className="flex-row items-center justify-between mt-3 bg-surface border border-line rounded-2xl px-4 py-3">
                    <Text className="text-fg-secondary">Times per week</Text>
                    <Stepper label="times per week" value={timesPerWeek} min={1} max={6} onChange={setTimesPerWeek} />
                  </View>
                )}
              </Section>

              <Section title="When in your day?" hint="Grouping habits by time turns your list into a routine.">
                <View className="flex-row flex-wrap">
                  {TIME_OF_DAY_ORDER.map((t) => (
                    <Chip
                      key={t}
                      label={TIME_OF_DAY_META[t].label}
                      selected={timeOfDay === t}
                      onPress={() => setTimeOfDay(t)}
                    />
                  ))}
                </View>
              </Section>

              <Section title="Daily goal">
                <View className="bg-surface border border-line rounded-2xl px-4 py-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-fg-secondary">{target > 1 ? "Count per day" : "Just check it off"}</Text>
                    <Stepper
                      label="daily goal"
                      value={target}
                      min={1}
                      max={99}
                      onChange={setTarget}
                      format={(v) => (v === 1 ? "Once" : `${v}×`)}
                    />
                  </View>
                  {target > 1 && (
                    <TextInput
                      value={unit}
                      onChangeText={setUnit}
                      placeholder="Unit (e.g. glasses, pages)"
                      placeholderTextColor={theme.muted}
                      className="text-white text-base mt-3 pt-3 border-t border-line"
                      maxLength={20}
                    />
                  )}
                </View>
              </Section>

              <Section title="Make it obvious" hint="Tie it to something you already do.">
                <Field value={cue} onChangeText={setCue} placeholder="e.g. After I pour my morning coffee" />
              </Section>
            </>
          )}

          <Section title="Why does this matter to you?" hint="We'll remind you when it gets hard.">
            <Field
              value={why}
              onChangeText={setWhy}
              placeholder={isQuit ? "e.g. I want my evenings back" : "e.g. I want to be someone who reads"}
              multiline
            />
          </Section>
        </ScrollView>

        <View className="px-5 pt-2 pb-3 border-t border-line bg-bg">
          <PrimaryButton
            label={isEdit ? "Save changes" : isQuit ? "Start breaking it" : "Create habit"}
            onPress={save}
            disabled={!canSave}
            color={accent}
          />
        </View>

        <IconModal visible={iconModal} onClose={() => setIconModal(false)} onSelect={setIcon} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
