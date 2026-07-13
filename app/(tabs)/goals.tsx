import GoalItem from "@/components/GoalItem";
import HomeHeader from "@/components/HomeHeader";
import { useGoals } from "@/hooks/useGoals";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, toggleGoal, deleteGoal } = useGoals();

  const weeklyGoals = goals.filter((g) => g.timeframe === "weekly");
  const monthlyGoals = goals.filter((g) => g.timeframe === "monthly");
  const longTermGoals = goals.filter((g) => g.timeframe === "long_term");

  const renderSection = (title: string, list: typeof goals) => (
    <View className="mb-6">
      <Text className="text-white text-xl font-bold mb-3">{title}</Text>
      {list.length === 0 ? (
        <View className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800 border-dashed">
          <Text className="text-neutral-500 text-center">No goals set yet.</Text>
        </View>
      ) : (
        list.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onToggle={toggleGoal}
            onDelete={deleteGoal}
          />
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1 px-5 pt-4">
        <HomeHeader />

        <ScrollView
          className="flex-1 mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {renderSection("Weekly Goals", weeklyGoals)}
          {renderSection("Monthly Goals", monthlyGoals)}
          {renderSection("Long-Term Goals", longTermGoals)}
        </ScrollView>

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
