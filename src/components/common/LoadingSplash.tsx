import { Asset } from "expo-asset";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface Props {
    onAnimationFinished: () => void;
}

export default function LoadingSplash({ onAnimationFinished }: Props) {
    const [htmlUri, setHtmlUri] = useState<string | null>(null);
    const finishedRef = useRef(false);

    const finishAnimation = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        onAnimationFinished();
    }, [onAnimationFinished]);

    useEffect(() => {
        let cancelled = false;

        async function loadAnimation() {
            try {
                const asset = Asset.fromModule(require("@/assets/loading.html"));
                await asset.downloadAsync();

                if (!cancelled) {
                    setHtmlUri(asset.localUri ?? asset.uri);
                }
            } catch {
                finishAnimation();
            }
        }

        loadAnimation();

        return () => {
            cancelled = true;
        };
    }, [finishAnimation]);

    return (
        <View style={styles.container}>
            {htmlUri ? (
                <WebView
                    source={{ uri: htmlUri }}
                    originWhitelist={["*"]}
                    javaScriptEnabled
                    onMessage={(event) => {
                        if (event.nativeEvent.data === "animation-finished") {
                            finishAnimation();
                        }
                    }}
                    onError={finishAnimation}
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