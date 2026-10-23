import { useUser } from "@/src/context/UserContext"; // Importe o Hook
import { Text, View } from "react-native";

interface Props {
  styles: any;
}

export default function HomeHeader({ styles }: Props) {
  const { user } = useUser(); // Dados globais do usuário
  
  return (
    <View style={styles.header}>
      <Text style={styles.welcome}>Bem vindo!{user?.name}</Text>

      <Text style={styles.subtitle}>Aqui está seu panorama financeiro</Text>
    </View>
  );
}
