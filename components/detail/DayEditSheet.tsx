import BottomSheetModal from "@/components/BottomSheetModal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import type { EntryStatus } from "@/types/dbTypes";
import { theme } from "@/utils/theme";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

type Choice = "none" | "done" | "skipped";
const toChoice = (s?: number | null): Choice => (s === 1 ? "done" : s === 2 ? "skipped" : "none");

export default function DayEditSheet({
  date,
  status,
  note,
  color,
  onClose,
  onSave,
}: {
  date: string | null;
  status?: number | null;
  note?: string | null;
  color: string;
  onClose: () => void;
  onSave: (status: EntryStatus | null, note: string | null) => void;
}) {
  const [choice, setChoice] = useState<Choice>(toChoice(status));
  const [text, setText] = useState(note ?? "");

  if (!date) return null;
  return (
    <BottomSheetModal visible onClose={onClose}>
      <View className="w-10 h-1 rounded-full bg-line-strong self-center mb-4" />
      <Text className="text-white text-xl font-bold mb-4">
        {DateTime.fromISO(date).toFormat("cccc, d LLLL")}
      </Text>
      <SegmentedControl
        options={["none", "done", "skipped"] as const}
        labels={{ none: "Not done", done: "Done", skipped: "Skipped" }}
        value={choice}
        onChange={setChoice}
        activeColor={choice === "done" ? color : undefined}
      />
      <Text className="text-muted text-xs font-semibold uppercase tracking-wider mt-5 mb-2">Note</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="How did it go? What helped or got in the way?"
        placeholderTextColor={theme.muted}
        multiline
        className="bg-elevated rounded-2xl px-4 py-3 text-white min-h-[80px] mb-5"
        style={{ textAlignVertical: "top" }}
      />
      <PrimaryButton
        label="Save"
        color={color}
        onPress={() => {
          onSave(choice === "done" ? 1 : choice === "skipped" ? 2 : null, text.trim() || null);
          onClose();
        }}
      />
      <View className="h-4" />
    </BottomSheetModal>
  );
}
