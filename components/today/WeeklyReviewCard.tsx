import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { WeeklyReview } from "@/hooks/useWeeklyReview";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

/**
 * Start-of-week reflection: celebrate what worked, look honestly at what
 * didn't, and decide one adjustment. The answer is saved to the journal.
 */
export default function WeeklyReviewCard({
  review,
  onSave,
  onDismiss,
}: {
  review: WeeklyReview;
  onSave: (text: string) => void;
  onDismiss: () => void;
}) {
  const [text, setText] = useState("");
  const range = `${DateTime.fromISO(review.weekStart).toFormat("d LLL")} – ${DateTime.fromISO(review.weekStart)
    .plus({ days: 6 })
    .toFormat("d LLL")}`;

  return (
    <Card className="mb-5" style={{ borderColor: theme.accent + "55" }}>
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider">Weekly review · {range}</Text>
          <Text className="text-white text-xl font-bold mt-1">
            {review.rate == null ? "New week, fresh start" : `Last week: ${Math.round(review.rate * 100)}% done`}
          </Text>
        </View>
        <Pressable onPress={onDismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss weekly review">
          <Ionicons name="close" size={20} color={theme.muted} />
        </Pressable>
      </View>

      {review.wins.length > 0 && (
        <View className="mt-3">
          {review.wins.map((w) => (
            <View key={w.name} className="flex-row items-center mt-1">
              <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
              <Text className="text-white ml-2 flex-1" numberOfLines={1}>
                {w.name}
              </Text>
              <Text className="text-fg-secondary text-sm">
                {w.done}/{w.expected}
              </Text>
            </View>
          ))}
        </View>
      )}

      {review.mostMissed && (
        <Text className="text-fg-secondary text-sm mt-3 leading-5">
          Hardest to keep: <Text className="text-white font-semibold">{review.mostMissed.name}</Text> (missed{" "}
          {review.mostMissed.missed}×). Could you make it smaller, or tie it to something you already do?
        </Text>
      )}

      <Text className="text-white font-semibold mt-4 mb-2">What will you adjust this week?</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="e.g. Read right after dinner instead of before bed"
        placeholderTextColor={theme.muted}
        multiline
        className="bg-elevated rounded-2xl px-4 py-3 text-white min-h-[64px] mb-3"
        style={{ textAlignVertical: "top" }}
      />
      <PrimaryButton label="Save to journal" disabled={!text.trim()} onPress={() => onSave(text.trim())} />
    </Card>
  );
}
