import AppLogo from "@/components/AppLogo";
import Chip from "@/components/ui/Chip";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useHabits } from "@/hooks/useHabits";
import { useAuthStore } from "@/services/authStorage";
import {
  FOCUS_AREAS,
  FocusArea,
  HabitTemplate,
  QUIT_TEMPLATES,
  suggestBuildTemplates,
} from "@/utils/habitTemplates";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const STEPS = ["welcome", "name", "focus", "quit", "starter"] as const;
type Step = (typeof STEPS)[number];

function Title({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-6">
      <Text className="text-white text-3xl font-bold leading-tight">{title}</Text>
      {subtitle ? <Text className="text-fg-secondary text-base mt-2 leading-6">{subtitle}</Text> : null}
    </View>
  );
}

function TemplateRow({ t, selected, onPress }: { t: HabitTemplate; selected: boolean; onPress: () => void }) {
  const color = t.color;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className="flex-row items-center p-3 mb-2.5 rounded-2xl border"
      style={{ borderColor: selected ? color : theme.border, backgroundColor: selected ? color + "1A" : theme.surface }}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: color + "26" }}>
        <Ionicons name={t.icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold">{t.name}</Text>
        {t.cue ? (
          <Text className="text-muted text-sm" numberOfLines={1}>
            {t.type === "quit" ? `Instead: ${t.cue}` : t.cue}
          </Text>
        ) : null}
      </View>
      <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? color : theme.muted} />
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const setProfile = useAuthStore((s) => s.setProfile);
  const completedOnboarding = useAuthStore((s) => s.completedOnboarding);
  const { addHabitAsync } = useHabits();

  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [areas, setAreas] = useState<FocusArea[]>([]);
  const [quits, setQuits] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);

  const index = STEPS.indexOf(step);
  const go = (s: Step) => {
    Haptics.selectionAsync();
    setStep(s);
  };
  const suggestions = [...suggestBuildTemplates(areas), ...QUIT_TEMPLATES.filter((q) => quits.includes(q.id))];
  // Default: the first three build suggestions plus every quit habit chosen.
  const selected =
    picked ?? [...suggestBuildTemplates(areas).slice(0, 3).map((t) => t.id), ...quits];

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = async () => {
    setSaving(true);
    setProfile({ name: name.trim(), focusAreas: areas });
    for (const t of suggestions.filter((s) => selected.includes(s.id))) {
      await addHabitAsync({
        name: t.name,
        icon: t.icon,
        color: t.color,
        type: t.type,
        time_of_day: t.time_of_day ?? "anytime",
        cue: t.cue ?? null,
        target: t.target ?? 1,
        unit: t.unit ?? null,
        schedule_days: t.schedule_days ?? null,
        times_per_week: t.times_per_week ?? null,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completedOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {step !== "welcome" && (
          <View className="flex-row items-center px-5 pt-2 pb-4">
            <Pressable
              onPress={() => go(STEPS[index - 1])}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </Pressable>
            <View className="flex-1 flex-row ml-4 gap-1.5">
              {STEPS.slice(1).map((s, i) => (
                <View
                  key={s}
                  className="flex-1 h-1 rounded-full"
                  style={{ backgroundColor: i < index ? theme.accent : theme.elevated }}
                />
              ))}
            </View>
          </View>
        )}

        {step === "welcome" && (
          <View className="flex-1 px-6 pb-6">
            <View className="flex-1 items-center justify-center">
              <Animated.View entering={FadeInDown.duration(600)}>
                <AppLogo size={96} />
              </Animated.View>
              <Animated.Text
                entering={FadeInDown.delay(200).duration(600)}
                className="text-white text-4xl font-bold text-center mt-8"
              >
                Speciate
              </Animated.Text>
              <Animated.Text
                entering={FadeInDown.delay(350).duration(600)}
                className="text-fg-secondary text-lg text-center mt-3 leading-7 max-w-[300px]"
              >
                Build the habits you want. Break the ones you don&apos;t. One small day at a time.
              </Animated.Text>
            </View>
            <Animated.View entering={FadeInDown.delay(500).duration(600)}>
              <PrimaryButton label="Get started" onPress={() => go("name")} />
              <Text className="text-muted text-xs text-center mt-3">Everything stays on your device.</Text>
            </Animated.View>
          </View>
        )}

        {step === "name" && (
          <Animated.View entering={FadeInRight.duration(250)} className="flex-1 px-6 pb-6">
            <Title title="What should we call you?" subtitle="Just your first name is fine." />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.muted}
              autoFocus
              maxLength={30}
              returnKeyType="next"
              onSubmitEditing={() => go("focus")}
              className="bg-surface border border-line rounded-2xl px-4 py-4 text-white text-lg"
            />
            <View className="flex-1" />
            <PrimaryButton label={name.trim() ? "Continue" : "Skip"} onPress={() => go("focus")} />
          </Animated.View>
        )}

        {step === "focus" && (
          <Animated.View entering={FadeInRight.duration(250)} className="flex-1 px-6 pb-6">
            <Title
              title={name.trim() ? `What matters most to you, ${name.trim()}?` : "What matters most to you?"}
              subtitle="Pick a few areas. We'll suggest small habits to start with."
            />
            <View className="flex-row flex-wrap">
              {FOCUS_AREAS.map((a) => (
                <Chip
                  key={a.id}
                  label={a.label}
                  selected={areas.includes(a.id)}
                  onPress={() => {
                    setPicked(null);
                    setAreas(toggle(areas, a.id));
                  }}
                />
              ))}
            </View>
            <View className="flex-1" />
            <PrimaryButton label="Continue" onPress={() => go("quit")} />
          </Animated.View>
        )}

        {step === "quit" && (
          <Animated.View entering={FadeInRight.duration(250)} className="flex-1 px-6 pb-6">
            <Title
              title="Anything you want to cut back on?"
              subtitle="Optional. We'll count your clean days and help you ride out urges."
            />
            <View className="flex-row flex-wrap">
              {QUIT_TEMPLATES.map((q) => (
                <Chip
                  key={q.id}
                  label={q.name}
                  color={theme.quit}
                  selected={quits.includes(q.id)}
                  onPress={() => {
                    setPicked(null);
                    setQuits(toggle(quits, q.id));
                  }}
                />
              ))}
            </View>
            <View className="flex-1" />
            <PrimaryButton label={quits.length ? "Continue" : "Skip"} onPress={() => go("starter")} />
          </Animated.View>
        )}

        {step === "starter" && (
          <Animated.View entering={FadeInRight.duration(250)} className="flex-1 pb-6">
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}>
              <Title
                title="Start small"
                subtitle="Three habits is plenty. You can change everything later."
              />
              {suggestions.map((t) => (
                <TemplateRow
                  key={t.id}
                  t={t}
                  selected={selected.includes(t.id)}
                  onPress={() => setPicked(toggle(selected, t.id))}
                />
              ))}
            </ScrollView>
            <View className="px-6">
              <PrimaryButton
                label={
                  saving
                    ? "Setting up…"
                    : selected.length
                      ? `Start with ${selected.length} habit${selected.length === 1 ? "" : "s"}`
                      : "Start with an empty list"
                }
                disabled={saving}
                onPress={finish}
              />
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
