
import StaticContentScreen from "@/src/components/common/StaticContentScreen";
import { SOBRENOS } from "@/src/constants/strings";

export default function AboutUs() {
  const content = `
Conheça a equipe responsável pelo desenvolvimento do MinhaCifra.

${SOBRENOS.title_kaue}
${SOBRENOS.subtitle_kaue}

${SOBRENOS.text_kaue}

${SOBRENOS.linkedin_kaue}

${SOBRENOS.title_renan}
${SOBRENOS.subtitle_renan}

${SOBRENOS.text_renan}

${SOBRENOS.linkedin_renan}

${SOBRENOS.title_tobias}
${SOBRENOS.subtitle_tobias}

${SOBRENOS.text_tobias}

${SOBRENOS.linkedin_tobias}

${SOBRENOS.title_vitoria}
${SOBRENOS.subtitle_vitoria}

${SOBRENOS.text_vitoria}

${SOBRENOS.linkedin_vitoria}
  `.trim();

  return (
    <StaticContentScreen
      title="Sobre nós"
      route="/(management)/configuration"
      content={content}
    />
  );
}
