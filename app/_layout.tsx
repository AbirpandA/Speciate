import "@/global.css";
import { useAuthStore } from "@/services/authStorage";
import { migrateDbIfNeeded } from "@/services/db";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/utils/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

// Created once: recreating it on every render would drop the query cache.
const queryClient = new QueryClient();

export default function RootLayout() {
  const { hasCompletedOnboarding, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated]);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!_hasHydrated) return;
    
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      // Small timeout ensures the router is fully mounted in the standalone build
      setTimeout(() => {
        router.replace("/(onboarding)/welcome");
      }, 1);
    } else if (hasCompletedOnboarding && inOnboardingGroup) {
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 1);
    }
  }, [_hasHydrated, hasCompletedOnboarding, segments]);

  if (!_hasHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <SQLiteProvider
        databaseName="habitTrackerApp4.db"
        onInit={migrateDbIfNeeded}
        options={{ useNewConnection: false }}
      >
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.bg },
            }}
          >
            <Stack.Screen
              name="(onboarding)"
              options={{ headerShown: false }}
            />

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="newHabit"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="newGoal"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="habit/[id]"
              options={{ headerShown: false, animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="urge/[id]"
              options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="more"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="reorder"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
