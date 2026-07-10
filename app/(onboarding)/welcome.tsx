import { useAuthStore } from "@/services/authStorage";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { completedOnboarding } = useAuthStore();

  const onGetStarted = async () => {
    completedOnboarding();
    router.replace("/(tabs)"); // Go to main app
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
      <View className="flex-1">
        {/* Full Top Image */}
        <Animated.Image
          entering={FadeInDown.duration(800)}
          source={require("../../assets/images/welcome-image.png")}
          style={{ width: width, height: width * 1.5 }}
          resizeMode="cover"
        />

        {/* Content pushed to bottom */}
        <View className="flex-1 justify-end">
          <View className="bg-black px-6 pt-10 pb-10">
            {/* Title Text */}
            <Animated.Text 
              entering={FadeInDown.delay(300).springify()}
              className="text-white text-4xl font-bold text-center mb-3 leading-snug"
            >
              Welcome to{"\n"}Habit Tracker
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text 
              entering={FadeInDown.delay(500).springify()}
              className="text-gray-400 text-xl text-center mb-10 max-w-[260px] self-center"
            >
              Small steps every day lead to big changes.
            </Animated.Text>

            {/* Bottom Button */}
            <Animated.View entering={FadeInDown.delay(700).springify()}>
              <TouchableOpacity
                onPress={onGetStarted}
                className="bg-white rounded-full py-4 w-full max-w-md self-center shadow-lg"
                activeOpacity={0.8}
              >
                <Text className="text-black text-lg font-bold text-center uppercase tracking-wider">
                  Get Started
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
