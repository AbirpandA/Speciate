import BreathingCircle from "@/components/urge/BreathingCircle";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useHabitDetail } from "@/hooks/useHabitDetail";
import { useHabitEvents, useLogHabitEvent } from "@/hooks/useQuitHabits";
import { theme } from "@/utils/theme";
import { TRIGGERS } from "@/utils/triggers";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SURF_SECONDS = 120;
const INTENSITY_LABELS = ["Mild", "Noticeable", "Strong", "Very strong", "Overwhelming"];

type Step = "checkin" | "surf" | "resisted" | "slipped";

/**
 * Urge surfing: name the urge, then ride it out. Cravings rise, peak and
 * fade like a wave, usually within a few minutes, if you don't act on them.
 */
export default function UrgeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const { data } = useHabitDetail(habitId);
  const { data: events = [] } = useHabitEvents(habitId);
  const { logEvent } = useLogHabitEvent();
  const habit = data?.habit;
  const color = habit?.color || theme.quit;

  const [step, setStep] = useState<Step>("checkin");
  const [intensity, setIntensity] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SURF_SECONDS);

  useEffect(() => {
    if (step !== "surf") return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (step === "surf" && secondsLeft === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [step, secondsLeft]);

  const urgesBeaten = events.filter((e) => e.kind === "urge" && e.resisted === 1).length;

  const finish = async (resisted: boolean) => {
    const base = { habit_id: habitId, trigger, note: null };
    await logEvent({ ...base, kind: "urge", intensity, resisted: resisted ? 1 : 0 });
    if (!resisted) await logEvent({ ...base, kind: "slip", intensity, resisted: null });
    Haptics.notificationAsync(
      resisted ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );
    setStep(resisted ? "resisted" : "slipped");
  };

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-3 py-1">
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
        <Text className="text-muted font-semibold" numberOfLines={1}>
          {habit?.name}
        </Text>
        <View className="w-11" />
      </View>

      {step === "checkin" && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text className="text-white text-2xl font-bold">Notice it. Name it.</Text>
          <Text className="text-fg-secondary mt-2 leading-5">
            Urges rise, peak and pass, usually within minutes. You don&apos;t have to fight it, just ride it out.
          </Text>

          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mt-7 mb-3">How strong is it?</Text>
          <View className="flex-row justify-between">
            {INTENSITY_LABELS.map((label, i) => {
              const v = i + 1;
              const on = intensity === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIntensity(v);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={label}
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: on ? color : theme.surface,
                    borderWidth: on ? 0 : 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text className="text-lg font-bold" style={{ color: on ? "#0B0B0C" : theme.textSecondary }}>
                    {v}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="text-muted text-sm mt-2 text-center">
            {intensity ? INTENSITY_LABELS[intensity - 1] : " "}
          </Text>

          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mt-6 mb-3">What&apos;s behind it?</Text>
          <View className="flex-row flex-wrap">
            {TRIGGERS.map((t) => (
              <Chip key={t} label={t} color={color} selected={trigger === t} onPress={() => setTrigger(trigger === t ? null : t)} />
            ))}
          </View>

          <View className="mt-8">
            <PrimaryButton label="Ride it out (2 min)" color={color} onPress={() => setStep("surf")} />
          </View>
        </ScrollView>
      )}

      {step === "surf" && (
        <View className="flex-1 px-5 pb-6">
          <View className="flex-1 items-center justify-center">
            <BreathingCircle color={color} />
            <Text className="text-white text-4xl font-bold mt-8" accessibilityLabel={`${mm} minutes ${ss} seconds left`}>
              {secondsLeft > 0 ? `${mm}:${ss}` : "You made it"}
            </Text>
            {habit?.why ? (
              <Text className="text-fg-secondary text-center mt-5 italic leading-6 px-4">“{habit.why}”</Text>
            ) : null}
            {habit?.cue ? (
              <Text className="text-muted text-center mt-3 px-4">Instead: {habit.cue}</Text>
            ) : null}
          </View>
          <PrimaryButton
            label={secondsLeft > 0 ? "The urge passed" : "I rode it out"}
            color={color}
            onPress={() => finish(true)}
          />
          <Pressable onPress={() => finish(false)} className="py-4 items-center" accessibilityRole="button">
            <Text className="text-muted">I gave in</Text>
          </Pressable>
        </View>
      )}

      {step === "resisted" && (
        <View className="flex-1 px-5 pb-6">
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl">🌊</Text>
            <Text className="text-white text-2xl font-bold mt-4 text-center">You rode the wave</Text>
            <Text className="text-fg-secondary text-center mt-2 leading-5 px-4">
              That&apos;s {urgesBeaten} urge{urgesBeaten === 1 ? "" : "s"} beaten. Every one you ride out makes
              the next one weaker.
            </Text>
          </View>
          <PrimaryButton label="Done" color={color} onPress={() => router.back()} />
        </View>
      )}

      {step === "slipped" && (
        <View className="flex-1 px-5 pb-6">
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl">🌱</Text>
            <Text className="text-white text-2xl font-bold mt-4 text-center">A slip isn&apos;t a restart from zero</Text>
            <Text className="text-fg-secondary text-center mt-2 leading-5 px-4">
              Your best run and every clean day still count.
              {trigger ? ` You've noted "${trigger}" as the trigger. Spotting it is how you plan for next time.` : ""}
            </Text>
          </View>
          <PrimaryButton label="Start a new run" color={color} onPress={() => router.back()} />
        </View>
      )}
    </SafeAreaView>
  );
}
