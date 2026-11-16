import { DayHabit } from "@/hooks/useDayHabits";
import { dailyTarget } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import ProgressRing from "@/components/ui/ProgressRing";

type Props = {
  habit: DayHabit;
  onPress: (h: DayHabit) => void;
  onLongPress: (h: DayHabit) => void;
  onCheck: (h: DayHabit) => void;
};

function HabitCard({ habit, onPress, onLongPress, onCheck }: Props) {
  const color = habit.color || theme.accent;
  const target = dailyTarget(habit);
  const value = habit.entry_value ?? (habit.entry_status === 1 ? target : 0);
  const done = habit.entry_status === 1;
  const skipped = habit.entry_status === 2;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const handleCheck = () => {
    Haptics.impactAsync(done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    scale.set(withSequence(withSpring(0.85, { damping: 12 }), withSpring(1, { damping: 10 })));
    onCheck(habit);
  };

  const subtitle = skipped
    ? "Skipped"
    : target > 1
      ? `${value} / ${target}${habit.unit ? ` ${habit.unit}` : ""}`
      : habit.cue
        ? habit.cue
        : habit.times_per_week
          ? `${habit.week_done} / ${habit.times_per_week} this week`
          : null;

  return (
    <View
      className="flex-row items-center rounded-3xl mb-3 pr-3 bg-surface border border-line"
      style={{ opacity: skipped ? 0.55 : 1 }}
    >
      <Pressable
        onPress={() => onPress(habit)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onLongPress(habit);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}. Open details`}
        accessibilityHint="Long press for quick actions"
        className="flex-row items-center flex-1 p-3 active:opacity-70"
      >
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: color + "26" }}
        >
          <Ionicons name={(habit.icon as any) || "ellipse-outline"} size={22} color={color} />
        </View>
        <View className="flex-1">
          <Text
            className="text-white text-base font-semibold"
            numberOfLines={1}
            style={done ? { color: theme.textSecondary } : undefined}
          >
            {habit.name}
          </Text>
          {subtitle ? (
            <Text className="text-muted text-sm mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={handleCheck}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={target > 1 ? `Add one to ${habit.name}` : `Mark ${habit.name} done`}
      >
        <Animated.View style={animatedStyle}>
          {target > 1 && !done ? (
            <ProgressRing progress={value / target} size={46} stroke={4} color={color}>
              <Ionicons name="add" size={22} color={theme.text} />
            </ProgressRing>
          ) : (
            <View
              className="w-[46px] h-[46px] rounded-2xl items-center justify-center"
              style={{
                backgroundColor: done ? color : skipped ? theme.elevated : "transparent",
                borderWidth: done ? 0 : 2,
                borderColor: theme.borderStrong,
              }}
            >
              <Ionicons
                name={skipped ? "play-skip-forward" : "checkmark"}
                size={skipped ? 18 : 24}
                color={done ? "#0B0B0C" : theme.muted}
              />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default React.memo(
  HabitCard,
  (a, b) =>
    a.habit.id === b.habit.id &&
    a.habit.entry_status === b.habit.entry_status &&
    a.habit.entry_value === b.habit.entry_value &&
    a.habit.week_done === b.habit.week_done &&
    a.habit.name === b.habit.name &&
    a.habit.icon === b.habit.icon &&
    a.habit.color === b.habit.color &&
    a.habit.cue === b.habit.cue &&
    a.onCheck === b.onCheck
);
