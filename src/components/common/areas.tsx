import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getSignStyles } from "../styles/stylesSign";
import { useTheme } from "@/src/contexts/ThemeContext";

interface AreaProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const EmailArea: React.FC<AreaProps> = ({ value, onChangeText }) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, { height: 50 }]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={value}
        onChangeText={onChangeText}
        placeholder="Digite seu Email"
        placeholderTextColor={isDark ? "#888" : "#999"}
      />
    </View>
  );
};

export const PasswordArea: React.FC<AreaProps> = ({ value, onChangeText }) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <View>
      <Text style={styles.label}>Senha</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          style={[
            styles.input,
            focused && styles.inputFocused,
            {
              height: 50,
              paddingRight: 45,
            },
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          value={value}
          onChangeText={onChangeText}
          placeholder="Digite sua Senha"
          placeholderTextColor={isDark ? "#888" : "#999"}
          secureTextEntry={hidePassword}
        />
        <TouchableOpacity
          onPress={() => setHidePassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: 12,
            top: 0,
            bottom: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather
            name={hidePassword ? "eye-off" : "eye"}
            size={18}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ConfirmPasswordArea: React.FC<AreaProps> = ({
  value,
  onChangeText,
}) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <View>
      <Text style={styles.label}>Confirme sua senha</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          style={[
            styles.input,
            focused && styles.inputFocused,
            {
              height: 50,
              paddingRight: 45,
            },
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          value={value}
          onChangeText={onChangeText}
          placeholder="Confirme sua Senha"
          placeholderTextColor={isDark ? "#888" : "#999"}
          secureTextEntry={hidePassword}
        />
        <TouchableOpacity
          onPress={() => setHidePassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: 12,
            top: 0,
            bottom: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather
            name={hidePassword ? "eye-off" : "eye"}
            size={18}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
