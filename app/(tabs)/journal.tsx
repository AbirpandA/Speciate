import ScreenHeader from "@/components/ui/ScreenHeader";
import { useJournal } from "@/hooks/useJournal";
import { JOURNAL_PROMPTS, MOODS } from "@/utils/journalPrompts";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { DateTime } from "luxon";
import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Today's text editor with debounced autosave. Remounted (via key) on outside changes. */
function TodayEditor({
  date,
  initialContent,
  prompt,
  onSave,
}: {
  date: string;
  initialContent: string;
  prompt: string;
  onSave: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"" | "saving" | "saved">(initialContent.trim() ? "saved" : "");
  const savedRef = useRef(initialContent);
  const save = useEffectEvent(async (value: string) => {
    try {
      await onSave(value);
      savedRef.current = value;
      setStatus("saved");
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  });

  useEffect(() => {
    if (content === savedRef.current) return;
    const id = setTimeout(() => save(content), 1000);
    return () => clearTimeout(id);
  }, [content, date]);

  return (
    <View>
      <View className="flex-row justify-end h-5 -mt-1 mb-1">
        <Text className="text-muted text-xs">{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}</Text>
      </View>
      <View className="bg-surface rounded-3xl border border-line">
        <TextInput
          className="text-white text-lg px-4 py-4 min-h-[140px]"
          placeholder={prompt}
          placeholderTextColor={theme.muted}
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={(v) => {
            setContent(v);
            setStatus(v === savedRef.current ? "saved" : "saving");
          }}
        />
      </View>
    </View>
  );
}

export default function JournalScreen() {
  const { entries, saveEntry, deleteEntry, isLoading } = useJournal();
  const now = DateTime.local();
  const today = now.toFormat("yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === today);
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = JOURNAL_PROMPTS[promptIndex % JOURNAL_PROMPTS.length];

  // Content the editor itself last wrote; anything else in the DB is an outside change.
  const [lastEditorSave, setLastEditorSave] = useState<string | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const dbContent = todayEntry?.content ?? "";
  const [seenDbContent, setSeenDbContent] = useState<string | null>(null);
  if (!isLoading && dbContent !== seenDbContent) {
    // Adjusting state during render (React-recommended over an effect).
    setSeenDbContent(dbContent);
    if (seenDbContent !== null && dbContent !== lastEditorSave) setEditorVersion((v) => v + 1);
  }

  const saveContent = async (content: string) => {
    setLastEditorSave(content);
    await saveEntry({ date: today, content });
  };

  const confirmDelete = (id: number, date: string) =>
    Alert.alert(
      "Delete this entry?",
      `Your entry for ${DateTime.fromISO(date).toFormat("d LLLL")} will be permanently deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteEntry(id) },
      ]
    );

  const pastEntries = entries.filter((e) => e.date !== today && (e.content.trim() || e.mood));

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 px-5 pt-2">
          <ScreenHeader title="Journal" subtitle={now.toFormat("cccc, d LLLL")} />

          <View className="mb-4">
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">How was today?</Text>
            <View className="flex-row justify-between mb-5">
              {MOODS.map((m) => {
                const on = todayEntry?.mood === m.value;
                return (
                  <Pressable
                    key={m.value}
                    onPress={() => {
                      Haptics.selectionAsync();
                      saveEntry({ date: today, mood: on ? null : m.value });
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={m.label}
                    className="items-center py-2 rounded-2xl"
                    style={{
                      width: 60,
                      backgroundColor: on ? theme.accentSoft : theme.surface,
                      borderWidth: 1,
                      borderColor: on ? theme.accent : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 24, opacity: todayEntry?.mood && !on ? 0.45 : 1 }}>{m.emoji}</Text>
                    <Text className="text-xs mt-0.5" style={{ color: on ? theme.accent : theme.muted }}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold flex-1 pr-2">{prompt}</Text>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setPromptIndex((i) => i + 1);
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Show another prompt"
              >
                <Ionicons name="shuffle" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
            {!isLoading && (
              <TodayEditor
                key={`${today}-${editorVersion}`}
                date={today}
                initialContent={dbContent}
                prompt="Write a few lines…"
                onSave={saveContent}
              />
            )}

            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mt-7">Past entries</Text>
          </View>

          <View className="flex-1">
            <FlashList
              data={pastEntries}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View className="p-5 rounded-2xl border border-line border-dashed">
                  <Text className="text-muted text-center">Your past entries will show up here.</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => {
                const mood = MOODS.find((m) => m.value === item.mood);
                return (
                  <View className="bg-surface p-4 rounded-3xl mb-3 border border-line">
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-fg-secondary font-semibold">
                        {DateTime.fromISO(item.date).toFormat("ccc, d LLL")}
                        {mood ? `  ${mood.emoji}` : ""}
                      </Text>
                      <Pressable
                        onPress={() => confirmDelete(item.id, item.date)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Delete entry"
                      >
                        <Ionicons name="trash-outline" size={18} color={theme.muted} />
                      </Pressable>
                    </View>
                    {item.content.trim() ? (
                      <Text className="text-white text-base leading-6">{item.content}</Text>
                    ) : (
                      <Text className="text-muted text-sm">Mood only</Text>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
