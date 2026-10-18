
import { ThemedText } from "@/src/components/expo/themed-text";
import { getBarStyles } from "@/src/components/styles/stylesBar";
import { useTheme } from "@/src/context/ThemeContext";
import { useEffect, useRef } from "react";
import { Alert, Animated, View } from "react-native";
import GraphBar from "./GraphBar";
import { BAR_COLORS } from "./colors";

interface Props {
  data: any[];
  maxValue: number;
}

function AnimatedEntry({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function GraphBars({ data, maxValue }: Props) {
  const { isDark } = useTheme();
  const styles = getBarStyles(isDark);

  function handleDetails(
    category: string,
    year: number,
    month: string,
    value: number,
  ) {
    Alert.alert(
      "Detalhes",
      `${category} em ${month}/${year}: R$ ${value.toFixed(2)}`,
    );
  }

  const hasData = data.some(
    (item) => item.earn > 0 || item.lost > 0 || item.investments > 0,
  );

  if (!hasData) {
    return (
      <View style={styles.noDataContainer}>
        <ThemedText style={styles.noDataLabel}>
          Sem dados para este mês.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      {data.map((item, groupIndex) => (
        <View
          key={`${item.month}-${item.year}-${item.earn}-${item.lost}-${item.investments}`}
          style={styles.monthGroup}
        >
          <View style={styles.barsRow}>
            <AnimatedEntry delay={groupIndex * 120}>
              <GraphBar
                value={item.earn}
                maxValue={maxValue}
                maxHeight={250}
                barWidth={45}
                color={BAR_COLORS.earn}
                onPress={() =>
                  handleDetails("Ganhos", item.year, item.month, item.earn)
                }
              />
            </AnimatedEntry>

            <AnimatedEntry delay={groupIndex * 120 + 90}>
              <GraphBar
                value={item.lost}
                maxValue={maxValue}
                maxHeight={250}
                barWidth={45}
                color={BAR_COLORS.lost}
                onPress={() =>
                  handleDetails("Gastos", item.year, item.month, item.lost)
                }
              />
            </AnimatedEntry>

            <AnimatedEntry delay={groupIndex * 120 + 180}>
              <GraphBar
                value={item.investments}
                maxValue={maxValue}
                maxHeight={250}
                barWidth={45}
                color={BAR_COLORS.investments}
                onPress={() =>
                  handleDetails(
                    "Investimentos",
                    item.year,
                    item.month,
                    item.investments,
                  )
                }
              />
            </AnimatedEntry>
          </View>
        </View>
      ))}
    </View>
  );
}
