import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
	Alert,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { useFinance } from "@/src/context/FinanceContext";
import { useTheme } from "@/src/context/ThemeContext";
import type { FinanceType } from "@/src/services/financeDatabase";

type Category = {
	type: FinanceType;
	title: string;
	description: string;
	tags: string[];
};

export default function TagsScreen() {
	const { isDark } = useTheme();
	const { tagsEarn, tagsInvestments, tagsLost, renameTag, deleteTag } = useFinance();
	const styles = getTagStyles(isDark);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
	const [editingTag, setEditingTag] = useState<{ type: FinanceType; name: string } | null>(null);
	const [deletingTag, setDeletingTag] = useState<{ type: FinanceType; name: string } | null>(null);
	const [tagName, setTagName] = useState("");

	const categories: Category[] = [
		{
			type: "earn",
			title: "Ganhos",
			description: "Entradas e receitas",
			tags: tagsEarn,
		},
		{
			type: "lost",
			title: "Gastos",
			description: "Despesas e saídas",
			tags: tagsLost,
		},
		{
			type: "investment",
			title: "Investimentos",
			description: "Aplicações e retornos",
			tags: tagsInvestments,
		},
	];

	const closeModal = () => {
		setSelectedCategory(null);
		setEditingTag(null);
		setDeletingTag(null);
		setTagName("");
	};

	const openEdit = (type: FinanceType, name: string) => {
		setEditingTag({ type, name });
		setTagName(name);
	};

	const handleRename = async () => {
		const nextName = tagName.trim();

		if (!nextName) {
			Alert.alert("Atenção", "Informe um nome para a tag.");
			return;
		}

		if (editingTag) {
			await renameTag(editingTag.type, editingTag.name, nextName);
			setEditingTag(null);
			setTagName("");
		}
	};

	const handleDelete = async () => {
		if (!deletingTag || tagName.trim() !== deletingTag.name) {
			Alert.alert("Nome incorreto", "Digite exatamente o nome da tag para confirmar.");
			return;
		}

		await deleteTag(deletingTag.type, deletingTag.name);
		closeModal();
	};

	return (
		<SafeAreaView style={styles.container}>
			<ArrowBackHeader title="Tags" route="/(tabs)/perfil" />

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.guide}>
					<Feather name="info" size={20} color="#FFFFFF" />
					<View style={styles.guideCopy}>
						<Text style={styles.guideTitle}>Como funciona</Text>
						<Text style={styles.guideText}>Toque em editar ao lado de uma categoria para renomear ou excluir suas tags.</Text>
					</View>
				</View>

				{categories.map((category) => (
					<View key={category.type} style={styles.categoryCard}>
						<View style={styles.categoryHeader}>
							<View style={styles.categoryCopy}>
								<Text style={styles.categoryTitle}>{category.title}</Text>
								<Text style={styles.categoryDescription}>{category.description}</Text>
							</View>
							<Pressable
								accessibilityLabel={`Editar tags de ${category.title}`}
								onPress={() => setSelectedCategory(category)}
								style={styles.editCategoryButton}
								hitSlop={8}
							>
								<Feather name="edit-2" size={18} color="#FFFFFF" />
							</Pressable>
						</View>
						<View style={styles.tagPreview}>
							{category.tags.length ? category.tags.slice(0, 4).map((tag) => (
								<View key={tag} style={styles.tagPill}>
									<Text style={styles.tagText}>{tag}</Text>
								</View>
							)) : <Text style={styles.emptyText}>Nenhuma tag cadastrada</Text>}
							{category.tags.length > 4 && <Text style={styles.moreText}>+{category.tags.length - 4}</Text>}
						</View>
					</View>
				))}
			</ScrollView>

			<Modal visible={selectedCategory !== null} transparent animationType="slide" onRequestClose={closeModal}>
				<View style={styles.overlay}>
					<View style={[styles.modal, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
						<View style={styles.modalHeader}>
							<View>
								<Text style={[styles.modalTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>{selectedCategory?.title}</Text>
								<Text style={[styles.modalSubtitle, { color: isDark ? "#CCCCCC" : "#555555" }]}>Gerencie suas tags</Text>
							</View>
							<Pressable onPress={closeModal} hitSlop={10}><Feather name="x" size={24} color={isDark ? "#CCCCCC" : "#555555"} /></Pressable>
						</View>
						<ScrollView contentContainerStyle={styles.modalList}>
							{selectedCategory?.tags.length ? selectedCategory.tags.map((tag) => (
								<View key={tag} style={[styles.tagRow, { borderColor: isDark ? "#555555" : "#CCCCCC" }]}>
									<View style={styles.tagRowName}><Text style={[styles.rowText, { color: isDark ? "#FFFFFF" : "#000000" }]}>{tag}</Text></View>
									<View style={styles.rowActions}>
										<Pressable onPress={() => openEdit(selectedCategory.type, tag)} hitSlop={8}><Feather name="edit-2" size={18} color={isDark ? "#CCCCCC" : "#555555"} /></Pressable>
										<Pressable onPress={() => { setDeletingTag({ type: selectedCategory.type, name: tag }); setTagName(""); }} hitSlop={8}><Feather name="trash-2" size={18} color="#D94B4B" /></Pressable>
									</View>
								</View>
								)) : <Text style={[styles.emptyModalText, { color: isDark ? "#CCCCCC" : "#555555" }]}>Esta categoria ainda não tem tags.</Text>}
						</ScrollView>
					</View>
				</View>
			</Modal>

			<Modal visible={editingTag !== null || deletingTag !== null} transparent animationType="fade" onRequestClose={() => { setEditingTag(null); setDeletingTag(null); setTagName(""); }}>
				<View style={styles.overlay}>
					<View style={[styles.modal, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
						<Text style={[styles.modalTitle, { color: isDark ? "#FFFFFF" : "#000000" }]}>{editingTag ? "Editar tag" : "Excluir tag"}</Text>
						<Text style={[styles.modalSubtitle, { color: isDark ? "#CCCCCC" : "#555555" }]}>{editingTag ? "Escolha um novo nome para esta tag." : `Digite ${deletingTag?.name} para confirmar a exclusão. Ao excluir, todos os itens associados serão removidos.`}</Text>
						<TextInput
							autoFocus
							value={tagName}
							onChangeText={setTagName}
							placeholder={editingTag?.name ?? deletingTag?.name}
							placeholderTextColor={isDark ? "#999999" : "#888888"}
							style={[styles.input, { color: isDark ? "#FFFFFF" : "#000000", borderColor: isDark ? "#555555" : "#CCCCCC" }]}
						/>
						<View style={styles.modalButtons}>
							<Pressable style={styles.button} onPress={() => { setEditingTag(null); setDeletingTag(null); setTagName(""); }}><Text style={styles.buttonText}>Cancelar</Text></Pressable>
							<Pressable style={[styles.button, styles.primaryButton, { backgroundColor: editingTag ? "#006BFF" : "#D32F2F" }]} onPress={editingTag ? handleRename : handleDelete}><Text style={styles.primaryButtonText}>{editingTag ? "Salvar" : "Excluir"}</Text></Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const getTagStyles = (isDark: boolean) => StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: isDark ? "#001B44" : "#006BFF" },
	content: { paddingBottom: 20 },
	guide: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: isDark ? "#243653" : "#DCEAFF", gap: 12 },
	guideCopy: { flex: 1 },
	guideTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginBottom: 4 },
	guideText: { color: isDark ? "#B8C7DD" : "#DCEAFF", fontSize: 14, lineHeight: 20 },
	categoryCard: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: isDark ? "#243653" : "#DCEAFF" },
	categoryHeader: { flexDirection: "row", alignItems: "center" },
	categoryCopy: { flex: 1 },
	categoryTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
	categoryDescription: { color: isDark ? "#B8C7DD" : "#DCEAFF", fontSize: 13, marginTop: 3 },
	editCategoryButton: { padding: 5 },
	tagPreview: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 14 },
	tagPill: { borderWidth: 1, borderColor: isDark ? "#3B5A7D" : "#DCEAFF", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
	tagText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
	emptyText: { color: isDark ? "#B8C7DD" : "#DCEAFF", fontSize: 13 },
	moreText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
	overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 20 },
	modal: { width: "100%", maxWidth: 400, borderRadius: 12, padding: 24, maxHeight: "82%" },
	modalHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 },
	modalTitle: { fontSize: 20, fontWeight: "bold" },
	modalSubtitle: { fontSize: 15, lineHeight: 21, marginTop: 5 },
	modalList: { gap: 10 },
	tagRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 8, padding: 12 },
	tagRowName: { flexDirection: "row", alignItems: "center", flex: 1 },
	rowText: { fontSize: 15, fontWeight: "600" },
	rowActions: { flexDirection: "row", gap: 18 },
	emptyModalText: { fontSize: 14, paddingVertical: 16 },
	input: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 16, marginTop: 20 },
	modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20 },
	button: { paddingVertical: 12, paddingHorizontal: 18 },
	buttonText: { color: "#777777", fontSize: 15, fontWeight: "600" },
	primaryButton: { minWidth: 90, borderRadius: 8, backgroundColor: "#006BFF", alignItems: "center" },
	primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
