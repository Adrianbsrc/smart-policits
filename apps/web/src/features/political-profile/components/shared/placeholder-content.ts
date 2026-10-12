export interface PlaceholderSectionContent {
  id: string;
  title: string;
  description: string;
}

/**
 * Conteúdo das seções ainda não implementadas (fora do escopo desta task).
 * Timeline, Promises, Indicators, Integrity e Sources (substituída por
 * OfficialData, ver ../OfficialData) já viraram features reais e saíram
 * daqui — só Assessment continua placeholder (depende do Evidence Engine).
 */
export const PLACEHOLDER_SECTIONS: Record<"assessment", PlaceholderSectionContent> = {
  assessment: {
    id: "assessment",
    title: "Assessment",
    description: "Avaliação por pilares (competência, governança, integridade e mais), baseada em evidências.",
  },
};
