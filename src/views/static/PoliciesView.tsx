import StaticContentScreen from "@/src/components/common/StaticContentScreen";
import { POLITICAS } from "@/src/constants/strings";

export default function PoliciesView() {
  return (
    <StaticContentScreen
      title="Políticas de privacidade"
      route="/(management)/configuration"
      content={POLITICAS.text}
    />
  );
}
