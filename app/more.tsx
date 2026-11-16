import AppLogo from "@/components/AppLogo";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import { useArchivedHabits, useHabits } from "@/hooks/useHabits";
import { BackupService } from "@/services/BackupService";
import { useAuthStore } from "@/services/authStorage";
import { invalidateHabitQueries } from "@/utils/queryKeys";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2 mt-6">{children}</Text>
  );
}

function Row({
  icon,
  label,
  hint,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  hint?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-row items-center py-3.5 active:opacity-60">
      <Ionicons name={icon} size={20} color={danger ? theme.danger : theme.textSecondary} />
      <Text className="flex-1 text-base ml-3" style={{ color: danger ? theme.danger : theme.text }}>
        {label}
      </Text>
      {hint ? <Text className="text-muted text-sm">{hint}</Text> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [name, setName] = useState(profile?.name ?? "");
  const { data: archived = [] } = useArchivedHabits();
  const { restoreHabit } = useHabits();

  const handleExport = async () => {
    const res = await BackupService.exportData(db);
    if (!res.success) Alert.alert("Export failed", res.error || "Unknown error");
  };

  const handleImport = () =>
    Alert.alert("Replace your data?", "Importing a backup overwrites your current habits, goals and journal.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Import",
        style: "destructive",
        onPress: async () => {
          const res = await BackupService.importData(db);
          if (res.success) {
            invalidateHabitQueries(queryClient);
            queryClient.invalidateQueries();
            Alert.alert("Done", "Your backup has been restored.");
          } else if (res.error !== "Import cancelled") {
            Alert.alert("Import failed", res.error || "Unknown error");
          }
        },
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center px-3 py-1">
        <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text className="text-white text-xl font-bold ml-2">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>
        <SectionLabel>You</SectionLabel>
        <Card>
          <Text className="text-muted text-sm mb-2">What should we call you?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => setProfile({ name: name.trim() })}
            placeholder="Your first name"
            placeholderTextColor={theme.muted}
            className="text-white text-lg"
            maxLength={30}
            returnKeyType="done"
          />
        </Card>

        <SectionLabel>{`Archived habits${archived.length ? ` (${archived.length})` : ""}`}</SectionLabel>
        <Card className="py-1">
          {archived.length === 0 ? (
            <Text className="text-muted py-3">Nothing archived. Archived habits keep their history.</Text>
          ) : (
            archived.map((h) => (
              <View key={h.id} className="flex-row items-center py-3">
                <Ionicons name={(h.icon as any) || "ellipse-outline"} size={20} color={h.color || theme.textSecondary} />
                <Text className="text-white flex-1 ml-3" numberOfLines={1}>
                  {h.name}
                </Text>
                <Pressable onPress={() => restoreHabit(h.id)} hitSlop={8} accessibilityRole="button">
                  <Text className="font-semibold" style={{ color: theme.accent }}>
                    Restore
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </Card>

        <SectionLabel>Data & backup</SectionLabel>
        <Card className="py-1">
          <Row icon="share-outline" label="Export backup" hint="JSON file" onPress={handleExport} />
          <View className="h-px bg-line" />
          <Row icon="download-outline" label="Import backup" hint="Replaces data" onPress={handleImport} danger />
        </Card>

        <View className="items-center mt-10">
          <AppLogo size={36} />
          <Text className="text-white font-semibold mt-2">Speciate</Text>
          <Text className="text-muted text-xs mt-0.5">
            Version {Constants.expoConfig?.version ?? "—"} · Your data stays on this device
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
