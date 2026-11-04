
import { Asset } from "expo-asset";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function LoadingSplash({
  onAnimationFinished,
}: {
  onAnimationFinished: () => void;
}) {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      finishTimer.current = setTimeout(onAnimationFinished, 2600);
      return () => {
        if (finishTimer.current) clearTimeout(finishTimer.current);
      };
    }

    let cancelled = false;

    async function loadAnimation() {
      try {
        const asset = Asset.fromModule(require("@/assets/loading.html"));
        await asset.downloadAsync();

        if (!cancelled) {
          setHtmlUri(asset.localUri ?? asset.uri);
        }
      } catch (error) {
        console.error("Erro ao carregar a animação:", error);
        onAnimationFinished();
      }
    }

    loadAnimation();

    return () => {
      cancelled = true;
      if (finishTimer.current) clearTimeout(finishTimer.current);
    };
  }, [onAnimationFinished]);

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color="#7DB6FF" />
        </View>
      ) : htmlUri ? (
        <WebView
          source={{ uri: htmlUri }}
          originWhitelist={["*"]}
          javaScriptEnabled
          scrollEnabled={false}
          onLoad={() => {
            finishTimer.current = setTimeout(onAnimationFinished, 2600);
          }}
          onError={() => {
            console.error("Erro ao exibir a animação de carregamento.");
            onAnimationFinished();
          }}
          style={styles.webview}
        />
      ) : (
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color="#7DB6FF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "#06173D",
  },
  webview: {
    flex: 1,
    backgroundColor: "#06173D",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06173D",
  },
});
