import { theme } from "@/utils/theme";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: "none",
      }}
    >
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
