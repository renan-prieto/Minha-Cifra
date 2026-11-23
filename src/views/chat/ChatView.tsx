import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ScrollViewInstance } from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getChatMarkdownStyles,
  getChatStyles,
} from "@/src/components/styles/stylesChat";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useChatViewModel } from "@/src/viewmodels/useChatViewModel";

export default function ChatView() {
  const router = useRouter();
  const { isDark } = useTheme();
  const styles = getChatStyles(isDark);
  const markdownStyles = getChatMarkdownStyles(isDark);
  const scrollViewRef = useRef<ScrollViewInstance>(null);

  const {
    messages,
    draft,
    setDraft,
    isResponding,
    suggestions,
    startNewConversation,
    sendMessage,
  } = useChatViewModel();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isResponding]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.headerIconButton}
          >
            <Feather name="arrow-left" size={21} color={styles.iconColor.color} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <View style={styles.headerAvatar}>
              <Feather name="message-circle" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Assistente financeiro</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.headerSubtitle}>Assistente com IA</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel="Nova conversa"
            onPress={startNewConversation}
            style={styles.headerIconButton}
          >
            <Feather name="edit-3" size={18} color={styles.iconColor.color} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.conversationSurface}
          contentContainerStyle={styles.conversationContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Feather name="trending-up" size={27} color="#006BFF" />
              </View>
              <Text style={styles.welcomeTitle}>
                Vamos cuidar bem do seu dinheiro?
              </Text>
              <Text style={styles.welcomeDescription}>
                Tire dúvidas e encontre ideias práticas para sua organização
                financeira.
              </Text>

              <View style={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() => sendMessage(suggestion)}
                    style={styles.suggestionButton}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <Feather name="arrow-up-right" size={16} color="#006BFF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.messageList}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.role === "user" && styles.userMessageRow,
                  ]}
                >
                  {message.role === "assistant" && (
                    <View style={styles.messageAvatar}>
                      <Feather name="message-circle" size={14} color="#FFFFFF" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === "user"
                        ? styles.userMessageBubble
                        : styles.assistantMessageBubble,
                    ]}
                  >
                    {message.role === "assistant" ? (
                      <Markdown style={markdownStyles}>{message.text}</Markdown>
                    ) : (
                      <Text style={styles.userMessageText}>{message.text}</Text>
                    )}
                  </View>
                </View>
              ))}

              {isResponding && (
                <View style={styles.messageRow}>
                  <View style={styles.messageAvatar}>
                    <Feather name="message-circle" size={14} color="#FFFFFF" />
                  </View>
                  <View
                    style={[
                      styles.messageBubble,
                      styles.assistantMessageBubble,
                    ]}
                  >
                    <Text style={styles.typingText}>
                      Preparando uma resposta...
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.composerArea}>
          <View style={styles.disclaimerRow}>
            <Feather name="info" size={13} color={styles.mutedColor.color} />
            <Text style={styles.disclaimerText}>
              Conteúdo educativo. Não é consultoria financeira.
            </Text>
          </View>
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Digite sua mensagem"
              editable={!isResponding}
              multiline
              maxLength={1000}
              onChangeText={setDraft}
              onSubmitEditing={() => sendMessage()}
              placeholder="Escreva sua dúvida..."
              placeholderTextColor={isDark ? "#8793A3" : "#929AA5"}
              returnKeyType="send"
              style={styles.input}
              value={draft}
            />
            <TouchableOpacity
              accessibilityLabel="Enviar mensagem"
              accessibilityState={{ disabled: !draft.trim() || isResponding }}
              disabled={!draft.trim() || isResponding}
              onPress={() => sendMessage()}
              style={[
                styles.sendButton,
                (!draft.trim() || isResponding) && styles.sendButtonDisabled,
              ]}
            >
              <Feather name="arrow-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
