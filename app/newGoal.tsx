import { useGoals } from "@/hooks/useGoals";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIMEFRAMES = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "long_term", label: "Long-term" },
] as const;

export default function NewGoalScreen() {
  const router = useRouter();
  const { addGoal } = useGoals();

  const [title, setTitle] = useState("");
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "long_term">("weekly");
  const [deadline, setDeadline] = useState("");

  const saveGoal = () => {
    if (!title.trim()) return;

    addGoal({
      title,
      timeframe,
      deadline: deadline.trim() || undefined,
    });

    router.back();
  };

  const isSaveEnabled = title.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-neutral-900">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-neutral-900">
          {/* HEADER */}
          <View className="flex-row items-center px-5 pb-5 pt-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-2xl font-semibold ml-4">
              New Goal
            </Text>
          </View>

          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
          >
            {/* TITLE */}
            <Text className="text-white text-lg font-bold mb-2 mt-4">What&apos;s your goal?</Text>
            <TextInput
              className="bg-neutral-800 px-4 py-4 rounded-xl text-white mb-6 border border-neutral-700 text-lg"
              placeholder="e.g. Read 2 books, Run a marathon"
              placeholderTextColor="#777"
              value={title}
              onChangeText={setTitle}
            />

            {/* TIMEFRAME */}
            <Text className="text-white text-lg font-bold mb-3">Timeframe</Text>
            <View className="flex-row flex-wrap mb-6 gap-2">
              {TIMEFRAMES.map((t) => {
                const isSelected = timeframe === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimeframe(t.id);
                    }}
                    className={`px-5 py-3 rounded-full border ${
                      isSelected
                        ? "bg-white border-white"
                        : "bg-neutral-800 border-neutral-700"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        isSelected ? "text-black" : "text-neutral-400"
                      }`}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DEADLINE (Optional) */}
            <Text className="text-white text-lg font-bold mb-2">
              Deadline (Optional)
            </Text>
            <TextInput
              className="bg-neutral-800 px-4 py-4 rounded-xl text-white mb-5 border border-neutral-700"
              placeholder="e.g. Dec 31, 2026"
              placeholderTextColor="#777"
              value={deadline}
              onChangeText={setDeadline}
            />
          </ScrollView>

          {/* SAVE BUTTON */}
          <View className="absolute bottom-0 w-full px-5 pb-5">
            <TouchableOpacity
              onPress={saveGoal}
              disabled={!isSaveEnabled}
              className={`py-4 rounded-full ${
                isSaveEnabled ? "bg-white" : "bg-neutral-700"
              }`}
            >
              <Text
                className={`text-center text-lg font-semibold ${
                  isSaveEnabled ? "text-black" : "text-neutral-500"
                }`}
              >
                Save Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
