import { AiChat } from "@/src/components/common/iabox";
import AddTagModal from "@/src/components/modal/tagModal";
import NewReleaseHeader from "@/src/components/newRelease/NewReleaseHeader";
import ReleaseForm from "@/src/components/newRelease/ReleaseForm";
import ReleaseTypeSelector from "@/src/components/newRelease/ReleaseTypeSelector";
import { getNewReleaseStyles } from "@/src/components/styles/stylesNewRelease";
import { useFinance } from "@/src/context/FinanceContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  ReleaseType,
  useNewReleaseActions,
} from "@/src/hooks/useNewReleaseActions";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewReleaseScreen() {
  const { isDark } = useTheme();
  const styles = getNewReleaseStyles(isDark);

  const { tagsEarn, tagsInvestments, tagsLost } = useFinance();

  const [type, setType] = useState<ReleaseType>("lost");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [rate, setRate] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentTags =
    type === "earn"
      ? tagsEarn
      : type === "investiments"
        ? tagsInvestments
        : tagsLost;

  const { handleSave, handleAddTag, handleChangeType } = useNewReleaseActions({
    type,
    title,
    value,
    selectedTag,
    rate,
    setType,
    setTitle,
    setValue,
    setSelectedTag,
    setRate,
    setIsModalVisible,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewReleaseHeader />

        <View style={styles.inputCard}>
          <ReleaseTypeSelector
            type={type}
            isDark={isDark}
            onChangeType={handleChangeType}
          />

          <ReleaseForm
            isDark={isDark}
            type={type}
            title={title}
            value={value}
            selectedTag={selectedTag}
            currentTags={currentTags}
            onChangeTitle={setTitle}
            onChangeValue={setValue}
            rate={rate}
            onChangeRate={setRate}
            onSelectTag={setSelectedTag}
            onOpenAddTag={() => setIsModalVisible(true)}
            onSave={handleSave}
          />
        </View>
      </ScrollView>

      <AddTagModal
        visible={isModalVisible}
        cardTitle={
          type === "earn"
            ? "Ganhos"
            : type === "investiments"
              ? "Investimentos"
              : "Despesas"
        }
        onClose={() => setIsModalVisible(false)}
        onAddTag={handleAddTag}
      />
      <AiChat />
      
    </SafeAreaView>
  );
}
