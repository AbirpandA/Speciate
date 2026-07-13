import { Goal } from "@/types/dbTypes";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface GoalItemProps {
  goal: Goal;
  onToggle: (goal: Goal) => void;
  onDelete: (id: number) => void;
}

export default function GoalItem({ goal, onToggle, onDelete }: GoalItemProps) {
  const isCompleted = goal.status === 1;

  return (
    <View className="flex-row items-center justify-between bg-neutral-800 p-4 rounded-2xl mb-3 border border-neutral-700">
      <View className="flex-row items-center flex-1">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => onToggle(goal)}
          className={`w-7 h-7 rounded-full border-2 items-center justify-center mr-3 ${
            isCompleted ? "bg-white border-white" : "border-neutral-500"
          }`}
        >
          {isCompleted && <Ionicons name="checkmark" size={18} color="black" />}
        </TouchableOpacity>

        {/* Text */}
        <View className="flex-1">
          <Text
            className={`text-lg font-semibold ${
              isCompleted ? "text-neutral-500 line-through" : "text-white"
            }`}
          >
            {goal.title}
          </Text>
          {goal.deadline ? (
            <Text className="text-sm text-neutral-400 mt-1">
              Deadline: {goal.deadline}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Delete button (optional, could be swipeable instead) */}
      <TouchableOpacity onPress={() => onDelete(goal.id)} className="ml-3 p-2">
        <Ionicons name="trash-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}
