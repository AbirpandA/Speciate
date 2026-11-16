import TodayView from "@/components/TodayView";
import IconButton from "@/components/ui/IconButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAuthStore } from "@/services/authStorage";
import { greeting } from "@/utils/motivation";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TodayScreen() {
  const router = useRouter();
  const name = useAuthStore((s) => s.profile?.name);
  const now = DateTime.local();
  const hello = greeting(now.hour);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <TodayView
        header={
          <ScreenHeader
            subtitle={now.toFormat("cccc, d LLLL")}
            title={name ? `${hello}, ${name}` : hello}
            right={
              <>
                <IconButton
                  icon="settings-outline"
                  variant="filled"
                  accessibilityLabel="Settings"
                  onPress={() => router.push("/more")}
                />
                <IconButton
                  icon="add"
                  variant="accent"
                  accessibilityLabel="New habit"
                  onPress={() => router.push("/newHabit")}
                />
              </>
            }
          />
        }
      />
    </SafeAreaView>
  );
}
