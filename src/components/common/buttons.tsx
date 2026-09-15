import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import {
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";
import { getHomeStyles } from "../styles/stylesHome";
import { getSignStyles } from "../styles/stylesSign";

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
}

interface ModalButtonProps extends TouchableOpacityProps {
  modal: boolean;
  defaultTitle: string;
  cancelTitle?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ title, ...props }) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  return (
    <TouchableOpacity style={styles.buttonAuth} {...props}>
      <Text style={styles.textButtonAuth}>{title}</Text>
    </TouchableOpacity>
  );
};

const ActionButton: React.FC<ModalButtonProps> = ({
  modal,
  defaultTitle,
  cancelTitle = "Cancelar",
  ...props
}) => {
  const { isDark } = useTheme();
  
  const styles = getHomeStyles(isDark);

  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>
        {modal ? cancelTitle : defaultTitle}
      </Text>
    </TouchableOpacity>
  );
};

export const ButtonSignUp: React.FC<TouchableOpacityProps> = (props) => (
  <AuthButton title="Cadastrar" {...props} />
);

export const ButtonSignIn: React.FC<TouchableOpacityProps> = (props) => (
  <AuthButton title="Entrar" {...props} />
);

export const ButtonAjusteDespesas: React.FC<
  Omit<ModalButtonProps, "defaultTitle">
> = (props) => <ActionButton defaultTitle="Adicionar Tag" {...props} />;

export const ButtonAjusteSaldo: React.FC<
  Omit<ModalButtonProps, "defaultTitle">
> = (props) => <ActionButton defaultTitle="Adicionar Tag" {...props} />;
