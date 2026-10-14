import {
  ButtonAjusteDespesas,
  ButtonAjusteSaldo,
} from "@/src/components/common/buttons";
import { AiChat } from "@/src/components/common/iabox";
import HomeHeader from "@/src/components/index/HomeHeader";
import WalletCard from "@/src/components/index/WalletCard";
import { getHomeStyles } from "@/src/components/styles/stylesHome";
import { useFinance } from "@/src/context/FinanceContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { isDark } = useTheme();
  const styles = getHomeStyles(isDark);
  const router = useRouter();

  const {
    itemsEarn,
    totalEarn,
    itemsInvestments,
    totalInvestments,
    itemsLost,
    totalLost,
    balance,
    addEarn,
    addInvestments,
    addLost,
    addTagEarn,
    addTagInvestments,
    addTagLost,
  } = useFinance();

  const [modalEarn, setModalEarn] = useState(false);
  const [modalInvestments, setModalInvestments] = useState(false);
  const [modalLost, setModalLost] = useState(false);
  const [hideValues, setHideValues] = useState(false);

  const toggleHideValues = () => setHideValues((prev) => !prev);

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
          items={itemsEarn}
          type="earn"
          hidden={hideValues}
          styles={styles}
          onToggle={toggleHideValues}
          button={
            <ButtonAjusteSaldo
              onPress={() => setModalEarn(!modalEarn)}
              modal={modalEarn}
            />
          }
          modal={modalEarn}
          setModal={setModalEarn}
          onAddItem={addEarn}
          onAddTag={addTagEarn}
        />

        <WalletCard
          title="Carteira de Investimentos"
          total={totalInvestments}
          items={itemsInvestments}
          type="investments"
          hidden={hideValues}
          styles={styles}
          onToggle={toggleHideValues}
          button={
            <ButtonAjusteSaldo
              onPress={() => setModalInvestments(!modalInvestments)}
              modal={modalInvestments}
            />
          }
          modal={modalInvestments}
          setModal={setModalInvestments}
          onAddItem={addInvestments}
          onAddTag={addTagInvestments}
        />

        <WalletCard
          title="Carteira de Gastos"
          total={totalLost}
          items={itemsLost}
          type="lost"
          hidden={hideValues}
          styles={styles}
          onToggle={toggleHideValues}
          button={
            <ButtonAjusteDespesas
              onPress={() => setModalLost(!modalLost)}
              modal={modalLost}
            />
          }
          modal={modalLost}
          setModal={setModalLost}
          onAddItem={addLost}
          onAddTag={addTagLost}
        />

        <TouchableOpacity
          style={[styles.button, { marginBottom: 30 }]}
          onPress={() => router.push("/newRelease")}
        >
          <Text style={styles.buttonText}>Gerenciar Carteiras</Text>
        </TouchableOpacity>
      </ScrollView>

      <AiChat />

    </SafeAreaView>
  );
}
