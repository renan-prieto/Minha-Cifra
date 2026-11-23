import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AiChat } from "@/src/components/common/iabox";
import AddTagModal from "@/src/components/modal/tagModal";
import NewReleaseHeader from "@/src/components/newRelease/NewReleaseHeader";
import ReleaseForm from "@/src/components/newRelease/ReleaseForm";
import ReleaseTypeSelector from "@/src/components/newRelease/ReleaseTypeSelector";
import { getNewReleaseStyles } from "@/src/components/styles/stylesNewRelease";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useNewReleaseViewModel } from "@/src/viewmodels/useNewReleaseViewModel";

export default function NewReleaseView() {
  const { isDark } = useTheme();
  const styles = getNewReleaseStyles(isDark);

  const {
    type,
    title,
    value,
    selectedTag,
    rate,
    isModalVisible,
    currentTags,
    cardTitle,
    setTitle,
    setValue,
    setSelectedTag,
    setRate,
    openAddTagModal,
    closeAddTagModal,
    handleSave,
    handleAddTag,
    handleChangeType,
  } = useNewReleaseViewModel();

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
            onOpenAddTag={openAddTagModal}
            onSave={handleSave}
          />
        </View>
      </ScrollView>

      <AddTagModal
        visible={isModalVisible}
        cardTitle={cardTitle}
        onClose={closeAddTagModal}
        onAddTag={handleAddTag}
      />
      <AiChat />
    </SafeAreaView>
  );
}
