import React, { useState } from "react";
import { Text, View, Dimensions, ActivityIndicator } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { getWeeklyCompletionData, ChartDataPoint } from "@/utils/analyticsQueries";
import Svg, { Line, Circle, Polyline, Text as SvgText } from "react-native-svg";
import { useFocusEffect } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = () => {
  const db = useSQLiteContext();
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setIsLoading(true);
    const chartData = await getWeeklyCompletionData(db);
    setData(chartData);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-900 justify-center items-center">
        <ActivityIndicator color="#10b981" />
      </View>
    );
  }

  // Chart config
  const chartHeight = 250;
  const paddingX = 20;
  const paddingY = 40;
  const chartWidth = screenWidth - 40; // Total width minus screen padding
  
  // To avoid division by zero if all values are 0
  const maxValue = Math.max(...data.map(d => d.value), 4); 
  
  // Calculate points
  const points = data.map((d, i) => {
    const x = paddingX + (i * (chartWidth - paddingX * 2)) / (data.length - 1);
    const y = chartHeight - paddingY - (d.value / maxValue) * (chartHeight - paddingY * 2);
    return { x, y, label: d.label, value: d.value };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <View className="flex-1 bg-neutral-900 pt-16 px-5">
      <Text className="text-white text-3xl font-bold mb-8">Analytics</Text>
      
      <View className="bg-neutral-800 rounded-2xl p-4 shadow-sm mb-6">
        <Text className="text-gray-400 font-bold uppercase mb-4 tracking-wider">7-Day Completion Trend</Text>
        
        <View style={{ alignItems: 'center' }}>
          <Svg height={chartHeight} width={chartWidth}>
            {/* Grid Line (Base) */}
            <Line 
              x1={paddingX} 
              y1={chartHeight - paddingY} 
              x2={chartWidth - paddingX} 
              y2={chartHeight - paddingY} 
              stroke="#3f3f46" 
              strokeWidth="2" 
            />
            
            {/* The Line Chart */}
            <Polyline
              points={polylinePoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />
            
            {/* Data Points & Labels */}
            {points.map((p, i) => (
              <React.Fragment key={i}>
                <Circle cx={p.x} cy={p.y} r="5" fill="#10b981" />
                <SvgText
                  x={p.x}
                  y={p.y - 12}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.value}
                </SvgText>
                <SvgText
                  x={p.x}
                  y={chartHeight - 15}
                  fill="#9ca3af"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {p.label}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>
      </View>
    </View>
  );
};

export default AnalyticsScreen;
