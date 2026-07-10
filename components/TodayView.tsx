// components/TodayView.tsx
import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import {
  HabitWithEntry,
  useHabitEntriesByPeriod,
} from "@/hooks/useHabitEntriesByPeriod";
import { useHabits } from "@/hooks/useHabits";
import { useToggleHabitEntry } from "@/hooks/useToggle";
import { Habit } from "@/types/dbTypes";
import Colors from "@/utils/colors";
import { getDateInfo } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming } from "react-native-reanimated";

import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

interface TodayViewProps {
  habits?: any[]; // Keep for backward compatibility, but we'll use hook data
}

const AnimatedCheckbox = ({ isChecked, onPress, checkboxColor, checkmarkColor }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.8, { damping: 10 }),
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onPress(e);
  };

  return (
    <Pressable onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View
        className="rounded-2xl items-center justify-center"
        style={[
          { backgroundColor: checkboxColor, width: 48, height: 48 },
          animatedStyle,
        ]}
      >
        <Ionicons name="checkmark" size={25} color={checkmarkColor} />
      </Animated.View>
    </Pressable>
  );
};

const HabitRow = React.memo(({ item, handleCardPress, handleCardLongPress, handleCheckboxPress }: any) => {
  const isChecked = item.entry_status === 1;
  const checkboxColor = isChecked
    ? item.color || "#fff"
    : Colors.checkBoxBackground;
  const checkmarkColor = isChecked ? "white" : Colors.checkMarkColor;

  return (
    <View
      className="flex-row items-center justify-between rounded-2xl p-4 mb-4"
      style={{
        backgroundColor: Colors.habitCardBackground,
        borderWidth: 1,
        borderColor: Colors.borderColor,
      }}
    >
      <TouchableOpacity
        onPress={() => handleCardPress(item)}
        onLongPress={() => handleCardLongPress(item)}
        className="flex-row items-center flex-1"
        activeOpacity={0.7}
      >
        <View
          className="bg-neutral-800 rounded-2xl p-4 mr-3"
          style={{ backgroundColor: Colors.habitIconBackground }}
        >
          <Ionicons
            name={(item.icon as any) ?? "help-outline"}
            size={24}
            color="#fff"
          />
        </View>
        <Text className="flex-1 text-white text-lg">{item.name}</Text>
      </TouchableOpacity>

      <AnimatedCheckbox
        isChecked={isChecked}
        onPress={(e: any) => handleCheckboxPress(item, e)}
        checkboxColor={checkboxColor}
        checkmarkColor={checkmarkColor}
      />
    </View>
  );
}, (prev, next) => {
  return (
    prev.item.entry_status === next.item.entry_status &&
    prev.item.id === next.item.id &&
    prev.item.name === next.item.name &&
    prev.item.icon === next.item.icon &&
    prev.item.color === next.item.color
  );
});

export default function TodayView({ habits: _habits }: TodayViewProps) {
  const router = useRouter();
  const {
    selectedHabit,
    actionSheetOpen,
    confirmSheet,
    openActions,
    closeActions,
    showConfirm,
    closeConfirm,
    handleConfirm,
  } = useHabitActions();

  const t = getDateInfo();

  const { archiveHabit, deleteHabit } = useHabits();
  const { toggleCheck } = useToggleHabitEntry();

  // Fetch habits with today's entry status - explicitly type as HabitWithEntry[]
  const {
    data: habitsWithEntries,
    isLoading,
    error,
    refetch,
  } = useHabitEntriesByPeriod("today");

  // Refetch when screen comes into focus (e.g., returning from edit/reorder screens)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Type assertion to ensure TypeScript knows this is HabitWithEntry[]
  const habitsData: HabitWithEntry[] =
    (habitsWithEntries as HabitWithEntry[]) || [];

  //console.log("Data", JSON.stringify(habitsData, null, 2));

  const handleArchive = (habit: Habit) => {
    archiveHabit(habit.id);
  };

  const handleDelete = (habit: Habit) => {
    deleteHabit(habit.id);
  };

  const handleEdit = (habit: Habit) => {
    router.push({
      pathname: "/newHabit",
      params: { habitId: habit.id.toString() },
    });
  };

  const handleReorder = () => {
    router.push("/reorder");
  };

  // Handle checkbox press
  const handleCheckboxPress = useCallback((habit: HabitWithEntry, e: any) => {
    e.stopPropagation();
    toggleCheck(habit.id, t.date, habit.entry_status);
  }, [toggleCheck, t.date]);

  // Handle card press
  const handleCardPress = useCallback((habit: HabitWithEntry) => {
    // TODO: Navigate to habit detail screen
  }, []);

  // Handle long press (for action sheet)
  const handleCardLongPress = useCallback((habit: HabitWithEntry) => {
    openActions(habit as Habit);
  }, [openActions]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white">Error loading habits</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList<HabitWithEntry>
        data={habitsData}
        keyExtractor={(item) => `habit-${item.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        estimatedItemSize={80}
        renderItem={({ item }) => (
          <HabitRow 
            item={item} 
            handleCardPress={handleCardPress}
            handleCardLongPress={handleCardLongPress}
            handleCheckboxPress={handleCheckboxPress}
          />
        )}
      />

      <HabitActionSheet
        selectedHabit={selectedHabit}
        actionSheetOpen={actionSheetOpen}
        confirmSheet={confirmSheet}
        onCloseActions={closeActions}
        onShowConfirm={showConfirm}
        onCloseConfirm={closeConfirm}
        onConfirm={() => handleConfirm(handleArchive, handleDelete)}
        onEdit={handleEdit}
        onReorder={handleReorder}
      />
    </View>
  );
}
