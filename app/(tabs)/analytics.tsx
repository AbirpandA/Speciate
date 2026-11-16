import StatTile from "@/components/detail/StatTile";
import ColumnChart from "@/components/insights/ColumnChart";
import ConsistencyHeatmap from "@/components/insights/ConsistencyHeatmap";
import HBarList from "@/components/insights/HBarList";
import Card from "@/components/ui/Card";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useInsights } from "@/hooks/useInsights";
import { WEEKDAY_LABELS } from "@/utils/schedule";
import { theme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const MOOD_LABELS = ["😞", "😕", "😐", "🙂", "😄"];

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <Text className="text-white text-base font-semibold">{title}</Text>
      {subtitle ? <Text className="text-muted text-sm mt-0.5 mb-3">{subtitle}</Text> : <View className="h-3" />}
      {children}
    </Card>
  );
}

export default function InsightsScreen() {
  const { data, isLoading } = useInsights();

  if (isLoading || !data) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  const { week, weekdays } = data;
  const delta =
    week.thisWeek != null && week.lastWeek != null ? Math.round((week.thisWeek - week.lastWeek) * 100) : null;
  const ranked = weekdays
    .map((v, i) => ({ v, i }))
    .filter((x): x is { v: number; i: number } => x.v != null)
    .sort((a, b) => b.v - a.v);
  const best = ranked[0];
  const worst = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;
  const topStreak = data.habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const totalUrges = data.urges.resisted + data.urges.gaveIn;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
        <ScreenHeader title="Insights" subtitle="How you're really doing" />

        {!data.hasHabits && !data.hasQuit ? (
          <View className="items-center mt-16 px-6">
            <Ionicons name="stats-chart-outline" size={36} color={theme.accent} />
            <Text className="text-white text-lg font-bold mt-4 text-center">Nothing to show yet</Text>
            <Text className="text-muted text-center mt-2">
              Check off a few habits and your patterns will start to appear here.
            </Text>
          </View>
        ) : (
          <>
            {data.hasHabits && (
              <>
                <View className="-mx-1 flex-row mb-3">
                  <StatTile
                    label="This week"
                    value={pct(week.thisWeek)}
                    hint={delta == null ? "so far" : `${delta >= 0 ? "+" : ""}${delta} pts vs last week`}
                  />
                  <StatTile label="Last week" value={pct(week.lastWeek)} />
                  <StatTile label="Top streak" value={`${topStreak}`} hint="days" />
                </View>

                <Section title="Consistency" subtitle="Share of scheduled habits done each day">
                  <ConsistencyHeatmap days={data.days} today={data.today} />
                </Section>

                <Section title="Habits" subtitle="Completion over the last 30 days">
                  <HBarList
                    bars={data.habits.map((h) => ({
                      key: String(h.id),
                      label: h.name,
                      value: h.rate30,
                      display: pct(h.rate30),
                    }))}
                  />
                </Section>

                <Section
                  title="Your week"
                  subtitle={
                    best
                      ? `Strongest on ${WEEKDAY_LABELS[best.i]}${worst ? `, toughest on ${WEEKDAY_LABELS[worst.i]}` : ""} (last 8 weeks)`
                      : "Completion by weekday, last 8 weeks"
                  }
                >
                  <ColumnChart
                    columns={weekdays.map((v, i) => ({
                      key: String(i),
                      label: WEEKDAY_LABELS[i].slice(0, 2),
                      value: v,
                      display: v == null ? "no habits scheduled" : pct(v),
                    }))}
                  />
                </Section>
              </>
            )}

            {data.hasQuit && (
              <Section title="Breaking habits" subtitle="Urges you logged and how they went">
                <View className="-mx-1 flex-row mb-4">
                  <StatTile label="Rode it out" value={`${data.urges.resisted}`} hint="urges" />
                  <StatTile label="Gave in" value={`${data.urges.gaveIn}`} hint="urges" />
                  <StatTile label="Slips" value={`${data.urges.slips}`} hint="total" />
                </View>
                {totalUrges > 0 && (
                  <Text className="text-fg-secondary text-sm mb-4">
                    You rode out {pct(data.urges.resisted / totalUrges)} of the urges you logged.
                  </Text>
                )}
                {data.triggers.length > 0 ? (
                  <>
                    <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
                      Top triggers
                    </Text>
                    <HBarList
                      color={theme.quit}
                      bars={data.triggers.slice(0, 5).map((t) => ({
                        key: t.trigger,
                        label: t.trigger,
                        value: t.count / data.triggers[0].count,
                        display: `${t.count}×`,
                      }))}
                    />
                  </>
                ) : (
                  <Text className="text-muted text-sm">
                    Name the trigger when you log an urge or slip to see your patterns here.
                  </Text>
                )}
              </Section>
            )}

            {data.hasHabits && data.moodDays >= 3 && (
              <Section title="Mood & habits" subtitle="Average completion on days with each journal mood">
                <ColumnChart
                  columns={data.mood.map((m) => ({
                    key: String(m.mood),
                    label: MOOD_LABELS[m.mood - 1],
                    value: m.rate,
                    display: m.rate == null ? "no days logged" : `${pct(m.rate)} over ${m.days} day${m.days === 1 ? "" : "s"}`,
                  }))}
                />
              </Section>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
