import { theme } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import React, { useEffect, useEffectEvent } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const COLORS = [theme.accent, "#FFD93D", "#4D96FF", "#F78DA7", "#C56CF0", "#FF9F1C"];
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  angle: (i / 24) * Math.PI * 2 + (i % 2) * 0.2,
  distance: 110 + (i % 4) * 30,
  color: COLORS[i % COLORS.length],
  size: 8 + (i % 3) * 3,
}));

function Particle({ angle, distance, color, size }: (typeof PARTICLES)[number]) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [t]);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
    opacity: 1 - v * 0.9,
    transform: [
      { translateX: Math.cos(angle) * distance * v },
      { translateY: Math.sin(angle) * distance * v + 40 * v * v },
      { scale: 1 - v * 0.4 },
    ],
    };
  });
  return (
    <Animated.View
      style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

export type CelebrationMessage = { emoji: string; title: string; subtitle?: string };

/** Full-screen, non-blocking burst (day complete, quit milestones). */
export default function Celebration({
  message,
  onDone,
}: {
  message: CelebrationMessage | null;
  onDone: () => void;
}) {
  const visible = message !== null;
  const hasSubtitle = !!message?.subtitle;
  // Latest onDone without restarting the timer when the parent re-renders.
  const finish = useEffectEvent(() => onDone());
  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = setTimeout(finish, hasSubtitle ? 2600 : 1800);
    return () => clearTimeout(id);
  }, [visible, hasSubtitle]);

  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(300)}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
        <View className="bg-elevated px-6 py-4 rounded-3xl border border-line items-center max-w-[280px]">
          <Text className="text-3xl">{message?.emoji}</Text>
          <Text className="text-white text-lg font-bold mt-1 text-center">{message?.title}</Text>
          {message?.subtitle ? (
            <Text className="text-fg-secondary text-sm mt-1 text-center">{message.subtitle}</Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
