import { Platform, StyleSheet } from "react-native";
import type { MarkdownProps } from "react-native-markdown-display";

export function getChatStyles(isDark: boolean) {
  const background = isDark ? "#001B44" : "#006BFF";
  const surface = isDark ? "#0B1933" : "#F7F9FC";
  const card = isDark ? "#101E36" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#001B44";
  const muted = isDark ? "#AEBBD0" : "#6B7280";
  const headerMuted = isDark ? "#B8C7DD" : "#DCEAFF";
  const border = isDark ? "#243653" : "#DCE3ED";

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: background },
    keyboardView: { flex: 1 },
    header: {
      minHeight: 76,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: background,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },
    headerTitleGroup: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      marginLeft: 8,
    },
    headerAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#2563EB" : "#0058D6",
    },
    headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 3,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#8FC5FF",
    },
    headerSubtitle: { color: headerMuted, fontSize: 11 },
    conversationSurface: {
      flex: 1,
      backgroundColor: surface,
      borderTopLeftRadius: 38,
      overflow: "hidden",
    },
    conversationContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    welcomeContainer: { alignItems: "center", paddingBottom: 14 },
    welcomeIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#162844" : "#E8F1FF",
      marginBottom: 18,
    },
    welcomeTitle: {
      maxWidth: 290,
      color: text,
      fontSize: 22,
      lineHeight: 29,
      fontWeight: "800",
      textAlign: "center",
    },
    welcomeDescription: {
      maxWidth: 300,
      color: muted,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 9,
      marginBottom: 25,
    },
    suggestions: { width: "100%", gap: 9 },
    suggestionButton: {
      minHeight: 50,
      paddingHorizontal: 15,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 12,
      backgroundColor: card,
    },
    suggestionText: { flex: 1, color: text, fontSize: 13, fontWeight: "500" },
    messageList: { gap: 18, paddingVertical: 8 },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    userMessageRow: { justifyContent: "flex-end" },
    messageAvatar: {
      width: 27,
      height: 27,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#2563EB" : "#006BFF",
    },
    messageBubble: {
      maxWidth: "82%",
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 16,
    },
    assistantMessageBubble: {
      borderBottomLeftRadius: 5,
      backgroundColor: card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
    },
    userMessageBubble: {
      borderBottomRightRadius: 5,
      backgroundColor: "#006BFF",
    },
    assistantMessageText: { color: text, fontSize: 14, lineHeight: 21 },
    userMessageText: { color: "#FFFFFF", fontSize: 14, lineHeight: 21 },
    typingText: { color: muted, fontSize: 13 },
    composerArea: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: Platform.OS === "android" ? 12 : 8,
      backgroundColor: surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: border,
    },
    disclaimerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginBottom: 9,
    },
    disclaimerText: { color: muted, fontSize: 11 },
    composer: {
      minHeight: 50,
      maxHeight: 120,
      paddingLeft: 15,
      paddingRight: 6,
      paddingVertical: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 25,
      backgroundColor: card,
    },
    input: {
      flex: 1,
      maxHeight: 105,
      color: text,
      fontSize: 14,
      paddingVertical: 8,
    },
    sendButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
    },
    sendButtonDisabled: {
      backgroundColor: isDark ? "#29476F" : "#B6C8E0",
    },
    iconColor: { color: "#FFFFFF" },
    mutedColor: { color: muted },
  });
}

export function getChatMarkdownStyles(
  isDark: boolean,
): NonNullable<MarkdownProps["style"]> {
  const text = isDark ? "#FFFFFF" : "#001B44";
  const border = isDark ? "#243653" : "#DCE3ED";

  return {
    body: { color: text, fontSize: 14, lineHeight: 21 },
    paragraph: { marginTop: 0, marginBottom: 10 },
    heading1: {
      color: text,
      fontSize: 19,
      lineHeight: 25,
      fontWeight: "800",
      marginTop: 8,
      marginBottom: 8,
    },
    heading2: {
      color: text,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 6,
    },
    heading3: {
      color: text,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "700",
      marginTop: 6,
      marginBottom: 4,
    },
    strong: { color: text, fontWeight: "800" },
    em: { fontStyle: "italic" },
    bullet_list: { marginTop: 2, marginBottom: 8 },
    ordered_list: { marginTop: 2, marginBottom: 8 },
    list_item: { marginBottom: 4 },
    blockquote: {
      borderLeftColor: isDark ? "#5B9BFF" : "#006BFF",
      borderLeftWidth: 3,
      backgroundColor: isDark ? "#172943" : "#F1F6FF",
      paddingHorizontal: 10,
      marginVertical: 6,
    },
    code_inline: {
      color: text,
      backgroundColor: isDark ? "#1B2B45" : "#EDF1F7",
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    fence: {
      color: text,
      backgroundColor: isDark ? "#1B2B45" : "#EDF1F7",
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      padding: 10,
      borderRadius: 8,
    },
    hr: { backgroundColor: border, marginVertical: 8 },
  };
}
