import GoalItem from "@/components/GoalItem";
import HomeHeader from "@/components/HomeHeader";
import { useGoals } from "@/hooks/useGoals";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Goal } from "@/types/dbTypes";

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, toggleGoal, deleteGoal } = useGoals();

  const weeklyGoals = goals.filter((g) => g.timeframe === "weekly");
  const monthlyGoals = goals.filter((g) => g.timeframe === "monthly");
  const longTermGoals = goals.filter((g) => g.timeframe === "long_term");

  // Flatten the data for FlashList to consume optimally
  const data: (string | Goal | { empty: boolean; id: string })[] = [
    "Weekly Goals",
    ...(weeklyGoals.length > 0 ? weeklyGoals : [{ empty: true, id: "empty-weekly" }]),
    "Monthly Goals",
    ...(monthlyGoals.length > 0 ? monthlyGoals : [{ empty: true, id: "empty-monthly" }]),
    "Long-Term Goals",
    ...(longTermGoals.length > 0 ? longTermGoals : [{ empty: true, id: "empty-long" }]),
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1 px-5 pt-4">
        <HomeHeader />

        <View className="flex-1 mt-4">
          <FlashList
            data={data}
            estimatedItemSize={80}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            getItemType={(item) => {
              if (typeof item === "string") return "header";
              if ("empty" in item) return "empty";
              return "goal";
            }}
            renderItem={({ item }) => {
              if (typeof item === "string") {
                return <Text className="text-white text-xl font-bold mt-4 mb-3">{item}</Text>;
              }
              if ("empty" in item) {
                return (
                  <View className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800 border-dashed mb-4">
                    <Text className="text-neutral-500 text-center">No goals set yet.</Text>
                  </View>
                );
              }

              return (
                <GoalItem
                  goal={item as Goal}
                  onToggle={toggleGoal}
                  onDelete={deleteGoal}
                />
              );
            }}
          />
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          className="absolute bottom-28 right-5 w-16 h-16 rounded-full bg-white items-center justify-center shadow-lg"
          onPress={() => router.push("/newGoal")}
        >
          <Ionicons name="add" size={36} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
