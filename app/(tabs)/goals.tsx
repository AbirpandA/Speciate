import GoalItem from "@/components/GoalItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import IconButton from "@/components/ui/IconButton";
import { useGoals } from "@/hooks/useGoals";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
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
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-4">
        <ScreenHeader
          title="Goals"
          subtitle="Where you're heading"
          right={
            <IconButton
              icon="add"
              variant="accent"
              accessibilityLabel="New goal"
              onPress={() => router.push("/newGoal")}
            />
          }
        />

        <View className="flex-1">
          <FlashList
            data={data}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            getItemType={(item) => {
              if (typeof item === "string") return "header";
              if ("empty" in item) return "empty";
              return "goal";
            }}
            renderItem={({ item }) => {
              if (typeof item === "string") {
                return <Text className="text-fg-secondary text-sm font-semibold uppercase tracking-wider mt-4 mb-3">{item}</Text>;
              }
              if ("empty" in item) {
                return (
                  <View className="p-5 rounded-2xl border border-line border-dashed mb-4">
                    <Text className="text-muted text-center">No goals here yet. Tap + to add one.</Text>
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

      </View>
    </SafeAreaView>
  );
}
