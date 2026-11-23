import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AiChat } from "@/src/components/common/iabox";
import HomeHeader from "@/src/components/index/HomeHeader";
import WalletCard from "@/src/components/index/WalletCard";
import { getHomeStyles } from "@/src/components/styles/stylesHome";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useHomeViewModel } from "@/src/viewmodels/useHomeViewModel";

export default function HomeView() {
  const { isDark } = useTheme();
  const styles = getHomeStyles(isDark);

  const {
    balance,
    walletItemsEarn,
    totalEarn,
    walletItemsInvestments,
    totalInvestments,
    walletItemsLost,
    totalLost,
    hideValues,
    handleManageWallets,
  } = useHomeViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader styles={styles} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceValue}>
            {hideValues
              ? "R$ •••••"
              : `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          </Text>
        </View>

        <WalletCard
          title="Carteira de Ganhos"
          total={totalEarn}
          items={walletItemsEarn}
          type="earn"
          hidden={hideValues}
          styles={styles}
        />

        <WalletCard
          title="Carteira de Investimentos"
          total={totalInvestments}
          items={walletItemsInvestments}
          type="investments"
          hidden={hideValues}
          styles={styles}
        />

        <WalletCard
          title="Carteira de Gastos"
          total={totalLost}
          items={walletItemsLost}
          type="lost"
          hidden={hideValues}
          styles={styles}
        />

        <TouchableOpacity
          style={[styles.button, { marginBottom: 30 }]}
          onPress={handleManageWallets}
        >
          <Text style={styles.buttonText}>Gerenciar Carteiras</Text>
        </TouchableOpacity>
      </ScrollView>

      <AiChat />
    </SafeAreaView>
  );
}
