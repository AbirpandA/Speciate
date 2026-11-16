import ScreenHeader from "@/components/ui/ScreenHeader";
import { useJournal } from "@/hooks/useJournal";
import { getDateInfo } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JournalScreen() {
  const { entries, saveEntry, deleteEntry, isLoading } = useJournal();
  const t = getDateInfo();
  const todayDateStr = t.date;

  const [todaysContent, setTodaysContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "">("");

  const isLoadedRef = useRef(false);
  const initialContentRef = useRef("");

  // Initialize today's content from the DB if it exists
  useEffect(() => {
    if (!isLoading && !isLoadedRef.current) {
      const todayEntry = entries.find((e) => e.date === todayDateStr);
      const content = todayEntry ? todayEntry.content : "";
      setTodaysContent(content);
      initialContentRef.current = content;
      isLoadedRef.current = true;
    }
  }, [entries, isLoading, todayDateStr]);

  // Debounced Auto-Save
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (todaysContent === initialContentRef.current) {
      setSaveStatus(todaysContent.trim() ? "saved" : "");
      return;
    }

    setSaveStatus("saving");
    const timeoutId = setTimeout(async () => {
      try {
        await saveEntry({ date: todayDateStr, content: todaysContent });
        initialContentRef.current = todaysContent;
        setSaveStatus("saved");
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timeoutId);
  }, [todaysContent, todayDateStr, saveEntry]);

  const pastEntries = entries.filter((e) => e.date !== todayDateStr);

  const renderEmpty = () => (
    <View className="p-5 rounded-2xl border border-line border-dashed">
      <Text className="text-neutral-500 text-center">
        No past journal entries yet.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-5 pt-4">
          <ScreenHeader title="Journal" subtitle={t.now.toFormat("cccc, d LLLL")} />

          {/* FIXED HEADER (Does not unmount when typing) */}
          <View className="mb-4">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="text-white text-xl font-bold">
                What did I learn today?
              </Text>
              {saveStatus === "saving" && (
                <Text className="text-neutral-400 text-sm">Saving...</Text>
              )}
              {saveStatus === "saved" && (
                <Text className="text-neutral-500 text-sm">Saved</Text>
              )}
            </View>
            <View className="bg-surface rounded-3xl border border-line">
              <TextInput
                className="text-white text-lg px-4 py-4 min-h-[150px]"
                placeholder="e.g. I learned how to use SQLite in React Native..."
                placeholderTextColor="#777"
                multiline
                textAlignVertical="top"
                value={todaysContent}
                onChangeText={setTodaysContent}
              />
            </View>

            <Text className="text-fg-secondary text-sm font-semibold uppercase tracking-wider mt-8">Past entries</Text>
          </View>

          <View className="flex-1">
            <FlashList
              data={pastEntries}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <View className="bg-surface p-4 rounded-3xl mb-3 border border-line">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-neutral-400 font-semibold">
                      {DateTime.fromISO(item.date).toFormat("ccc, d LLL")}
                    </Text>
                    <TouchableOpacity onPress={() => deleteEntry(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-white text-lg leading-relaxed">
                    {item.content}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
