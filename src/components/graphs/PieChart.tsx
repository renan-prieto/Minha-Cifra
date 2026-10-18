
import { ThemedText } from "@/src/components/expo/themed-text";
import { getPizzaStyles } from "@/src/components/styles/stylesPizza";
import { useTheme } from "@/src/context/ThemeContext";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { GRAPH_COLORS } from "./colors";

interface GraphicItem {
  id: string;
  title: string;
  value: number;
}

interface Props {
  data: GraphicItem[];
}

export default function PieChart({ data }: Props) {
  const { isDark } = useTheme();
  const pizzaStyles = getPizzaStyles(isDark);
  const progress = useRef(new Animated.Value(0)).current;

  const dataKey = data.map((item) => `${item.id}:${item.value}`).join("|");

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [dataKey, progress]);

  const radius = 55;
  const size = 240;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length || total === 0) {
    return (
      <View style={pizzaStyles.noDataContainer}>
        <ThemedText style={pizzaStyles.noDataLabel}>
          Sem gastos registrados neste mês.
        </ThemedText>
      </View>
    );
  }

  let accumulated = 0;

  return (
    <View style={pizzaStyles.chartWrapper}>
      <Animated.View
        style={{
          opacity: progress,
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.75, 1],
              }),
            },
          ],
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const strokeLength = circumference * (item.value / total);

            const circle = (
              <Circle
                key={item.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={GRAPH_COLORS[index % GRAPH_COLORS.length]}
                strokeWidth={radius * 2}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={-accumulated}
                transform={`rotate(-90 ${center} ${center})`}
              />
            );

            accumulated += strokeLength;
            return circle;
          })}
        </Svg>
      </Animated.View>
    </View>
  );
}
