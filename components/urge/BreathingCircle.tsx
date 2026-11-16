import { theme } from "@/utils/theme";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// 4 seconds in, 6 seconds out: a slow exhale calms the body's stress response.
const IN_MS = 4000;
const OUT_MS = 6000;

export default function BreathingCircle({ color = theme.quit, size = 220 }: { color?: string; size?: number }) {
  const scale = useSharedValue(0.6);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    scale.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: IN_MS, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.6, { duration: OUT_MS, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      )
    );
    let t: ReturnType<typeof setTimeout>;
    const cycle = (p: "in" | "out") => {
      setPhase(p);
      t = setTimeout(() => cycle(p === "in" ? "out" : "in"), p === "in" ? IN_MS : OUT_MS);
    };
    cycle("in");
    return () => {
      clearTimeout(t);
      cancelAnimation(scale);
    };
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Animated.View
        style={[
          { position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color + "22" },
          style,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: size,
            backgroundColor: color + "44",
          },
          style,
        ]}
      />
      <Text className="text-white text-xl font-semibold" accessibilityLiveRegion="polite">
        {phase === "in" ? "Breathe in" : "Breathe out"}
      </Text>
    </View>
  );
}
