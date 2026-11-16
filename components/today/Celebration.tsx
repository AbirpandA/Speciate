import { theme } from "@/utils/theme";
import React, { useEffect } from "react";
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

/** Full-screen, non-blocking burst shown when every habit for today is done. */
export default function Celebration({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onDone, 1800);
    return () => clearTimeout(id);
  }, [visible, onDone]);

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
        <View className="bg-elevated px-6 py-4 rounded-3xl border border-line items-center">
          <Text className="text-3xl">🌱</Text>
          <Text className="text-white text-lg font-bold mt-1">Day complete</Text>
        </View>
      </View>
    </Animated.View>
  );
}
