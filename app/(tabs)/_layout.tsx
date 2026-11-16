import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: "index", title: "Today", icon: "today-outline", iconActive: "today" },
  { name: "goals", title: "Goals", icon: "flag-outline", iconActive: "flag" },
  { name: "journal", title: "Journal", icon: "book-outline", iconActive: "book" },
  { name: "analytics", title: "Insights", icon: "stats-chart-outline", iconActive: "stats-chart" },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.bg },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingTop: 6,
        },
      }}
      screenListeners={{ tabPress: () => Haptics.selectionAsync() }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? t.iconActive : t.icon} size={23} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
