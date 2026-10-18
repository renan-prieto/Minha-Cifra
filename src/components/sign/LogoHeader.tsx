
import { Image, Text, View, useWindowDimensions } from "react-native";
import { getSignStyles } from "../styles/stylesSign";

interface Props {
  isDark: boolean;
  responsive?: boolean;
}

export default function LogoHeader({ isDark, responsive = false }: Props) {
  const styles = getSignStyles(isDark);
  const { width } = useWindowDimensions();

  const scale = Math.min(width / 390, 1.15);
  const fontSize = Math.max(25, Math.min(38, 38 * scale));
  const logoSize = Math.max(38, Math.min(58, 58 * scale));

  return (
    <View
      style={[
        styles.header,
        responsive && {
          position: "relative",
          top: 0,
          left: undefined,
          right: undefined,
          width: "100%",
          paddingHorizontal: 8,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.title,
          responsive && { fontSize, flexShrink: 1 },
        ]}
      >
        Minha
      </Text>

      <Image
        source={require("../../../assets/images/logo_no_background.png")}
        resizeMode="contain"
        style={[
          styles.logo,
          responsive && {
            width: logoSize,
            height: logoSize,
            marginLeft: 3,
            flexShrink: 0,
          },
        ]}
      />

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.title,
          responsive && { fontSize, flexShrink: 1 },
        ]}
      >
        ifra
      </Text>
    </View>
  );
}
