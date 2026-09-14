import * as Haptics from "expo-haptics";
import type { BottomTabBarButtonProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { Pressable } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityLabel={props["aria-label"]}
      accessibilityState={props.accessibilityState}
      disabled={props.disabled}
      onLongPress={props.onLongPress}
      onPress={props.onPress}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPressOut={props.onPressOut}
      style={props.style}
      testID={props.testID}
    >
      {props.children}
    </Pressable>
  );
}
