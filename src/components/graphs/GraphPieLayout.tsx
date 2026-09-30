import { Text, View } from "react-native";

import LegendList from "@/src/components/graphs/LegendList";
import PieChart from "@/src/components/graphs/PieChart";
import { getPizzaStyles } from "@/src/components/styles/stylesPizza";
import { useTheme } from "@/src/context/ThemeContext";

interface GraphicItem {
  id: string;
  title: string;
  value: number;
}

interface GraphPieLayoutProps {
  data: GraphicItem[];
  maiorGasto?: string;
  categoria?: string;
  total?: string | number;
}

export const GraphPieLayout = ({
  data,
  maiorGasto,
  categoria,
  total,
}: GraphPieLayoutProps) => {
  const { isDark } = useTheme();
  const pizzaStyles = getPizzaStyles(isDark);

  const pieData: GraphicItem[] = Object.values(
    data.reduce<Record<string, GraphicItem>>((acc, item) => {
      const categoria = item.title?.trim() || "Sem categoria";

      if (!acc[categoria]) {
        acc[categoria] = {
          id: item.id,
          title: categoria,
          value: 0,
        };
      }

      acc[categoria].value += item.value;

      return acc;
    }, {}),
  );

  const maiorGastoCalculado =
    pieData.length > 0
      ? pieData.reduce((maior, atual) =>
          atual.value > maior.value ? atual : maior,
        )
      : null;

  const maiorGastoFinal = maiorGasto ?? maiorGastoCalculado?.title ?? "Nenhum";

  const categoriaFinal = categoria ?? maiorGastoCalculado?.title ?? "Nenhuma";

  const totalCalculado = pieData.reduce((acc, item) => acc + item.value, 0);

  const totalFinal = total ?? totalCalculado;

  const formattedTotal =
    typeof totalFinal === "number"
      ? `R$ ${totalFinal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : totalFinal.startsWith("R$")
        ? totalFinal
        : `R$ ${totalFinal}`;

  return (
    <View>
      <View style={pizzaStyles.pizzaCard}>
        <Text style={pizzaStyles.pizzaTitle}>Distribuição por categoria</Text>

        <View style={pizzaStyles.pizzaArea}>
          <PieChart data={pieData} />
        </View>

        <View style={pizzaStyles.legend}>
          <LegendList data={pieData} />
        </View>

        <View style={pizzaStyles.summary}>
          <View style={pizzaStyles.summaryCard}>
            <Text style={pizzaStyles.summaryLabel}>Maior gasto</Text>

            <Text style={pizzaStyles.summaryValue}>{maiorGastoFinal}</Text>
          </View>

          <View style={pizzaStyles.summaryCard}>
            <Text style={pizzaStyles.summaryLabel}>Total</Text>

            <Text style={pizzaStyles.summaryValue}>{formattedTotal}</Text>
          </View>
        </View>
      </View>

      <Text style={pizzaStyles.instructionText}>
        * Toque em uma categoria para auditar os lançamentos associados.
      </Text>
    </View>
  );
};
