import StaticContentScreen from "@/src/components/common/StaticContentScreen";
import { TERMOS_DE_USO } from "@/src/constants/strings";

export default function TermsView() {
  return (
    <StaticContentScreen
      title="Termos de Uso"
      route="/(management)/configuration"
      content={TERMOS_DE_USO.text}
    />
  );
}
