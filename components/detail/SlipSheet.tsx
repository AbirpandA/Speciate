import BottomSheetModal from "@/components/BottomSheetModal";
import Chip from "@/components/ui/Chip";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { theme } from "@/utils/theme";
import React, { useState } from "react";
import { Text, View } from "react-native";

import { TRIGGERS } from "@/utils/triggers";

/** Compassionate slip logging: record it, learn the trigger, keep going. */
export default function SlipSheet({
  visible,
  habitName,
  bestDays,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  habitName: string;
  bestDays: number;
  onClose: () => void;
  onConfirm: (trigger: string | null) => void;
}) {
  const [trigger, setTrigger] = useState<string | null>(null);
  if (!visible) return null;
  return (
    <BottomSheetModal visible onClose={onClose}>
      <View className="w-10 h-1 rounded-full bg-line-strong self-center mb-4" />
      <Text className="text-white text-xl font-bold">{"A slip isn't a restart from zero"}</Text>
      <Text className="text-fg-secondary mt-2 leading-5">
        Your best run of {bestDays} day{bestDays === 1 ? "" : "s"} and every clean day so far still count.
        Noticing what triggered it is how you get stronger against {habitName.toLowerCase()}.
      </Text>
      <Text className="text-muted text-xs font-semibold uppercase tracking-wider mt-5 mb-2">
        What set it off?
      </Text>
      <View className="flex-row flex-wrap">
        {TRIGGERS.map((t) => (
          <Chip
            key={t}
            label={t}
            selected={trigger === t}
            color={theme.quit}
            onPress={() => setTrigger(trigger === t ? null : t)}
          />
        ))}
      </View>
      <View className="mt-4">
        <PrimaryButton
          label="Log slip & start a new run"
          color={theme.quit}
          onPress={() => {
            onConfirm(trigger);
            setTrigger(null);
            onClose();
          }}
        />
        <View className="h-2" />
        <PrimaryButton label="Cancel" variant="outline" onPress={onClose} />
      </View>
      <View className="h-4" />
    </BottomSheetModal>
  );
}
